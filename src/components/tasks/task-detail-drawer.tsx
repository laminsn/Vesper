"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  MessageSquare,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { PriorityBadge, DepartmentBadge, StatusIndicator } from "@/components/jarvis";
import { agents, getAgentBySlug } from "@/data/agents";
import { departments } from "@/data/departments";
import { formatRelativeTime } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/types";
import type { EnhancedTask, TaskOperations } from "./task-types";
import {
  getDeadlineStatus,
  getDeadlineColor,
  formatDeadline,
  generateId,
} from "./task-types";

/* ───── props ───── */

interface TaskDetailDrawerProps {
  readonly task: EnhancedTask | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly operations: TaskOperations;
}

/* ───── status options ───── */

const STATUS_OPTIONS: readonly { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS: readonly { value: TaskPriority; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

/* ───── component ───── */

export function TaskDetailDrawer({
  task,
  isOpen,
  onClose,
  operations,
}: TaskDetailDrawerProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleTitleSave = useCallback(() => {
    if (!task || !titleDraft.trim()) return;
    operations.updateTask(task.id, { title: titleDraft.trim() });
    setEditingTitle(false);
  }, [task, titleDraft, operations]);

  const handleDescSave = useCallback(() => {
    if (!task) return;
    operations.updateTask(task.id, { description: descDraft });
    setEditingDesc(false);
  }, [task, descDraft, operations]);

  const handleAddSubtask = useCallback(() => {
    if (!task || !newSubtask.trim()) return;
    const updated = [
      ...task.subtasks,
      { id: generateId(), title: newSubtask.trim(), completed: false },
    ];
    operations.updateTask(task.id, { subtasks: updated });
    setNewSubtask("");
  }, [task, newSubtask, operations]);

  const handleToggleSubtask = useCallback(
    (subtaskId: string) => {
      if (!task) return;
      const updated = task.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      );
      operations.updateTask(task.id, { subtasks: updated });
    },
    [task, operations]
  );

  const handleAddComment = useCallback(() => {
    if (!task || !newComment.trim()) return;
    const updated = [
      ...task.comments,
      {
        id: generateId(),
        author: "Lamin",
        text: newComment.trim(),
        created_at: new Date().toISOString(),
      },
    ];
    operations.updateTask(task.id, { comments: updated });
    setNewComment("");
  }, [task, newComment, operations]);

  const handleAddTag = useCallback(() => {
    if (!task || !newTag.trim()) return;
    if (task.tags.includes(newTag.trim())) return;
    operations.updateTask(task.id, { tags: [...task.tags, newTag.trim()] });
    setNewTag("");
    setShowTagInput(false);
  }, [task, newTag, operations]);

  const handleRemoveTag = useCallback(
    (tag: string) => {
      if (!task) return;
      operations.updateTask(task.id, {
        tags: task.tags.filter((t) => t !== tag),
      });
    },
    [task, operations]
  );

  const handleSignOff = useCallback(() => {
    if (!task) return;
    operations.updateTask(task.id, {
      signed_off_by: "Lamin",
      signed_off_at: new Date().toISOString(),
    });
  }, [task, operations]);

  const handleDelete = useCallback(() => {
    if (!task) return;
    operations.deleteTask(task.id);
    onClose();
    setConfirmDelete(false);
  }, [task, operations, onClose]);

  if (!task) return null;

  const deadlineStatus = getDeadlineStatus(task.deadline);
  const deadlineColor = getDeadlineColor(deadlineStatus);
  const agent = getAgentBySlug(task.assigned_agent_id);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto border-l border-[var(--jarvis-border)] bg-[var(--jarvis-bg-primary)] shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--jarvis-border)] bg-[var(--jarvis-bg-primary)] px-6 py-4">
              <div className="flex items-center gap-2">
                <PriorityBadge priority={task.priority} />
                {deadlineStatus === "overdue" && (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <AlertTriangle className="h-3 w-3" />
                    Overdue
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-[var(--jarvis-text-muted)] hover:bg-[var(--jarvis-bg-secondary)] hover:text-[var(--jarvis-text-primary)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-5">
              {/* Title */}
              <div>
                {editingTitle ? (
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTitleSave();
                      if (e.key === "Escape") setEditingTitle(false);
                    }}
                    className="w-full bg-transparent text-xl font-semibold text-[var(--jarvis-text-primary)] border-b border-[var(--jarvis-accent)] outline-none pb-1"
                  />
                ) : (
                  <h2
                    onClick={() => {
                      setTitleDraft(task.title);
                      setEditingTitle(true);
                    }}
                    className="text-xl font-semibold text-[var(--jarvis-text-primary)] cursor-pointer hover:text-[var(--jarvis-accent)] transition-colors"
                  >
                    {task.title}
                  </h2>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-2 block">
                  Description
                </label>
                {editingDesc ? (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      value={descDraft}
                      onChange={(e) => setDescDraft(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-3 py-2 text-sm text-[var(--jarvis-text-primary)] outline-none focus:border-[var(--jarvis-accent)] resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleDescSave}
                        className="rounded-md bg-[var(--jarvis-accent)] px-3 py-1 text-xs font-medium text-black"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingDesc(false)}
                        className="rounded-md px-3 py-1 text-xs text-[var(--jarvis-text-muted)] hover:text-[var(--jarvis-text-primary)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    onClick={() => {
                      setDescDraft(task.description);
                      setEditingDesc(true);
                    }}
                    className="text-sm text-[var(--jarvis-text-secondary)] cursor-pointer hover:text-[var(--jarvis-text-primary)] transition-colors leading-relaxed"
                  >
                    {task.description || "Click to add description..."}
                  </p>
                )}
              </div>

              {/* Status & Priority row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-2 block">
                    Status
                  </label>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      operations.moveTask(task.id, e.target.value as TaskStatus)
                    }
                    className="w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-3 py-2 text-sm text-[var(--jarvis-text-primary)] outline-none focus:border-[var(--jarvis-accent)]"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-2 block">
                    Priority
                  </label>
                  <select
                    value={task.priority}
                    onChange={(e) =>
                      operations.updateTask(task.id, {
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-3 py-2 text-sm text-[var(--jarvis-text-primary)] outline-none focus:border-[var(--jarvis-accent)]"
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Agent & Department row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-2 block">
                    Assigned Agent
                  </label>
                  <select
                    value={task.assigned_agent_id}
                    onChange={(e) =>
                      operations.updateTask(task.id, {
                        assigned_agent_id: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-3 py-2 text-sm text-[var(--jarvis-text-primary)] outline-none focus:border-[var(--jarvis-accent)]"
                  >
                    {agents.map((a) => (
                      <option key={a.slug} value={a.slug}>
                        {a.name} — {a.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-2 block">
                    Department
                  </label>
                  <select
                    value={task.department_id}
                    onChange={(e) =>
                      operations.updateTask(task.id, {
                        department_id: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-3 py-2 text-sm text-[var(--jarvis-text-primary)] outline-none focus:border-[var(--jarvis-accent)]"
                  >
                    {departments.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-2 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Deadline
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={task.deadline ? task.deadline.split("T")[0] : ""}
                    onChange={(e) =>
                      operations.updateTask(task.id, {
                        deadline: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      })
                    }
                    className="rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-3 py-2 text-sm text-[var(--jarvis-text-primary)] outline-none focus:border-[var(--jarvis-accent)]"
                  />
                  <span className={`text-xs font-medium ${deadlineColor}`}>
                    {formatDeadline(task.deadline)}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-2 flex items-center gap-1.5">
                  <Tag className="h-3 w-3" />
                  Tags
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--jarvis-accent)]15 px-2.5 py-0.5 text-xs text-[var(--jarvis-accent)] border border-[var(--jarvis-accent)]30"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {showTagInput ? (
                    <input
                      autoFocus
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddTag();
                        if (e.key === "Escape") setShowTagInput(false);
                      }}
                      onBlur={() => {
                        if (newTag.trim()) handleAddTag();
                        else setShowTagInput(false);
                      }}
                      placeholder="Tag name..."
                      className="rounded-full border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-2.5 py-0.5 text-xs text-[var(--jarvis-text-primary)] outline-none focus:border-[var(--jarvis-accent)] w-24"
                    />
                  ) : (
                    <button
                      onClick={() => setShowTagInput(true)}
                      className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-[var(--jarvis-border)] px-2 py-0.5 text-xs text-[var(--jarvis-text-muted)] hover:border-[var(--jarvis-accent)] hover:text-[var(--jarvis-accent)] transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-2 flex items-center gap-1.5">
                  <CheckSquare className="h-3 w-3" />
                  Subtasks ({completedSubtasks}/{task.subtasks.length})
                </label>
                {task.subtasks.length > 0 && (
                  <div className="mb-2 h-1.5 rounded-full bg-[var(--jarvis-bg-tertiary)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--jarvis-success)] transition-all"
                      style={{
                        width: `${task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  {task.subtasks.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleToggleSubtask(sub.id)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[var(--jarvis-bg-secondary)] transition-colors text-left"
                    >
                      {sub.completed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--jarvis-success)]" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-[var(--jarvis-text-muted)]" />
                      )}
                      <span
                        className={
                          sub.completed
                            ? "line-through text-[var(--jarvis-text-muted)]"
                            : "text-[var(--jarvis-text-primary)]"
                        }
                      >
                        {sub.title}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddSubtask();
                    }}
                    placeholder="Add a subtask..."
                    className="flex-1 rounded-md border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-3 py-1.5 text-sm text-[var(--jarvis-text-primary)] outline-none focus:border-[var(--jarvis-accent)]"
                  />
                  <button
                    onClick={handleAddSubtask}
                    disabled={!newSubtask.trim()}
                    className="rounded-md bg-[var(--jarvis-accent)]20 px-3 py-1.5 text-xs font-medium text-[var(--jarvis-accent)] hover:bg-[var(--jarvis-accent)]30 transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3" />
                  Comments ({task.comments.length})
                </label>
                <div className="space-y-3 mb-3">
                  {task.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[var(--jarvis-accent)]">
                          {comment.author}
                        </span>
                        <span className="text-[10px] text-[var(--jarvis-text-muted)]">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--jarvis-text-secondary)] leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  ))}
                  {task.comments.length === 0 && (
                    <p className="text-xs text-[var(--jarvis-text-muted)] italic">
                      No comments yet
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    className="flex-1 rounded-md border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-3 py-2 text-sm text-[var(--jarvis-text-primary)] outline-none focus:border-[var(--jarvis-accent)] resize-none"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="rounded-md bg-[var(--jarvis-accent)]20 px-3 py-2 text-xs font-medium text-[var(--jarvis-accent)] hover:bg-[var(--jarvis-accent)]30 transition-colors disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Activity log */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-2 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Activity
                </label>
                <div className="space-y-2 text-xs text-[var(--jarvis-text-secondary)]">
                  {task.last_viewed_by && task.last_viewed_at && (
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3 text-[var(--jarvis-text-muted)]" />
                      Last viewed by {task.last_viewed_by}{" "}
                      {formatRelativeTime(task.last_viewed_at)}
                    </div>
                  )}
                  {agent && (
                    <div className="flex items-center gap-2">
                      <StatusIndicator status={agent.status} size="sm" />
                      Assigned to {agent.name} ({agent.role})
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-[var(--jarvis-text-muted)]" />
                    Created {formatRelativeTime(task.created_at)}
                  </div>
                </div>
              </div>

              {/* Sign-off section */}
              {task.sign_off_required && (
                <div className="rounded-lg border border-[var(--jarvis-accent)]30 bg-[var(--jarvis-accent)]10 p-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--jarvis-accent)] mb-2 block">
                    Sign-off Required
                  </label>
                  {task.signed_off_by ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--jarvis-success)]">
                      <CheckCircle2 className="h-4 w-4" />
                      Signed off by {task.signed_off_by}{" "}
                      {task.signed_off_at &&
                        formatRelativeTime(task.signed_off_at)}
                    </div>
                  ) : (
                    <button
                      onClick={handleSignOff}
                      className="rounded-md bg-[var(--jarvis-accent)] px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition-opacity"
                    >
                      Sign Off as Lamin
                    </button>
                  )}
                </div>
              )}

              {/* Delete */}
              <div className="border-t border-[var(--jarvis-border)] pt-4">
                {confirmDelete ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-red-400">
                      Are you sure? This cannot be undone.
                    </span>
                    <button
                      onClick={handleDelete}
                      className="rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-[var(--jarvis-text-muted)] hover:text-[var(--jarvis-text-primary)]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Task
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
