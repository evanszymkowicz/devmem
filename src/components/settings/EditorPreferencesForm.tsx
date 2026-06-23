"use client";

import { useEditorPreferences } from "@/components/editor/EditorPreferencesProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  EDITOR_THEMES,
  EDITOR_THEME_LABELS,
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
} from "@/lib/editor-preferences";

function SettingRow({
  label,
  description,
  htmlFor,
  control,
}: {
  label: string;
  description: string;
  htmlFor?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export function EditorPreferencesForm() {
  const { preferences, updatePreferences } = useEditorPreferences();

  return (
    <div className="flex flex-col gap-5">
      <SettingRow
        label="Font size"
        description="Code editor font size in pixels"
        htmlFor="editor-font-size"
        control={
          <Select
            value={String(preferences.fontSize)}
            onValueChange={(v) => updatePreferences({ fontSize: Number(v) })}
          >
            <SelectTrigger id="editor-font-size" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <SettingRow
        label="Tab size"
        description="Number of spaces per indentation level"
        htmlFor="editor-tab-size"
        control={
          <Select
            value={String(preferences.tabSize)}
            onValueChange={(v) => updatePreferences({ tabSize: Number(v) })}
          >
            <SelectTrigger id="editor-tab-size" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAB_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} spaces
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <SettingRow
        label="Word wrap"
        description="Wrap long lines instead of scrolling horizontally"
        htmlFor="editor-word-wrap"
        control={
          <Switch
            id="editor-word-wrap"
            checked={preferences.wordWrap}
            onCheckedChange={(checked) =>
              updatePreferences({ wordWrap: checked })
            }
          />
        }
      />

      <SettingRow
        label="Minimap"
        description="Show the code overview minimap on the right"
        htmlFor="editor-minimap"
        control={
          <Switch
            id="editor-minimap"
            checked={preferences.minimap}
            onCheckedChange={(checked) =>
              updatePreferences({ minimap: checked })
            }
          />
        }
      />

      <SettingRow
        label="Theme"
        description="Color theme for the code editor"
        htmlFor="editor-theme"
        control={
          <Select
            value={preferences.theme}
            onValueChange={(v) =>
              updatePreferences({
                theme: v as (typeof EDITOR_THEMES)[number],
              })
            }
          >
            <SelectTrigger id="editor-theme" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDITOR_THEMES.map((theme) => (
                <SelectItem key={theme} value={theme}>
                  {EDITOR_THEME_LABELS[theme]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
