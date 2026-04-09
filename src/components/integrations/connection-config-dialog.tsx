"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Plug, Loader2, TestTube } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useRegisterIntegration,
  useUpdateIntegration,
  useTestIntegration,
} from "@/hooks/use-integrations";
import type { Integration, ConnectionMethod } from "@/data/integrations";
import type { IntegrationRecord } from "@/types";

const METHOD_LABELS: Record<ConnectionMethod, string> = {
  api: "API Key / Token",
  mcp: "MCP Server (Claude Code)",
  cli: "CLI Tool",
  browser: "Browser Login",
  manual: "Manual / Instructions",
  oauth: "OAuth",
};

const METHOD_DESCRIPTIONS: Record<ConnectionMethod, string> = {
  api: "Connect using an API key or access token",
  mcp: "Already connected via Claude Code MCP — no credentials needed",
  cli: "Connect using a command-line tool installed locally",
  browser: "Log in via browser with username and password",
  manual: "Provide credentials for agents to use manually",
  oauth: "Authorize via OAuth redirect flow",
};

interface ConnectionConfigDialogProps {
  readonly integration: Integration;
  readonly registryRecord?: IntegrationRecord;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function ConnectionConfigDialog({
  integration,
  registryRecord,
  open,
  onOpenChange,
}: ConnectionConfigDialogProps) {
  const [method, setMethod] = useState<ConnectionMethod>(
    (registryRecord?.config as Record<string, unknown>)?.connectionMethod as ConnectionMethod
      ?? integration.defaultMethod
  );
  const [credentials, setCredentials] = useState<Record<string, string>>(() => {
    const saved = (registryRecord?.config as Record<string, unknown>)?.credentials as Record<string, string> | undefined;
    return saved ?? {};
  });
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());

  const registerMutation = useRegisterIntegration();
  const updateMutation = useUpdateIntegration();
  const testMutation = useTestIntegration();

  const isSaving = registerMutation.isPending || updateMutation.isPending;
  const isTesting = testMutation.isPending;
  const isMcpMethod = method === "mcp";

  const updateField = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
  };

  const toggleVisibility = (key: string) => {
    setVisibleFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSave = async () => {
    const config = {
      connectionMethod: method,
      credentials: isMcpMethod ? {} : credentials,
      connectionUrl: integration.connectionUrl ?? "",
    };

    try {
      if (registryRecord) {
        await updateMutation.mutateAsync({
          id: registryRecord.id,
          config,
          status: isMcpMethod ? "connected" : "disconnected",
        });
      } else {
        await registerMutation.mutateAsync({
          integration_key: integration.id,
          display_name: integration.name,
          category: isMcpMethod ? "mcp" : "api",
          config,
          status: isMcpMethod ? "connected" : "disconnected",
        });
      }
      toast.success(`${integration.name} configuration saved`);
      onOpenChange(false);
    } catch {
      toast.error("Failed to save configuration");
    }
  };

  const handleSaveAndTest = async () => {
    await handleSave();
    if (registryRecord) {
      try {
        await testMutation.mutateAsync(registryRecord.id);
        toast.success(`${integration.name} — connection test passed`);
      } catch {
        toast.error(`${integration.name} — connection test failed`);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--jarvis-text-primary)]">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: integration.color }}
            >
              {integration.name.charAt(0)}
            </div>
            Configure {integration.name}
          </DialogTitle>
          <DialogDescription className="text-[var(--jarvis-text-muted)]">
            Choose how agents connect to {integration.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Connection Method */}
          <div className="space-y-2">
            <Label className="text-xs text-[var(--jarvis-text-secondary)]">Connection Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as ConnectionMethod)}>
              <SelectTrigger className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)]">
                {integration.supportedMethods.map((m) => (
                  <SelectItem key={m} value={m} className="text-[var(--jarvis-text-primary)]">
                    {METHOD_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-[var(--jarvis-text-muted)]">
              {METHOD_DESCRIPTIONS[method]}
            </p>
          </div>

          {/* MCP Badge */}
          {isMcpMethod && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-xs text-emerald-400 font-medium">
                Connected via Claude Code MCP
              </p>
              <p className="text-[10px] text-emerald-400/70 mt-1">
                This integration is managed by your MCP configuration. No credentials needed here.
              </p>
            </div>
          )}

          {/* Credential Fields */}
          {!isMcpMethod && (
            <div className="space-y-3">
              {/* Browser method adds username/password */}
              {(method === "browser" || method === "manual") && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs text-[var(--jarvis-text-secondary)]">
                      Username / Email
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={credentials.username ?? ""}
                      onChange={(e) => updateField("username", e.target.value)}
                      placeholder="user@example.com"
                      className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs text-[var(--jarvis-text-secondary)]">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={visibleFields.has("password") ? "text" : "password"}
                        value={credentials.password ?? ""}
                        onChange={(e) => updateField("password", e.target.value)}
                        placeholder="Enter password"
                        className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility("password")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--jarvis-text-muted)] hover:text-[var(--jarvis-text-primary)]"
                      >
                        {visibleFields.has("password") ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Integration-specific credential fields */}
              {integration.credentialFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key} className="text-xs text-[var(--jarvis-text-secondary)]">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-0.5">*</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.key}
                      type={
                        field.type === "password" && !visibleFields.has(field.key)
                          ? "password"
                          : field.type === "password"
                          ? "text"
                          : field.type
                      }
                      value={credentials[field.key] ?? ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder ?? ""}
                      className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)] pr-10"
                    />
                    {field.type === "password" && (
                      <button
                        type="button"
                        onClick={() => toggleVisibility(field.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--jarvis-text-muted)] hover:text-[var(--jarvis-text-primary)]"
                      >
                        {visibleFields.has(field.key) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* CLI method adds command field */}
              {method === "cli" && (
                <div className="space-y-1.5">
                  <Label htmlFor="cliCommand" className="text-xs text-[var(--jarvis-text-secondary)]">
                    CLI Command
                  </Label>
                  <Input
                    id="cliCommand"
                    type="text"
                    value={credentials.cliCommand ?? ""}
                    onChange={(e) => updateField("cliCommand", e.target.value)}
                    placeholder="e.g., aws cli, npx tool-name"
                    className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[var(--jarvis-border)] text-[var(--jarvis-text-secondary)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[var(--jarvis-accent)] text-[var(--jarvis-bg-primary)] hover:bg-[var(--jarvis-accent)]/90"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plug className="h-4 w-4 mr-1" />}
            Save
          </Button>
          {registryRecord && (
            <Button
              onClick={handleSaveAndTest}
              disabled={isSaving || isTesting}
              variant="outline"
              className="border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <TestTube className="h-4 w-4 mr-1" />}
              Save & Test
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
