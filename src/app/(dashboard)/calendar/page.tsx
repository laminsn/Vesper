"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Clock,
  MapPin,
  Users,
  FileText,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAgents } from "@/hooks/use-agents";
import { useDepartments } from "@/hooks/use-departments";
import { useCalendarEvents, useCreateEvent, type CalendarEvent } from "@/hooks/use-calendar";
import { useMeetingNotes, useCreateMeetingNote, type MeetingNote } from "@/hooks/use-meeting-notes";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { GlowCard, HudFrame, StatusIndicator } from "@/components/jarvis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

/* ───── constants ───── */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const EVENT_TYPE_COLORS: Record<string, string> = {
  meeting: "#3b82f6",
  standup: "#06d6a0",
  appointment: "#f59e0b",
  follow_up: "#8b5cf6",
  review: "#ec4899",
  training: "#14b8a6",
  deadline: "#ef4444",
  idt: "#4cc9f0",
  briefing: "#f97316",
  call: "#6366f1",
};

const DEPT_COLORS: Record<string, string> = {
  executive: "#f59e0b",
  marketing: "#ec4899",
  "clinical-operations": "#ef4444",
  "admissions-intake": "#3b82f6",
  "caregiver-staffing": "#8b5cf6",
  "customer-experience": "#06d6a0",
  "compliance-quality": "#f97316",
  "accounting-finance": "#14b8a6",
};

/* ───── animations ───── */

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

/* ───── helpers ───── */

function getDaysInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  const startPad = firstDay.getDay();
  for (let i = startPad - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
  }
  return days;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDateFull(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function getDeptLabel(dept: string): string {
  return dept.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/* ───── page ───── */

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const { data: events = [], isLoading } = useCalendarEvents(monthKey);
  const { data: agents = [] } = useAgents();
  const { data: departments = [] } = useDepartments();

  useRealtimeSubscription("calendar_events");

  const days = useMemo(() => getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()), [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const key = new Date(ev.start_time).toISOString().split("T")[0];
      map.set(key, [...(map.get(key) ?? []), ev]);
    }
    return map;
  }, [events]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = selectedDate.toISOString().split("T")[0];
    return eventsByDate.get(key) ?? [];
  }, [selectedDate, eventsByDate]);

  const prevMonth = () => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  const today = new Date();

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">Calendar</h1>
          <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
            Agent events, meetings, and Google Calendar sync
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={prevMonth} className="border-[var(--jarvis-border)] text-[var(--jarvis-text-secondary)]">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[180px] text-center">
              <span className="text-sm font-semibold text-[var(--jarvis-text-primary)]">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={nextMonth} className="border-[var(--jarvis-border)] text-[var(--jarvis-text-secondary)]">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="bg-[var(--jarvis-accent)] text-[var(--jarvis-bg-primary)] hover:bg-[var(--jarvis-accent)]/80"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Event
          </Button>
        </div>
      </motion.div>

      {/* Calendar + Side Panel */}
      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Calendar Grid */}
        <motion.div variants={fadeUp}>
          <HudFrame title="CALENDAR" className="overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--jarvis-accent)]" />
              </div>
            ) : (
              <>
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-[var(--jarvis-border)]">
                  {DAYS.map((d) => (
                    <div key={d} className="py-2 text-center text-[10px] font-mono uppercase tracking-wider text-[var(--jarvis-text-muted)]">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7">
                  {days.map((day, i) => {
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const isToday = isSameDay(day, today);
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const key = day.toISOString().split("T")[0];
                    const dayEvents = eventsByDate.get(key) ?? [];

                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(day)}
                        className={`min-h-[80px] border-b border-r border-[var(--jarvis-border)] p-1.5 text-left transition-colors ${
                          isSelected
                            ? "bg-[var(--jarvis-accent)]/10"
                            : isToday
                            ? "bg-[var(--jarvis-bg-tertiary)]"
                            : "hover:bg-[var(--jarvis-bg-secondary)]"
                        } ${!isCurrentMonth ? "opacity-30" : ""}`}
                      >
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                            isToday
                              ? "bg-[var(--jarvis-accent)] text-[var(--jarvis-bg-primary)] font-bold"
                              : "text-[var(--jarvis-text-secondary)]"
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <div
                              key={ev.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setSelectedDate(day); }}
                              className="truncate rounded px-1 py-0.5 text-[9px] font-medium cursor-pointer hover:brightness-125"
                              style={{
                                backgroundColor: `${EVENT_TYPE_COLORS[ev.event_type] ?? "#666"}20`,
                                color: EVENT_TYPE_COLORS[ev.event_type] ?? "#666",
                              }}
                            >
                              {formatTime(ev.start_time)} {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[9px] text-[var(--jarvis-text-muted)]">+{dayEvents.length - 3} more</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </HudFrame>
        </motion.div>

        {/* Side Panel */}
        <motion.div variants={fadeUp} className="space-y-4">
          {/* Selected Date Events */}
          <HudFrame title={selectedDate ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "SELECT A DAY"}>
            <ScrollArea className="h-[300px]">
              {selectedDateEvents.length === 0 ? (
                <p className="text-xs text-[var(--jarvis-text-muted)] text-center py-8">
                  {selectedDate ? "No events this day" : "Click a day to view events"}
                </p>
              ) : (
                <div className="space-y-2 pr-2">
                  {selectedDateEvents.map((ev) => {
                    const agent = agents.find((a) => a.id === ev.assigned_agent_id);
                    return (
                      <GlowCard
                        key={ev.id}
                        className="p-3 cursor-pointer"
                        glowColor={DEPT_COLORS[ev.department ?? ""] ?? EVENT_TYPE_COLORS[ev.event_type]}
                        hover
                        onClick={() => setSelectedEvent(ev)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase"
                            style={{
                              backgroundColor: `${EVENT_TYPE_COLORS[ev.event_type] ?? "#666"}20`,
                              color: EVENT_TYPE_COLORS[ev.event_type] ?? "#666",
                            }}
                          >
                            {ev.event_type}
                          </span>
                          {ev.google_meet_link && (
                            <Video className="h-3 w-3 text-blue-400" />
                          )}
                          {ev.status === "completed" && (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          )}
                        </div>
                        <p className="text-xs font-medium text-[var(--jarvis-text-primary)]">{ev.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--jarvis-text-muted)]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {formatTime(ev.start_time)}{ev.end_time ? ` — ${formatTime(ev.end_time)}` : ""}
                          </span>
                          {agent && (
                            <span className="flex items-center gap-1">
                              <Users className="h-2.5 w-2.5" />
                              {agent.name}
                            </span>
                          )}
                        </div>
                      </GlowCard>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </HudFrame>

          {/* Event Detail / Meeting Notes */}
          {selectedEvent && (
            <EventDetailPanel
              event={selectedEvent}
              agents={agents}
              onClose={() => setSelectedEvent(null)}
            />
          )}
        </motion.div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        agents={agents}
        departments={departments}
        defaultDate={selectedDate}
      />
    </motion.div>
  );
}

/* ───── Event Detail Panel ───── */

function EventDetailPanel({
  event,
  agents,
  onClose,
}: {
  readonly event: CalendarEvent;
  readonly agents: readonly { id: string; name: string; slug: string }[];
  readonly onClose: () => void;
}) {
  const { data: notes = [], isLoading } = useMeetingNotes(event.id);
  const createNote = useCreateMeetingNote();
  const [noteBody, setNoteBody] = useState("");
  const [noteType, setNoteType] = useState("summary");

  const agent = agents.find((a) => a.id === event.assigned_agent_id);
  const attendeeList = Array.isArray(event.attendees) ? event.attendees : [];

  const handleAddNote = async () => {
    if (!noteBody.trim()) return;
    try {
      await createNote.mutateAsync({
        event_id: event.id,
        note_type: noteType,
        title: `${noteType.charAt(0).toUpperCase() + noteType.slice(1).replace("_", " ")} — ${event.title}`,
        body: noteBody.trim(),
      });
      setNoteBody("");
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    }
  };

  return (
    <HudFrame title="EVENT DETAILS">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--jarvis-text-primary)]">{event.title}</p>
            <p className="text-[10px] text-[var(--jarvis-text-muted)] mt-0.5">
              {formatDateFull(event.start_time)} &middot; {formatTime(event.start_time)}
              {event.end_time ? ` — ${formatTime(event.end_time)}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--jarvis-text-muted)] hover:text-[var(--jarvis-text-primary)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="rounded-full px-2 py-0.5 bg-[var(--jarvis-bg-tertiary)] text-[var(--jarvis-text-secondary)]">
            {event.event_type}
          </span>
          {event.department && (
            <span className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${DEPT_COLORS[event.department] ?? "#666"}20`, color: DEPT_COLORS[event.department] ?? "#666" }}>
              {getDeptLabel(event.department)}
            </span>
          )}
          {agent && (
            <span className="rounded-full px-2 py-0.5 bg-[var(--jarvis-accent)]/10 text-[var(--jarvis-accent)]">
              {agent.name}
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-xs text-[var(--jarvis-text-secondary)]">{event.description}</p>
        )}

        {/* Google Meet Link */}
        {event.google_meet_link && (
          <a
            href={event.google_meet_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/20 transition-colors"
          >
            <Video className="h-4 w-4" />
            Join Google Meet
          </a>
        )}

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--jarvis-text-muted)]">
            <MapPin className="h-3 w-3" />
            {event.location}
          </div>
        )}

        {/* Attendees */}
        {attendeeList.length > 0 && (
          <div>
            <p className="text-[10px] font-mono uppercase text-[var(--jarvis-text-muted)] mb-1">Attendees</p>
            <div className="flex flex-wrap gap-1">
              {attendeeList.map((a, i) => (
                <span key={i} className="rounded-full bg-[var(--jarvis-bg-tertiary)] px-2 py-0.5 text-[10px] text-[var(--jarvis-text-secondary)]">
                  {a.name}{a.role ? ` (${a.role})` : ""}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Notes */}
        <Tabs defaultValue="notes" className="mt-2">
          <TabsList className="bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)]">
            <TabsTrigger value="notes" className="text-[10px]">Notes ({notes.length})</TabsTrigger>
            <TabsTrigger value="add" className="text-[10px]">Add Note</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-2">
            <ScrollArea className="h-[200px]">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[var(--jarvis-accent)] mx-auto mt-4" />
              ) : notes.length === 0 ? (
                <p className="text-[10px] text-[var(--jarvis-text-muted)] text-center py-4">No notes yet</p>
              ) : (
                <div className="space-y-2 pr-2">
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-lg bg-[var(--jarvis-bg-tertiary)] px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold uppercase text-[var(--jarvis-accent)]">{n.note_type.replace("_", " ")}</span>
                        <span className="text-[9px] text-[var(--jarvis-text-muted)]">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-[var(--jarvis-text-primary)]">{n.body}</p>
                      {n.action_items.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {n.action_items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-[var(--jarvis-text-secondary)]">
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                              {item.task}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="add" className="mt-2 space-y-2">
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger className="h-8 text-xs bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)]">
                <SelectItem value="agenda" className="text-[var(--jarvis-text-primary)]">Agenda</SelectItem>
                <SelectItem value="briefing" className="text-[var(--jarvis-text-primary)]">Briefing</SelectItem>
                <SelectItem value="live_notes" className="text-[var(--jarvis-text-primary)]">Live Notes</SelectItem>
                <SelectItem value="summary" className="text-[var(--jarvis-text-primary)]">Summary</SelectItem>
                <SelectItem value="action_items" className="text-[var(--jarvis-text-primary)]">Action Items</SelectItem>
                <SelectItem value="follow_up" className="text-[var(--jarvis-text-primary)]">Follow Up</SelectItem>
                <SelectItem value="recording_transcript" className="text-[var(--jarvis-text-primary)]">Recording Transcript</SelectItem>
              </SelectContent>
            </Select>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Type your note..."
              rows={4}
              className="w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-3 py-2 text-xs text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)] focus:border-[var(--jarvis-accent)] focus:outline-none"
            />
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={createNote.isPending || !noteBody.trim()}
              className="w-full bg-[var(--jarvis-accent)] text-[var(--jarvis-bg-primary)]"
            >
              {createNote.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
              Add Note
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </HudFrame>
  );
}

/* ───── Create Event Modal ───── */

function CreateEventModal({
  open,
  onOpenChange,
  agents,
  departments,
  defaultDate,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly agents: readonly { id: string; name: string; slug: string; department: string }[];
  readonly departments: readonly { slug: string; name: string }[];
  readonly defaultDate: Date | null;
}) {
  const createEvent = useCreateEvent();
  const defaultDateStr = defaultDate ? defaultDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("meeting");
  const [date, setDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [department, setDepartment] = useState("");
  const [agentId, setAgentId] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    try {
      await createEvent.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        event_type: eventType,
        start_time: `${date}T${startTime}:00`,
        end_time: `${date}T${endTime}:00`,
        department: department || undefined,
        assigned_agent_id: agentId || undefined,
        google_meet_link: meetLink.trim() || undefined,
        location: location.trim() || undefined,
      });
      toast.success("Event created");
      onOpenChange(false);
      setTitle(""); setDescription(""); setMeetLink(""); setLocation("");
    } catch {
      toast.error("Failed to create event");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--jarvis-text-primary)]">New Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label className="text-xs text-[var(--jarvis-text-secondary)]">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Leadership Standup" className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[var(--jarvis-text-secondary)]">Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)]">
                  {Object.keys(EVENT_TYPE_COLORS).map((t) => (
                    <SelectItem key={t} value={t} className="text-[var(--jarvis-text-primary)] capitalize">{t.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[var(--jarvis-text-secondary)]">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent className="bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)]">
                  {departments.map((d) => (
                    <SelectItem key={d.slug} value={d.slug} className="text-[var(--jarvis-text-primary)]">{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[var(--jarvis-text-secondary)]">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[var(--jarvis-text-secondary)]">Start</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[var(--jarvis-text-secondary)]">End</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-[var(--jarvis-text-secondary)]">Assigned Agent</Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]"><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent className="bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)]">
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-[var(--jarvis-text-primary)]">{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-[var(--jarvis-text-secondary)]">Google Meet Link</Label>
            <Input value={meetLink} onChange={(e) => setMeetLink(e.target.value)} placeholder="https://meet.google.com/..." className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-[var(--jarvis-text-secondary)]">Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Conference Room / Virtual" className="bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-primary)]" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-[var(--jarvis-text-secondary)]">Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meeting agenda, notes..."
              rows={3}
              className="w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-3 py-2 text-xs text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)] focus:border-[var(--jarvis-accent)] focus:outline-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[var(--jarvis-border)] text-[var(--jarvis-text-secondary)]">Cancel</Button>
          <Button onClick={handleCreate} disabled={createEvent.isPending} className="bg-[var(--jarvis-accent)] text-[var(--jarvis-bg-primary)]">
            {createEvent.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            Create Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
