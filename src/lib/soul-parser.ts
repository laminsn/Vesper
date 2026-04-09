/**
 * Soul File Parser
 *
 * Parses HHCC agent soul files (.soul.md) that contain YAML frontmatter
 * between `---` delimiters followed by markdown content.
 *
 * Designed for graceful degradation: returns partial results and collects
 * errors instead of throwing on malformed input.
 */

import { promises as fs } from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParsedSoul {
  agent_name: string;
  agent_id: string | null;
  role: string;
  department: string;
  creature: string | null;
  emoji_signature: string | null;
  version: string | null;
  status: string;
  soul_file_path: string;
  raw_frontmatter: Record<string, string>;
}

export interface SoulParseResult {
  souls: ParsedSoul[];
  errors: string[];
}

// ---------------------------------------------------------------------------
// Frontmatter extraction
// ---------------------------------------------------------------------------

function extractFrontmatter(content: string): Record<string, string> | null {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith("---")) {
    return null;
  }

  const endIndex = trimmed.indexOf("---", 3);
  if (endIndex === -1) {
    return null;
  }

  const yamlBlock = trimmed.slice(3, endIndex).trim();
  const pairs: Record<string, string> = {};

  for (const line of yamlBlock.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      pairs[key] = value;
    }
  }

  return pairs;
}

// ---------------------------------------------------------------------------
// Slug derivation
// ---------------------------------------------------------------------------

function deriveSlug(filePath: string): string {
  const basename = path.basename(filePath, ".soul.md");
  return basename.toLowerCase().replace(/\s+/g, "-");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function parseSoulFile(content: string, filePath: string): ParsedSoul {
  const frontmatter = extractFrontmatter(content);
  const raw = frontmatter ?? {};

  return {
    agent_name: raw.agent_name ?? deriveSlug(filePath),
    agent_id: raw.agent_id ?? null,
    role: raw.role ?? "Unknown",
    department: raw.department ?? "Unknown",
    creature: raw.creature ?? null,
    emoji_signature: raw.emoji_signature ?? null,
    version: raw.version ?? null,
    status: raw.status ?? "Active",
    soul_file_path: filePath,
    raw_frontmatter: raw,
  };
}

export async function parseSoulDirectory(
  dirPath: string
): Promise<SoulParseResult> {
  const souls: ParsedSoul[] = [];
  const errors: string[] = [];

  let entries: string[];
  try {
    entries = await fs.readdir(dirPath);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error reading directory";
    return { souls: [], errors: [`Failed to read directory ${dirPath}: ${message}`] };
  }

  const soulFiles = entries.filter((f) => f.endsWith(".soul.md"));

  for (const file of soulFiles) {
    const fullPath = path.join(dirPath, file);
    try {
      const content = await fs.readFile(fullPath, "utf-8");
      const parsed = parseSoulFile(content, fullPath);
      souls.push(parsed);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error reading file";
      errors.push(`Failed to parse ${fullPath}: ${message}`);
    }
  }

  return { souls, errors };
}
