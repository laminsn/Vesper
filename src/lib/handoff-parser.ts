/**
 * Handoff Protocol Parser
 *
 * Parses handoff-protocols.md which contains numbered handoff definitions
 * with from/to departments, agents, SLAs, and packet field lists.
 *
 * Format expected:
 *   ### N. <From Department> -> <To Department> Handoff (<Name>)
 *   **Trigger**: ...
 *   **From**: Agent (Dept) / Agent
 *   **To**: Agent (Dept) -> Agent
 *   **Protocol**: (numbered steps)
 *   **Handoff Packet**: (bullet list)
 *   **SLA**: ...
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParsedHandoff {
  handoff_number: number;
  name: string;
  from_department: string;
  to_department: string;
  from_agent_slug: string | null;
  to_agent_slug: string | null;
  sla_description: string | null;
  packet_fields: string[];
}

export interface HandoffParseResult {
  handoffs: ParsedHandoff[];
  errors: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Matches: ### 1. Marketing -> Admissions Handoff (Inquiry to Intake)
// Also: ### 11. Revenue Recognition Handoff (Medicare/Medicaid Billing)
const HANDOFF_HEADER_RE =
  /^#{2,3}\s*(\d+)\.\s+(.+?)(?:\s+Handoff)?\s*\(([^)]+)\)/i;

// Alternate format: just the number and name after department arrows
const HANDOFF_HEADER_ALT_RE =
  /^#{2,3}\s*(\d+)\.\s+(.+)/;

const BOLD_FIELD_RE = /^\*\*(.+?)\*\*\s*:\s*(.+)/;
const LIST_ITEM_RE = /^[-*]\s+(.+)/;

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Extract the first agent name from a "From" or "To" field.
 * Examples:
 *   "Camila (Marketing) / Beacon / Grace" -> "camila"
 *   "River (Admissions) -> Bridge (Intake Coordinator)" -> "river"
 *   "Harvest (Revenue Cycle & Medicare/Medicaid Billing Specialist)" -> "harvest"
 */
function extractLeadAgent(text: string): string | null {
  // Split on /, ->, or |, take first segment
  const first = text.split(/[/|]|->/).map((s) => s.trim())[0];
  if (!first) return null;

  // Take just the name (before any parenthetical)
  const nameMatch = first.match(/^([A-Z][a-zA-Z\s.]+?)(?:\s*\(|$)/);
  if (!nameMatch) return null;

  return slugify(nameMatch[1]);
}

/**
 * Extract departments from the header arrow pattern.
 * "Marketing -> Admissions" -> { from: "Marketing", to: "Admissions" }
 */
function extractDepartments(text: string): {
  from: string;
  to: string;
} | null {
  const arrowMatch = text.match(/(.+?)\s*->\s*(.+)/);
  if (!arrowMatch) return null;

  return {
    from: arrowMatch[1].trim(),
    to: arrowMatch[2].trim().replace(/\s*Handoff.*$/i, ""),
  };
}

// ---------------------------------------------------------------------------
// Section state
// ---------------------------------------------------------------------------

type SectionKind = "protocol" | "packet" | "sla" | "unknown";

function classifyLine(line: string): SectionKind | null {
  const lower = line.toLowerCase();
  if (lower.includes("**protocol**") || lower.includes("**handoff packet**") || lower.includes("**sla**")) {
    if (lower.includes("protocol")) return "protocol";
    if (lower.includes("packet")) return "packet";
    if (lower.includes("sla")) return "sla";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function parseHandoffProtocols(content: string): HandoffParseResult {
  const handoffs: ParsedHandoff[] = [];
  const errors: string[] = [];

  const lines = content.split("\n");

  // Identify handoff blocks
  const blocks: {
    number: number;
    headerText: string;
    parenthetical: string;
    startLine: number;
    endLine: number;
  }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(HANDOFF_HEADER_RE);
    if (match) {
      if (blocks.length > 0) {
        blocks[blocks.length - 1] = {
          ...blocks[blocks.length - 1],
          endLine: i,
        };
      }
      blocks.push({
        number: parseInt(match[1], 10),
        headerText: match[2].trim(),
        parenthetical: match[3].trim(),
        startLine: i,
        endLine: lines.length,
      });
    }
  }

  for (const block of blocks) {
    try {
      const handoff = parseHandoffBlock(
        lines.slice(block.startLine, block.endLine),
        block.number,
        block.headerText,
        block.parenthetical
      );
      handoffs.push(handoff);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown parse error";
      errors.push(
        `Failed to parse Handoff ${block.number} (${block.parenthetical}): ${message}`
      );
    }
  }

  return { handoffs, errors };
}

function parseHandoffBlock(
  lines: string[],
  handoffNumber: number,
  headerText: string,
  parenthetical: string
): ParsedHandoff {
  const departments = extractDepartments(headerText);
  let fromDepartment = departments?.from ?? "Unknown";
  let toDepartment = departments?.to ?? "Unknown";
  let fromAgentSlug: string | null = null;
  let toAgentSlug: string | null = null;
  let slaDescription: string | null = null;
  const packetFields: string[] = [];

  let currentSection: SectionKind = "unknown";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for bold field declarations
    const fieldMatch = trimmed.match(BOLD_FIELD_RE);
    if (fieldMatch) {
      const key = fieldMatch[1].toLowerCase();
      const val = fieldMatch[2].trim();

      if (key === "from") {
        fromAgentSlug = extractLeadAgent(val);
        // If we failed to parse departments from header, try "From" field
        if (fromDepartment === "Unknown") {
          const deptMatch = val.match(/\(([^)]+)\)/);
          if (deptMatch) fromDepartment = deptMatch[1];
        }
        continue;
      }
      if (key === "to") {
        toAgentSlug = extractLeadAgent(val);
        if (toDepartment === "Unknown") {
          const deptMatch = val.match(/\(([^)]+)\)/);
          if (deptMatch) toDepartment = deptMatch[1];
        }
        continue;
      }
      if (key === "trigger") {
        continue;
      }
      if (key === "sla") {
        slaDescription = val;
        currentSection = "sla";
        continue;
      }
      if (key === "handoff packet") {
        currentSection = "packet";
        continue;
      }
      if (key === "protocol") {
        currentSection = "protocol";
        continue;
      }
    }

    // Collect packet fields
    if (currentSection === "packet") {
      const listMatch = trimmed.match(LIST_ITEM_RE);
      if (listMatch) {
        packetFields.push(listMatch[1].trim());
        continue;
      }
      // Non-list line means section ended
      if (!trimmed.startsWith("-") && !trimmed.startsWith("*")) {
        currentSection = "unknown";
      }
    }
  }

  return {
    handoff_number: handoffNumber,
    name: parenthetical,
    from_department: fromDepartment,
    to_department: toDepartment,
    from_agent_slug: fromAgentSlug,
    to_agent_slug: toAgentSlug,
    sla_description: slaDescription,
    packet_fields: packetFields,
  };
}
