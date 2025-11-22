.PHONY: help test lint build run clean coverage fmt vet mocks check install

# Default target - show help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install development dependencies
	@echo "Installing dependencies..."
	go mod download
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@echo "Dependencies installed successfully"
	@echo "Note: Docker is required for testcontainers integration tests"

test: ## Run all tests
	@echo "Running tests..."
	go test ./... -v -race -coverprofile=coverage.out

test-unit: ## Run only unit tests
	@echo "Running unit tests..."
	go test ./internal/... -v -short

test-integration: ## Run integration tests
	@echo "Running integration tests..."
	go test ./tests/integration/... -v

coverage: test ## Run tests and show coverage report
	@echo "Generating coverage report..."
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated at coverage.html"
	go tool cover -func=coverage.out

lint: ## Run linter
	@echo "Running linter..."
	@if command -v golangci-lint >/dev/null 2>&1; then \
		golangci-lint run ./... -v; \
	else \
		$$(go env GOPATH)/bin/golangci-lint run ./... -v; \
	fi

fmt: ## Format code
	@echo "Formatting code..."
	go fmt ./...

vet: ## Run go vet
	@echo "Running go vet..."
	go vet ./...

build: ## Build the application
	@echo "Building application..."
	go build -o bin/server ./cmd/server

run: ## Run the application
	@echo "Running application..."
	go run ./cmd/server

clean: ## Clean build artifacts
	@echo "Cleaning..."
	rm -rf bin/
	rm -rf tmp/
	rm -f coverage.out coverage.html

check: fmt vet lint test ## Run all quality checks (fmt, vet, lint, test)
	@echo "✅ All checks passed!"

.DEFAULT_GOAL := help
