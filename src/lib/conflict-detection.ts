/**
 * Directive Conflict Detection
 * Checks if a directive conflicts with:
 * 1. A human teammate's authority (org hierarchy)
 * 2. Existing SOPs/Protocols
 * 3. Active directives (duplicate/contradictory)
 */

import type { Agent, Directive } from "@/types";

export interface ConflictWarning {
  readonly type: "hierarchy" | "sop" | "duplicate" | "compliance";
  readonly severity: "info" | "warning" | "critical";
  readonly message: string;
  readonly details: string;
}

/** Known SOP keywords that trigger compliance checks */
const SOP_TRIGGERS: readonly { keyword: string; sop: string; department: string }[] = [
  { keyword: "patient", sop: "HIPAA compliance required for all patient-related directives", department: "compliance-quality" },
  { keyword: "Medicare", sop: "Medicare CoP compliance — Justice must review", department: "compliance-quality" },
  { keyword: "billing", sop: "Revenue cycle SOP — Harvest/Steward must be involved", department: "accounting-finance" },
  { keyword: "hire", sop: "Recruitment SOP — Terra must approve all hiring", department: "caregiver-staffing" },
  { keyword: "recruit", sop: "Recruitment SOP — Terra must approve all hiring", department: "caregiver-staffing" },
  { keyword: "discharge", sop: "Discharge protocol — Dr. Elena + Harmony must coordinate", department: "clinical-operations" },
  { keyword: "media", sop: "All public-facing content must pass Camila's brand review", department: "marketing" },
  { keyword: "press", sop: "Press releases require Diane's approval", department: "executive" },
  { keyword: "financial", sop: "Financial decisions over $1000 require Steward approval", department: "accounting-finance" },
  { keyword: "PHI", sop: "PHI handling requires Shield (HIPAA Officer) review", department: "compliance-quality" },
  { keyword: "HIPAA", sop: "HIPAA compliance — Shield must be consulted", department: "compliance-quality" },
  { keyword: "survey", sop: "Survey/audit preparation — Justice leads per Play 8", department: "compliance-quality" },
  { keyword: "recertification", sop: "Medicare recertification — Play 7 protocol", department: "clinical-operations" },
];

/** Check if a directive targets an agent above the issuer in hierarchy */
function checkHierarchyConflict(
  targetAgent: Agent,
  allAgents: readonly Agent[]
): ConflictWarning | null {
  // Directors and orchestrators should not receive directives from lower-tier users
  // without acknowledgment
  if (targetAgent.tier === "orchestrator") {
    return {
      type: "hierarchy",
      severity: "warning",
      message: `${targetAgent.name} is a CEO/Orchestrator-level agent`,
      details: `Directives to ${targetAgent.name} should come through the proper chain of command. Consider routing through Leona (Chief of Staff) first.`,
    };
  }

  if (targetAgent.tier === "director") {
    return {
      type: "hierarchy",
      severity: "info",
      message: `${targetAgent.name} is a Department Director`,
      details: `${targetAgent.name} manages their own team. This directive will be acknowledged but may be delegated to their specialists.`,
    };
  }

  return null;
}

/** Check if the directive instruction matches SOP keywords */
function checkSopConflicts(instruction: string): readonly ConflictWarning[] {
  const lower = instruction.toLowerCase();
  const warnings: ConflictWarning[] = [];

  for (const trigger of SOP_TRIGGERS) {
    if (lower.includes(trigger.keyword.toLowerCase())) {
      warnings.push({
        type: "sop",
        severity: "warning",
        message: `SOP triggered: ${trigger.keyword}`,
        details: trigger.sop,
      });
    }
  }

  return warnings;
}

/** Check for duplicate/conflicting active directives */
function checkDuplicateDirectives(
  instruction: string,
  targetAgentId: string,
  existingDirectives: readonly Directive[]
): ConflictWarning | null {
  const activeForAgent = existingDirectives.filter(
    (d) => d.target_agent_id === targetAgentId &&
      (d.status === "pending" || d.status === "in_progress")
  );

  if (activeForAgent.length >= 3) {
    return {
      type: "duplicate",
      severity: "warning",
      message: `Agent has ${activeForAgent.length} active directives`,
      details: `This agent already has ${activeForAgent.length} pending/in-progress directives. Adding more may cause task overload. Consider waiting for current directives to complete.`,
    };
  }

  // Simple similarity check
  const lowerInstruction = instruction.toLowerCase();
  for (const d of activeForAgent) {
    const similarity = d.instruction.toLowerCase();
    if (lowerInstruction.includes(similarity.slice(0, 30)) || similarity.includes(lowerInstruction.slice(0, 30))) {
      return {
        type: "duplicate",
        severity: "info",
        message: "Potentially similar directive exists",
        details: `Active directive: "${d.instruction.slice(0, 60)}..." — check if this is a duplicate before proceeding.`,
      };
    }
  }

  return null;
}

/** Main conflict detection function */
export function detectConflicts(
  instruction: string,
  targetAgent: Agent,
  allAgents: readonly Agent[],
  existingDirectives: readonly Directive[]
): readonly ConflictWarning[] {
  const warnings: ConflictWarning[] = [];

  const hierarchyWarning = checkHierarchyConflict(targetAgent, allAgents);
  if (hierarchyWarning) warnings.push(hierarchyWarning);

  const sopWarnings = checkSopConflicts(instruction);
  warnings.push(...sopWarnings);

  const duplicateWarning = checkDuplicateDirectives(instruction, targetAgent.id, existingDirectives);
  if (duplicateWarning) warnings.push(duplicateWarning);

  return warnings;
}
