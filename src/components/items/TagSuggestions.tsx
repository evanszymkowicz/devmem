"use client";

import { Check, X } from "lucide-react";

interface TagSuggestionsProps {
  suggestions: string[];
  onAccept: (tag: string) => void;
  onReject: (tag: string) => void;
}

export function TagSuggestions({ suggestions, onAccept, onReject }: TagSuggestionsProps) {
  if (suggestions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-0.5 rounded-full border bg-muted px-2 py-0.5 text-[11px]"
        >
          {tag}
          <button
            type="button"
            onClick={() => onAccept(tag)}
            className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-green-500/20 hover:text-green-600"
            aria-label={`Accept tag ${tag}`}
          >
            <Check className="size-2.5" />
          </button>
          <button
            type="button"
            onClick={() => onReject(tag)}
            className="rounded-full p-0.5 transition-colors hover:bg-red-500/20 hover:text-red-600"
            aria-label={`Reject tag ${tag}`}
          >
            <X className="size-2.5" />
          </button>
        </span>
      ))}
    </div>
  );
}
