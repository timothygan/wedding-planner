# Initial Go Backend Project Structure with TDD/DDD Setup

## Overview

Set up the foundational project structure for the Wedding Planner Go backend following Test-Driven Development (TDD) and Domain-Driven Design (DDD) principles. This includes directory structure, tooling, testing framework, CI/CD pipeline, and development environment setup to ensure code quality and maintainability from day one.

## Objectives

- Establish DDD-compliant project structure with clear layer separation
- Configure comprehensive testing infrastructure with quality gates
- Automate quality checks through CI/CD pipeline
- Provide seamless local development experience with Docker and live reload

## Functional Requirements

**Project Initialization:**
- [ ] Initialize Go module with `go mod init` (using latest Go version)
- [ ] Add core dependencies (testify, mock generation, etc.)

**Directory Structure:**
- [ ] Create DDD layer directories (domain, application, infrastructure, interfaces)
- [ ] Create `cmd/server/` for main entry point
- [ ] Create `tests/` directory with integration and e2e subdirectories
- [ ] Create `baml/` directory for BAML functions
- [ ] Create `migrations/` directory for database migrations
- [ ] Create `scripts/` directory for build/deploy scripts

**Testing Framework:**
- [ ] Configure testify for assertions and test suites
- [ ] Set up mockgen for interface mocking
- [ ] Create example test files demonstrating testing patterns

**CI/CD Pipeline:**
- [ ] Create GitHub Actions workflow for running tests on PR and push to main
- [ ] Add golangci-lint step to CI pipeline
- [ ] Configure code coverage reporting with 80% minimum threshold
- [ ] Add status badges to README

**Development Tooling:**
- [ ] Configure Air for live reload with `.air.toml`
- [ ] Create `.golangci.yml` with strict linting rules
- [ ] Create Makefile with targets: test, build, lint, run, coverage

**Docker Setup:**
- [ ] Create Dockerfile for application
- [ ] Create docker-compose.yml for local development
- [ ] Include PostgreSQL service in docker-compose

**Documentation:**
- [ ] Create comprehensive README with setup instructions
- [ ] Document development workflow
- [ ] Add examples of running common commands

## Non-Functional Requirements

**Code Quality:**
- [ ] All code must pass golangci-lint with zero warnings
- [ ] Code coverage minimum 80% enforced in CI
- [ ] All exported types and functions must have godoc comments

**Developer Experience:**
- [ ] Local setup should complete in under 5 minutes
- [ ] Live reload should restart server in under 2 seconds
- [ ] All make commands should have help descriptions

**Maintainability:**
- [ ] Directory structure must follow standard Go project layout
- [ ] Clear separation between DDD layers (no cross-layer imports except allowed directions)
- [ ] CI pipeline should complete in under 5 minutes

**Portability:**
- [ ] Development environment must work on macOS, Linux, and Windows (via Docker)
- [ ] No hardcoded paths or environment-specific configurations

**Documentation:**
- [ ] README must include troubleshooting section
- [ ] All setup steps must be copy-pasteable commands

## Success Criteria

- [ ] `make test` runs successfully with no errors
- [ ] `make lint` passes with zero warnings
- [ ] `make build` produces a working binary
- [ ] CI pipeline passes on a test PR with all checks green
- [ ] Code coverage report shows 80%+ coverage (even with example tests)
- [ ] `docker-compose up` starts the development environment successfully
- [ ] A new developer can follow README and get running in under 5 minutes
- [ ] Project structure matches Go standard layout and DDD principles from CLAUDE.md
- [ ] All Makefile commands are documented and working

**Acceptance test:** Create a minimal "hello world" endpoint with a test, run all tooling commands, and verify CI passes.

## Context & Background

This is the foundational ticket for the Wedding Planner project. According to CLAUDE.md, the project mandates:
- Test-Driven Development (TDD) with minimum 80% coverage
- Domain-Driven Design (DDD) with clear bounded contexts
- Go as the primary backend language
- Strict code quality standards

This ticket establishes the infrastructure to support these requirements from day one. Without proper tooling and structure, it's difficult to enforce TDD/DDD practices consistently. The setup must support the future addition of BAML for AI-powered vendor search and PostgreSQL for data persistence.

This is a prerequisite for all future development work.

**Decisions Made:**
- Use latest stable Go version (1.23+)
- Use industry-standard database migration tool (specific choice to be determined during implementation)
- CI runs on both PRs and pushes to main
- Automatic dependency updates deferred for now

## Open Questions

- [ ] Which specific migration tool? (golang-migrate, goose, or atlas - all are industry standard)
- [ ] Should BAML tooling setup be included in this ticket or deferred to a separate BAML integration ticket?
- [ ] Any specific golangci-lint rules beyond the recommended defaults that are critical for this project?

## Related Work

- Implementation plan: [will be created via /create_plan]
- Research: [none required - standard project setup]
