// ═══════════════════════════════════════════════════
// HHCC Command Center — Core Types
// ═══════════════════════════════════════════════════

export type AgentStatus = "active" | "idle" | "offline" | "executing";
export type AgentTier = "orchestrator" | "director" | "specialist";
export type UserRole = "owner" | "cofounder" | "staff" | "readonly";
export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "blocked" | "done";
export type TaskPriority = "critical" | "high" | "normal" | "low";
export type DirectiveStatus = "pending" | "acknowledged" | "in_progress" | "completed" | "cancelled";
export type PlaybookExecutionStatus = "running" | "completed" | "failed" | "killed" | "paused";
export type EvolutionCategory = "PROMPT" | "PROCESS" | "TOOL" | "KNOWLEDGE" | "STRATEGY";
export type ValidationLevel = "GREEN" | "YELLOW" | "RED";
export type MessageType = "directive" | "status_report" | "handoff" | "escalation" | "notification";

export interface Agent {
  id: string;
  organization_id?: string;
  slug: string;
  name: string;
  role: string;
  department: string;
  tier: AgentTier;
  parent_agent_id: string | null;
  status: AgentStatus;
  last_seen_at: string;
  avatar_url: string | null;
  soul_file_path: string | null;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  organization_id?: string;
  slug: string;
  name: string;
  director_agent_id: string | null;
  color: string;
  icon: string;
  agent_count: number;
  created_at: string;
}

export interface Kpi {
  id: string;
  organization_id?: string;
  department_id: string;
  metric_name: string;
  current_value: number | null;
  target_value: number | null;
  unit: string;
  trend: "up" | "down" | "flat" | "unknown";
  owner_agent_id: string | null;
  measured_at: string;
  created_at: string;
}

export interface Task {
  id: string;
  organization_id?: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  department_id: string | null;
  assigned_agent_id: string | null;
  created_by_user_id: string | null;
  due_date: string | null;
  tags: string[];
  sign_off_required: boolean;
  signed_off_by: string | null;
  signed_off_at: string | null;
  parent_task_id: string | null;
  playbook_execution_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Playbook {
  id: string;
  organization_id?: string;
  play_number: number;
  name: string;
  trigger_description: string | null;
  duration_target: string | null;
  playmaker_agent_id: string | null;
  steps: PlaybookStep[];
  kill_criteria: string[] | null;
  non_negotiables: string[] | null;
  created_at: string;
}

export interface PlaybookStep {
  step_number: number;
  description: string;
  agent_slug: string;
  sla: string | null;
}

export interface PlaybookExecution {
  id: string;
  playbook_id: string;
  triggered_by: string;
  status: PlaybookExecutionStatus;
  current_step: number;
  step_statuses: StepStatus[];
  context: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
  quality_score: number | null;
  sla_met_percentage: number | null;
}

export interface StepStatus {
  step: number;
  agent: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  started_at: string | null;
  completed_at: string | null;
}

export interface Handoff {
  id: string;
  organization_id?: string;
  handoff_number: number;
  name: string;
  from_department: string;
  to_department: string;
  from_agent_id: string | null;
  to_agent_id: string | null;
  sla_description: string | null;
  packet_template: Record<string, unknown> | null;
  created_at: string;
}

export interface AgentCommunication {
  id: string;
  organization_id?: string;
  from_agent_id: string | null;
  to_agent_id: string | null;
  to_department: string | null;
  message_type: MessageType;
  subject: string | null;
  body: string;
  priority: string;
  read_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Directive {
  id: string;
  organization_id?: string;
  issued_by: string;
  target_agent_id: string | null;
  target_department: string | null;
  instruction: string;
  priority: string;
  status: DirectiveStatus;
  acknowledged_at: string | null;
  completed_at: string | null;
  response: string | null;
  created_at: string;
}

export interface EvolutionProposal {
  id: string;
  organization_id?: string;
  agent_id: string;
  category: EvolutionCategory;
  validation_level: ValidationLevel;
  title: string;
  description: string;
  rationale: string | null;
  status: "pending" | "approved" | "rejected" | "implemented" | "expired";
  reviewed_by: string | null;
  reviewed_at: string | null;
  implemented_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface KpiHistory {
  id: string;
  kpi_id: string;
  value: number;
  recorded_at: string;
  recorded_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface HandoffExecution {
  id: string;
  handoff_id: string;
  triggered_by: string;
  status: "pending" | "in_transit" | "received" | "completed" | "failed";
  packet_data: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
  sla_met: boolean | null;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}

export interface EvolutionRetrospective {
  id: string;
  organization_id?: string;
  agent_id: string;
  period_start: string;
  period_end: string;
  wins: string[];
  losses: string[];
  lessons: string[];
  next_actions: string[];
  created_at: string;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  display_name: string | null;
  email: string;
}

// Integration Registry types
export type IntegrationCategory = "mcp" | "api" | "webhook" | "oauth" | "database";
export type IntegrationStatus = "connected" | "disconnected" | "error" | "testing";
export type SyncType = "souls" | "playbooks" | "handoffs" | "org_chart" | "skills" | "mcps" | "full";
export type SyncDirection = "filesystem_to_db" | "db_to_filesystem";
export type SyncStatus = "never" | "syncing" | "synced" | "error";
export type SyncLogStatus = "running" | "completed" | "failed";

export interface IntegrationRecord {
  id: string;
  organization_id: string | null;
  integration_key: string;
  display_name: string;
  category: IntegrationCategory;
  config: Record<string, unknown>;
  credentials_ref: string | null;
  status: IntegrationStatus;
  last_health_check: string | null;
  health_details: Record<string, unknown>;
  used_by_agents: string[];
  used_by_departments: string[];
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  organization_id: string | null;
  filesystem_root: string;
  soul_files_path: string;
  org_chart_hash: string | null;
  playbook_count: number;
  handoff_count: number;
  agent_count: number;
  department_count: number;
  skills_manifest: Record<string, unknown>;
  mcp_configs: Record<string, unknown>;
  knowledge_base_refs: Record<string, unknown>[];
  last_synced_at: string | null;
  sync_status: SyncStatus;
  sync_errors: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
}

export interface SyncLogEntry {
  id: string;
  organization_id: string | null;
  sync_type: SyncType;
  direction: SyncDirection;
  status: SyncLogStatus;
  items_processed: number;
  items_failed: number;
  error_details: Record<string, unknown>[];
  started_at: string;
  completed_at: string | null;
}

// UI-specific types
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  roles?: UserRole[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

// Multi-tenant organization types
export type OrgPlan = "free" | "starter" | "professional" | "enterprise";
export type OrgMemberRole = "owner" | "admin" | "member" | "readonly";
export type OrgIndustry =
  | "healthcare"
  | "marketing"
  | "finance"
  | "real_estate"
  | "technology"
  | "education"
  | "hospitality"
  | "other";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  industry: OrgIndustry | null;
  hipaa_mode: boolean;
  theme_config: Record<string, unknown>;
  settings: Record<string, unknown>;
  plan: OrgPlan;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id?: string;
  user_id: string;
  role: OrgMemberRole;
  display_name: string | null;
  invited_by: string | null;
  joined_at: string;
}
