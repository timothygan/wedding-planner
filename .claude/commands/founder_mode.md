---
description: Create PR for experimental features after implementation
---

you're working on an experimental feature that didn't get the proper PR set up.

assuming you just made a commit, here are the next steps:

1. get the sha of the commit you just made (if you didn't make one, read `.claude/commands/commit.md` and make one)

2. ask the user for a descriptive branch name based on what you implemented

3. git checkout main

4. git checkout -b 'BRANCHNAME'

5. git cherry-pick 'COMMITHASH'

6. git push -u origin 'BRANCHNAME'

7. gh pr create --fill

8. read '.claude/commands/describe_pr.md' and follow the instructions to create a proper PR description
