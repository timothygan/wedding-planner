#!/bin/bash
# Create a git worktree for working on a branch

set -euo pipefail

usage() {
    cat <<EOF
Usage: $0 BRANCH_NAME

Create a git worktree for working on a branch.

Arguments:
  BRANCH_NAME    Name of the branch to create/checkout

The worktree will be created at: ~/wt/wedding-planner/BRANCH_NAME

Examples:
  $0 feature/video-filtering
  $0 fix/audio-sync-bug

EOF
    exit 1
}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

info() {
    echo -e "${BLUE}$1${NC}"
}

success() {
    echo -e "${GREEN}$1${NC}"
}

# Check arguments
if [[ $# -lt 1 ]]; then
    usage
fi

BRANCH_NAME="$1"
WORKTREE_BASE="$HOME/wt/wedding-planner"
WORKTREE_PATH="$WORKTREE_BASE/$BRANCH_NAME"

# Ensure we're in a git repo
if ! git rev-parse --git-dir &>/dev/null; then
    error "Not in a git repository"
fi

# Check if worktree already exists
if [[ -d "$WORKTREE_PATH" ]]; then
    error "Worktree already exists at $WORKTREE_PATH"
fi

# Create worktree base directory if needed
mkdir -p "$WORKTREE_BASE"

# Check if branch exists locally or remotely
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    # Branch exists locally
    info "Checking out existing branch: $BRANCH_NAME"
    git worktree add "$WORKTREE_PATH" "$BRANCH_NAME"
elif git show-ref --verify --quiet "refs/remotes/origin/$BRANCH_NAME"; then
    # Branch exists on remote
    info "Checking out remote branch: origin/$BRANCH_NAME"
    git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" "origin/$BRANCH_NAME"
else
    # Create new branch
    info "Creating new branch: $BRANCH_NAME"
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH"
fi

success "✅ Worktree created at: $WORKTREE_PATH"

# Copy Claude settings if they exist
if [[ -f .claude/settings.local.json ]]; then
    mkdir -p "$WORKTREE_PATH/.claude"
    cp .claude/settings.local.json "$WORKTREE_PATH/.claude/"
    success "✅ Copied Claude settings"
fi

# Initialize thoughts if weddingplanner command exists
if command -v weddingplanner &>/dev/null; then
    info "Initializing thoughts for worktree..."
    cd "$WORKTREE_PATH"
    weddingplanner thoughts init --directory wedding-planner 2>/dev/null || true
    cd - > /dev/null
fi

echo ""
info "Next steps:"
echo "  cd $WORKTREE_PATH"
echo "  # Do your work..."
echo "  # When done:"
echo "  git worktree remove $WORKTREE_PATH"
