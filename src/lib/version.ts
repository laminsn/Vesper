/**
 * Vesper Version Tracking
 * Centralized version info and changelog for update management.
 */

export const VESPER_VERSION = "1.0.0";
export const VESPER_BUILD_DATE = "2026-04-10";

export interface ChangelogEntry {
  readonly version: string;
  readonly date: string;
  readonly title: string;
  readonly changes: readonly string[];
}

export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2026-04-10",
    title: "Vesper OS Launch",
    changes: [
      "Full platform deployed to Vercel — no local dev server needed",
      "42 agents across 8 departments with real-time status",
      "25+ dashboard pages: Command Station, Calendar, Daily Reports, Content Vault, Assets, Integrations",
      "65 integrations including Beehiiv, Cloudinary, Remotion, Ideogram",
      "Voice Mode — push-to-talk speech-to-text on all inputs",
      "Startup synth engine rev sound",
      "Content Vault — quote extraction, viral topics, static post pipeline",
      "Daily Reports — hierarchy communications from all 8 departments",
      "Calendar with Google Meet links and meeting notes",
      "Asset Viewer with approve/reject workflow",
      "Conflict detection for directives (SOP + hierarchy awareness)",
      "HIPAA/BAA/PHI compliance tagging for medical businesses",
      "5 Journalist agents (Quill, Scroll, Crônica, Ink, Herald) with Beehiiv newsletters",
      "8 n8n workflow definitions for autonomous execution",
      "Agent webhooks: calendar, meeting notes, content vault, assets, directives",
      "Branding: removed 'AI Army', now just 'Vesper'",
      "Alphabetized integrations",
      "Performance: 5-minute cache, fixed realtime subscription leak",
    ],
  },
];
