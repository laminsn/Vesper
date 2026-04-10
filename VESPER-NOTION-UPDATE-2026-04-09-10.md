# Vesper (AI Army Command Center) — Full System Update

> **Date**: April 9-10, 2026
> **Prepared by**: Claude Code (Opus 4.6)
> **Deployed at**: https://vesper-wheat.vercel.app
> **Repository**: https://github.com/laminsn/Vesper
> **Supabase Project**: awhqismttxaxbvyfkhvg

---

## Executive Summary

Vesper (formerly "Nexus") is now a fully operational AI Agent Workforce Management Platform for Happier Homes Comfort Care. Over the past 2 sessions, we built and deployed the complete system from scratch — 25+ pages, 60+ integrations, 42 agents, real-time data, and full Vercel cloud deployment eliminating the need to run locally.

---

## 1. PLATFORM OVERVIEW

### Rebranding
- **Old name**: AI Army Nexus
- **New name**: AI Army Vesper
- All references updated across 30+ files (code, configs, env vars, n8n workflows, i18n)

### Architecture
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.2.1 + React 19 + TypeScript |
| UI | Radix UI + Tailwind CSS + Framer Motion (Jarvis theme) |
| Backend | Supabase (PostgreSQL + Auth + Real-time + RLS) |
| Deployment | Vercel (auto-deploy from GitHub on push) |
| Workflow Engine | n8n (8 workflow definitions) |
| State Management | TanStack React Query + Zustand |
| Auth | Supabase Auth (email/password + role-based access) |
| i18n | English, Spanish, Portuguese |

### Deployment
- **URL**: https://vesper-wheat.vercel.app
- **GitHub**: https://github.com/laminsn/Vesper
- **No local dev server needed** — all testing via Vercel (prevents MacBook Air crashes)
- Every `git push` auto-deploys to production

---

## 2. AUTHENTICATION & USER MANAGEMENT

### Auth System
- Supabase Auth with email/password login
- Role-based access: `owner`, `cofounder`, `staff`, `readonly`
- RLS (Row Level Security) on all tables

### Users Created
| Email | Role | Display Name |
|-------|------|-------------|
| admin@vesper.app | owner | Lamin |

### Login Credentials
- **URL**: https://vesper-wheat.vercel.app/login
- **Password**: VesperAdmin2026!
- **Show/hide password toggle** on login form

### API Endpoints
| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/setup` | Create admin users via Supabase Admin API |
| `POST /api/auth/migrate` | Run migrations + seed data |
| `GET /api/auth/callback` | OAuth callback handler |

---

## 3. DATABASE SCHEMA (Supabase)

### Tables (24 total)

| Table | Rows | Purpose |
|-------|------|---------|
| agents | 42 | All AI agents with status, tier, department, soul file path |
| departments | 8 | Organizational departments with directors |
| tasks | 0+ | Task board items with Kanban workflow |
| task_comments | 0 | Comments on tasks |
| playbooks | 11 | Operational playbooks with steps |
| playbook_executions | 0+ | Running/completed playbook instances |
| handoffs | 12 | Data transfer protocols between departments |
| handoff_executions | 0 | Handoff execution tracking |
| directives | 0+ | Commands issued to agents via Command Station |
| agent_communications | 0+ | Messages between agents/departments |
| kpis | 46 | KPI metrics tied to departments/agents |
| kpi_history | 0 | Historical KPI values for trending |
| evolution_proposals | 0 | Agent self-improvement proposals |
| evolution_retrospectives | 0 | Post-execution retrospectives |
| user_roles | 1 | Maps auth users to roles |
| user_invites | 0 | Invite tokens for onboarding |
| integration_registry | 42+ | Connected services and tools |
| business_profiles | 0 | Org filesystem metadata |
| sync_log | 0 | Filesystem↔DB sync history |
| daily_reports | 8+ | Daily department communications and reports |
| calendar_events | 7+ | Appointments, meetings, standups |
| meeting_notes | 3+ | Agendas, summaries, action items per event |
| content_vault | 6+ | Extracted quotes, viral topics, static posts |

### Migrations Applied
1. `001-multi-tenant.sql` — Organizations + members
2. `002-integration-sync.sql` — Integration registry + business profiles
3. `003-daily-reports.sql` — Daily reports table
4. `004-calendar-events.sql` — Calendar events + meeting notes
5. `005-content-vault.sql` — Content vault for quote extraction

---

## 4. AGENTS (42 in Vesper)

### By Department

| Department | Director | Agent Count | Agents |
|------------|----------|-------------|--------|
| Executive | Diane (CEO) | 1 | Diane |
| Marketing | Camila | 8 | Camila, Haven, Beacon, Roots, Ember, Gather, Grace, **Quill** (NEW) |
| Clinical Operations | Dr. Elena | 7 | Dr. Elena, Nurse Riley, Solace, Comfort, Spirit, Harmony, Bereavement |
| Admissions & Intake | River | 4 | River, Bridge, Verify, Triage |
| Caregiver Staffing | Terra | 5 | Terra, Recruit, Shift, Train, Retain |
| Customer Experience | Serenity | 6 | Serenity, Embrace, Memory, Gratitude, Reflect, Listen |
| Compliance & Quality | Justice | 5 | Justice, Guardian, Chart, Shield, Quality |
| Accounting & Finance | Steward | 6 | Steward, Nurture, Provision, Harvest, Pledge, Foundation |

### NEW: Journalist Agents (5 companies)

| Company | Agent | Slug | Creature | Newsletter | Soul File Lines |
|---------|-------|------|----------|-----------|-----------------|
| **HHC** | Quill | quill | Owl 🦉 | HHCC Insights | 529 |
| **FNF** | Scroll | scroll | Eagle 🦅 | FNF Market Intel | 530 |
| **BET** | Crônica | cronica | Toucan 🐦 | BET Mercado | 530 |
| **HAA** | Ink | ink | Raven 🐦‍⬛ | HAA Pulse | 530 |
| **RAM** | Herald | herald | Falcon 🦅 | RAM Dispatch | 530 |

**Each journalist has 14 core responsibilities:**
1. Daily Executive Briefing (7:30 AM delivery to CEO + all directors)
2. Blog post creation (2-3/week)
3. Newsletter publishing via Beehiiv (weekly)
4. Content review of ALL company output
5. Thought leadership articles (monthly)
6. Industry research & intelligence (daily)
7. Press release drafting
8. Case study creation (quarterly)
9. Whitepaper authoring (semi-annual)
10. LinkedIn article publishing (bi-weekly)
11. Content calendar management (90-day in Notion)
12. SEO content optimization
13. Editorial standards enforcement
14. Content performance analytics (weekly report)

**NEW Content Vault responsibilities:**
- Monitor ALL content channels (YouTube, podcasts, IG, TikTok, interviews, webinars)
- Extract 5-10 key quotes per long-form piece
- Tag each with viral potential (high/medium/low/viral)
- Identify 2-3 thumbnail moments per video
- Propose static post concepts (Lewis Howes / Myron Golden style quote cards)

---

## 5. PAGES & FEATURES (25+ pages)

### Command Section
| Page | URL | Status | Description |
|------|-----|--------|-------------|
| Command Center | `/` | **Functional** | Dashboard with real-time agent stats, gauges, charts, activity feed, department grid |
| Agents | `/agents` | **Functional** | Agent roster with status filters, department grouping |
| Agent Detail | `/agents/[id]` | **Functional** | Agent profile with directives, tasks, comms, evolution tabs |
| Org Chart | `/org-chart` | **Functional** | Visual hierarchy from Diane down to all specialists |
| Command Station | `/command-station` | **Functional** | Issue directives, send messages, real-time timeline, agent metrics |

### Operations Section
| Page | URL | Status | Description |
|------|-----|--------|-------------|
| Departments | `/departments` | **Functional** | Department cards with director, agent count, status dots |
| Department Detail | `/departments/[slug]` | **Functional** | KPI gauges, agent roster, recent directive activity |
| Playbooks | `/playbooks` | **Functional** | 11 playbooks with Run button (creates executions) |
| Handoffs | `/handoffs` | **Functional** | 12 handoff protocols with SLA descriptions |
| Task Board | `/tasks` | **Functional** | Kanban, Calendar, Table, Timeline views with Supabase persistence |
| Calendar | `/calendar` | **Functional** | Month view, event creation, Google Meet links, meeting notes |
| Daily Tasks | `/daily-tasks` | **Functional** | 108 daily task templates across 9 departments |
| Integrations | `/integrations` | **Functional** | 62 integrations, credential config modal, health checks |
| Training | `/training` | **Functional** | Agent templates and skills library |
| Workflows | `/workflows` | **Functional** | 11 playbooks as workflow templates from Supabase |

### Intelligence Section
| Page | URL | Status | Description |
|------|-----|--------|-------------|
| **Content Vault** | `/content-vault` | **NEW** | Quote extraction, viral topics, static post pipeline |
| **Daily Reports** | `/daily-reports` | **NEW** | Hierarchy communications with date navigation |
| Comms Hub | `/comms` | **Functional** | Agent-to-external communications |
| Evolution | `/evolution` | **Functional** | Agent self-improvement proposals |
| Custom Dashboards | `/custom-dashboards` | **Placeholder** | — |
| Notifications | `/notifications` | **Placeholder** | — |

### Admin Section
| Page | URL | Status | Description |
|------|-----|--------|-------------|
| Settings | `/settings` | **Functional** | Theme, language, org settings |
| PHI Monitor | `/phi-monitor` | **Functional** | HIPAA/PHI compliance monitoring |
| Billing | `/billing` | **Placeholder** | — |
| API Portal | `/api-portal` | **Placeholder** | — |

---

## 6. INTEGRATIONS (62 in catalog, 42+ in registry)

### Categories
| Category | Count | Examples |
|----------|-------|---------|
| AI Models | 9 | OpenAI, Anthropic, Gemini, Nano-Banana, Perplexity, MiniMax, Kimi, Mistral, Cohere |
| Voice AI | 4 | ElevenLabs, Deepgram, VAPI, Wispr Flow |
| Cloud | 2 | AWS, Supabase |
| Productivity | 16 | Notion, Airtable, n8n, Gmail, Google Drive/Docs/Sheets/Slides, Figma, Canva, Stitch, Icons8, LottieFiles, Rive, Spline, Better Icons |
| CRM | 6 | GoHighLevel, HubSpot, Salesforce, Zoho, Pipedrive, Vibe Prospecting |
| Communication | 4 | Slack, Twilio, SendGrid, **Resend** |
| EHR/EMR | 4 | Epic, Cerner, Allscripts, Nuance |
| Video | 2 | Zoom, Google Meet |
| Messaging | 4 | Telegram, WhatsApp, Discord, Slack |
| Project Management | 5 | Trello, Asana, Monday, Jira, GitHub |
| Dev Tools | 3 | Playwright, Context7, Firecrawl |
| Data/Scraping | 2 | Apify, JobSpy |
| Newsletter | 1 | **Beehiiv** (NEW) |

### NEW: Beehiiv Integration
- API Key + Publication ID + Custom Domain credential fields
- Methods: API, Browser, Manual
- Supports all 5 journalist agents' newsletter publishing

### Connection Methods (per integration)
- **API** — API key/token authentication
- **MCP** — Connected via Claude Code MCP server
- **OAuth** — OAuth redirect flow
- **CLI** — Command-line tool
- **Browser** — Browser login with username/password
- **Manual** — Agent uses any available tool

---

## 7. WEBHOOK API (Agent-Facing Endpoints)

All webhooks authenticate via `x-vesper-webhook-secret` header.

| Endpoint | Purpose | Actions |
|----------|---------|---------|
| `POST /api/webhooks/agent-heartbeat` | Agent status updates | Update status, last_seen_at |
| `POST /api/webhooks/playbook-step` | Playbook execution progress | Update step_statuses, current_step |
| `POST /api/webhooks/directive-complete` | Directive completion | Update status, response |
| `POST /api/webhooks/calendar-event` | **NEW** — Agent calendar CRUD | create, update, cancel, complete |
| `POST /api/webhooks/meeting-notes` | **NEW** — Agent meeting notes | Add agendas, summaries, transcripts |
| `POST /api/webhooks/content-vault` | **NEW** — Bulk content extraction | Submit quotes, topics, thumbnails |

---

## 8. N8N WORKFLOWS (8 definitions)

| Workflow | Trigger | Description |
|----------|---------|-------------|
| Patient Intake Automation | Webhook | Verify insurance → Schedule assessment → Notify care team |
| Insurance Verification | Webhook | Check eligibility → File NOE → Update CRM |
| Clinical Documentation | Webhook | Generate note → Review → Submit to EMR |
| Appointment Reminders | Cron (8am daily) | Query appointments → Send SMS/Email |
| Referral Management | Webhook | Track referral → Status update → Follow-up |
| Ops Reporting | Cron (6am daily) | Aggregate metrics → Generate report → Email Diane |
| Agent Optimizer | Cron (Mon 8am) | Analyze performance → Suggest improvements |
| Platform Health Monitor | Cron (5min) | Check agents → Alert if degraded |

All workflow JSON files in `n8n-workflows/` directory, ready for import into n8n.

---

## 9. DAILY REPORTS SYSTEM

### Structure
- 8 departments submit daily reports
- Report types: morning_brief, end_of_day, standup, escalation, clinical_review, compliance_check, financial_update, recruitment_update, marketing_update
- Status workflow: draft → submitted → reviewed → acknowledged
- Date navigation with "TODAY" badge
- Activity timeline showing directives + comms + reports chronologically

### Sample Reports Seeded
| Department | Director | Report Type | Key Metrics |
|------------|----------|-------------|-------------|
| Executive | Diane | Morning Brief | 7 directors present, 0 escalations |
| Clinical | Dr. Elena | Clinical Review | 12 patients, pain managed, 1 new admission |
| Admissions | River | Standup | 2 new referrals, 1 pending assessment |
| Marketing | Camila | Marketing Update | CPI down 12%, email 34% open rate |
| Compliance | Justice | Compliance Check | 3 charts audited, 0 deficiencies |
| Finance | Steward | Financial Update | 4 claims submitted, cap at 87% |
| Staffing | Terra | Recruitment Update | 100% coverage, 3 candidates interviewing |
| CX | Serenity | Standup | 2 family calls, satisfaction 4.6/5.0 |

---

## 10. CALENDAR SYSTEM

### Features
- Full month view with color-coded event chips
- Event types: meeting, appointment, follow_up, standup, review, training, deadline, idt, briefing, call
- Create Event modal with all fields
- Google Meet link support ("Join Google Meet" button)
- Meeting Notes system (7 note types): agenda, briefing, live_notes, summary, action_items, follow_up, recording_transcript
- Agent-facing webhooks for calendar CRUD
- Real-time subscriptions

### Sample Events Seeded
| Event | Type | Department | Attendees |
|-------|------|-----------|-----------|
| Leadership Team Standup | standup | Executive | Diane + 7 directors |
| IDT Meeting | idt | Clinical | Dr. Elena + clinical team (6) |
| Marketing Team Standup | standup | Marketing | Camila + 7 reports |
| Compliance Weekly Briefing | review | Compliance | Justice + Chart |
| Patient Assessment | appointment | Admissions | Triage |
| Monthly Mission Alignment | meeting | Executive | Diane + all |

---

## 11. CONTENT VAULT (NEW)

### Purpose
Journalist agents monitor all content output (YouTube, podcasts, IG, TikTok, interviews, webinars) and extract:
- **Quotes** — powerful one-liners for static posts
- **Key Phrases** — recurring themes and concepts
- **Viral Topics** — high-potential content angles
- **Thumbnails** — compelling still frames from video
- **Hooks** — opening lines for Reels/TikTok
- **CTAs** — calls to action for engagement

### Post Pipeline
`extracted` → `drafted` → `approved` → `scheduled` → `posted`

### Viral Potential Rating
- **Viral** — immediate post potential, high share probability
- **High** — strong engagement expected
- **Medium** — solid content, standard performance
- **Low** — archive for future use

### Visual Treatment
Each vault item includes a suggested visual treatment (e.g., "Dark background, white serif text, portrait left-aligned. Orange highlight on key phrase. 1080x1350 format.")

### Sample Items Seeded
| Speaker | Type | Viral | Body (truncated) |
|---------|------|-------|-------------------|
| Diane | Quote | HIGH | "We don't measure success by how many patients we admit..." |
| Dr. Elena | Quote | VIRAL | "The number one misconception about hospice..." |
| Terra | Key Phrase | HIGH | "You cannot pour from an empty cup..." |
| — | Viral Topic | VIRAL | "5 Things Every Family Should Know Before Calling Hospice" |
| Terrell | Hook | HIGH | "What if the most important business decision..." |
| Diane | Thumbnail | MEDIUM | Diane reading family letter at 23:15 |

---

## 12. PERFORMANCE OPTIMIZATIONS

### Memory Leak Fix
- **Root cause**: `useRealtimeSubscription` hook created new Supabase client on every render, causing exponential WebSocket connections
- **Fix**: Module-level singleton client + useRef for callback stabilization
- **File**: `src/hooks/use-realtime.ts`

### Cache Optimization
- `staleTime`: 60s → **5 minutes** (data stays fresh longer)
- `gcTime`: added **10 minutes** (cached data persists in memory)
- `refetchOnMount`: **false** (returning to a page uses cached data instantly)
- `reactStrictMode`: **false** (prevents double-mount in dev, halves subscriptions)

### Result
- First page load: ~2-3s (Supabase free tier cold start)
- Subsequent navigation: **instant** (cached data)

---

## 13. ENVIRONMENT VARIABLES

### Vercel Environment Variables
| Variable | Purpose |
|----------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key |
| SUPABASE_SERVICE_ROLE_KEY | Server-side admin operations |
| VESPER_WEBHOOK_SECRET | Agent webhook authentication |
| N8N_BASE_URL | n8n instance URL |

---

## 14. FILE STRUCTURE

```
hhcc-command-center/
├── src/
│   ├── app/
│   │   ├── (auth)/          — Login, Register pages
│   │   ├── (dashboard)/     — All 25+ dashboard pages
│   │   └── api/             — 15+ API routes + 6 webhook endpoints
│   ├── components/
│   │   ├── charts/          — 5 Vesper chart components + sparklines
│   │   ├── integrations/    — ConnectionConfigDialog
│   │   ├── jarvis/          — 15+ Jarvis UI components
│   │   ├── layout/          — Sidebar, Topbar, DashboardShell
│   │   ├── tasks/           — Kanban, Calendar, Table, Timeline views
│   │   └── ui/              — 15+ shadcn/ui components
│   ├── data/                — Static catalogs (integrations, agents, templates)
│   ├── hooks/               — 15+ React Query hooks for all tables
│   ├── i18n/                — en, es, pt translations
│   ├── lib/                 — Supabase clients, n8n gateway, security, utils
│   ├── providers/           — Auth, Query, Theme, i18n providers
│   ├── stores/              — Zustand stores
│   └── types/               — TypeScript type definitions
├── n8n-workflows/           — 8 n8n workflow JSON files
├── supabase/
│   ├── schema.sql           — Full database schema
│   ├── seed.sql             — Agent, department, KPI, playbook, handoff seed data
│   ├── seed-integrations.sql — Integration registry seed
│   └── migrations/          — 5 migration files
└── package.json             — ai-army-vesper
```

---

## 15. WHAT'S NEXT (Recommended)

1. **Connect Beehiiv** — Enter API keys in Integrations page for each company newsletter
2. **Connect Google Calendar** — OAuth setup for Gmail sync
3. **Wire n8n workflows** — Import JSON files into your n8n instance at repocloud.io
4. **Content production** — Have journalist agents start extracting quotes from existing content
5. **Daily briefings** — Configure Quill to send daily executive briefings via the daily reports system
6. **Supabase Pro upgrade** — Eliminate cold start delays ($25/mo)

---

*Generated by Claude Code (Opus 4.6) — April 9-10, 2026*
*Total commits this session: 15+*
*Total files created/modified: 100+*
*Total lines of code: 35,000+*
