---
description: Debug issues by investigating logs, database state, and git history
---

# Debug

You are tasked with helping debug issues during manual testing or implementation. This command allows you to investigate problems by examining logs, database state, and git history without editing files. Think of this as a way to bootstrap a debugging session without using the primary window's context.

## Initial Response

When invoked WITH a plan/ticket file:
```
I'll help debug issues with [file name]. Let me understand the current state.

What specific problem are you encountering?
- What were you trying to test/implement?
- What went wrong?
- Any error messages?

I'll investigate the logs, database, and git state to help figure out what's happening.
```

When invoked WITHOUT parameters:
```
I'll help debug your current issue.

Please describe what's going wrong:
- What are you working on?
- What specific problem occurred?
- When did it last work?

I can investigate logs, database state, and recent changes to help identify the issue.
```

## Environment Information

You have access to these key locations and tools:

**Logs**:
- Application logs (check common locations like `logs/`, `.wedding-planner/logs/`, or `/tmp/`)
- Look for error logs, debug logs, or service-specific logs
- Check log timestamps to find relevant timeframes

**Database** (if applicable):
- Check project for SQLite, PostgreSQL, or other database files
- Can query directly with appropriate tools (`sqlite3`, `psql`, etc.)
- Look in project root or data directories

**Git State**:
- Check current branch, recent commits, uncommitted changes
- Similar to how `commit` and `describe_pr` commands work

**Service Status**:
- Check if application processes are running: `ps aux | grep wedding-planner`
- Check for lock files or PID files
- Verify ports are accessible if network services are involved

## Process Steps

### Step 1: Understand the Problem

After the user describes the issue:

1. **Read any provided context** (plan or ticket file):
   - Understand what they're implementing/testing
   - Note which phase or step they're on
   - Identify expected vs actual behavior

2. **Quick state check**:
   - Current git branch and recent commits
   - Any uncommitted changes
   - When the issue started occurring

### Step 2: Investigate the Issue

Spawn parallel Task agents for efficient investigation:

```
Task 1 - Check Recent Logs:
Find and analyze the most recent logs for errors:
1. Search common log locations: logs/, .wedding-planner/logs/, /tmp/, ./
2. Look for recent log files: find . -name "*.log" -type f -mtime -1
3. Search for errors, warnings, or issues around the problem timeframe
4. Check application output or console logs
5. Look for stack traces or repeated errors
Return: Key errors/warnings with timestamps
```

```
Task 2 - Database State (if applicable):
Check the current database state if the project uses one:
1. Identify database files or connection configs
2. Connect with appropriate tool (sqlite3, psql, etc.)
3. Check schema and recent data
4. Look for stuck states or anomalies
5. Query relevant tables based on the issue
Return: Relevant database findings
```

```
Task 3 - Git and File State:
Understand what changed recently:
1. Check git status and current branch
2. Look at recent commits: git log --oneline -10
3. Check uncommitted changes: git diff
4. Verify expected files exist
5. Look for any file permission issues
Return: Git state and any file issues
```

### Step 3: Present Findings

Based on the investigation, present a focused debug report:

```markdown
## Debug Report

### What's Wrong
[Clear statement of the issue based on evidence]

### Evidence Found

**From Logs**:
- [Error/warning with timestamp and file location]
- [Pattern or repeated issue]

**From Database** (if applicable):
```sql
-- Relevant query and result
[Finding from database]
```

**From Git/Files**:
- [Recent changes that might be related]
- [File state issues]

### Root Cause
[Most likely explanation based on evidence]

### Next Steps

1. **Try This First**:
   ```bash
   [Specific command or action]
   ```

2. **If That Doesn't Work**:
   - Restart application services
   - Check console/terminal output for errors
   - Run with debug mode enabled (if available)
   - Review recent code changes

### Can't Access?
Some issues might be outside my reach:
- GUI application console errors
- External service states
- System-level issues

Would you like me to investigate something specific further?
```

## Important Notes

- **Focus on manual testing scenarios** - This is for debugging during implementation
- **Always require problem description** - Can't debug without knowing what's wrong
- **Read files completely** - No limit/offset when reading context
- **Think like `commit` or `describe_pr`** - Understand git state and changes
- **Guide back to user** - Some issues (browser console, MCP internals) are outside reach
- **No file editing** - Pure investigation only

## Quick Reference

**Find Latest Logs**:
```bash
find . -name "*.log" -type f -mtime -1 -ls
ls -t logs/*.log 2>/dev/null | head -5
tail -f [log-file]  # Follow log in real-time
```

**Database Queries** (if applicable):
```bash
# For SQLite
sqlite3 [db-file] ".tables"
sqlite3 [db-file] ".schema [table]"

# For PostgreSQL
psql -d [dbname] -c "\dt"
```

**Service Check**:
```bash
ps aux | grep wedding-planner
ps aux | grep [process-name]
lsof -i :[port]  # Check if port is in use
```

**Git State**:
```bash
git status
git log --oneline -10
git diff
```

Remember: This command helps you investigate without burning the primary window's context. Perfect for when you hit an issue during manual testing and need to dig into logs, database, or git state.
