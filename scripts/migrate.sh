#!/bin/bash
set -e

# Migration script using golang-migrate
# golang-migrate will be installed in the container

MIGRATIONS_DIR="./migrations"
DATABASE_URL="${DATABASE_URL:-postgres://weddingplanner:devpassword@localhost:5432/weddingplanner?sslmode=disable}"

case "$1" in
  up)
    echo "Running migrations up..."
    # migrate -path ${MIGRATIONS_DIR} -database ${DATABASE_URL} up
    echo "Migrations complete (no migrations yet)"
    ;;
  down)
    echo "Running migrations down..."
    # migrate -path ${MIGRATIONS_DIR} -database ${DATABASE_URL} down
    echo "Migrations rolled back (no migrations yet)"
    ;;
  create)
    if [ -z "$2" ]; then
      echo "Usage: $0 create <migration_name>"
      exit 1
    fi
    echo "Creating migration: $2"
    # migrate create -ext sql -dir ${MIGRATIONS_DIR} -seq $2
    echo "Migration files will be created in Ticket 3"
    ;;
  *)
    echo "Usage: $0 {up|down|create <name>}"
    exit 1
    ;;
esac
