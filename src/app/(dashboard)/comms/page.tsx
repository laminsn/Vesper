"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Phone,
  Send,
  Zap,
  Monitor,
  Printer,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  Users,
} from "lucide-react";
import { useAgents } from "@/hooks/use-agents";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { AgentChat } from "@/components/comms/agent-chat";
import {
  GlowCard,
  KpiCard,
  HudFrame,
  DepartmentBadge,
  DirectiveCard,
} from "@/components/jarvis";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Agent, Directive } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type RecipientType =
  | "patient"
  | "family"
  | "physician"
  | "hospital"
  | "staff"
  | "partner"
  | "vendor";

type Channel =
  | "email"
  | "sms"
  | "phone_call"
  | "telegram"
  | "ghl"
  | "in_app"
  | "fax";

type CommStatus =
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "bounced"
  | "pending";

interface CommunicationEntry {
  readonly id: string;
  readonly from_agent: string;
  readonly to_recipient: string;
  readonly recipient_type: RecipientType;
  readonly channel: Channel;
  readonly subject: string;
  readonly body: string;
  readonly status: CommStatus;
  readonly department: string;
  readonly timestamp: string;
  readonly metadata?: {
    readonly duration?: string;
    readonly attachments?: number;
    readonly read_at?: string;
  };
}

// ─── Mock Communication Data ──────────────────────────────────────────────────

const MOCK_COMMUNICATIONS: readonly CommunicationEntry[] = [
  {
    id: "comm-01",
    from_agent: "bridge",
    to_recipient: "Maria Rodriguez",
    recipient_type: "family",
    channel: "phone_call",
    subject: "Intake Assessment Scheduling",
    body: "Called Maria Rodriguez to schedule intake assessment for her mother, Elena Rodriguez. Appointment confirmed for Thursday at 10am. Family requesting bilingual aide if possible. Will coordinate with River on admission paperwork.",
    status: "delivered",
    department: "admissions-intake",
    timestamp: "2026-03-31T14:57:00Z",
    metadata: { duration: "3m" },
  },
  {
    id: "comm-02",
    from_agent: "ember",
    to_recipient: "Dr. James Wilson",
    recipient_type: "physician",
    channel: "email",
    subject: "Monthly Referral Newsletter — April Preview",
    body: "Sent monthly referral newsletter featuring new comfort care programs, updated service areas in Bucks County, and patient success stories. Includes CTA for physician referral portal access.",
    status: "read",
    department: "marketing",
    timestamp: "2026-03-31T14:30:00Z",
    metadata: { read_at: "2026-03-31T14:45:00Z" },
  },
  {
    id: "comm-03",
    from_agent: "verify",
    to_recipient: "BlueCross BlueShield",
    recipient_type: "partner",
    channel: "fax",
    subject: "Insurance Verification Request — Patient #4821",
    body: "Submitted insurance verification request for new patient intake. Policy number BCBS-PA-9928341. Requesting hospice benefit eligibility, prior authorization requirements, and coverage period confirmation.",
    status: "sent",
    department: "admissions-intake",
    timestamp: "2026-03-31T14:15:00Z",
    metadata: { attachments: 2 },
  },
  {
    id: "comm-04",
    from_agent: "solace",
    to_recipient: "Johnson Family",
    recipient_type: "family",
    channel: "phone_call",
    subject: "Symptom Management Update",
    body: "Called Johnson family to provide update on Mr. Johnson's pain management plan. New medication regimen showing improvement. Explained titration schedule and what to monitor. Family expressed gratitude for the proactive communication.",
    status: "delivered",
    department: "clinical-operations",
    timestamp: "2026-03-31T13:50:00Z",
    metadata: { duration: "8m" },
  },
  {
    id: "comm-05",
    from_agent: "recruit",
    to_recipient: "Indeed Job Board",
    recipient_type: "vendor",
    channel: "email",
    subject: "CNA Position Posting — Weekend Shift",
    body: "Posted new CNA position listing for weekend shift coverage. Requirements: PA CNA certification, hospice experience preferred, bilingual a plus. Compensation range $18-22/hr. Application deadline April 15.",
    status: "delivered",
    department: "caregiver-staffing",
    timestamp: "2026-03-31T13:20:00Z",
  },
  {
    id: "comm-06",
    from_agent: "beacon",
    to_recipient: "Google Ads",
    recipient_type: "vendor",
    channel: "ghl",
    subject: "Campaign Performance Report — March",
    body: "Generated and sent March campaign performance report via GoHighLevel. Key metrics: 2,400 impressions, 186 clicks, 12 form submissions, 4 qualified referrals. CPC dropped 15% month-over-month. Recommended budget increase for April.",
    status: "read",
    department: "marketing",
    timestamp: "2026-03-31T12:45:00Z",
    metadata: { read_at: "2026-03-31T13:00:00Z" },
  },
  {
    id: "comm-07",
    from_agent: "embrace",
    to_recipient: "Williams Family",
    recipient_type: "family",
    channel: "sms",
    subject: "Care Team Check-in",
    body: "Hi Mrs. Williams, this is Embrace from Happier Homes. Just checking in to see how things are going with your father's care plan. Please don't hesitate to reach out if you need anything. We're here for you.",
    status: "delivered",
    department: "customer-experience",
    timestamp: "2026-03-31T12:10:00Z",
  },
  {
    id: "comm-08",
    from_agent: "harvest",
    to_recipient: "CMS Medicare",
    recipient_type: "partner",
    channel: "email",
    subject: "Claims Batch #2026-03-28",
    body: "Submitted claims batch #2026-03-28 for 12 active patients. Total claim value: $28,400. All documentation verified by Chart prior to submission. Expected reimbursement within 14-21 business days.",
    status: "sent",
    department: "accounting-finance",
    timestamp: "2026-03-31T11:30:00Z",
    metadata: { attachments: 12 },
  },
  {
    id: "comm-09",
    from_agent: "shield-agent",
    to_recipient: "All Staff",
    recipient_type: "staff",
    channel: "in_app",
    subject: "HIPAA Training Reminder — Q2 Certification Due",
    body: "Reminder: Q2 HIPAA recertification is due by April 15. 4 staff members have outstanding training modules. Please complete the online course and submit your certification before the deadline. Non-compliance will be escalated to Justice.",
    status: "delivered",
    department: "compliance-quality",
    timestamp: "2026-03-31T11:00:00Z",
  },
  {
    id: "comm-10",
    from_agent: "gratitude",
    to_recipient: "Johnson Family",
    recipient_type: "family",
    channel: "email",
    subject: "Thank You for Your Referral",
    body: "Dear Johnson Family, Thank you so much for referring the Williams family to Happier Homes Comfort Care. Your trust in our services means the world to us. We are committed to providing the same level of compassionate care to every family we serve.",
    status: "read",
    department: "customer-experience",
    timestamp: "2026-03-31T10:45:00Z",
    metadata: { read_at: "2026-03-31T11:20:00Z" },
  },
  {
    id: "comm-11",
    from_agent: "grace",
    to_recipient: "Bucks County Community",
    recipient_type: "partner",
    channel: "email",
    subject: "Grief Workshop Invitation — April 12",
    body: "You are invited to our free Grief Support Workshop on April 12 at the Bucks County Community Center. Topics include coping strategies, building resilience, and connecting with others who understand. Light refreshments provided. RSVP by April 8.",
    status: "sent",
    department: "marketing",
    timestamp: "2026-03-31T10:15:00Z",
    metadata: { attachments: 1 },
  },
  {
    id: "comm-12",
    from_agent: "chart",
    to_recipient: "Dr. Elena",
    recipient_type: "staff",
    channel: "in_app",
    subject: "Documentation Audit Results — March",
    body: "March documentation audit complete. Results: 48/50 charts fully compliant (96%). Two charts missing initial care plan signatures (patients Martinez and Chen). Remediation requests sent to responsible nurses. Full report attached in compliance dashboard.",
    status: "read",
    department: "compliance-quality",
    timestamp: "2026-03-31T09:50:00Z",
    metadata: { read_at: "2026-03-31T10:05:00Z" },
  },
  {
    id: "comm-13",
    from_agent: "spirit",
    to_recipient: "Martinez Family",
    recipient_type: "family",
    channel: "phone_call",
    subject: "Spiritual Care Visit Follow-up",
    body: "Follow-up call with Martinez family after yesterday's spiritual care visit. Mrs. Martinez expressed comfort from the prayer session. Discussed upcoming visit schedule and family's cultural preferences for end-of-life rituals. Documented preferences in care plan.",
    status: "delivered",
    department: "clinical-operations",
    timestamp: "2026-03-31T09:30:00Z",
    metadata: { duration: "12m" },
  },
  {
    id: "comm-14",
    from_agent: "shift",
    to_recipient: "Nurse Riley",
    recipient_type: "staff",
    channel: "sms",
    subject: "Weekend Coverage Confirmed",
    body: "Hi Riley, confirming your weekend coverage schedule: Sat 7am-3pm (Martinez, Johnson), Sun 7am-3pm (Chen, Williams). On-call backup: Solace. Please confirm receipt.",
    status: "read",
    department: "caregiver-staffing",
    timestamp: "2026-03-31T09:00:00Z",
    metadata: { read_at: "2026-03-31T09:05:00Z" },
  },
  {
    id: "comm-15",
    from_agent: "bridge",
    to_recipient: "St. Mary Hospital",
    recipient_type: "hospital",
    channel: "fax",
    subject: "Patient Transfer Documentation",
    body: "Transmitting patient transfer documentation for Mrs. Patricia Adams. Includes: discharge summary, medication list, DNR order, advance directive, and hospice enrollment consent. Please confirm receipt and contact River for any questions.",
    status: "sent",
    department: "admissions-intake",
    timestamp: "2026-03-31T08:45:00Z",
    metadata: { attachments: 5 },
  },
  {
    id: "comm-16",
    from_agent: "nurture",
    to_recipient: "QuickBooks",
    recipient_type: "vendor",
    channel: "email",
    subject: "Monthly Bank Reconciliation Report — March",
    body: "March bank reconciliation complete. All 3 accounts balanced with zero discrepancies. Operating account: $142,000 revenue, $98,000 expenses. Payroll account: $45,200 disbursed. Reserve account: $85,000 maintained. Full report exported to QuickBooks.",
    status: "sent",
    department: "accounting-finance",
    timestamp: "2026-03-31T08:30:00Z",
    metadata: { attachments: 3 },
  },
  {
    id: "comm-17",
    from_agent: "river",
    to_recipient: "Dr. Sarah Chen",
    recipient_type: "physician",
    channel: "email",
    subject: "Referral Thank You + Patient Update",
    body: "Thank you for referring Mrs. Thompson to Happier Homes Comfort Care. Her intake assessment was completed yesterday and she has been enrolled in our hospice program. Her care team includes Solace (RN), Comfort (CNA), and Spirit (Chaplain). We will send monthly updates.",
    status: "delivered",
    department: "admissions-intake",
    timestamp: "2026-03-31T08:15:00Z",
  },
  {
    id: "comm-18",
    from_agent: "bereavement",
    to_recipient: "Thompson Family",
    recipient_type: "family",
    channel: "email",
    subject: "Month 3 Grief Support Check-in",
    body: "Dear Thompson Family, We are reaching out as part of our 13-month bereavement support program. We know this is a difficult time. Please find enclosed resources for local grief support groups and counseling services. Remember, our door is always open.",
    status: "delivered",
    department: "clinical-operations",
    timestamp: "2026-03-31T08:00:00Z",
    metadata: { attachments: 1 },
  },
  {
    id: "comm-19",
    from_agent: "reflect",
    to_recipient: "Social Media",
    recipient_type: "vendor",
    channel: "ghl",
    subject: "Weekly Content Batch Published",
    body: "Published weekly social media content batch via GoHighLevel: 3 Facebook posts, 2 Instagram stories, 1 LinkedIn article. Content themes: caregiver appreciation, hospice awareness month prep, community event promotion. Engagement metrics will be reviewed Friday.",
    status: "sent",
    department: "customer-experience",
    timestamp: "2026-03-30T17:00:00Z",
  },
  {
    id: "comm-20",
    from_agent: "quality",
    to_recipient: "Justice",
    recipient_type: "staff",
    channel: "in_app",
    subject: "Q1 Compliance Scorecard Ready",
    body: "Q1 2026 Compliance Scorecard is ready for review. Overall score: 94%. Highlights: zero HIPAA incidents, 96% documentation compliance, 100% incident reporting rate. Areas for improvement: advance directive completion rate at 88% (target 95%).",
    status: "read",
    department: "compliance-quality",
    timestamp: "2026-03-30T16:30:00Z",
    metadata: { read_at: "2026-03-30T16:45:00Z" },
  },
  {
    id: "comm-21",
    from_agent: "train",
    to_recipient: "New CNA Cohort",
    recipient_type: "staff",
    channel: "email",
    subject: "Orientation Schedule — Week 1",
    body: "Welcome to Happier Homes Comfort Care! Please find your Week 1 orientation schedule: Monday — Company overview & HIPAA training, Tuesday — Clinical procedures, Wednesday — Documentation systems, Thursday — Shadowing assignments, Friday — Q&A with Dr. Elena.",
    status: "delivered",
    department: "caregiver-staffing",
    timestamp: "2026-03-30T15:00:00Z",
    metadata: { attachments: 2 },
  },
  {
    id: "comm-22",
    from_agent: "foundation",
    to_recipient: "PA Dept of Revenue",
    recipient_type: "partner",
    channel: "email",
    subject: "Quarterly Tax Filing Confirmation — Q1 2026",
    body: "Confirming successful submission of Q1 2026 quarterly tax filings for Happier Homes Comfort Care LLC. Federal EIN: XX-XXXXXXX. PA entity ID: XXXXXXX. All estimated payments current. Next filing deadline: June 15, 2026.",
    status: "sent",
    department: "accounting-finance",
    timestamp: "2026-03-30T14:00:00Z",
  },
  {
    id: "comm-23",
    from_agent: "listen",
    to_recipient: "Serenity",
    recipient_type: "staff",
    channel: "in_app",
    subject: "Family Satisfaction Survey Results — March",
    body: "March satisfaction survey results compiled. Response rate: 78% (14/18 families). Overall satisfaction: 4.6/5. Highest rated: communication (4.8), compassion (4.9). Lowest rated: response time to non-urgent requests (4.1). Recommendation: streamline non-urgent request workflow.",
    status: "read",
    department: "customer-experience",
    timestamp: "2026-03-30T13:00:00Z",
    metadata: { read_at: "2026-03-30T13:30:00Z" },
  },
  {
    id: "comm-24",
    from_agent: "gather",
    to_recipient: "Community Partners",
    recipient_type: "partner",
    channel: "email",
    subject: "Memorial Service RSVP — April 20",
    body: "Please RSVP for our quarterly Memorial Service on April 20 at 2pm. This event honors patients who passed in Q1. Families, staff, and community partners are welcome. Light refreshments and live music provided. Dress code: business casual.",
    status: "sent",
    department: "marketing",
    timestamp: "2026-03-30T11:00:00Z",
  },
  {
    id: "comm-25",
    from_agent: "triage",
    to_recipient: "Dr. Elena",
    recipient_type: "staff",
    channel: "in_app",
    subject: "New Patient Clinical Assessment Ready",
    body: "Clinical intake assessment for new patient Patricia Adams is complete. Key findings: Stage IV pancreatic cancer, Karnofsky score 40, moderate pain (6/10), on morphine sulfate. Recommended: immediate palliative care plan, pain management consult, social work referral.",
    status: "read",
    department: "admissions-intake",
    timestamp: "2026-03-30T10:00:00Z",
    metadata: { read_at: "2026-03-30T10:15:00Z" },
  },
] as const;

// ─── Mock Directives ──────────────────────────────────────────────────────────

const MOCK_DIRECTIVES: readonly Directive[] = [
  {
    id: "dir-1",
    issued_by: "lamin",
    target_agent_id: "camila",
    target_department: "marketing",
    instruction: "Prepare Q2 marketing budget proposal",
    priority: "high",
    status: "in_progress",
    acknowledged_at: "2026-03-28T10:00:00Z",
    completed_at: null,
    response: null,
    created_at: "2026-03-28T09:00:00Z",
  },
  {
    id: "dir-2",
    issued_by: "lamin",
    target_agent_id: "justice",
    target_department: "compliance-quality",
    instruction:
      "Run pre-survey compliance check on all active patient charts",
    priority: "critical",
    status: "completed",
    acknowledged_at: "2026-03-27T08:00:00Z",
    completed_at: "2026-03-27T16:00:00Z",
    response:
      "All 50 active patient charts reviewed. 48 compliant, 2 remediated.",
    created_at: "2026-03-27T07:00:00Z",
  },
  {
    id: "dir-3",
    issued_by: "lamin",
    target_agent_id: "terra",
    target_department: "caregiver-staffing",
    instruction: "Fill open CNA position for weekend shift by Friday",
    priority: "high",
    status: "pending",
    acknowledged_at: null,
    completed_at: null,
    response: null,
    created_at: "2026-03-31T08:00:00Z",
  },
] as const;

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNEL_CONFIG: Record<
  Channel,
  { readonly label: string; readonly icon: typeof Mail; readonly color: string }
> = {
  email: { label: "Email", icon: Mail, color: "#3b82f6" },
  sms: { label: "SMS", icon: MessageSquare, color: "#22c55e" },
  phone_call: { label: "Phone Call", icon: Phone, color: "#a855f7" },
  telegram: { label: "Telegram", icon: Send, color: "#0ea5e9" },
  ghl: { label: "GHL", icon: Zap, color: "#f59e0b" },
  in_app: { label: "In-App", icon: Monitor, color: "#06d6a0" },
  fax: { label: "Fax", icon: Printer, color: "#6b7280" },
};

const STATUS_CONFIG: Record<
  CommStatus,
  { readonly label: string; readonly className: string }
> = {
  sent: {
    label: "Sent",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  read: {
    label: "Read",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  bounced: {
    label: "Bounced",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
};

const RECIPIENT_TYPE_CONFIG: Record<
  RecipientType,
  { readonly label: string; readonly className: string }
> = {
  patient: {
    label: "Patient",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  family: {
    label: "Family",
    className: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  physician: {
    label: "Physician",
    className: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  },
  hospital: {
    label: "Hospital",
    className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
  staff: {
    label: "Staff",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  partner: {
    label: "Partner",
    className: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  },
  vendor: {
    label: "Vendor",
    className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  },
};

const DEPARTMENT_MAP: Record<string, string> = {
  "admissions-intake": "Admissions",
  "clinical-operations": "Clinical",
  marketing: "Marketing",
  "caregiver-staffing": "Staffing",
  "customer-experience": "CX",
  "compliance-quality": "Compliance",
  "accounting-finance": "Finance",
  executive: "Executive",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findAgentBySlug(agentList: readonly Agent[], slug: string): Agent | undefined {
  return agentList.find((a) => a.slug === slug);
}

function getAgentName(agentList: readonly Agent[], slug: string): string {
  const agent = findAgentBySlug(agentList, slug);
  return agent?.name ?? slug;
}

function getAgentInitial(agentList: readonly Agent[], slug: string): string {
  const agent = findAgentBySlug(agentList, slug);
  if (!agent) return slug.charAt(0).toUpperCase();
  return agent.name.charAt(0).toUpperCase();
}

function getAgentDepartment(agentList: readonly Agent[], slug: string): string {
  const agent = findAgentBySlug(agentList, slug);
  return agent?.department ?? "unknown";
}

function formatTimestamp(iso: string): string {
  const now = new Date();
  const target = new Date(iso);
  const diffMs = now.getTime() - target.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return target.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function computeStats(entries: readonly CommunicationEntry[]) {
  const total = entries.length;
  const delivered = entries.filter(
    (e) => e.status === "delivered" || e.status === "read"
  ).length;
  const deliveryRate =
    total > 0 ? Math.round((delivered / total) * 100) : 0;
  const channels = new Set(entries.map((e) => e.channel)).size;

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const todayCount = entries.filter(
    (e) => new Date(e.timestamp) >= todayStart
  ).length;

  return { total, deliveryRate, channels, todayCount };
}

// ─── Animations ───────────────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { readonly status: CommStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function RecipientTypeBadge({ type }: { readonly type: RecipientType }) {
  const config = RECIPIENT_TYPE_CONFIG[type];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function CommunicationRow({
  entry,
  agents,
}: {
  readonly entry: CommunicationEntry;
  readonly agents: readonly Agent[];
}) {
  const [expanded, setExpanded] = useState(false);
  const channelCfg = CHANNEL_CONFIG[entry.channel];
  const ChannelIcon = channelCfg.icon;

  return (
    <GlowCard
      className="overflow-hidden"
      hover
      onClick={() => setExpanded((prev) => !prev)}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Channel Icon */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${channelCfg.color}20` }}
          >
            <ChannelIcon
              className="h-4 w-4"
              style={{ color: channelCfg.color }}
            />
          </div>

          {/* Agent */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold bg-[var(--jarvis-bg-tertiary)] text-[var(--jarvis-text-secondary)] border border-[var(--jarvis-border)]">
              {getAgentInitial(agents, entry.from_agent)}
            </span>
            <span className="text-xs font-medium text-[var(--jarvis-text-secondary)]">
              {getAgentName(agents, entry.from_agent)}
            </span>
          </div>

          {/* Arrow */}
          <ArrowRight className="h-3 w-3 text-[var(--jarvis-text-muted)] shrink-0" />

          {/* Recipient */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-[var(--jarvis-text-secondary)]">
              {entry.to_recipient}
            </span>
            <RecipientTypeBadge type={entry.recipient_type} />
          </div>

          {/* Spacer */}
          <div className="flex-1 min-w-0" />

          {/* Status + Timestamp + Department + Expand */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <DepartmentBadge
              slug={getAgentDepartment(agents, entry.from_agent)}
              name={DEPARTMENT_MAP[entry.department]}
              size="sm"
              showIcon={false}
            />
            <StatusBadge status={entry.status} />
            <span className="text-[10px] text-[var(--jarvis-text-muted)] whitespace-nowrap">
              {formatTimestamp(entry.timestamp)}
            </span>
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-[var(--jarvis-text-muted)]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[var(--jarvis-text-muted)]" />
            )}
          </div>
        </div>

        {/* Subject */}
        <p className="text-sm font-medium text-[var(--jarvis-text-primary)] mt-2 ml-11">
          {entry.subject}
        </p>

        {/* Expanded Body + Metadata */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 ml-11 rounded-lg bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)] p-3">
                <p className="text-xs text-[var(--jarvis-text-muted)] leading-relaxed">
                  {entry.body}
                </p>
                {entry.metadata && (
                  <div className="flex items-center gap-4 mt-3 pt-2 border-t border-[var(--jarvis-border)]">
                    {entry.metadata.duration && (
                      <span className="text-[10px] text-[var(--jarvis-text-muted)]">
                        Duration:{" "}
                        <span className="text-[var(--jarvis-text-secondary)]">
                          {entry.metadata.duration}
                        </span>
                      </span>
                    )}
                    {entry.metadata.attachments != null &&
                      entry.metadata.attachments > 0 && (
                        <span className="text-[10px] text-[var(--jarvis-text-muted)]">
                          Attachments:{" "}
                          <span className="text-[var(--jarvis-text-secondary)]">
                            {entry.metadata.attachments}
                          </span>
                        </span>
                      )}
                    {entry.metadata.read_at && (
                      <span className="text-[10px] text-[var(--jarvis-text-muted)]">
                        Read at:{" "}
                        <span className="text-[var(--jarvis-text-secondary)]">
                          {new Date(entry.metadata.read_at).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--jarvis-text-muted)]">
                      Channel:{" "}
                      <span className="text-[var(--jarvis-text-secondary)]">
                        {channelCfg.label}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlowCard>
  );
}

function AgentGroupCard({
  agentSlug,
  entries,
  onSelect,
  agents,
}: {
  readonly agentSlug: string;
  readonly entries: readonly CommunicationEntry[];
  readonly onSelect: (slug: string) => void;
  readonly agents: readonly Agent[];
}) {
  const agent = findAgentBySlug(agents, agentSlug);
  const name = agent?.name ?? agentSlug;
  const dept = agent?.department ?? "unknown";

  const channelCounts = entries.reduce<Record<string, number>>((acc, e) => {
    return { ...acc, [e.channel]: (acc[e.channel] ?? 0) + 1 };
  }, {});
  const topChannel = Object.entries(channelCounts).sort(
    ([, a], [, b]) => b - a
  )[0];
  const lastTimestamp = entries
    .map((e) => e.timestamp)
    .sort()
    .reverse()[0];

  return (
    <GlowCard className="p-4" hover onClick={() => onSelect(agentSlug)}>
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold bg-[var(--jarvis-bg-tertiary)] text-[var(--jarvis-accent)] border border-[var(--jarvis-border)]">
          {getAgentInitial(agents, agentSlug)}
        </span>
        <div>
          <p className="text-sm font-medium text-[var(--jarvis-text-primary)]">
            {name}
          </p>
          <DepartmentBadge
            slug={dept}
            name={DEPARTMENT_MAP[dept]}
            size="sm"
            showIcon={false}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)] p-2 text-center">
          <p className="text-lg font-bold text-[var(--jarvis-accent)] font-[family-name:var(--font-display)]">
            {entries.length}
          </p>
          <p className="text-[9px] text-[var(--jarvis-text-muted)]">Messages</p>
        </div>
        <div className="rounded-lg bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)] p-2 text-center">
          <p className="text-xs font-medium text-[var(--jarvis-text-secondary)] mt-1">
            {topChannel
              ? CHANNEL_CONFIG[topChannel[0] as Channel]?.label ?? topChannel[0]
              : "N/A"}
          </p>
          <p className="text-[9px] text-[var(--jarvis-text-muted)]">
            Top Channel
          </p>
        </div>
        <div className="rounded-lg bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)] p-2 text-center">
          <p className="text-[10px] font-medium text-[var(--jarvis-text-secondary)] mt-1">
            {lastTimestamp ? formatTimestamp(lastTimestamp) : "N/A"}
          </p>
          <p className="text-[9px] text-[var(--jarvis-text-muted)]">Last Msg</p>
        </div>
      </div>
    </GlowCard>
  );
}

function ChannelCard({
  channel,
  entries,
}: {
  readonly channel: Channel;
  readonly entries: readonly CommunicationEntry[];
}) {
  const config = CHANNEL_CONFIG[channel];
  const ChannelIcon = config.icon;
  const total = entries.length;
  const successCount = entries.filter(
    (e) => e.status === "delivered" || e.status === "read"
  ).length;
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
  const lastTimestamp = entries
    .map((e) => e.timestamp)
    .sort()
    .reverse()[0];

  return (
    <GlowCard className="p-4" hover={false} glowColor={config.color}>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <ChannelIcon className="h-5 w-5" style={{ color: config.color }} />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--jarvis-text-primary)]">
            {config.label}
          </p>
          <p className="text-[10px] text-[var(--jarvis-text-muted)]">
            {total} message{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)] p-2 text-center">
          <p
            className="text-lg font-bold font-[family-name:var(--font-display)]"
            style={{ color: config.color }}
          >
            {successRate}%
          </p>
          <p className="text-[9px] text-[var(--jarvis-text-muted)]">
            Success Rate
          </p>
        </div>
        <div className="rounded-lg bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)] p-2 text-center">
          <p className="text-[10px] font-medium text-[var(--jarvis-text-secondary)] mt-1">
            {lastTimestamp ? formatTimestamp(lastTimestamp) : "N/A"}
          </p>
          <p className="text-[9px] text-[var(--jarvis-text-muted)]">Last Used</p>
        </div>
      </div>
    </GlowCard>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

interface Filters {
  readonly agent: string;
  readonly channel: string;
  readonly status: string;
  readonly department: string;
  readonly search: string;
}

const INITIAL_FILTERS: Filters = {
  agent: "all",
  channel: "all",
  status: "all",
  department: "all",
  search: "",
};

function FilterBar({
  filters,
  onFilterChange,
  agents,
}: {
  readonly filters: Filters;
  readonly onFilterChange: (updated: Filters) => void;
  readonly agents: readonly Agent[];
}) {
  const commAgents = useMemo(() => {
    const slugs = [
      ...new Set(MOCK_COMMUNICATIONS.map((c) => c.from_agent)),
    ].sort();
    return slugs.map((slug) => ({
      slug,
      name: getAgentName(agents, slug),
    }));
  }, [agents]);

  const departments = useMemo(() => {
    const slugs = [
      ...new Set(MOCK_COMMUNICATIONS.map((c) => c.department)),
    ].sort();
    return slugs.map((slug) => ({
      slug,
      name: DEPARTMENT_MAP[slug] ?? slug,
    }));
  }, []);

  return (
    <HudFrame title="Filters" color="var(--jarvis-accent)">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Agent Filter */}
        <Select
          value={filters.agent}
          onValueChange={(val) =>
            onFilterChange({ ...filters, agent: val })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Agents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {commAgents.map((a) => (
              <SelectItem key={a.slug} value={a.slug}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Channel Filter */}
        <Select
          value={filters.channel}
          onValueChange={(val) =>
            onFilterChange({ ...filters, channel: val })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            {Object.entries(CHANNEL_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(val) =>
            onFilterChange({ ...filters, status: val })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Department Filter */}
        <Select
          value={filters.department}
          onValueChange={(val) =>
            onFilterChange({ ...filters, department: val })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.slug} value={d.slug}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--jarvis-text-muted)]" />
          <input
            type="text"
            placeholder="Search subject or recipient..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="flex h-9 w-full rounded-lg border border-border bg-jarvis-bg-tertiary pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-[rgba(6,214,160,0.4)]"
          />
        </div>
      </div>
    </HudFrame>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommsPage() {
  const { data: agents = [] } = useAgents();
  useRealtimeSubscription("agent_communications");

  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [directiveOpen, setDirectiveOpen] = useState(false);

  const handleFilterChange = useCallback((updated: Filters) => {
    setFilters(updated);
  }, []);

  const filteredComms = useMemo(() => {
    return MOCK_COMMUNICATIONS.filter((entry) => {
      if (filters.agent !== "all" && entry.from_agent !== filters.agent)
        return false;
      if (filters.channel !== "all" && entry.channel !== filters.channel)
        return false;
      if (filters.status !== "all" && entry.status !== filters.status)
        return false;
      if (
        filters.department !== "all" &&
        entry.department !== filters.department
      )
        return false;
      if (filters.search.trim() !== "") {
        const query = filters.search.toLowerCase();
        const matchesSubject = entry.subject.toLowerCase().includes(query);
        const matchesRecipient = entry.to_recipient
          .toLowerCase()
          .includes(query);
        if (!matchesSubject && !matchesRecipient) return false;
      }
      return true;
    });
  }, [filters]);

  const stats = useMemo(
    () => computeStats(MOCK_COMMUNICATIONS),
    []
  );

  // Groups for "By Agent" tab
  const agentGroups = useMemo(() => {
    const grouped: Record<string, CommunicationEntry[]> = {};
    for (const entry of filteredComms) {
      const list = grouped[entry.from_agent] ?? [];
      grouped[entry.from_agent] = [...list, entry];
    }
    return Object.entries(grouped).sort(([, a], [, b]) => b.length - a.length);
  }, [filteredComms]);

  // Groups for "By Channel" tab
  const channelGroups = useMemo(() => {
    const grouped: Record<string, CommunicationEntry[]> = {};
    for (const entry of filteredComms) {
      const list = grouped[entry.channel] ?? [];
      grouped[entry.channel] = [...list, entry];
    }
    return Object.entries(grouped).sort(([, a], [, b]) => b.length - a.length);
  }, [filteredComms]);

  const directorAgents = useMemo(
    () =>
      agents.filter((a) => a.tier === "director" || a.tier === "orchestrator"),
    [agents]
  );

  // When clicking an agent card, switch filter to that agent
  const handleAgentSelect = useCallback(
    (slug: string) => {
      setFilters({ ...filters, agent: slug });
    },
    [filters]
  );

  return (
    <motion.div
      className="space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">
          Communications Hub
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          Internal agent messaging & external communication tracker
        </p>
      </motion.div>

      {/* Top-level section tabs */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="internal" className="space-y-6">
          <TabsList>
            <TabsTrigger value="internal" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Agent Comms
            </TabsTrigger>
            <TabsTrigger value="external" className="gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              External Messages
            </TabsTrigger>
          </TabsList>

          {/* Internal — 2-way Agent Chat */}
          <TabsContent value="internal">
            <AgentChat />
          </TabsContent>

          {/* External — Message Tracker (existing content below) */}
          <TabsContent value="external" className="space-y-6">

      {/* Stats Row */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <KpiCard
            title="Total Messages"
            value={stats.total}
            subtitle="All time"
            icon={MessageSquare}
            color="var(--jarvis-accent)"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <KpiCard
            title="Delivery Rate"
            value={`${stats.deliveryRate}%`}
            subtitle={`${Math.round(
              (stats.deliveryRate / 100) * stats.total
            )}/${stats.total} delivered`}
            icon={CheckCircle2}
            color="var(--jarvis-success)"
            trend="up"
            trendValue="2%"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <KpiCard
            title="Channels Active"
            value={stats.channels}
            subtitle="Across all departments"
            icon={Activity}
            color="var(--jarvis-accent-2)"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <KpiCard
            title="Messages Today"
            value={stats.todayCount}
            subtitle="Since midnight"
            icon={Clock}
            color="var(--jarvis-warning)"
          />
        </motion.div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={fadeUp}>
        <FilterBar filters={filters} onFilterChange={handleFilterChange} agents={agents} />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              All Communications
            </TabsTrigger>
            <TabsTrigger value="by-agent" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              By Agent
            </TabsTrigger>
            <TabsTrigger value="by-channel" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              By Channel
            </TabsTrigger>
            <TabsTrigger value="directives" className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Directives
            </TabsTrigger>
          </TabsList>

          {/* All Communications Tab */}
          <TabsContent value="all">
            <motion.div
              className="grid gap-3 mt-4"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {filteredComms.length === 0 && (
                <motion.div variants={fadeUp}>
                  <div className="text-center py-12 text-[var(--jarvis-text-muted)]">
                    <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">
                      No communications match the current filters.
                    </p>
                  </div>
                </motion.div>
              )}
              {filteredComms.map((entry) => (
                <motion.div key={entry.id} variants={fadeUp}>
                  <CommunicationRow entry={entry} agents={agents} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* By Agent Tab */}
          <TabsContent value="by-agent">
            <motion.div
              className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {agentGroups.map(([slug, entries]) => (
                <motion.div key={slug} variants={fadeUp}>
                  <AgentGroupCard
                    agentSlug={slug}
                    entries={entries}
                    onSelect={handleAgentSelect}
                    agents={agents}
                  />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* By Channel Tab */}
          <TabsContent value="by-channel">
            <motion.div
              className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {channelGroups.map(([channel, entries]) => (
                <motion.div key={channel} variants={fadeUp}>
                  <ChannelCard
                    channel={channel as Channel}
                    entries={entries}
                  />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Directives Tab */}
          <TabsContent value="directives">
            <div className="mt-4 space-y-4">
              <Dialog open={directiveOpen} onOpenChange={setDirectiveOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4" />
                    Issue New Directive
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Issue New Directive</DialogTitle>
                    <DialogDescription>
                      Send an instruction to an agent or department.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Target Agent</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent..." />
                        </SelectTrigger>
                        <SelectContent>
                          {directorAgents.map((agent) => (
                            <SelectItem key={agent.slug} value={agent.slug}>
                              {agent.name} — {agent.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Instruction</Label>
                      <Textarea
                        placeholder="Enter directive instruction..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDirectiveOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setDirectiveOpen(false)}>
                      <Send className="h-4 w-4" />
                      Send Directive
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <motion.div
                className="space-y-3"
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                {MOCK_DIRECTIVES.map((directive) => {
                  const agent = findAgentBySlug(
                    agents,
                    directive.target_agent_id ?? ""
                  );
                  return (
                    <motion.div key={directive.id} variants={fadeUp}>
                      <DirectiveCard
                        directive={directive}
                        agentName={agent?.name}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
