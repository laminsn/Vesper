"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus, Clock, Eye } from "lucide-react";
import {
  GlowCard,
  PriorityBadge,
  DepartmentBadge,
  StatusIndicator,
} from "@/components/jarvis";
import { getAgentBySlug } from "@/data/agents";
import { formatRelativeTime } from "@/lib/utils";
import type { TaskStatus } from "@/types";
import type { EnhancedTask, ColumnDef, TaskOperations } from "./task-types";
import {
  DEFAULT_COLUMNS,
  getDeadlineStatus,
  getDeadlineColor,
  formatDeadline,
} from "./task-types";

/* ───── props ───── */

interface KanbanViewProps {
  readonly tasks: readonly EnhancedTask[];
  readonly operations: TaskOperations;
  readonly onOpenTask: (task: EnhancedTask) => void;
}

/* ───── draggable task card ───── */

function DraggableTaskCard({
  task,
  onOpen,
}: {
  readonly task: EnhancedTask;
  readonly onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
    >
      <TaskCardContent task={task} />
    </div>
  );
}

function TaskCardContent({
  task,
  isDragging,
}: {
  readonly task: EnhancedTask;
  readonly isDragging?: boolean;
}) {
  const agent = getAgentBySlug(task.assigned_agent_id);
  const deadlineStatus = getDeadlineStatus(task.deadline);
  const deadlineColor = getDeadlineColor(deadlineStatus);

  return (
    <GlowCard
      className={`p-3 space-y-2 ${isDragging ? "shadow-2xl ring-2 ring-[var(--jarvis-accent)]" : ""}`}
      hover={false}
    >
      <p className="text-sm font-medium text-[var(--jarvis-text-primary)] leading-snug">
        {task.title}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <PriorityBadge priority={task.priority} />
        <DepartmentBadge slug={task.department_id} size="sm" />
      </div>
      {task.deadline && (
        <div className={`flex items-center gap-1 text-[10px] ${deadlineColor}`}>
          <Clock className="h-3 w-3" />
          {formatDeadline(task.deadline)}
        </div>
      )}
      <div className="flex items-center justify-between pt-0.5">
        {agent && (
          <div className="flex items-center gap-1.5">
            <StatusIndicator status={agent.status} size="sm" />
            <span className="text-xs text-[var(--jarvis-text-secondary)]">
              {agent.name}
            </span>
          </div>
        )}
        {task.last_viewed_at && (
          <div className="flex items-center gap-1 text-[10px] text-[var(--jarvis-text-muted)]">
            <Eye className="h-2.5 w-2.5" />
            {formatRelativeTime(task.last_viewed_at)}
          </div>
        )}
      </div>
    </GlowCard>
  );
}

/* ───── droppable column ───── */

function KanbanColumn({
  column,
  tasks,
  onOpenTask,
}: {
  readonly column: ColumnDef;
  readonly tasks: readonly EnhancedTask[];
  readonly onOpenTask: (task: EnhancedTask) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col min-w-[280px] w-[280px] shrink-0"
    >
      {/* Column header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-lg border border-b-0 border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)]"
        style={{ borderTopWidth: 2, borderTopColor: column.accent }}
      >
        <span className="text-sm font-semibold text-[var(--jarvis-text-primary)]">
          {column.label}
        </span>
        <span
          className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
          style={{
            backgroundColor: `${column.accent}20`,
            color: column.accent,
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Column body */}
      <div
        className={`flex-1 space-y-2 p-2 rounded-b-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] transition-colors min-h-[200px] ${
          isOver
            ? "bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-accent)]"
            : ""
        }`}
      >
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onOpen={() => onOpenTask(task)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-[var(--jarvis-text-muted)]">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

/* ───── main kanban view ───── */

export function KanbanView({ tasks, operations, onOpenTask }: KanbanViewProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [columns, setColumns] = useState<readonly ColumnDef[]>(DEFAULT_COLUMNS);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, EnhancedTask[]> = {};
    for (const col of columns) {
      grouped[col.id] = [];
    }
    for (const task of tasks) {
      if (grouped[task.status]) {
        grouped[task.status] = [...grouped[task.status], task];
      }
    }
    return grouped;
  }, [tasks, columns]);

  const activeTask = useMemo(
    () =>
      activeTaskId ? tasks.find((t) => t.id === activeTaskId) ?? null : null,
    [activeTaskId, tasks]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTaskId(null);
      const { active, over } = event;
      if (!over) return;
      const targetStatus = over.id as TaskStatus;
      const taskId = String(active.id);
      operations.moveTask(taskId, targetStatus);
    },
    [operations]
  );

  const handleDragCancel = useCallback(() => {
    setActiveTaskId(null);
  }, []);

  const handleAddColumn = useCallback(() => {
    if (!newColumnName.trim()) return;
    const slug = newColumnName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_") as TaskStatus;
    const newCol: ColumnDef = {
      id: slug,
      label: newColumnName.trim(),
      accent: "var(--jarvis-accent-2)",
    };
    setColumns((prev) => [...prev, newCol]);
    setNewColumnName("");
    setAddingColumn(false);
  }, [newColumnName]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={tasksByColumn[col.id] ?? []}
            onOpenTask={onOpenTask}
          />
        ))}

        {/* Add column */}
        <div className="min-w-[200px] shrink-0">
          {addingColumn ? (
            <div className="rounded-lg border border-dashed border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] p-3 space-y-2">
              <input
                autoFocus
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddColumn();
                  if (e.key === "Escape") setAddingColumn(false);
                }}
                placeholder="Column name..."
                className="w-full rounded-md border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-2 py-1.5 text-sm text-[var(--jarvis-text-primary)] outline-none focus:border-[var(--jarvis-accent)]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddColumn}
                  className="rounded-md bg-[var(--jarvis-accent)] px-3 py-1 text-xs font-medium text-black"
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingColumn(false)}
                  className="text-xs text-[var(--jarvis-text-muted)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingColumn(true)}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--jarvis-border)] bg-transparent px-4 py-3 text-sm text-[var(--jarvis-text-muted)] hover:border-[var(--jarvis-accent)] hover:text-[var(--jarvis-accent)] transition-colors w-full justify-center"
            >
              <Plus className="h-4 w-4" />
              Add Column
            </button>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-[280px]">
            <TaskCardContent task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
