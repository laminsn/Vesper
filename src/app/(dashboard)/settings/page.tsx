"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Settings,
  UserPlus,
  Database,
  Workflow,
  BookOpen,
  Upload,
  Table2,
  Send,
  Globe,
  Crown,
  User,
} from "lucide-react";
import { GlowCard } from "@/components/jarvis";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface TeamMember {
  readonly name: string;
  readonly role: string;
  readonly email: string;
  readonly icon: typeof Crown;
}

const TEAM_MEMBERS: readonly TeamMember[] = [
  { name: "Lamin Ngobeh", role: "Owner", email: "lamin@hhcc.com", icon: Crown },
  { name: "Terrell Alston", role: "Co-founder", email: "terrell@hhcc.com", icon: User },
] as const;

interface Integration {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: typeof Database;
  readonly connected: boolean;
  readonly color: string;
}

const INTEGRATIONS: readonly Integration[] = [
  { id: "supabase", name: "Supabase", description: "Database & Auth", icon: Database, connected: false, color: "#3ecf8e" },
  { id: "n8n", name: "n8n", description: "Workflow Automation", icon: Workflow, connected: false, color: "#ff6d5a" },
  { id: "ghl", name: "GoHighLevel", description: "CRM & Marketing", icon: Globe, connected: false, color: "#4285f4" },
  { id: "notion", name: "Notion", description: "Knowledge Base", icon: BookOpen, connected: false, color: "#ffffff" },
  { id: "airtable", name: "Airtable", description: "Data Management", icon: Table2, connected: false, color: "#fcb400" },
  { id: "telegram", name: "Telegram", description: "Bot Communication", icon: Send, connected: false, color: "#0088cc" },
] as const;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [inviteOpen, setInviteOpen] = useState(false);

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
          Settings
        </h1>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general" className="gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              General
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5">
              <User className="h-3.5 w-3.5" />
              Team
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-1.5">
              <Workflow className="h-3.5 w-3.5" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <div className="mt-4 max-w-xl space-y-6">
              <GlowCard className="p-5" hover={false}>
                <h3 className="heading-mono mb-4">Organization</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Organization Name</Label>
                    <Input
                      value="Happier Homes Comfort Care"
                      readOnly
                      className="opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dashboard Theme</Label>
                    <Input
                      value="JARVIS Dark"
                      readOnly
                      className="opacity-70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input
                      value="America/New_York"
                      readOnly
                      className="opacity-70"
                    />
                  </div>
                </div>
              </GlowCard>

              {/* Upload Profile Link */}
              <GlowCard className="p-5" hover={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="heading-mono mb-1">Upload Organization Profile</h3>
                    <p className="text-xs text-[var(--jarvis-text-muted)]">
                      Import a new AI agent workforce structure from a file or template
                    </p>
                  </div>
                  <Link href="/settings/upload-profile">
                    <Button size="sm">
                      <Upload className="h-4 w-4" />
                      Upload Profile
                    </Button>
                  </Link>
                </div>
              </GlowCard>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <div className="mt-4 space-y-4">
              <GlowCard className="p-5" hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="heading-mono">Team Members</h3>
                  <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4" />
                        Invite Team Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Send an invitation to join the HHCC Command Center.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <Input
                            type="email"
                            placeholder="name@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cofounder">Co-founder</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="readonly">Read-only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setInviteOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setInviteOpen(false)}>
                          <Send className="h-4 w-4" />
                          Send Invite
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="rounded-lg border border-[var(--jarvis-border)] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)]">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                          Role
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {TEAM_MEMBERS.map((member) => {
                        const MemberIcon = member.icon;
                        return (
                          <tr
                            key={member.email}
                            className="border-b border-[var(--jarvis-border)] last:border-b-0"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)]">
                                  <MemberIcon className="h-3.5 w-3.5 text-[var(--jarvis-accent)]" />
                                </div>
                                <span className="font-medium text-[var(--jarvis-text-primary)]">
                                  {member.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center rounded-md bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)] px-2 py-0.5 text-xs font-medium text-[var(--jarvis-text-secondary)]">
                                {member.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[var(--jarvis-text-muted)]">
                              {member.email}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlowCard>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <motion.div
              className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {INTEGRATIONS.map((integration) => {
                const IntIcon = integration.icon;
                return (
                  <motion.div key={integration.id} variants={fadeUp}>
                    <GlowCard className="p-5" glowColor={integration.color} hover={false}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${integration.color}15` }}
                          >
                            <IntIcon
                              className="h-5 w-5"
                              style={{ color: integration.color }}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--jarvis-text-primary)]">
                              {integration.name}
                            </p>
                            <p className="text-[10px] text-[var(--jarvis-text-muted)]">
                              {integration.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: integration.connected
                                ? "var(--jarvis-success)"
                                : "var(--jarvis-danger)",
                              boxShadow: integration.connected
                                ? "0 0 6px var(--jarvis-success)"
                                : "0 0 6px var(--jarvis-danger)",
                            }}
                          />
                          <span className="text-xs text-[var(--jarvis-text-muted)]">
                            {integration.connected ? "Connected" : "Not Connected"}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>
                    </GlowCard>
                  </motion.div>
                );
              })}
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
