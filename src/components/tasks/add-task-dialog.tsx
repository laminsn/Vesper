"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { agents } from "@/data/agents";
import { departments } from "@/data/departments";
import type { TaskPriority } from "@/types";
import type { EnhancedTask, TaskOperations } from "./task-types";
import { generateId } from "./task-types";

/* ───── props ───── */

interface AddTaskDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly operations: TaskOperations;
}

/* ───── initial form state ───── */

interface FormState {
  readonly title: string;
  readonly description: string;
  readonly priority: TaskPriority;
  readonly department_id: string;
  readonly assigned_agent_id: string;
  readonly deadline: string;
  readonly tagsRaw: string;
  readonly sign_off_required: boolean;
}

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  priority: "normal",
  department_id: "marketing",
  assigned_agent_id: "",
  deadline: "",
  tagsRaw: "",
  sign_off_required: false,
};

/* ───── component ───── */

export function AddTaskDialog({
  isOpen,
  onClose,
  operations,
}: AddTaskDialogProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  const filteredAgents = useMemo(
    () => agents.filter((a) => a.department === form.department_id),
    [form.department_id]
  );

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setError(null);
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    const agentId =
      form.assigned_agent_id || filteredAgents[0]?.slug || agents[0].slug;

    const tags = form.tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newTask: EnhancedTask = {
      id: generateId(),
      title: form.title.trim(),
      description: form.description.trim(),
      status: "todo",
      priority: form.priority,
      assigned_agent_id: agentId,
      department_id: form.department_id,
      deadline: form.deadline
        ? new Date(form.deadline).toISOString()
        : null,
      created_at: new Date().toISOString(),
      last_viewed_by: null,
      last_viewed_at: null,
      sign_off_required: form.sign_off_required,
      signed_off_by: null,
      signed_off_at: null,
      tags,
      subtasks: [],
      comments: [],
    };

    operations.addTask(newTask);
    setForm(INITIAL_FORM);
    onClose();
  }, [form, filteredAgents, operations, onClose]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setForm(INITIAL_FORM);
        setError(null);
        onClose();
      }
    },
    [onClose]
  );

  const selectClasses =
    "w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-3 py-2 text-sm text-[var(--jarvis-text-primary)] outline-none focus:border-[var(--jarvis-accent)]";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a task and assign it to an agent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-1.5 block">
              Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Task title..."
              className={selectClasses}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-xs text-red-400">{error}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-1.5 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Task description..."
              rows={3}
              className={`${selectClasses} resize-none`}
            />
          </div>

          {/* Priority & Department row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-1.5 block">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  updateField("priority", e.target.value as TaskPriority)
                }
                className={selectClasses}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-1.5 block">
                Department
              </label>
              <select
                value={form.department_id}
                onChange={(e) => {
                  updateField("department_id", e.target.value);
                  updateField("assigned_agent_id", "");
                }}
                className={selectClasses}
              >
                {departments.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Agent */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-1.5 block">
              Assigned Agent
            </label>
            <select
              value={form.assigned_agent_id}
              onChange={(e) =>
                updateField("assigned_agent_id", e.target.value)
              }
              className={selectClasses}
            >
              <option value="">
                {filteredAgents.length > 0
                  ? "Select an agent..."
                  : "No agents in department"}
              </option>
              {filteredAgents.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name} — {a.role}
                </option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-1.5 block">
              Deadline
            </label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => updateField("deadline", e.target.value)}
              className={selectClasses}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-1.5 block">
              Tags (comma-separated)
            </label>
            <input
              value={form.tagsRaw}
              onChange={(e) => updateField("tagsRaw", e.target.value)}
              placeholder="e.g. urgent, billing, q1"
              className={selectClasses}
            />
          </div>

          {/* Sign-off toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                updateField("sign_off_required", !form.sign_off_required)
              }
              className={`relative h-5 w-9 rounded-full transition-colors ${
                form.sign_off_required
                  ? "bg-[var(--jarvis-accent)]"
                  : "bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  form.sign_off_required ? "left-4" : "left-0.5"
                }`}
              />
            </button>
            <span className="text-sm text-[var(--jarvis-text-secondary)]">
              Requires sign-off
            </span>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-[var(--jarvis-accent)] px-4 py-2.5 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
          >
            Create Task
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
