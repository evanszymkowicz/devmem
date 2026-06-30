"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/lib/languages";

// Out-of-band sentinel — never stored in the DB; maps to "" (→ null at save)
const NONE = "__none__";

const LANGUAGE_VALUES = new Set(LANGUAGES.map((l) => l.value));

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  // Unknown or empty values (including legacy free-text entries not in the list)
  // fall through to the "None" option instead of rendering a blank trigger.
  const selectValue = LANGUAGE_VALUES.has(value) ? value : NONE;
  return (
    <Select
      value={selectValue}
      onValueChange={(v) => onChange(v === NONE ? "" : v)}
    >
      <SelectTrigger className="h-6 w-36 text-[11px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE} className="text-xs italic text-muted-foreground">
          None
        </SelectItem>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.value} value={lang.value} className="text-xs">
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
