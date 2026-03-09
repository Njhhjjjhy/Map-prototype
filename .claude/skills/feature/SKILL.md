---
name: feature
description: "Manages feature branch workflows with GitHub PRs. Use when the user invokes /feature with a branch name to start a new feature, or /feature finish to finalize and merge. Handles branch creation, commits, PRs, code review feedback, and CLAUDE.md guideline updates."
---

# Feature Branch Workflow Skill

Manages the full lifecycle of a feature branch: creation, committing, PR management, review incorporation, and merging.

## Arguments

- `/feature <branch_name>` - Start or continue a feature branch.
- `/feature finish` - Finalize the current feature branch: apply PR review comments, update CLAUDE.md, and merge.

## Mode Detection

On every invocation, detect the current mode by checking the branch name:

```bash
git branch --show-current
```

- If the branch matches `feature/*` → **Feature mode** (active feature branch).
- If the branch is `master` or anything else → **No active feature**.

**Always announce the detected mode first** before doing anything else. Examples:
- "Currently on feature branch `feature/add-legend`. Continuing in feature mode."
- "Currently on `master`. No active feature branch."

---

## Mode 1: `/feature <branch_name>`

### If already on the target `feature/<branch_name>` branch

Skip branch creation. Continue working on the user's request. After making changes:
1. Stage and commit with the user's prompt as the commit message.
2. Push to remote.

### If on a different branch (not `master`)

1. Warn the user: "You are currently on branch `<current>` with uncommitted/unpushed changes."
2. Ask: "Should I commit and merge these changes to master first, or discard them?"
3. Wait for user response before proceeding.

### Starting a new feature (on `master` or after cleanup)

1. Ensure master is up to date:
   ```bash
   git checkout master && git pull origin master
   ```
2. Create and switch to the feature branch:
   ```bash
   git checkout -b feature/<branch_name>
   ```
3. Immediately check for uncommitted changes:
   ```bash
   git status --porcelain
   ```
   - **If changes exist:** Do not wait for a follow-up prompt. Stage and commit all changed files now, using the `/feature <branch_name>` invocation as the commit message body. Then push and create the PR.
   - **If no changes exist:** Wait for the user's first prompt describing what they want built. After making those changes, proceed to step 4.
4. Stage, commit, push, and create PR:
   - Stage relevant files (prefer explicit file names over `git add .`).
   - Commit with the user's prompt as the commit message.
   - Push the branch to remote:
     ```bash
     git push -u origin feature/<branch_name>
     ```
   - Create a PR targeting `master`:
     ```bash
     gh pr create --title "<branch_name>" --body "$(cat <<'EOF'
     ## Summary
     <summary of changes>

     ## Test plan
     - [ ] Manual testing by presenter

     Generated with Claude Code
     EOF
     )"
     ```
   - Return the PR URL to the user.

### On subsequent prompts (already on `feature/*` with existing PR)

1. Make the requested changes.
2. Stage and commit with the user's prompt as the commit message.
3. Push to remote.
4. Update the PR body if the summary needs updating:
   ```bash
   gh pr edit <pr_number> --body "<updated body>"
   ```

---

## Mode 2: `/feature finish`

### Prerequisites

- Must be on a `feature/*` branch. If not, inform the user: "No active feature branch. Nothing to finish."
- A PR must exist for the current branch. Check with:
  ```bash
  gh pr list --head "$(git branch --show-current)" --json number,url --jq '.[0]'
  ```

### Steps

1. **Fetch PR review comments:**
   ```bash
   gh pr view <pr_number> --comments --json comments,reviews
   ```
   Also fetch inline code review comments:
   ```bash
   gh api repos/{owner}/{repo}/pulls/<pr_number>/comments --jq '.[] | {path, body, line}'
   ```

2. **Apply review feedback:**
   - For each actionable comment, make the requested code change.
   - Stage, commit (use the review comment as the commit message), and push.

3. **Update CLAUDE.md:**
   - Analyze the review comments for patterns or recurring issues.
   - If a comment reveals a generalizable guideline (not a one-off fix), append a concise rule to the `## Strict Rules` section of CLAUDE.md.
   - Keep added guidelines short, brief, and clear - one or two sentences maximum.
   - Example: if a reviewer says "always validate marker data before rendering," add: `- Always validate marker data before rendering to prevent null reference errors.`
   - Commit this CLAUDE.md update separately with message: "chore: update CLAUDE.md with review guidelines".

4. **Ask user to test:**
   - Tell the user: "All review feedback has been applied. Please test the changes."
   - Ask: "Should I merge this PR to master?"
   - Wait for user confirmation.

5. **Merge the PR:**
   ```bash
   gh pr merge <pr_number> --merge --delete-branch
   ```
   - Switch back to master and pull:
     ```bash
     git checkout master && git pull origin master
     ```
   - Confirm: "Feature branch `feature/<name>` merged and deleted. Back on master."

---

## Commit Message Convention

- The commit message body must be exactly the user's prompt text, verbatim, with no rewording or expansion. The title can be a concise summary of the change (e.g. "Add legend to map").
- NEVER say Co-Authored-By CLAUDE in the commit message. The user is the sole author.

## GitHub CLI Authentication

Before any `gh` operation, check authentication:
```bash
gh auth status 2>&1
```
If not authenticated, tell the user:
- "GitHub CLI is not authenticated. Please run `gh auth login` to continue."
- Wait for the user to confirm they have authenticated before proceeding.
- Do NOT skip PR creation or any `gh` operations due to auth failure - always prompt the user to authenticate first.

## Important Rules

- Always use `gh` for GitHub operations (never raw API calls with curl unless gh doesn't support it).
- Never force-push. Never amend published commits.
- Never skip git hooks (no `--no-verify`).
- Prefer staging specific files over `git add .` or `git add -A`.
- Always confirm destructive actions (discarding changes, force operations) with the user first.
- Every user prompt that results in changes must produce a commit that is pushed to the remote branch.
- The PR must be created after the first user prompt. If `gh` is not authenticated at that point, prompt the user to authenticate, then create the PR once auth succeeds.
