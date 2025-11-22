# Wedding Planner - Project Context

## Project Overview

Wedding Planner is a vendor management application designed to help users track, research, and organize wedding vendors through an intuitive Trello-style interface with AI-powered search capabilities.

## Core Features

### Vendor Management
- **Board View**: Trello-style columns representing vendor status (Needs Research, Need to Contact, In Discussion, Moving Forward, Not Moving Forward, Booked)
- **Vendor Cards**: Each card represents a vendor with details:
  - Name and business information
  - Contact details (phone, email, website)
  - Pricing information
  - Last contact date
  - AI-generated summaries
  - Category (caterer, venue, florist, photographer, etc.)
  - Notes and attachments

### AI-Powered Search
- **Natural Language Search**: Users can describe vendor requirements in plain English
  - Example: "find me asian food caterers in seattle that are really popular nowadays and specialize in weddings"
- **Image-Based Search**: Users can upload images to find similar vendors
  - Example: Upload a chair image and ask for "vendors that have chairs like this except in black in the SF area"
- **Auto-Population**: Search results automatically create vendor cards with populated details in the "Needs Research" or "Need to Contact" columns

## Technical Architecture

### Backend
- **Language**: Go (primary choice for performance, concurrency, and type safety)
- **Architecture Pattern**: Domain-Driven Design (DDD)
- **Testing Approach**: Test-Driven Development (TDD)
- **AI Integration**: BAML (Basically a Made-up Language) for structured LLM interactions

### Frontend
- **Framework**: React with TypeScript (or similar modern framework)
- **UI Components**: Component-based architecture with reusable card and board components
- **State Management**: React Context or similar for vendor state

### Data Layer
- **Database**: PostgreSQL (recommended for structured vendor data)
- **ORM/Query Builder**: Consider sqlc or GORM for type-safe database access

### AI/ML Layer
- **BAML**: Schema-driven LLM interactions for:
  - Natural language query parsing
  - Vendor information extraction from web searches
  - Image analysis and similarity matching
  - Structured data generation for vendor cards
- **LLM Providers**: Support for OpenAI, Anthropic, or similar

## Development Principles

### Test-Driven Development (TDD) - MANDATORY

**TDD is a core requirement for this project. All features must follow the Red-Green-Refactor cycle:**

1. **Red**: Write failing tests first
   - Unit tests for domain models and business logic
   - Integration tests for API endpoints
   - Contract tests for BAML functions
2. **Green**: Write minimal code to make tests pass
3. **Refactor**: Improve code while keeping tests green

**Test Coverage Requirements:**
- Minimum 80% code coverage for core business logic
- 100% coverage for domain models and value objects
- Integration tests for all API endpoints
- E2E tests for critical user workflows

**Testing Philosophy: Sociable Testing - MANDATORY**

We practice **sociable testing** (also called "integration-style unit tests") rather than solitary unit testing with extensive mocking.

**Core Principles:**
- **Test real collaborations**: Test components together with their real dependencies
- **Minimize mocking**: Only mock at system boundaries (external APIs, third-party services, filesystem)
- **Use real databases in tests**: Use testcontainers-go to run tests against real PostgreSQL instances
- **Test behavior, not implementation**: Focus on what the system does, not how it does it
- **Accept slower tests for higher confidence**: Sociable tests are more realistic but may run slower

**What to Mock (System Boundaries Only):**
- ✅ External HTTP APIs (third-party services, payment gateways)
- ✅ LLM/AI services (OpenAI, Anthropic APIs)
- ✅ Email services, SMS providers
- ✅ Cloud storage (S3, etc.)
- ✅ System clock (for time-dependent tests)

**What NOT to Mock (Use Real Implementations):**
- ❌ Database access (use testcontainers with real PostgreSQL)
- ❌ Domain services
- ❌ Application services
- ❌ Repositories (test with real DB)
- ❌ Value objects and entities
- ❌ Internal HTTP handlers

**Example: Testing Application Service with Real Repository**
```go
func TestVendorService_CreateVendor(t *testing.T) {
    // Use real PostgreSQL via testcontainers
    db := setupTestDatabase(t)
    defer db.Close()

    // Use real repository implementation
    repo := postgres.NewVendorRepository(db)

    // Use real application service with real repository
    service := application.NewVendorService(repo)

    // Test the actual behavior
    vendor, err := service.CreateVendor(ctx, createDTO)
    assert.NoError(t, err)
    assert.NotNil(t, vendor)

    // Verify with real database query
    found, err := repo.FindByID(ctx, vendor.ID)
    assert.NoError(t, err)
    assert.Equal(t, vendor.Name, found.Name)
}
```

**Why Sociable Testing?**
- Catches integration bugs early
- Tests reflect real system behavior
- Less brittle than heavily mocked tests
- Easier to refactor without breaking tests
- Validates actual data flow and collaborations

**Testing Structure:**
```
├── internal/
│   ├── domain/
│   │   ├── vendor.go
│   │   └── vendor_test.go          # Sociable tests with real collaborators
│   ├── application/
│   │   ├── vendor_service.go
│   │   └── vendor_service_test.go  # Tests with real repositories (testcontainers)
│   └── infrastructure/
│       ├── repository/
│       │   ├── vendor_repository.go
│       │   └── vendor_repository_test.go  # Tests with real PostgreSQL (testcontainers)
├── tests/
│   ├── integration/                 # Integration tests
│   └── e2e/                         # End-to-end tests
```

### Domain-Driven Design (DDD) - MANDATORY

**DDD principles guide the architecture and code organization:**

#### Ubiquitous Language
- Use wedding industry terminology consistently across code, docs, and UI
- Domain terms: Vendor, Category, VendorStatus, Budget, ContactLog, SearchCriteria
- Avoid technical jargon in domain layer (use "VendorRepository" not "VendorDAO")

#### Bounded Contexts
1. **Vendor Management Context**: Core vendor CRUD, status tracking
2. **Search Context**: AI-powered vendor discovery and matching
3. **Communication Context**: Contact tracking, reminders, notes
4. **Budget Context**: Pricing, payment tracking (future)

#### Layered Architecture
```
├── domain/              # Entities, Value Objects, Domain Services
│   ├── vendor/         # Vendor aggregate
│   ├── search/         # Search domain
│   └── shared/         # Shared kernel
├── application/        # Use Cases, Application Services
├── infrastructure/     # External concerns (DB, API, BAML)
└── interfaces/         # API handlers, DTOs
```

#### Aggregates and Entities
- **Vendor Aggregate**: Root entity managing vendor lifecycle
- **Value Objects**: ContactInfo, Money, SearchCriteria, VendorCategory
- **Domain Events**: VendorCreated, VendorStatusChanged, VendorContacted

#### Repository Pattern
- Abstract data access behind repository interfaces
- Domain layer defines repository contracts
- Infrastructure layer implements repositories

**Example Domain Structure:**
```go
// domain/vendor/vendor.go
type Vendor struct {
    ID          VendorID
    Name        string
    Category    VendorCategory
    Status      VendorStatus
    ContactInfo ContactInfo
    Pricing     Money
    LastContact time.Time
}

// domain/vendor/repository.go
type VendorRepository interface {
    Save(ctx context.Context, vendor *Vendor) error
    FindByID(ctx context.Context, id VendorID) (*Vendor, error)
    FindByStatus(ctx context.Context, status VendorStatus) ([]*Vendor, error)
}
```

## BAML Integration

BAML functions should be defined in `.baml` files for:
- Parsing natural language search queries into structured SearchCriteria
- Extracting vendor information from web results
- Analyzing images for visual similarity
- Generating vendor summaries

**Example BAML function:**
```baml
class SearchCriteria {
    category VendorCategory
    location string
    keywords string[]
    priceRange PriceRange?
    requirements string[]
}

function ParseSearchQuery(query: string) -> SearchCriteria {
    client "anthropic/claude-sonnet-4"
    prompt #"
        Parse the following wedding vendor search query into structured criteria:
        {{ query }}

        Extract: category, location, keywords, and specific requirements.
    "#
}
```

## Code Quality Standards

- **Linting**: Use golangci-lint with strict settings
- **Formatting**: gofmt and goimports mandatory
- **Code Review**: All PRs require review with passing tests
- **Documentation**: Godoc comments for all exported types and functions
- **Error Handling**: Explicit error handling, no silent failures
- **Logging**: Structured logging with appropriate levels

## Git Workflow

- Feature branches from `main`
- Meaningful commit messages following conventional commits
- Squash merges to keep history clean
- CI/CD runs all tests before merge

## Project Structure (Initial)

```
wedding-planner/
├── cmd/
│   └── server/          # Main application entry point
├── internal/
│   ├── domain/          # Domain models, entities, value objects
│   ├── application/     # Use cases, application services
│   ├── infrastructure/  # Database, external services, BAML
│   └── interfaces/      # HTTP handlers, gRPC, GraphQL
├── baml/                # BAML function definitions
├── web/                 # Frontend application
├── tests/               # Integration and E2E tests
├── migrations/          # Database migrations
├── docs/                # Additional documentation
└── scripts/             # Build and deployment scripts
```

## Key Priorities

1. **Test First**: Always write tests before implementation
2. **Domain Modeling**: Invest time in rich domain models
3. **Type Safety**: Leverage Go's type system and BAML's structured outputs
4. **Incremental Development**: Build features iteratively with working software at each stage
5. **User Experience**: Focus on intuitive UI and fast AI responses

## Anti-Patterns to Avoid

- Anemic domain models (models with only getters/setters)
- Logic in HTTP handlers (keep them thin)
- Direct database access outside repositories
- Tight coupling between layers
- Skipping tests to "move faster"

## Resources

- [BAML Documentation](https://docs.boundaryml.com/)
- [Domain-Driven Design by Eric Evans](https://www.oreilly.com/library/view/domain-driven-design-tackling/0321125215/)
- [Go Project Layout](https://github.com/golang-standards/project-layout)
- [Table Driven Tests in Go](https://dave.cheney.net/2019/05/07/prefer-table-driven-tests)

## Getting Started

New developers should:
1. Read this document thoroughly
2. Review the domain model in `internal/domain/`
3. Run the test suite: `go test ./...`
4. Check the TIMELINE.md for current development phase
5. Pick a ticket from the backlog and follow TDD/DDD principles

---

**Remember: If you're not writing tests first, you're not following our development process. If your code doesn't reflect the domain, you're not practicing DDD.**
