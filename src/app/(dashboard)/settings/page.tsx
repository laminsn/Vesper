"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Bell, Building2, Users, Shield, Save, Loader2,
  Mail, Phone, MessageSquare, Send as SendIcon, Globe, Camera,
} from "lucide-react";
import { toast } from "sonner";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-preferences";
import { useAuth } from "@/providers/auth-provider";
import { GlowCard } from "@/components/jarvis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Sao_Paulo", "Europe/London", "Europe/Berlin", "Asia/Tokyo", "UTC",
];

export default function SettingsPage() {
  const { user, role } = useAuth();
  const { data: prefs, isLoading } = usePreferences();
  const updatePrefs = useUpdatePreferences();
  const isOwner = role === "owner" || role === "cofounder";

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [language, setLanguage] = useState("en");
  const [channels, setChannels] = useState({ app: true, email: false, whatsapp: false, telegram: false, slack: false });
  const [notifEmail, setNotifEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [notifTypes, setNotifTypes] = useState<Record<string, boolean>>({
    sla_warnings: true, task_completions: true, directive_updates: true,
    daily_reports: true, agent_status: true, hipaa_alerts: true,
    playbook_executions: true, financial_reports: false,
  });

  useEffect(() => {
    if (!prefs) return;
    setDisplayName(prefs.display_name ?? "");
    setAvatarUrl(prefs.avatar_url ?? "");
    setPhone(prefs.phone ?? "");
    setTimezone(prefs.timezone);
    setLanguage(prefs.language);
    if (prefs.notification_channels) setChannels(prefs.notification_channels as typeof channels);
    setNotifEmail(prefs.notification_email ?? "");
    setWhatsappPhone(prefs.whatsapp_phone ?? "");
    setTelegramChatId(prefs.telegram_chat_id ?? "");
    setSlackWebhook(prefs.slack_webhook_url ?? "");
    if (prefs.notification_types) setNotifTypes(prefs.notification_types as Record<string, boolean>);
  }, [prefs]);

  const handleSaveProfile = async () => {
    try {
      await updatePrefs.mutateAsync({ display_name: displayName, avatar_url: avatarUrl || null, phone: phone || null, timezone, language });
      toast.success("Profile saved");
    } catch { toast.error("Failed to save"); }
  };

  const handleSaveNotifications = async () => {
    try {
      await updatePrefs.mutateAsync({
        notification_channels: channels, notification_email: notifEmail || null,
        whatsapp_phone: whatsappPhone || null, telegram_chat_id: telegramChatId || null,
        slack_webhook_url: slackWebhook || null, notification_types: notifTypes,
      });
      toast.success("Notification preferences saved");
    } catch { toast.error("Failed to save"); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[var(--jarvis-accent)]" /></div>;
  }

  return (
    <motion.div className="space-y-6 max-w-4xl" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
      <motion.div variants={fadeUp}>
        <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">Manage your profile, notifications, and company settings</p>
      </motion.div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)]">
          <TabsTrigger value="profile" className="text-xs gap-1"><User className="h-3 w-3" /> Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1"><Bell className="h-3 w-3" /> Notifications</TabsTrigger>
          <TabsTrigger value="company" className="text-xs gap-1"><Building2 className="h-3 w-3" /> Company</TabsTrigger>
          <TabsTrigger value="team" className="text-xs gap-1"><Users className="h-3 w-3" /> Team</TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1"><Shield className="h-3 w-3" /> Security</TabsTrigger>
        </TabsList>

        {/* PROFILE */}
        <TabsContent value="profile" className="mt-4">
          <GlowCard className="p-6" hover={false}>
            <h2 className="heading-mono mb-4">Personal Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] overflow-hidden">
                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-[var(--jarvis-text-muted)]" />}
                  </div>
                  <Camera className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[var(--jarvis-accent)] p-1 text-[var(--jarvis-bg-primary)]" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-[var(--jarvis-text-secondary)]">Avatar URL</Label>
                  <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className="mt-1 bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" />
                </div>
              </div>
              <div><Label className="text-xs text-[var(--jarvis-text-secondary)]">Display Name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="mt-1 bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" /></div>
              <div><Label className="text-xs text-[var(--jarvis-text-secondary)]">Email</Label><Input value={user?.email ?? ""} disabled className="mt-1 bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-muted)]" /></div>
              <div><Label className="text-xs text-[var(--jarvis-text-secondary)]">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="mt-1 bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" /></div>
              <div>
                <Label className="text-xs text-[var(--jarvis-text-secondary)]">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="mt-1 bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)]">{TIMEZONES.map((tz) => <SelectItem key={tz} value={tz} className="text-[var(--jarvis-text-primary)]">{tz}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-[var(--jarvis-text-secondary)]">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-1 bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)]">
                    <SelectItem value="en" className="text-[var(--jarvis-text-primary)]">English</SelectItem>
                    <SelectItem value="es" className="text-[var(--jarvis-text-primary)]">Español</SelectItem>
                    <SelectItem value="pt" className="text-[var(--jarvis-text-primary)]">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveProfile} disabled={updatePrefs.isPending} className="bg-[var(--jarvis-accent)] text-[var(--jarvis-bg-primary)]">
                {updatePrefs.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save Profile
              </Button>
            </div>
          </GlowCard>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <GlowCard className="p-6" hover={false}>
            <h2 className="heading-mono mb-2">Delivery Channels</h2>
            <p className="text-xs text-[var(--jarvis-text-muted)] mb-4">Choose how you receive updates from Vesper</p>
            <div className="space-y-3">
              {[
                { key: "app" as const, label: "In-App", desc: "Notifications in Vesper dashboard", icon: Globe, color: "text-[var(--jarvis-accent)]" },
                { key: "email" as const, label: "Email", desc: "Receive updates via email", icon: Mail, color: "text-blue-400", field: { value: notifEmail, set: setNotifEmail, placeholder: "your@email.com" } },
                { key: "whatsapp" as const, label: "WhatsApp", desc: "Receive updates via WhatsApp", icon: MessageSquare, color: "text-green-400", field: { value: whatsappPhone, set: setWhatsappPhone, placeholder: "+1234567890" } },
                { key: "telegram" as const, label: "Telegram", desc: "Receive updates via Telegram bot", icon: SendIcon, color: "text-blue-400", field: { value: telegramChatId, set: setTelegramChatId, placeholder: "Chat ID" } },
                { key: "slack" as const, label: "Slack", desc: "Receive updates in Slack channel", icon: MessageSquare, color: "text-purple-400", field: { value: slackWebhook, set: setSlackWebhook, placeholder: "https://hooks.slack.com/..." } },
              ].map(({ key, label, desc, icon: Icon, color, field }) => (
                <div key={key} className="rounded-lg bg-[var(--jarvis-bg-tertiary)] px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <div><p className="text-sm text-[var(--jarvis-text-primary)]">{label}</p><p className="text-[10px] text-[var(--jarvis-text-muted)]">{desc}</p></div>
                    </div>
                    <Switch checked={channels[key]} onCheckedChange={(v) => setChannels({ ...channels, [key]: v })} />
                  </div>
                  {channels[key] && field && (
                    <Input value={field.value} onChange={(e) => field.set(e.target.value)} placeholder={field.placeholder} className="bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" />
                  )}
                </div>
              ))}
            </div>
          </GlowCard>

          <GlowCard className="p-6" hover={false}>
            <h2 className="heading-mono mb-4">Notification Types</h2>
            <div className="space-y-2">
              {Object.entries(notifTypes).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between rounded-lg bg-[var(--jarvis-bg-tertiary)] px-4 py-2.5">
                  <span className="text-sm text-[var(--jarvis-text-primary)] capitalize">{key.replace(/_/g, " ")}</span>
                  <Switch checked={enabled} onCheckedChange={(v) => setNotifTypes({ ...notifTypes, [key]: v })} />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveNotifications} disabled={updatePrefs.isPending} className="bg-[var(--jarvis-accent)] text-[var(--jarvis-bg-primary)]">
                {updatePrefs.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save Notifications
              </Button>
            </div>
          </GlowCard>
        </TabsContent>

        {/* COMPANY */}
        <TabsContent value="company" className="mt-4">
          <GlowCard className="p-6" hover={false}>
            <h2 className="heading-mono mb-4">Company Profile</h2>
            {isOwner ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label className="text-xs text-[var(--jarvis-text-secondary)]">Company Name</Label><Input defaultValue="Happier Homes Comfort Care" className="mt-1 bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" /></div>
                <div>
                  <Label className="text-xs text-[var(--jarvis-text-secondary)]">Industry</Label>
                  <Select defaultValue="healthcare">
                    <SelectTrigger className="mt-1 bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)]">
                      {["healthcare", "finance", "real_estate", "marketing", "education", "technology"].map((i) => (
                        <SelectItem key={i} value={i} className="text-[var(--jarvis-text-primary)] capitalize">{i.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs text-[var(--jarvis-text-secondary)]">Logo URL</Label><Input placeholder="https://..." className="mt-1 bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" /></div>
                <div className="flex items-center gap-4 rounded-lg bg-[var(--jarvis-bg-tertiary)] px-4 py-3">
                  <div><p className="text-sm text-[var(--jarvis-text-primary)]">HIPAA Mode</p><p className="text-[10px] text-[var(--jarvis-text-muted)]">Enforce PHI rules for medical businesses</p></div>
                  <Switch defaultChecked />
                </div>
                <div className="sm:col-span-2 flex justify-end"><Button className="bg-[var(--jarvis-accent)] text-[var(--jarvis-bg-primary)]"><Save className="h-4 w-4 mr-1" /> Save Company</Button></div>
              </div>
            ) : (
              <p className="text-sm text-[var(--jarvis-text-muted)]">Only the account owner can edit company settings.</p>
            )}
          </GlowCard>
        </TabsContent>

        {/* TEAM */}
        <TabsContent value="team" className="mt-4">
          <GlowCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-mono">Team Members</h2>
              {isOwner && <Button size="sm" className="bg-[var(--jarvis-accent)] text-[var(--jarvis-bg-primary)]"><Users className="h-3 w-3 mr-1" /> Invite</Button>}
            </div>
            <div className="overflow-x-auto rounded-lg border border-[var(--jarvis-border)]">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)]">
                  {["Name", "Email", "Role", "Dept Access", "Status"].map((h) => <th key={h} className="px-4 py-2 text-left text-[10px] font-mono uppercase text-[var(--jarvis-text-muted)]">{h}</th>)}
                </tr></thead>
                <tbody>
                  <tr className="border-b border-[var(--jarvis-border)]">
                    <td className="px-4 py-3 text-[var(--jarvis-text-primary)]">Lamin Ngobeh</td>
                    <td className="px-4 py-3 text-[var(--jarvis-text-secondary)]">admin@vesper.app</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 font-medium">Owner</span></td>
                    <td className="px-4 py-3 text-[10px] text-[var(--jarvis-text-muted)]">All</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">Active</span></td>
                  </tr>
                  <tr className="border-b border-[var(--jarvis-border)]">
                    <td className="px-4 py-3 text-[var(--jarvis-text-primary)]">Terrell Alston</td>
                    <td className="px-4 py-3 text-[var(--jarvis-text-secondary)]">terrell@hhcc.com</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-400 font-medium">Admin</span></td>
                    <td className="px-4 py-3 text-[10px] text-[var(--jarvis-text-muted)]">All</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <h3 className="heading-mono text-xs mb-3">Permission Matrix</h3>
              <div className="overflow-x-auto rounded-lg border border-[var(--jarvis-border)]">
                <table className="w-full text-[10px]">
                  <thead><tr className="bg-[var(--jarvis-bg-tertiary)]">
                    <th className="px-3 py-2 text-left text-[var(--jarvis-text-muted)]">Permission</th>
                    <th className="px-3 py-2 text-center text-emerald-400">Owner</th>
                    <th className="px-3 py-2 text-center text-blue-400">Admin</th>
                    <th className="px-3 py-2 text-center text-purple-400">Operator</th>
                    <th className="px-3 py-2 text-center text-gray-400">Viewer</th>
                  </tr></thead>
                  <tbody className="text-[var(--jarvis-text-secondary)]">
                    {[["Dashboard","✓","✓","✓","✓"],["All Departments","✓","✓","—","—"],["Financials","✓","—","—","—"],["PHI Data","✓","—","—","—"],["Directives","✓","✓","Own Dept","—"],["Manage Agents","✓","✓","—","—"],["Settings","✓","✓","—","—"],["Invite Team","✓","✓","—","—"],["Edit Company","✓","—","—","—"],["Approve Assets","✓","✓","—","—"]].map(([p,...r])=>(
                      <tr key={p} className="border-t border-[var(--jarvis-border)]">
                        <td className="px-3 py-1.5 text-[var(--jarvis-text-primary)]">{p}</td>
                        {r.map((v,i)=><td key={i} className={`px-3 py-1.5 text-center ${v==="✓"?"text-emerald-400":v==="—"?"text-[var(--jarvis-text-muted)]":"text-amber-400"}`}>{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </GlowCard>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security" className="mt-4">
          <GlowCard className="p-6" hover={false}>
            <h2 className="heading-mono mb-4">Security</h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-[var(--jarvis-bg-tertiary)] px-4 py-3">
                <p className="text-sm text-[var(--jarvis-text-primary)]">Change Password</p>
                <div className="grid gap-3 sm:grid-cols-2 mt-3">
                  <Input type="password" placeholder="Current password" className="bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" />
                  <Input type="password" placeholder="New password" className="bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" />
                </div>
                <Button size="sm" className="mt-3 bg-[var(--jarvis-accent)] text-[var(--jarvis-bg-primary)]">Update Password</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[var(--jarvis-bg-tertiary)] px-4 py-3">
                <div><p className="text-sm text-[var(--jarvis-text-primary)]">Two-Factor Authentication</p><p className="text-[10px] text-[var(--jarvis-text-muted)]">Extra security layer</p></div>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">Coming Soon</span>
              </div>
            </div>
          </GlowCard>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
