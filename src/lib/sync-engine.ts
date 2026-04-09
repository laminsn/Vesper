/**
 * Sync Engine
 *
 * Orchestrates reading HHCC business files from the filesystem and
 * upserting them into Supabase tables (agents, playbooks, handoffs).
 *
 * Uses the service role key so RLS is bypassed during sync operations.
 * All mutations are immutable-style upserts (insert on conflict update).
 */

import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parseSoulDirectory, type ParsedSoul } from "./soul-parser";
import {
  parsePlaybookProtocols,
  type ParsedPlaybook,
} from "./playbook-parser";
import {
  parseHandoffProtocols,
  type ParsedHandoff,
} from "./handoff-parser";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SyncResult {
  agents_synced: number;
  playbooks_synced: number;
  handoffs_synced: number;
  errors: string[];
  duration_ms: number;
}

export interface SyncSoulsResult {
  agents_synced: number;
  errors: string[];
  duration_ms: number;
}

// ---------------------------------------------------------------------------
// Org-chart parser (lightweight)
// ---------------------------------------------------------------------------

interface OrgRelation {
  childSlug: string;
  parentSlug: string;
}

/**
 * Parses org-chart.md to extract parent-child relationships.
 * Each indented `+-- Name (Role)` line under a parent establishes the link.
 */
function parseOrgChart(content: string): OrgRelation[] {
  const relations: OrgRelation[] = [];
  const lines = content.split("\n");
  const indentStack: { indent: number; slug: string }[] = [];

  for (const line of lines) {
    // Match lines like: "    +-- Camila (Marketing Director)"
    const match = line.match(/^(\s*)\+--\s+([A-Z][a-zA-Z\s.]+?)(?:\s*\(|$)/);
    if (!match) continue;

    const indent = match[1].length;
    const slug = match[2]
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\.$/, "");

    // Pop stack entries with >= indent
    while (indentStack.length > 0 && indentStack[indentStack.length - 1].indent >= indent) {
      indentStack.pop();
    }

    if (indentStack.length > 0) {
      relations.push({
        childSlug: slug,
        parentSlug: indentStack[indentStack.length - 1].slug,
      });
    }

    indentStack.push({ indent, slug });
  }

  return relations;
}

// ---------------------------------------------------------------------------
// Tier derivation
// ---------------------------------------------------------------------------

const ORCHESTRATOR_SLUGS = new Set(["leona", "diane"]);
const DIRECTOR_SLUGS = new Set([
  "camila",
  "dr-elena",
  "river",
  "terra",
  "serenity",
  "justice",
  "steward",
]);

function deriveTier(slug: string): "orchestrator" | "director" | "specialist" {
  if (ORCHESTRATOR_SLUGS.has(slug)) return "orchestrator";
  if (DIRECTOR_SLUGS.has(slug)) return "director";
  return "specialist";
}

// ---------------------------------------------------------------------------
// Agent sync
// ---------------------------------------------------------------------------

async function syncAgents(
  supabase: SupabaseClient,
  souls: ParsedSoul[],
  orgRelations: OrgRelation[],
  errors: string[]
): Promise<number> {
  let synced = 0;

  // First pass: upsert all agents without parent_agent_id
  const slugToId: Record<string, string> = {};

  for (const soul of souls) {
    const slug = path
      .basename(soul.soul_file_path, ".soul.md")
      .toLowerCase()
      .replace(/\s+/g, "-");

    const row = {
      slug,
      name: soul.agent_name,
      role: soul.role,
      department: soul.department,
      tier: deriveTier(slug),
      status: soul.status.toLowerCase() === "active" ? "idle" : "offline",
      soul_file_path: soul.soul_file_path,
      config: {
        agent_id: soul.agent_id,
        creature: soul.creature,
        emoji_signature: soul.emoji_signature,
        version: soul.version,
        ...soul.raw_frontmatter,
      },
    };

    const { data, error } = await supabase
      .from("agents")
      .upsert(row, { onConflict: "slug" })
      .select("id, slug")
      .single();

    if (error) {
      errors.push(`Agent upsert failed for ${slug}: ${error.message}`);
      continue;
    }

    if (data) {
      slugToId[data.slug] = data.id;
      synced++;
    }
  }

  // Second pass: set parent_agent_id based on org-chart relationships
  for (const rel of orgRelations) {
    const childId = slugToId[rel.childSlug];
    const parentId = slugToId[rel.parentSlug];
    if (!childId || !parentId) continue;

    const { error } = await supabase
      .from("agents")
      .update({ parent_agent_id: parentId })
      .eq("id", childId);

    if (error) {
      errors.push(
        `Failed to set parent for ${rel.childSlug} -> ${rel.parentSlug}: ${error.message}`
      );
    }
  }

  return synced;
}

// ---------------------------------------------------------------------------
// Playbook sync
// ---------------------------------------------------------------------------

async function syncPlaybooks(
  supabase: SupabaseClient,
  playbooks: ParsedPlaybook[],
  errors: string[]
): Promise<number> {
  let synced = 0;

  // Fetch agent slug -> id map for playmaker resolution
  const { data: agents } = await supabase
    .from("agents")
    .select("id, slug");

  const slugToId: Record<string, string> = {};
  for (const agent of agents ?? []) {
    slugToId[agent.slug] = agent.id;
  }

  for (const pb of playbooks) {
    const playmakerId = pb.playmaker_slug
      ? slugToId[pb.playmaker_slug] ?? null
      : null;

    const row = {
      play_number: pb.play_number,
      name: pb.name,
      trigger_description: pb.trigger_description,
      duration_target: pb.duration_target,
      playmaker_agent_id: playmakerId,
      steps: pb.steps,
      kill_criteria: pb.kill_criteria,
      non_negotiables: pb.non_negotiables,
    };

    const { error } = await supabase
      .from("playbooks")
      .upsert(row, { onConflict: "play_number" });

    if (error) {
      errors.push(
        `Playbook upsert failed for Play ${pb.play_number} (${pb.name}): ${error.message}`
      );
      continue;
    }

    synced++;
  }

  return synced;
}

// ---------------------------------------------------------------------------
// Handoff sync
// ---------------------------------------------------------------------------

async function syncHandoffs(
  supabase: SupabaseClient,
  handoffs: ParsedHandoff[],
  errors: string[]
): Promise<number> {
  let synced = 0;

  // Fetch agent slug -> id map
  const { data: agents } = await supabase
    .from("agents")
    .select("id, slug");

  const slugToId: Record<string, string> = {};
  for (const agent of agents ?? []) {
    slugToId[agent.slug] = agent.id;
  }

  for (const ho of handoffs) {
    const fromId = ho.from_agent_slug
      ? slugToId[ho.from_agent_slug] ?? null
      : null;
    const toId = ho.to_agent_slug
      ? slugToId[ho.to_agent_slug] ?? null
      : null;

    const row = {
      handoff_number: ho.handoff_number,
      name: ho.name,
      from_department: ho.from_department,
      to_department: ho.to_department,
      from_agent_id: fromId,
      to_agent_id: toId,
      sla_description: ho.sla_description,
      packet_template: ho.packet_fields,
    };

    const { error } = await supabase
      .from("handoffs")
      .upsert(row, { onConflict: "handoff_number" });

    if (error) {
      errors.push(
        `Handoff upsert failed for #${ho.handoff_number} (${ho.name}): ${error.message}`
      );
      continue;
    }

    synced++;
  }

  return synced;
}

// ---------------------------------------------------------------------------
// File readers
// ---------------------------------------------------------------------------

async function readFileOrNull(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function syncBusinessProfile(
  supabaseUrl: string,
  supabaseServiceKey: string,
  filesystemRoot: string,
  _organizationId?: string
): Promise<SyncResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // 1. Parse souls
  const soulsDir = path.join(filesystemRoot, "souls");
  const { souls, errors: soulErrors } = await parseSoulDirectory(soulsDir);
  errors.push(...soulErrors);

  // 2. Parse org chart
  const orgChartPath = path.join(
    filesystemRoot,
    ".claude",
    "rules",
    "org-chart.md"
  );
  const orgContent = await readFileOrNull(orgChartPath);
  const orgRelations = orgContent ? parseOrgChart(orgContent) : [];

  // 3. Sync agents
  const agentsSynced = await syncAgents(supabase, souls, orgRelations, errors);

  // 4. Parse and sync playbooks
  const playbookPath = path.join(
    filesystemRoot,
    ".claude",
    "rules",
    "playbook-protocols.md"
  );
  const playbookContent = await readFileOrNull(playbookPath);
  let playbooksSynced = 0;
  if (playbookContent) {
    const { playbooks, errors: pbErrors } =
      parsePlaybookProtocols(playbookContent);
    errors.push(...pbErrors);
    playbooksSynced = await syncPlaybooks(supabase, playbooks, errors);
  } else {
    errors.push(`Playbook file not found: ${playbookPath}`);
  }

  // 5. Parse and sync handoffs
  const handoffPath = path.join(
    filesystemRoot,
    ".claude",
    "rules",
    "handoff-protocols.md"
  );
  const handoffContent = await readFileOrNull(handoffPath);
  let handoffsSynced = 0;
  if (handoffContent) {
    const { handoffs, errors: hoErrors } =
      parseHandoffProtocols(handoffContent);
    errors.push(...hoErrors);
    handoffsSynced = await syncHandoffs(supabase, handoffs, errors);
  } else {
    errors.push(`Handoff file not found: ${handoffPath}`);
  }

  return {
    agents_synced: agentsSynced,
    playbooks_synced: playbooksSynced,
    handoffs_synced: handoffsSynced,
    errors,
    duration_ms: Date.now() - startTime,
  };
}

export async function syncSoulsOnly(
  supabaseUrl: string,
  supabaseServiceKey: string,
  soulsDir: string
): Promise<SyncSoulsResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const { souls, errors: soulErrors } = await parseSoulDirectory(soulsDir);
  errors.push(...soulErrors);

  // Sync without org-chart relationships (souls-only mode)
  const agentsSynced = await syncAgents(supabase, souls, [], errors);

  return {
    agents_synced: agentsSynced,
    errors,
    duration_ms: Date.now() - startTime,
  };
}
