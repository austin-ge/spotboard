---
name: wrap-up
description: End-of-session workflow — commit, push, and update project documentation
---

Run the session wrap-up workflow. Do all three steps in order:

## 1. Commit & Push

- Run `git status` and `git diff --stat` to see what changed
- If there are uncommitted changes, stage the relevant files (not .env or secrets) and commit with a descriptive message following the repo's commit style (`feat:`, `fix:`, `refactor:`, etc.)
- Push to the current branch (check what branch you're on first)
- If the working tree is already clean, skip this step

## 2. Update Project Memory

Update the auto-memory file at `~/.claude/projects/-Users-austingeorge-Developer-spotboard/memory/MEMORY.md` to reflect the current state of the project. This should be a concise reference, not a changelog. Update these sections:

- **Current State**: Replace with what's actually built and working now
- **Key Architecture Decisions**: Add any new patterns or decisions made this session
- **Tech Stack**: Update if anything changed
- Remove or update anything that's outdated or wrong

Keep MEMORY.md under 200 lines. Don't add session-specific details — only stable facts about the project.

## 3. Summary

Print a short summary of:
- What was committed/pushed (or "nothing to commit")
- What was updated in memory
- Any suggested next steps based on the current project state
