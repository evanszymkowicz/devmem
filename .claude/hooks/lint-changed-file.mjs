#!/usr/bin/env node
// PostToolUse hook: lint only the file that was just edited.
//
// Advisory by design — it NEVER blocks a tool call (always exits 0). When the
// edited file is a TS/TSX source file and ESLint reports problems, the findings
// are returned to Claude as `additionalContext` so they can be fixed in the same
// turn, instead of waiting for the `/feature test` gate or a human review.
//
// Scope is deliberately one file: linting the whole project on every edit is too
// slow and would surface the known pre-existing baseline noise. Linting just the
// changed file is fast and high-signal.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

function emit(additionalContext) {
  if (additionalContext) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext,
        },
      }),
    );
  }
  process.exit(0); // advisory: never block
}

let raw = "";
try {
  raw = await new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
} catch {
  emit();
}

let filePath;
try {
  const input = JSON.parse(raw || "{}");
  filePath = input?.tool_input?.file_path;
} catch {
  emit();
}

if (!filePath) emit();

// Only lint TypeScript/TSX sources under src/.
const normalized = filePath.replace(/\\/g, "/");
if (!/\/src\/.*\.(ts|tsx)$/.test(normalized)) emit();

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const eslintBin = path.join(projectDir, "node_modules", ".bin", "eslint");

// If deps aren't installed (e.g. a fresh worktree), skip silently.
if (!existsSync(eslintBin)) emit();

let output = "";
try {
  execFileSync(eslintBin, [filePath], {
    cwd: projectDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  // Exit 0 from ESLint => clean file => nothing to report.
  emit();
} catch (err) {
  // Non-zero exit => problems found; ESLint prints them to stdout.
  output = `${err.stdout ?? ""}${err.stderr ?? ""}`.trim();
}

if (!output) emit();

// Cap to keep context small.
const MAX = 4000;
const trimmed =
  output.length > MAX ? `${output.slice(0, MAX)}\n…(truncated)` : output;

emit(
  `ESLint flagged the file you just edited (${path.relative(projectDir, filePath)}). ` +
    `Fix these before moving on (advisory — the edit was still applied):\n\n${trimmed}`,
);
