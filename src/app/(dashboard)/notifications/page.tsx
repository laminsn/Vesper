"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  XCircle,
  FileText,
  Shield,
  Eye,
} from "lucide-react";
import { GlowCard } from "@/components/jarvis";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/i18n-provider";

// ─── Animations ────────────────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// ─── Data ──────────────────────────────────────────────────────────────────────

type NotificationType = "warning" | "success" | "info" | "purple" | "danger";

interface Notification {
  readonly id: string;
  readonly title: string;
  readonly timestamp: string;
  readonly type: NotificationType;
  readonly read: boolean;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const TYPE_COLORS: Record<NotificationType, string> = {
  warning: "var(--jarvis-warning)",
  success: "var(--jarvis-success)",
  info: "var(--jarvis-accent-2)",
  purple: "#a78bfa",
  danger: "var(--jarvis-danger)",
} as const;

const NOTIFICATIONS: readonly Notification[] = [
  {
    id: "n1",
    title: "SLA Warning: Handoff #7 approaching deadline",
    timestamp: "5m ago",
    type: "warning",
    read: false,
    icon: AlertTriangle,
  },
  {
    id: "n2",
    title: "Task completed: Bridge finished patient intake",
    timestamp: "15m ago",
    type: "success",
    read: false,
    icon: CheckCircle2,
  },
  {
    id: "n3",
    title: "New directive acknowledged by Camila",
    timestamp: "30m ago",
    type: "info",
    read: false,
    icon: Info,
  },
  {
    id: "n4",
    title: "Evolution proposal submitted by Quality",
    timestamp: "1h ago",
    type: "purple",
    read: false,
    icon: Sparkles,
  },
  {
    id: "n5",
    title: "Playbook #1 execution completed",
    timestamp: "2h ago",
    type: "success",
    read: true,
    icon: CheckCircle2,
  },
  {
    id: "n6",
    title: "Agent Beacon went offline",
    timestamp: "3h ago",
    type: "danger",
    read: true,
    icon: XCircle,
  },
  {
    id: "n7",
    title: "Monthly financial package delivered by Steward",
    timestamp: "5h ago",
    type: "info",
    read: true,
    icon: FileText,
  },
  {
    id: "n8",
    title: "HIPAA audit: 0 violations this week",
    timestamp: "1d ago",
    type: "success",
    read: true,
    icon: Shield,
  },
] as const;

interface NotificationPref {
  readonly id: string;
  readonly label: string;
  readonly defaultEnabled: boolean;
}

const NOTIFICATION_TYPES: readonly NotificationPref[] = [
  { id: "sla", label: "SLA Warnings", defaultEnabled: true },
  { id: "tasks", label: "Task Completions", defaultEnabled: true },
  { id: "directives", label: "Directive Updates", defaultEnabled: true },
  { id: "evolution", label: "Evolution Proposals", defaultEnabled: true },
  { id: "agents", label: "Agent Status Changes", defaultEnabled: false },
  { id: "playbooks", label: "Playbook Executions", defaultEnabled: true },
  { id: "hipaa", label: "HIPAA Alerts", defaultEnabled: true },
  { id: "financial", label: "Financial Reports", defaultEnabled: false },
] as const;

const DELIVERY_CHANNELS: readonly NotificationPref[] = [
  { id: "inapp", label: "In-App", defaultEnabled: true },
  { id: "email", label: "Email", defaultEnabled: false },
  { id: "slack", label: "Slack", defaultEnabled: false },
] as const;

// ─── Components ────────────────────────────────────────────────────────────────

function NotificationCard({ notification }: { readonly notification: Notification }) {
  const Icon = notification.icon;
  const color = TYPE_COLORS[notification.type];

  return (
    <GlowCard className="p-0 overflow-hidden" hover={false}>
      <div className="flex items-start gap-3 p-4" style={{ borderLeft: `3px solid ${color}` }}>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <span style={{ color }}><Icon className="h-4 w-4" /></span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--jarvis-text-primary)] leading-snug">
            {notification.title}
          </p>
          <p className="text-xs text-[var(--jarvis-text-muted)] mt-1">
            {notification.timestamp}
          </p>
        </div>
        {!notification.read && (
          <Button variant="ghost" size="sm" className="shrink-0" title="Mark as read">
            <Eye className="h-3.5 w-3.5" />
          </Button>
        )}
        {!notification.read && (
          <span
            className="h-2 w-2 shrink-0 rounded-full mt-2"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
          />
        )}
      </div>
    </GlowCard>
  );
}

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  readonly enabled: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200"
      style={{
        backgroundColor: enabled ? "var(--jarvis-accent)" : "var(--jarvis-bg-tertiary)",
        border: `1px solid ${enabled ? "var(--jarvis-accent)" : "var(--jarvis-border)"}`,
      }}
    >
      <span
        className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{
          transform: enabled ? "translateX(16px)" : "translateX(0px)",
        }}
      />
    </button>
  );
}

function PreferenceRow({
  label,
  enabled,
  onToggle,
}: {
  readonly label: string;
  readonly enabled: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--jarvis-border)] last:border-b-0">
      <span className="text-sm text-[var(--jarvis-text-secondary)]">{label}</span>
      <ToggleSwitch enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { t } = useI18n();
  const [preferences, setPreferences] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const pref of NOTIFICATION_TYPES) {
      initial[pref.id] = pref.defaultEnabled;
    }
    for (const channel of DELIVERY_CHANNELS) {
      initial[`channel_${channel.id}`] = channel.defaultEnabled;
    }
    return initial;
  });

  const togglePreference = (key: string) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const unreadNotifications = NOTIFICATIONS.filter((n) => !n.read);

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
          {t("notifications.title")}
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          {t("notifications.subtitle")}
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              <Bell className="h-3.5 w-3.5" />
              {t("notifications.all")}
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-1.5">
              <span className="relative">
                <Bell className="h-3.5 w-3.5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[var(--jarvis-danger)] text-[8px] font-bold text-white">
                    {unreadNotifications.length}
                  </span>
                )}
              </span>
              {t("notifications.unread")}
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-1.5">
              {t("notifications.preferences")}
            </TabsTrigger>
          </TabsList>

          {/* All Tab */}
          <TabsContent value="all">
            <motion.div
              className="mt-4 space-y-3"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {NOTIFICATIONS.map((notification) => (
                <motion.div key={notification.id} variants={fadeUp}>
                  <NotificationCard notification={notification} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Unread Tab */}
          <TabsContent value="unread">
            <motion.div
              className="mt-4 space-y-3"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {unreadNotifications.length === 0 ? (
                <motion.div variants={fadeUp}>
                  <GlowCard className="p-8 text-center" hover={false}>
                    <Bell className="h-8 w-8 text-[var(--jarvis-text-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--jarvis-text-muted)]">
                      {t("notifications.noUnread")}
                    </p>
                  </GlowCard>
                </motion.div>
              ) : (
                unreadNotifications.map((notification) => (
                  <motion.div key={notification.id} variants={fadeUp}>
                    <NotificationCard notification={notification} />
                  </motion.div>
                ))
              )}
            </motion.div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <div className="mt-4 max-w-xl space-y-6">
              <GlowCard className="p-5" hover={false}>
                <h3 className="heading-mono mb-3">{t("notifications.notificationTypes")}</h3>
                <div>
                  {NOTIFICATION_TYPES.map((pref) => (
                    <PreferenceRow
                      key={pref.id}
                      label={pref.label}
                      enabled={preferences[pref.id] ?? pref.defaultEnabled}
                      onToggle={() => togglePreference(pref.id)}
                    />
                  ))}
                </div>
              </GlowCard>

              <GlowCard className="p-5" hover={false}>
                <h3 className="heading-mono mb-3">{t("notifications.deliveryChannels")}</h3>
                <div>
                  {DELIVERY_CHANNELS.map((channel) => (
                    <PreferenceRow
                      key={channel.id}
                      label={channel.label}
                      enabled={preferences[`channel_${channel.id}`] ?? channel.defaultEnabled}
                      onToggle={() => togglePreference(`channel_${channel.id}`)}
                    />
                  ))}
                </div>
              </GlowCard>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
