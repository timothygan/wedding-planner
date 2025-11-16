# Wedding Planner Application - Architecture & Technology Research

**Prompt:** "This is an empty git repo - i want to create an application that will help me plan my wedding. Let's plan it out, these are the problems so far: i need to keep track of different vendors i am communicating with, and what vendors i need to find. i need to be reminded of who and what i need to communicate with. i need to keep it all organized. there are a variety of tasks that all have different timelines/urgencies. i want to integrate ai to help me search for vendors/things i need by text prompt or image, and it should integrate straight into my vendor tracking. the only traffic is going to be me, so it should be cheap and fairly lightweight infrastructure"

**Date:** 2025-11-15
**Status:** Research Complete - Ready for Implementation

---

## Table of Contents
- [Requirements Summary](#requirements-summary)
- [Technology Stack Decisions](#technology-stack-decisions)
- [Architecture Overview](#architecture-overview)
- [Database Schema Design](#database-schema-design)
- [AI Integration Strategy](#ai-integration-strategy)
- [Cost Analysis](#cost-analysis)
- [Implementation Roadmap](#implementation-roadmap)
- [Key Learnings](#key-learnings)

---

## Requirements Summary

### Core Problems to Solve
1. **Vendor Management**: Track vendors being communicated with + vendors to find
2. **Communication Reminders**: System to remind about vendor communications
3. **Organization**: Keep everything organized and accessible
4. **Task Management**: Tasks with different timelines/urgencies
5. **AI-Powered Search**: Search vendors by text/image, auto-populate into tracking system
6. **Cost Constraints**: Single-user app, needs to be cheap and lightweight

### User Constraints
- **Platform**: Web application only (browser access)
- **Tech Preferences**: JavaScript/TypeScript frontend, Go backend (learning opportunity)
- **Budget**: $5-15/month for infrastructure
- **Traffic**: Single user only
- **AI Features**: Text search, image search, smart recommendations, auto-populate entities

---

## Technology Stack Decisions

### Frontend: Vite + React + TypeScript ✅

**Decision Rationale:**
- **Why Vite over Next.js:**
  - No SEO requirements for single-user app
  - Lightning-fast dev experience with HMR
  - Simpler deployment (static assets)
  - Better separation from Go backend (learning opportunity)
  - Smaller bundle sizes

**Key Libraries:**
- `react-router-dom` - Client-side routing
- `@tanstack/react-query` - Data fetching/caching
- `axios` - HTTP client for API calls
- `vite-plugin-pwa` - Progressive Web App support

**File Reference Pattern:**
```
frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page-level components
│   ├── services/      # API client code
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   └── App.tsx        # Main app component
├── vite.config.ts
└── tsconfig.json
```

---

### Backend: Go + Gin Framework ✅

**Decision Rationale:**
- **Why Gin:**
  - Most beginner-friendly Go framework (75K+ GitHub stars)
  - Syntax similar to Express.js (familiar for JS developers)
  - Official Go tutorial uses Gin
  - Fast performance + rich middleware ecosystem
  - Excellent documentation and community support

**Why NOT other frameworks:**
- **Fiber**: Uses fasthttp (non-standard library compatibility issues)
- **Echo**: More enterprise-focused, steeper learning curve
- **Chi**: Too minimalist, less helpful for beginners

**Key Dependencies:**
```go
github.com/gin-gonic/gin              // Web framework
github.com/mattn/go-sqlite3            // SQLite driver
github.com/anthropics/anthropic-sdk-go // Claude API client
```

**File Structure:**
```
backend/
├── cmd/
│   └── api/
│       └── main.go           # Entry point
├── internal/
│   ├── handlers/             # HTTP request handlers
│   ├── models/               # Database models
│   ├── services/             # Business logic
│   ├── middleware/           # Gin middleware
│   ├── db/                   # Database connection
│   └── ai/                   # AI integration (Claude API)
├── migrations/               # SQL migration files
└── go.mod
```

---

### Database: SQLite with WAL Mode ✅

**Decision Rationale:**
- **Why SQLite over PostgreSQL:**
  - Zero configuration (embedded database)
  - Zero hosting cost (no separate DB server)
  - Faster for single-user read-heavy workloads
  - Simple backups (single file)
  - Production-ready in 2025 (Rails 8, PocketBase use it)

**Critical Configuration:**
```go
// backend/internal/db/connection.go
PRAGMA journal_mode = WAL;          // Write-Ahead Logging
PRAGMA synchronous = NORMAL;         // Balance safety/performance
PRAGMA cache_size = 1000000;        // Large cache
PRAGMA temp_store = MEMORY;         // In-memory temp storage
PRAGMA wal_autocheckpoint = 1000;   // Auto checkpoints

db.SetMaxOpenConns(1) // Single connection for SQLite
```

**Backup Strategy:**
- **Litestream**: Continuous replication to Backblaze B2
- Cost: ~$0.50/month for 50GB storage
- Command: `litestream replicate wedding-planner.db s3://bucket/db`

---

### Deployment: Fly.io (Backend) + Vercel (Frontend) ✅

**Frontend: Vercel Free Tier**
- Static hosting for React SPA
- Free tier includes:
  - 100GB bandwidth/month
  - Automatic HTTPS + CDN
  - Preview deployments
- **Cost: $0/month**

**Backend: Fly.io**
- Shared CPU-1x, 256MB RAM, 1GB storage
- Persistent volume for SQLite
- Automatic HTTPS
- Simple deployment: `fly launch && fly deploy`
- **Cost: $3-5/month**

**Why NOT alternatives:**
- Railway: $5/month minimum + usage (more expensive)
- Render: $7/month + apps can idle (poor UX)
- Vercel backend: 10-second timeout kills long AI requests

---

### AI Provider: Anthropic Claude Sonnet 4 ✅

**Decision Rationale:**

| Feature | Claude | OpenAI | Gemini |
|---------|--------|--------|--------|
| Text reasoning | Excellent | Excellent | Good |
| Image understanding | Good | Excellent | Excellent |
| Structured output | ✅ Tool use | ✅ Functions | ✅ |
| Context window | 200K | 128K | 1M |
| Cost (1M input tokens) | $3 | $5 | $1.25 |
| Prompt caching | ✅ 90% savings | ❌ | ❌ |

**Recommendation:** Claude Sonnet 4 primary, supplement with GPT-4o for image-heavy tasks if needed.

**Monthly AI Cost Estimate:**
- 40 vendor searches/month × $0.006/search = $0.24
- 5 image analyses/month × $0.03/image = $0.15
- With prompt caching: **$0.50-1/month**

---

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────┐
│         USER BROWSER                │
│  ┌──────────────────────────────┐   │
│  │  Vite + React + TypeScript   │   │
│  │  - Vendor management UI      │   │
│  │  - Task dashboard            │   │
│  │  - AI search interface       │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
              ↕ HTTPS
┌─────────────────────────────────────┐
│    VERCEL (Frontend Hosting)        │
│    Cost: $0/month                   │
└─────────────────────────────────────┘
              ↕ REST API
┌─────────────────────────────────────┐
│    FLY.IO (Go Backend)              │
│  ┌──────────────────────────────┐   │
│  │  Gin REST API Server         │   │
│  │  /api/vendors                │   │
│  │  /api/tasks                  │   │
│  │  /api/ai/search              │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  SQLite + Litestream         │   │
│  │  (Persistent Volume)         │   │
│  └──────────────────────────────┘   │
│    Cost: $3-5/month                 │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│    EXTERNAL APIS                    │
│  - Anthropic Claude ($0.50-1/mo)   │
│  - Resend Email (FREE)              │
└─────────────────────────────────────┘
```

### API Design

**RESTful Endpoints:**
```
GET    /api/vendors              # List all vendors
POST   /api/vendors              # Create vendor
GET    /api/vendors/:id          # Get vendor details
PUT    /api/vendors/:id          # Update vendor
DELETE /api/vendors/:id          # Delete vendor

GET    /api/tasks                # List tasks
POST   /api/tasks                # Create task
PUT    /api/tasks/:id            # Update task

POST   /api/ai/search-text       # AI text-based vendor search
POST   /api/ai/analyze-image     # AI image analysis
POST   /api/ai/recommend         # AI recommendations

GET    /api/reminders            # List reminders
POST   /api/reminders            # Create reminder
```

---

## Database Schema Design

### 1. Vendors Table

```sql
-- backend/migrations/001_create_vendors.sql
CREATE TABLE vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN (
        'photographer', 'venue', 'caterer', 'florist',
        'dj', 'videographer', 'planner', 'baker',
        'designer', 'rentals'
    )),

    -- Contact info
    email TEXT,
    phone TEXT,
    website TEXT,
    instagram TEXT,

    -- Location
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,

    -- Pricing
    starting_price REAL,
    price_range TEXT,
    currency TEXT DEFAULT 'USD',

    -- Details (JSON arrays stored as TEXT)
    services_offered TEXT,  -- JSON: ["full-day coverage", "engagement shoot"]
    style_tags TEXT,        -- JSON: ["vintage", "candid", "film"]
    portfolio_images TEXT,  -- JSON: ["url1", "url2"]

    -- Reviews
    average_rating REAL,
    review_count INTEGER,
    review_source TEXT,

    -- Status tracking
    status TEXT DEFAULT 'discovered' CHECK(status IN (
        'discovered', 'contacted', 'quoted',
        'meeting_scheduled', 'booked', 'rejected', 'backup'
    )),

    -- Notes
    notes TEXT,
    initial_contact_date TEXT,
    contract_signed_date TEXT,

    -- AI metadata
    ai_discovery_source TEXT,  -- How AI found this
    ai_confidence_score REAL,

    -- Timestamps
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for common queries
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_status ON vendors(status);
```

**Go Model:**
```go
// backend/internal/models/vendor.go
type Vendor struct {
    ID                  string    `json:"id" db:"id"`
    Name                string    `json:"name" db:"name"`
    Category            string    `json:"category" db:"category"`
    Email               *string   `json:"email,omitempty" db:"email"`
    Phone               *string   `json:"phone,omitempty" db:"phone"`
    Website             *string   `json:"website,omitempty" db:"website"`
    Instagram           *string   `json:"instagram,omitempty" db:"instagram"`
    Address             *string   `json:"address,omitempty" db:"address"`
    City                *string   `json:"city,omitempty" db:"city"`
    State               *string   `json:"state,omitempty" db:"state"`
    Zip                 *string   `json:"zip,omitempty" db:"zip"`
    StartingPrice       *float64  `json:"starting_price,omitempty" db:"starting_price"`
    PriceRange          *string   `json:"price_range,omitempty" db:"price_range"`
    Currency            string    `json:"currency" db:"currency"`
    ServicesOffered     []string  `json:"services_offered,omitempty" db:"services_offered"`
    StyleTags           []string  `json:"style_tags,omitempty" db:"style_tags"`
    PortfolioImages     []string  `json:"portfolio_images,omitempty" db:"portfolio_images"`
    AverageRating       *float64  `json:"average_rating,omitempty" db:"average_rating"`
    ReviewCount         *int      `json:"review_count,omitempty" db:"review_count"`
    ReviewSource        *string   `json:"review_source,omitempty" db:"review_source"`
    Status              string    `json:"status" db:"status"`
    Notes               *string   `json:"notes,omitempty" db:"notes"`
    InitialContactDate  *string   `json:"initial_contact_date,omitempty" db:"initial_contact_date"`
    ContractSignedDate  *string   `json:"contract_signed_date,omitempty" db:"contract_signed_date"`
    AIDiscoverySource   *string   `json:"ai_discovery_source,omitempty" db:"ai_discovery_source"`
    AIConfidenceScore   *float64  `json:"ai_confidence_score,omitempty" db:"ai_confidence_score"`
    CreatedAt           time.Time `json:"created_at" db:"created_at"`
    UpdatedAt           time.Time `json:"updated_at" db:"updated_at"`
}
```

### 2. Tasks Table

```sql
-- backend/migrations/002_create_tasks.sql
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,

    -- Categorization
    category TEXT,
    vendor_id TEXT REFERENCES vendors(id),

    -- Timeline
    due_date TEXT,
    timeline_phase TEXT CHECK(timeline_phase IN (
        '12+ months', '9-12 months', '6-9 months',
        '3-6 months', '1-3 months', '1 month',
        '1 week', 'day of'
    )),

    -- Priority
    priority TEXT DEFAULT 'medium' CHECK(priority IN (
        'low', 'medium', 'high', 'urgent'
    )),
    status TEXT DEFAULT 'todo' CHECK(status IN (
        'todo', 'in_progress', 'waiting', 'completed', 'cancelled'
    )),

    -- Budget
    estimated_cost REAL,
    actual_cost REAL,
    notes TEXT,

    -- Timestamps
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

### 3. Reminders Table

```sql
-- backend/migrations/003_create_reminders.sql
CREATE TABLE reminders (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id),
    vendor_id TEXT REFERENCES vendors(id),

    title TEXT NOT NULL,
    message TEXT,
    reminder_type TEXT CHECK(reminder_type IN (
        'follow_up', 'payment_due', 'meeting', 'deadline', 'custom'
    )),

    -- Timing
    remind_at TEXT NOT NULL,
    recurrence TEXT,

    -- Delivery
    notification_channels TEXT,  -- JSON: ["browser", "email"]

    -- Status
    status TEXT DEFAULT 'pending' CHECK(status IN (
        'pending', 'sent', 'dismissed', 'snoozed'
    )),
    sent_at TEXT,
    snoozed_until TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminders_remind_at ON reminders(remind_at);
CREATE INDEX idx_reminders_status ON reminders(status);
```

### 4. Budget Items Table

```sql
-- backend/migrations/004_create_budget_items.sql
CREATE TABLE budget_items (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    vendor_id TEXT REFERENCES vendors(id),

    estimated_amount REAL,
    actual_amount REAL,
    paid_amount REAL DEFAULT 0,

    payment_status TEXT DEFAULT 'unpaid' CHECK(payment_status IN (
        'unpaid', 'deposit_paid', 'partially_paid', 'paid'
    )),

    deposit_amount REAL,
    deposit_due_date TEXT,
    final_payment_due_date TEXT,

    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Inspiration Board Table

```sql
-- backend/migrations/005_create_inspiration.sql
CREATE TABLE inspiration_items (
    id TEXT PRIMARY KEY,
    title TEXT,
    image_url TEXT NOT NULL,
    source_url TEXT,

    -- AI extracted attributes
    style_tags TEXT,      -- JSON: ["rustic", "outdoor"]
    color_palette TEXT,   -- JSON: ["#F5E6D3", "#8B7355"]
    category TEXT,

    notes TEXT,
    favorite BOOLEAN DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 6. AI Search History

```sql
-- backend/migrations/006_create_ai_searches.sql
CREATE TABLE ai_searches (
    id TEXT PRIMARY KEY,
    query_text TEXT NOT NULL,
    query_type TEXT CHECK(query_type IN ('text', 'image', 'hybrid')),

    search_parameters TEXT,  -- JSON of structured params
    image_url TEXT,

    results_count INTEGER,
    vendors_created TEXT,  -- JSON array of vendor IDs

    ai_model TEXT,
    tokens_used INTEGER,
    cost REAL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## AI Integration Strategy

### Key Requirement: Auto-Populate Vendor Entities

**Problem:** User searches for vendors via AI, but doesn't want manual data entry.

**Solution:** Structured output with database schema mapping.

### Implementation: Text-Based Vendor Search

**Flow:**
1. User enters: "Find vintage photographers in Austin under $3000"
2. Claude extracts structured search parameters
3. Backend performs web search (or uses Claude's browsing)
4. Claude extracts vendor data matching database schema
5. User confirms, vendors inserted into database

**Code Implementation:**

```go
// backend/internal/ai/search.go
package ai

import (
    "context"
    "github.com/anthropics/anthropic-sdk-go"
)

// Define vendor schema as Claude tool
var vendorExtractionTool = anthropic.Tool{
    Name: "create_vendor_entries",
    Description: "Extract vendor information and create structured entries",
    InputSchema: map[string]interface{}{
        "type": "object",
        "properties": map[string]interface{}{
            "vendors": map[string]interface{}{
                "type": "array",
                "items": map[string]interface{}{
                    "type": "object",
                    "properties": map[string]interface{}{
                        "name":            map[string]string{"type": "string"},
                        "category":        map[string]interface{}{
                            "type": "string",
                            "enum": []string{"photographer", "venue", "caterer", "florist", "dj", "videographer"},
                        },
                        "email":           map[string]string{"type": "string"},
                        "phone":           map[string]string{"type": "string"},
                        "website":         map[string]string{"type": "string"},
                        "city":            map[string]string{"type": "string"},
                        "state":           map[string]string{"type": "string"},
                        "starting_price":  map[string]string{"type": "number"},
                        "style_tags":      map[string]interface{}{
                            "type": "array",
                            "items": map[string]string{"type": "string"},
                        },
                        "services_offered": map[string]interface{}{
                            "type": "array",
                            "items": map[string]string{"type": "string"},
                        },
                    },
                    "required": []string{"name", "category"},
                },
            },
        },
    },
}

func SearchVendors(query string) ([]Vendor, error) {
    client := anthropic.NewClient()

    // Call Claude with structured output
    resp, err := client.Messages.Create(context.Background(), &anthropic.MessageCreateParams{
        Model:     "claude-sonnet-4-20250514",
        MaxTokens: 4096,
        Tools:     []anthropic.Tool{vendorExtractionTool},
        Messages: []anthropic.Message{
            {
                Role: "user",
                Content: fmt.Sprintf(
                    "Search for vendors matching: %s\n\nExtract all vendor information into structured entries.",
                    query,
                ),
            },
        },
    })

    // Extract vendors from tool use response
    vendors := parseVendorsFromResponse(resp)
    return vendors, nil
}
```

**TypeScript Frontend:**
```typescript
// frontend/src/services/ai.ts
export async function searchVendorsWithAI(query: string): Promise<Vendor[]> {
  const response = await axios.post('/api/ai/search-text', { query });
  return response.data.vendors;
}

// frontend/src/components/AISearchModal.tsx
function AISearchModal() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Vendor[]>([]);

  const handleSearch = async () => {
    const vendors = await searchVendorsWithAI(query);
    setResults(vendors);
  };

  const handleConfirm = async (vendor: Vendor) => {
    await axios.post('/api/vendors', vendor);
    toast.success('Vendor added!');
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Find vintage photographers in Austin under $3000"
      />
      <button onClick={handleSearch}>Search with AI</button>

      {results.map(vendor => (
        <VendorCard
          vendor={vendor}
          onConfirm={() => handleConfirm(vendor)}
        />
      ))}
    </div>
  );
}
```

### Image-Based Search

**Flow:**
1. User uploads inspiration image
2. Claude Vision analyzes style, colors, mood
3. Extracts searchable attributes
4. Uses attributes to find similar vendors

```go
// backend/internal/ai/image_analysis.go
func AnalyzeInspirationImage(imageBase64 string) (*ImageAnalysis, error) {
    client := anthropic.NewClient()

    resp, err := client.Messages.Create(context.Background(), &anthropic.MessageCreateParams{
        Model:     "claude-sonnet-4-20250514",
        MaxTokens: 2048,
        Messages: []anthropic.Message{
            {
                Role: "user",
                Content: []anthropic.ContentBlock{
                    {
                        Type: "image",
                        Source: &anthropic.ImageSource{
                            Type:      "base64",
                            MediaType: "image/jpeg",
                            Data:      imageBase64,
                        },
                    },
                    {
                        Type: "text",
                        Text: "Analyze this wedding inspiration photo. Extract: style, color palette, setting, decor elements, mood, budget estimate.",
                    },
                },
            },
        },
    })

    // Parse structured response
    return parseImageAnalysis(resp), nil
}
```

### Cost Optimization: Prompt Caching

**Claude's prompt caching reduces costs by 90% for repeated content:**

```go
// Cache the vendor schema in system prompt
resp, err := client.Messages.Create(context.Background(), &anthropic.MessageCreateParams{
    Model:     "claude-sonnet-4-20250514",
    MaxTokens: 4096,
    System: []anthropic.SystemMessage{
        {
            Type: "text",
            Text: vendorSchemaDefinition,
            CacheControl: &anthropic.CacheControl{Type: "ephemeral"},
        },
    },
    Messages: messages,
})
```

**Savings:** First request pays full cost, subsequent requests in 5-minute window pay 90% less.

---

## Cost Analysis

### Monthly Infrastructure Costs

| Service | Purpose | Cost |
|---------|---------|------|
| **Vercel** | Frontend hosting | $0 (free tier) |
| **Fly.io** | Backend hosting | $3-5 |
| **Anthropic Claude** | AI vendor search | $0.50-1 |
| **Resend** | Email notifications | $0 (free tier) |
| **Backblaze B2** | Database backups | $0.50 |
| **Domain (optional)** | Custom domain | $1 |
| **Total** | | **$5-8/month** |

### Cost Optimization Strategies

1. **Prompt caching** - 90% savings on repeated AI queries
2. **Lazy loading** - Load vendors on-demand, not all at once
3. **Browser notifications** - Free alternative to push notification services
4. **SQLite** - No database hosting fees
5. **Static frontend** - Free Vercel hosting vs paid server

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Backend Setup:**
```bash
# Initialize Go module
go mod init wedding-planner-backend

# Install dependencies
go get github.com/gin-gonic/gin
go get github.com/mattn/go-sqlite3
go get github.com/anthropics/anthropic-sdk-go
```

**Files to create:**
- `backend/cmd/api/main.go` - Entry point
- `backend/internal/db/connection.go` - SQLite setup with WAL mode
- `backend/internal/handlers/vendors.go` - CRUD endpoints
- `backend/internal/models/vendor.go` - Vendor model
- `backend/migrations/001_create_vendors.sql` - Schema

**Frontend Setup:**
```bash
# Create Vite project
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install react-router-dom @tanstack/react-query axios
```

**Files to create:**
- `frontend/src/App.tsx` - Main app with routing
- `frontend/src/pages/VendorsPage.tsx` - Vendor list view
- `frontend/src/components/VendorCard.tsx` - Vendor display
- `frontend/src/services/api.ts` - API client

### Phase 2: Core Features (Week 3-4)

**Backend:**
- `backend/internal/handlers/tasks.go` - Task CRUD
- `backend/internal/handlers/reminders.go` - Reminder system
- `backend/internal/services/notifications.go` - Email via Resend

**Frontend:**
- `frontend/src/pages/TasksPage.tsx` - Task dashboard
- `frontend/src/pages/TimelinePage.tsx` - Visual timeline
- `frontend/src/components/ReminderBell.tsx` - Notification UI

### Phase 3: AI Integration (Week 5-6)

**Backend:**
- `backend/internal/ai/search.go` - Text-based vendor search
- `backend/internal/ai/image_analysis.go` - Image analysis
- `backend/internal/handlers/ai.go` - AI API endpoints

**Frontend:**
- `frontend/src/components/AISearchModal.tsx` - Search interface
- `frontend/src/components/ImageUpload.tsx` - Image upload
- `frontend/src/pages/InspirationBoard.tsx` - Visual inspiration

### Phase 4: Deployment (Week 7)

**Backend Deployment:**
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy backend
cd backend
fly launch
fly deploy
```

**Frontend Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel
```

---

## Key Learnings

### 1. Monorepo vs Polyrepo
**Decision:** Monorepo ✅
**Reasoning:**
- Single developer benefits from unified context
- Claude Code/Cursor work better with full codebase visibility
- Shared TypeScript types between frontend/backend
- Atomic commits for coordinated changes

### 2. SQLite in Production
**Myth:** SQLite is not production-ready
**Reality:**
- Rails 8 defaults to SQLite
- Perfect for single-user, read-heavy apps
- Faster than PostgreSQL for this use case
- WAL mode provides concurrency
- Litestream provides continuous backups

**Configuration is critical:**
```sql
PRAGMA journal_mode = WAL;  -- REQUIRED for production
PRAGMA synchronous = NORMAL;
```

### 3. AI-Powered Data Entry
**Innovation:** Schema-aware structured outputs
**Pattern:**
1. Define database schema as JSON schema
2. Pass schema to Claude as tool definition
3. Claude extracts data matching exact schema
4. Direct insert into database (no transformation)

**Benefit:** Zero manual data entry - AI search → populated database in one click

### 4. Cost Optimization
**Key insight:** Serverless/free tiers can handle single-user apps entirely

**Breakdown:**
- Vercel free tier: 100GB bandwidth (more than enough)
- Fly.io: $3/month for tiny VM
- Claude API: Prompt caching reduces costs 90%
- SQLite: No hosting fees vs $15/month PostgreSQL

**Total savings:** ~$20/month vs traditional stack (Next.js on Vercel paid + Postgres)

### 5. Go Learning Path
**Best approach for learning Go while building:**
1. Start with official Gin tutorial (1 day)
2. Build one complete CRUD endpoint (vendors)
3. Copy pattern for other endpoints
4. Use Air for live reload (fast feedback)
5. Let Claude Code explain Go idioms as you code

**Common Go patterns:**
```go
// Pointer receivers for methods that modify state
func (v *Vendor) Update() error

// Error handling - always check
if err != nil {
    return err
}

// Defer for cleanup
defer db.Close()
```

### 6. Progressive Web App (PWA)
**Benefit:** Web app that feels like native app
**Features:**
- Installable to home screen
- Offline support
- Push notifications
- No app store approval needed

**Implementation:**
```bash
npm install vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Wedding Planner',
        short_name: 'Wedding',
        theme_color: '#ffffff'
      }
    })
  ]
}
```

---

## Next Steps

### Immediate Actions
1. ✅ Create learning documentation (this file)
2. ⏳ Present implementation plan to user
3. ⏳ Initialize monorepo structure
4. ⏳ Set up backend with Go + Gin
5. ⏳ Set up frontend with Vite + React
6. ⏳ Create database schema
7. ⏳ Implement first CRUD endpoint (vendors)

### Questions for User
- Should we start with Phase 1 (foundation) immediately?
- Any specific vendor categories to prioritize?
- Preference for color scheme/design system?

---

## References

### Documentation
- Go + Gin tutorial: https://go.dev/doc/tutorial/web-service-gin
- SQLite in production: https://blog.pecar.me/sqlite-prod
- Litestream backups: https://litestream.io/
- Claude API: https://docs.anthropic.com/
- Fly.io Go guide: https://fly.io/docs/languages-and-frameworks/golang/

### Code Patterns
- Gin middleware: https://gin-gonic.com/docs/examples/
- React Query: https://tanstack.com/query/latest/docs/framework/react/overview
- Vite PWA: https://vite-pwa-org.netlify.app/

---

**End of Research Documentation**
**Ready for implementation planning and execution**
