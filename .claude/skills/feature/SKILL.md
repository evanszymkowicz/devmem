---
name: feature
description: Manage current feature workflow - start, review, explain or complete
argument-hint: load|start|review|test|explain|complete
---

# Feature Workflow

Manages the full lifecycle of a feature from spec to merge.

## Working File

`@context/current-feature.md`

### File Structure

`current-feature.md` has these sections:

- `# Current Feature` - H1 heading with feature name when active
- `## Status` - Not Started | In Progress | Complete
- `## Goals` - Bullet points of what success looks like
- `## Notes` - Additional context, constraints, or details from spec
- `## History` - Completed features (append only)

## Task

Execute the requested action: $ARGUMENTS

| Action     | Description                                                              |
| ---------- | ------------------------------------------------------------------------ |
| `load`     | Load a feature spec or inline description into current-feature.md        |
| `start`    | Begin implementation (user creates the branch)                           |
| `review`   | Check goals met, code quality                                            |
| `test`     | Check for testable logic; run `npm run build` and fix any errors         |
| `explain`  | Document what changed and why                                            |
| `complete` | Update history in current-feature.md, create change-log file, reset     |

See [actions/](actions/) for detailed instructions.

If no action provided, explain the available options.
