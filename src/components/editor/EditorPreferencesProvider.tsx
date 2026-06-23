"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { toast } from "sonner";

import { updateEditorPreferences } from "@/actions/editor-preferences";
import {
  DEFAULT_EDITOR_PREFERENCES,
  type EditorPreferences,
} from "@/lib/editor-preferences";

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  // Applies a partial update optimistically, persists it, and toasts on save.
  updatePreferences: (partial: Partial<EditorPreferences>) => void;
  isSaving: boolean;
}

const EditorPreferencesContext =
  createContext<EditorPreferencesContextValue>({
    preferences: DEFAULT_EDITOR_PREFERENCES,
    updatePreferences: () => {},
    isSaving: false,
  });

export function useEditorPreferences() {
  return useContext(EditorPreferencesContext);
}

interface EditorPreferencesProviderProps {
  initialPreferences: EditorPreferences;
  children: React.ReactNode;
}

export function EditorPreferencesProvider({
  initialPreferences,
  children,
}: EditorPreferencesProviderProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  // Mirrors the latest preferences so the stable `updatePreferences` callback can
  // read current state (and capture a rollback value) without a stale closure,
  // while keeping side effects out of the setState updater (which Strict Mode
  // double-invokes).
  const preferencesRef = useRef(initialPreferences);

  const updatePreferences = useCallback(
    (partial: Partial<EditorPreferences>) => {
      const previous = preferencesRef.current;
      const next = { ...previous, ...partial };

      // Optimistically apply so open editors reflect the change immediately.
      preferencesRef.current = next;
      setPreferences(next);
      setIsSaving(true);

      updateEditorPreferences(next)
        .then((result) => {
          if (result.success) {
            toast.success("Editor preferences saved");
          } else {
            preferencesRef.current = previous;
            setPreferences(previous);
            toast.error(result.error ?? "Failed to save preferences");
          }
        })
        .finally(() => setIsSaving(false));
    },
    [],
  );

  return (
    <EditorPreferencesContext.Provider
      value={{ preferences, updatePreferences, isSaving }}
    >
      {children}
    </EditorPreferencesContext.Provider>
  );
}
