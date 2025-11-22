# Wedding Planner Backend

[![CI](https://github.com/timgan/wedding-planner/workflows/CI/badge.svg)](https://github.com/timgan/wedding-planner/actions)
[![Go Report Card](https://goreportcard.com/badge/github.com/timgan/wedding-planner)](https://goreportcard.com/report/github.com/timgan/wedding-planner)

A vendor management application for wedding planning with AI-powered search capabilities. Built with Go using Test-Driven Development (TDD) and Domain-Driven Design (DDD) principles.

## Features

- **Vendor Management**: Trello-style board interface for tracking vendors
- **TDD/DDD Architecture**: Clean, maintainable, well-tested codebase
- **AI-Powered Search**: Natural language and image-based vendor discovery (coming soon)
- **Developer-Friendly**: Hot reload, comprehensive testing, automated quality gates

## Quick Start

### Prerequisites

- Go 1.23 or later
- Docker and Docker Compose
- Make

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/timgan/wedding-planner.git
   cd wedding-planner
   ```

2. **Install dependencies**
   ```bash
   make install
   ```

3. **Start the development environment**
   ```bash
   docker-compose up
   ```

4. **Verify the setup**
   ```bash
   curl http://localhost:8080/health
   # Should return: {"status":"ok"}
   ```

That's it! You're ready to develop. The application will auto-reload on code changes.

## Development Workflow

### Running Tests

```bash
# Run all tests
make test

# Run only unit tests
make test-unit

# Run with coverage report
make coverage
```

### Code Quality

```bash
# Run linter
make lint

# Format code
make fmt

# Run all quality checks (fmt, vet, lint, test)
make check
```

### Building

```bash
# Build the application
make build

# Run locally (without Docker)
make run
```

### Database Migrations

```bash
# Run migrations (when added in Ticket 3)
./scripts/migrate.sh up

# Rollback migrations
./scripts/migrate.sh down

# Create new migration
./scripts/migrate.sh create <migration_name>
```

## Project Structure

```
wedding-planner/
├── cmd/server/           # Application entry point
├── internal/
│   ├── domain/          # Domain layer (entities, value objects)
│   ├── application/     # Application services (use cases)
│   ├── infrastructure/  # Database, external services
│   └── interfaces/      # HTTP handlers, DTOs
├── tests/               # Integration and E2E tests
├── baml/                # BAML AI function definitions
└── migrations/          # Database migrations
```

See [CLAUDE.md](CLAUDE.md) for detailed architectural guidelines.

## Test-Driven Development & Sociable Testing

This project strictly follows TDD with a **sociable testing** approach. All code changes must:

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to pass the test
3. **Refactor**: Improve code while keeping tests green

**Sociable Testing Philosophy:**
- Test with real dependencies, not mocks
- Use testcontainers for real PostgreSQL in tests
- Only mock system boundaries (external APIs, third-party services)
- See `tests/integration/setup_test.go` for testcontainers pattern
- See `internal/domain/vendor/vendor_status_test.go` for table-driven tests

## Domain-Driven Design

The codebase follows DDD principles:

- **Domain Layer**: Pure business logic, no dependencies on infrastructure
- **Application Layer**: Orchestrates domain objects, provides use cases
- **Infrastructure Layer**: Database, external APIs, BAML integration
- **Interface Layer**: HTTP handlers, DTOs, API contracts

Layer dependencies flow inward: `interfaces → application → domain`

## Available Make Commands

Run `make help` to see all available commands:

```
make help          # Show all available commands
make install       # Install development dependencies
make test          # Run all tests
make lint          # Run linter
make build         # Build the application
make run           # Run the application
make check         # Run all quality checks
```

## CI/CD

Every pull request runs:

- ✅ All tests (with 80% minimum coverage)
- ✅ golangci-lint
- ✅ Build verification

CI must pass before merging.

## Contributing

1. Create a feature branch
2. Write tests first (TDD)
3. Implement features following DDD principles
4. Ensure `make check` passes
5. Open a pull request

## Troubleshooting

### Docker containers won't start

```bash
# Stop and remove containers
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

### Database connection errors

Verify PostgreSQL is running:
```bash
docker-compose ps
docker-compose logs postgres
```

### Tests failing

Ensure dependencies are up to date:
```bash
go mod download
make install
```

### Air not reloading

Check the Air logs:
```bash
docker-compose logs -f app
```

## License

[Your License Here]

## Resources

- [Go Project Layout](https://github.com/golang-standards/project-layout)
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- [BAML Documentation](https://docs.boundaryml.com/)
