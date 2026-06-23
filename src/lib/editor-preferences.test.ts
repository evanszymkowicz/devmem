import { describe, it, expect } from "vitest";

import {
  DEFAULT_EDITOR_PREFERENCES,
  resolveEditorPreferences,
} from "./editor-preferences";

describe("resolveEditorPreferences", () => {
  it("returns defaults for null/undefined", () => {
    expect(resolveEditorPreferences(null)).toEqual(DEFAULT_EDITOR_PREFERENCES);
    expect(resolveEditorPreferences(undefined)).toEqual(
      DEFAULT_EDITOR_PREFERENCES,
    );
  });

  it("returns defaults for non-object values", () => {
    expect(resolveEditorPreferences("nope")).toEqual(
      DEFAULT_EDITOR_PREFERENCES,
    );
    expect(resolveEditorPreferences(42)).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("preserves a complete, valid object", () => {
    const prefs = {
      fontSize: 16,
      tabSize: 4,
      wordWrap: false,
      minimap: true,
      theme: "monokai",
    };
    expect(resolveEditorPreferences(prefs)).toEqual(prefs);
  });

  it("falls back field-by-field for invalid values", () => {
    const resolved = resolveEditorPreferences({
      fontSize: 99, // not an allowed option
      tabSize: 3, // not an allowed option
      wordWrap: "yes", // not a boolean
      minimap: 1, // not a boolean
      theme: "dracula", // not an allowed theme
    });
    expect(resolved).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("merges valid partial values with defaults", () => {
    const resolved = resolveEditorPreferences({ fontSize: 18, theme: "github-dark" });
    expect(resolved).toEqual({
      ...DEFAULT_EDITOR_PREFERENCES,
      fontSize: 18,
      theme: "github-dark",
    });
  });

  it("ignores unknown extra fields", () => {
    const resolved = resolveEditorPreferences({
      fontSize: 14,
      somethingElse: "ignored",
    });
    expect(resolved).toEqual({ ...DEFAULT_EDITOR_PREFERENCES, fontSize: 14 });
    expect(resolved).not.toHaveProperty("somethingElse");
  });
});
