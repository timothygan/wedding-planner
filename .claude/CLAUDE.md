# Wedding Planner Application - Project Context

**Project Type:** Single-user wedding planning app
**Progress Tracking:** See `TODO.md` for current phase and tasks
**Detailed Research:** `/learnings/2025-11-15-15_29_wedding-planner-architecture-research.md`

---

## Quick Reference

- **Tech Stack:** Vite + React + TypeScript, Go + Gin, SQLite
- **Architecture:** Monorepo (frontend/ and backend/)
- **Monthly Cost:** $5-8/month (Vercel free + Fly.io + Claude API)

---

## Project Overview

Single-user wedding planning application to manage vendors, tasks, reminders, and budget with AI-powered vendor search capabilities.

### Core Features
1. **Vendor Management** - Track vendors being communicated with + vendors to find
2. **Task Management** - Tasks with different timelines and urgency levels
3. **Reminders** - Communication reminders via browser notifications and email
4. **Budget Tracking** - Track estimated vs actual costs, payment status
5. **AI Vendor Search** - Search by text or image, auto-populate vendor data
6. **AI Message Generation** - Auto-generate contextual vendor emails using communication history

---

## Technology Stack Decisions

### Frontend
- **Framework:** Vite + React + TypeScript
- **Routing:** React Router
- **Data Fetching:** TanStack React Query
- **HTTP Client:** Axios
- **Deployment:** Vercel (free tier)

**Rationale:** Fast dev experience, simple deployment, no SEO needs for single-user app.

### Backend
- **Language/Framework:** Go + Gin framework
- **Database:** SQLite with WAL mode
- **Backup:** Litestream → Backblaze B2
- **Deployment:** Fly.io ($3-5/month)

**Rationale:** Learning opportunity (Go), zero-config database (SQLite), beginner-friendly framework (Gin).

### AI Integration
- **Provider:** Anthropic Claude Sonnet 4
- **Features:** Text search, image analysis, structured data extraction
- **Cost Optimization:** Prompt caching (90% savings on repeated queries)
- **Monthly Cost:** ~$0.50-1

---

## Architecture

### Monorepo Structure
```
wedding-planner/
├── .claude/
│   └── CLAUDE.md              # This file - project instructions
├── learnings/                  # Learning documentation (one per task)
│   └── 2025-11-15-15_29_wedding-planner-architecture-research.md
├── frontend/                   # Vite + React + TypeScript
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API clients
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript types (shared with backend)
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                    # Go + Gin
│   ├── cmd/
│   │   └── api/
│   │       └── main.go        # Entry point
│   ├── internal/
│   │   ├── handlers/          # HTTP handlers (CRUD endpoints)
│   │   ├── models/            # Database models
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Gin middleware (CORS, logging)
│   │   ├── db/                # Database connection & setup
│   │   └── ai/                # AI integration (Claude API)
│   ├── migrations/            # SQL migration files
│   ├── go.mod
│   └── go.sum
├── scripts/                    # Development scripts
│   ├── dev.sh                 # Start both frontend + backend
│   └── backup-db.sh           # SQLite backup script
└── README.md
```

---

## Database Schema

### ID Format
**CRITICAL:** All IDs use UUID v4 format stored as TEXT (not INTEGER). See `SCHEMA.md` for details.

### Key Tables

**vendors** - Primary entity for vendor tracking
- Fields: id (UUID v4 TEXT), name, category (ENUM), email, phone, website, city, state, starting_price, status (ENUM), notes, ai_discovery_source, last_communication_at, last_communication_type, created_at, updated_at
- Status values (ENUM): 'considering', 'booked', 'rejected'
- Categories (ENUM): 'photographer', 'venue', 'caterer', 'florist', 'dj', 'videographer', 'planner', 'baker', 'designer', 'rentals'

**tasks** - Task management with timeline phases
- Fields: id, title, description, category, vendor_id (FK), due_date, timeline_phase, priority, status, estimated_cost, actual_cost, notes
- Timeline phases: '12+ months', '9-12 months', '6-9 months', '3-6 months', '1-3 months', '1 month', '1 week', 'day of'
- Priority: 'low', 'medium', 'high', 'urgent'

**reminders** - Notification system
- Fields: id, task_id (FK), vendor_id (FK), title, message, reminder_type, remind_at, recurrence, notification_channels (JSON), status

**budget_items** - Budget tracking
- Fields: id, category, vendor_id (FK), estimated_amount, actual_amount, paid_amount, payment_status, deposit_amount, deposit_due_date

**communications** - Communication history and AI message generation tracking
- Fields: id, vendor_id (FK), direction, channel, subject, message_body, ai_generated, communication_type, communicated_at, created_at, updated_at
- Direction: 'sent', 'received'
- Channel: 'email', 'phone', 'text', 'in_person', 'other'
- Communication types: 'initial_inquiry', 'follow_up', 'quote_request', 'quote_received', 'meeting_scheduling', 'decision_notification', 'question', 'answer', 'contract_discussion', 'payment_discussion', 'other'

**ai_searches** - AI search history and cost tracking
- Fields: id, query_text, query_type, search_parameters (JSON), image_url, results_count, vendors_created (JSON), ai_model, tokens_used, cost

**Full schema:** See `/learnings/2025-11-15-15_29_wedding-planner-architecture-research.md` (Database Schema Design section)

---

## AI Integration Strategy

### Key Innovation: Auto-Populate Vendor Entities

**User Flow:**
1. User enters: "Find vintage photographers in Austin under $3000"
2. Claude extracts structured search parameters via tool calling
3. Backend performs web search or uses Claude's knowledge
4. Claude extracts vendor data matching exact database schema
5. User reviews AI-extracted vendors in UI
6. One-click confirmation → vendors inserted into database

**Implementation Pattern:**
```go
// Define database schema as Claude tool
var vendorExtractionTool = anthropic.Tool{
    Name: "create_vendor_entries",
    InputSchema: vendorSchemaAsJSON, // Exact match to database
}

// Claude returns structured data that maps 1:1 to database
vendors := claudeResponse.ToolUse.Input.Vendors
db.InsertVendors(vendors) // Direct insert, no transformation
```

**Cost Optimization:**
- Use prompt caching for vendor schema (90% cost reduction)
- Cache system prompts for 5-minute windows
- Estimated cost: $0.50-1/month for typical usage

---

## Code Patterns

**See `PATTERNS.md` for detailed code examples and implementation patterns.**

Key patterns include:
- Go handler, service, and model patterns
- React component and hook patterns
- API design standards
- Database query patterns
- AI integration examples

---

## Learning Documentation Process

**MANDATORY:** Create a new learning document for each significant task.

### When to Create Learning Docs
- ✅ Implementing new features
- ✅ Debugging issues
- ✅ Making architectural decisions
- ✅ Integrating new tools/libraries
- ✅ Database schema changes
- ✅ AI integration work

### Filename Convention
`/learnings/YYYY-MM-DD-HH_MM_task-description.md`

**Example:** `/learnings/2025-11-15-16_30_vendor-crud-implementation.md`

### Content Requirements
- Original prompt at the top
- File:line references for code changes
- Decision rationale (why, not just what)
- Patterns and tools used
- Next steps or follow-up tasks

---

## Important Reminders

### For Claude Code
- ALWAYS create learning documentation for non-trivial tasks
- Get fresh timestamp with `date '+%Y-%m-%d-%H_%M'` before creating docs
- Reference specific files and line numbers in explanations
- Follow Go and TypeScript style guides
- Add error handling to ALL database operations
- Use structured outputs for AI integration (tool calling)

### For Development
- Run `gofmt` before committing Go code
- Run ESLint + Prettier before committing TypeScript code
- Test API endpoints with curl/Postman before frontend integration
- Use React Query DevTools for debugging data fetching
- Check SQLite database with: `sqlite3 wedding-planner.db "SELECT * FROM vendors;"`

### Security
- Never commit API keys (use .env files)
- Validate all user input on backend
- Use parameterized SQL queries (prevent injection)
- Set appropriate CORS headers
- Rate limit AI API calls

---

## References

- **Progress & Tasks:** `TODO.md`
- **Code Patterns:** `PATTERNS.md`
- **Detailed Research:** `/learnings/2025-11-15-15_29_wedding-planner-architecture-research.md`
- **Go + Gin Tutorial:** https://go.dev/doc/tutorial/web-service-gin
- **Claude API Docs:** https://docs.anthropic.com/
