# AI Interaction Guidelines

## Communication

- Be concise and direct
- Explain non-obvious decisions briefly
- Ask before large refactors or architectural changes
- Don't add features not in the project spec
- Never delete files without clarification

## Workflow

This is the common workflow that we will use for every single feature/fix:

1. **Document** - Document the feature in @context/current-feature.md.
2. **Branch** - The user will create the branch.
3. **Implement** - Implement the feature/fix documented in @context/current-feature.md.
4. **Test** - Verify it works in the browser. Run `npm test` and fix any failures. Run `npm run build` and fix any errors.
5. **Iterate** - Iterate and change things if needed.
6. **Commit** - The user will commit to the branch.
7. **Merge** - The user will review and merge on GitHub's website.
8. **Wrap Up** - After implementation is complete and working:
   - Update @context/current-feature.md history section with what was done, then reset the file to the base state for the next feature.
   - Create a new file in @context/change-log/ documenting what was done.

Do NOT commit. If build fails, fix the issues first.

## Branching

The user creates all branches. Name branches **feature/[feature]** or **fix/[fix]**, etc.

## Commits

- Do NOT commit — the user handles all commits and merges.
- Use conventional commit messages (feat:, fix:, chore:, etc.) when suggesting commit messages.
- Keep commits focused (one feature/fix per commit).
- Never put "Generated With Claude" in commit messages.

## When Stuck

- If something isn't working after 2-3 attempts, stop and explain the issue
- Don't keep trying random fixes
- Ask for clarification if requirements are unclear

## Code Changes

- Make minimal changes to accomplish the task
- Don't refactor unrelated code unless asked
- Don't add "nice to have" features
- Preserve existing patterns in the codebase

## Code Review

Review AI-generated code periodically, especially for:

- Security (auth checks, input validation)
- Performance (unnecessary re-renders, N+1 queries)
- Logic errors (edge cases)
- Patterns (matches existing codebase?)

### Self-review checklist

Before handing off a change, scan it for the issues our code-scans repeatedly catch:

- **Bounded queries** — every `findMany` has a `take`; no unbounded fetches
- **Env guards** — required env vars validated at module load and fail loud
- **Ownership** — every Server Action reads the session and scopes queries to the user; no client-trusted `userId`
- **No secrets in source** — passwords/keys come from gitignored env, never literals or weak fallbacks
- **DRY** — no duplicated constants/maps; shared data resolved once, not re-fetched per component
- **Defensive rendering** — empty states, input guards, no blank screens

### Deferred findings

When a real finding is intentionally not fixed (waiting on auth, a migration, etc.),
record it explicitly with the reason — in the change-log under a "Deferred" heading
and/or `.claude/agent-memory/code-scanner/recurring-issues.md` — rather than silently
skipping it. Prefer fixing latent issues (unbounded queries, missing guards) before
they become bugs, not after.
