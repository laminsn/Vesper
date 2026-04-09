/**
 * Playbook Protocol Parser
 *
 * Parses the playbook-protocols.md file that contains numbered plays
 * with triggers, duration targets, playmakers, steps, kill criteria,
 * and non-negotiables.
 *
 * Format expected:
 *   ## PLAY N: <Name>
 *   **Trigger**: ...
 *   **Duration**: ...
 *   **Playmaker**: ...
 *   ### Steps:
 *   1. **Agent** does something
 *   ### Kill Criteria (...):
 *   - item
 *   ### Non-Negotiable:
 *   - item
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlaybookStep {
  step_number: number;
  description: string;
  agent_slug: string | null;
  sla: string | null;
}

export interface ParsedPlaybook {
  play_number: number;
  name: string;
  trigger_description: string | null;
  duration_target: string | null;
  playmaker_slug: string | null;
  steps: PlaybookStep[];
  kill_criteria: string[];
  non_negotiables: string[];
}

export interface PlaybookParseResult {
  playbooks: ParsedPlaybook[];
  errors: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PLAY_HEADER_RE = /^#{1,3}\s*PLAY\s+(\d+)\s*:\s*(.+)/i;
const BOLD_FIELD_RE = /^\*\*(.+?)\*\*\s*:\s*(.+)/;
const STEP_RE = /^\d+\.\s+(.+)/;
const BOLD_AGENT_RE = /\*\*([A-Z][a-zA-Z\s.]+?)\*\*/;
const LIST_ITEM_RE = /^[-*]\s+(.+)/;
const SLA_RE =
  /within\s+[\d]+\s*(?:hour|minute|day|week|month)s?|immediate|same[- ]day/i;

function extractAgentSlug(text: string): string | null {
  const match = text.match(BOLD_AGENT_RE);
  if (!match) return null;
  return match[1]
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\.$/, "");
}

function extractSla(text: string): string | null {
  const match = text.match(SLA_RE);
  return match ? match[0] : null;
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// ---------------------------------------------------------------------------
// Section classification
// ---------------------------------------------------------------------------

type SectionKind = "steps" | "kill" | "non_negotiable" | "escalation" | "monthly" | "unknown";

function classifySection(heading: string): SectionKind {
  const lower = heading.toLowerCase();
  if (lower.includes("step")) return "steps";
  if (lower.includes("kill")) return "kill";
  if (lower.includes("non-negotiable") || lower.includes("non negotiable"))
    return "non_negotiable";
  if (lower.includes("escalation")) return "escalation";
  if (lower.includes("monthly") || lower.includes("schedule")) return "monthly";
  return "unknown";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function parsePlaybookProtocols(content: string): PlaybookParseResult {
  const playbooks: ParsedPlaybook[] = [];
  const errors: string[] = [];

  // Split into play blocks by looking for PLAY headers
  const lines = content.split("\n");
  const playBlocks: { number: number; name: string; startLine: number; endLine: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(PLAY_HEADER_RE);
    if (match) {
      if (playBlocks.length > 0) {
        playBlocks[playBlocks.length - 1] = {
          ...playBlocks[playBlocks.length - 1],
          endLine: i,
        };
      }
      playBlocks.push({
        number: parseInt(match[1], 10),
        name: match[2].trim(),
        startLine: i,
        endLine: lines.length,
      });
    }
  }

  // Close last block
  if (playBlocks.length > 0) {
    // Find where the last play ends (next ## that isn't a play or end of file)
    const lastBlock = playBlocks[playBlocks.length - 1];
    for (let i = lastBlock.startLine + 1; i < lines.length; i++) {
      if (/^#{1,2}\s+/.test(lines[i]) && !PLAY_HEADER_RE.test(lines[i]) && !lines[i].startsWith("###")) {
        playBlocks[playBlocks.length - 1] = { ...lastBlock, endLine: i };
        break;
      }
    }
  }

  for (const block of playBlocks) {
    try {
      const playbook = parsePlayBlock(
        lines.slice(block.startLine, block.endLine),
        block.number,
        block.name
      );
      playbooks.push(playbook);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown parse error";
      errors.push(`Failed to parse Play ${block.number} (${block.name}): ${message}`);
    }
  }

  return { playbooks, errors };
}

function parsePlayBlock(
  lines: string[],
  playNumber: number,
  name: string
): ParsedPlaybook {
  let triggerDescription: string | null = null;
  let durationTarget: string | null = null;
  let playmakerSlug: string | null = null;
  const steps: PlaybookStep[] = [];
  const killCriteria: string[] = [];
  const nonNegotiables: string[] = [];

  let currentSection: SectionKind = "unknown";
  let stepCounter = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect sub-section headings
    if (/^#{2,3}\s+/.test(trimmed) && !PLAY_HEADER_RE.test(trimmed)) {
      const headingText = trimmed.replace(/^#{2,3}\s+/, "");
      currentSection = classifySection(headingText);
      continue;
    }

    // Extract top-level fields
    const fieldMatch = trimmed.match(BOLD_FIELD_RE);
    if (fieldMatch) {
      const key = fieldMatch[1].toLowerCase();
      const val = fieldMatch[2].trim();

      if (key === "trigger") {
        triggerDescription = val;
        continue;
      }
      if (key === "duration") {
        durationTarget = val;
        continue;
      }
      if (key === "playmaker") {
        playmakerSlug = slugify(val);
        continue;
      }
    }

    // Parse steps
    if (currentSection === "steps") {
      const stepMatch = trimmed.match(STEP_RE);
      if (stepMatch) {
        stepCounter++;
        const description = stepMatch[1].trim();
        steps.push({
          step_number: stepCounter,
          description,
          agent_slug: extractAgentSlug(description),
          sla: extractSla(description),
        });
        continue;
      }
    }

    // Parse kill criteria
    if (currentSection === "kill") {
      const listMatch = trimmed.match(LIST_ITEM_RE);
      if (listMatch) {
        killCriteria.push(listMatch[1].trim());
        continue;
      }
    }

    // Parse non-negotiables
    if (currentSection === "non_negotiable") {
      const listMatch = trimmed.match(LIST_ITEM_RE);
      if (listMatch) {
        nonNegotiables.push(listMatch[1].trim());
        continue;
      }
    }
  }

  return {
    play_number: playNumber,
    name,
    trigger_description: triggerDescription,
    duration_target: durationTarget,
    playmaker_slug: playmakerSlug,
    steps,
    kill_criteria: killCriteria,
    non_negotiables: nonNegotiables,
  };
}
