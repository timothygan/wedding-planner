#!/bin/bash
# Generate metadata for research documents and implementation plans

set -euo pipefail

# Get current git information
get_git_info() {
    local key="$1"

    case "$key" in
        commit)
            git rev-parse HEAD 2>/dev/null || echo "unknown"
            ;;
        branch)
            git branch --show-current 2>/dev/null || echo "unknown"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Get researcher name from git config or thoughts config
get_researcher() {
    # Try weddingplanner config first
    if [[ -f ~/.weddingplanner/config.json ]] && command -v jq &>/dev/null; then
        local user
        user=$(jq -r '.user // empty' ~/.weddingplanner/config.json 2>/dev/null)
        if [[ -n "$user" ]]; then
            echo "$user"
            return
        fi
    fi

    # Fall back to git config
    git config user.name 2>/dev/null || echo "${USER}"
}

# Get current timestamp in ISO format
get_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%S%z"
}

# Get current date
get_date() {
    date -u +"%Y-%m-%d"
}

# Main output
main() {
    cat <<EOF
date: $(get_timestamp)
researcher: $(get_researcher)
git_commit: $(get_git_info commit)
branch: $(get_git_info branch)
repository: wedding-planner
EOF
}

main "$@"
