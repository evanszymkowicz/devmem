"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createItem } from "@/actions/items";
import { generateAutoTags, generateDescription } from "@/actions/ai";
import {
  CREATABLE_TYPE_SLUGS,
  FILE_TYPE_SLUGS,
  CONTENT_TYPE_SLUGS,
  LANGUAGE_TYPE_SLUGS,
  URL_TYPE_SLUGS,
  type CreatableTypeSlug,
} from "@/lib/validations/items";
import type { SidebarItemType } from "@/lib/db/items";
import type { UploadedFile } from "@/components/ui/file-upload";

export interface FormState {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  content: "",
  language: "",
  url: "",
  tags: "",
  fileKey: "",
  fileName: "",
  fileSize: 0,
};

interface UseNewItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTypes: SidebarItemType[];
  defaultTypeSlug?: string;
  isPro?: boolean;
}

export function useNewItemForm({
  open,
  onOpenChange,
  itemTypes,
  defaultTypeSlug,
  isPro,
}: UseNewItemFormProps) {
  const router = useRouter();

  const creatableTypes = itemTypes.filter((t) =>
    (CREATABLE_TYPE_SLUGS as readonly string[]).includes(t.slug),
  );

  const [typeSlug, setTypeSlug] = useState<CreatableTypeSlug>(
    (creatableTypes[0]?.slug as CreatableTypeSlug) ?? "snippets",
  );
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [uploadKey, setUploadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [suggestingTags, setSuggestingTags] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);

  // Track previous prop values in state so we can reset the form synchronously
  // during render when the dialog opens or the requested type changes.
  // This is the React-recommended getDerivedStateFromProps equivalent — calling
  // setState during render (not in an effect) triggers an immediate re-render
  // before the browser paints, with no cascading-render penalty.
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevDefaultTypeSlug, setPrevDefaultTypeSlug] = useState(defaultTypeSlug);

  if (open !== prevOpen || (open && defaultTypeSlug !== prevDefaultTypeSlug)) {
    setPrevOpen(open);
    setPrevDefaultTypeSlug(defaultTypeSlug);
    if (open) {
      const slug = defaultTypeSlug ?? creatableTypes[0]?.slug ?? "snippets";
      setTypeSlug(slug as CreatableTypeSlug);
      setForm(EMPTY_FORM);
      setCollectionIds([]);
      setUploadKey((k) => k + 1);
      setTagSuggestions([]);
    }
  }

  const selectedType = creatableTypes.find((t) => t.slug === typeSlug);
  const accent = selectedType?.color ?? "#6b7280";

  const showContent = CONTENT_TYPE_SLUGS.has(typeSlug);
  const showLanguage = LANGUAGE_TYPE_SLUGS.has(typeSlug);
  const showUrl = URL_TYPE_SLUGS.has(typeSlug);
  const showFile = FILE_TYPE_SLUGS.has(typeSlug);
  const showUpgradePrompt = showFile && !isPro;

  const canSubmit =
    form.title.trim().length > 0 &&
    (!showUrl || form.url.trim().length > 0) &&
    (!showFile || form.fileKey.length > 0) &&
    !submitting;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTypeChange(slug: CreatableTypeSlug) {
    setTypeSlug(slug);
    setForm(EMPTY_FORM);
    setUploadKey((k) => k + 1);
    setTagSuggestions([]);
  }

  function handleClose(next: boolean) {
    if (!next) {
      setForm(EMPTY_FORM);
      setCollectionIds([]);
      setTypeSlug((creatableTypes[0]?.slug as CreatableTypeSlug) ?? "snippets");
      setUploadKey((k) => k + 1);
      setTagSuggestions([]);
    }
    onOpenChange(next);
  }

  async function handleGenerateDescription() {
    setGeneratingDescription(true);
    const result = await generateDescription({
      title: form.title,
      typeSlug,
      content: form.content || null,
      url: form.url || null,
      language: form.language || null,
      fileName: form.fileName || null,
    });
    setGeneratingDescription(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setField("description", result.data);
  }

  async function handleSuggestTags() {
    setSuggestingTags(true);
    const result = await generateAutoTags({ title: form.title, content: form.content || null });
    setSuggestingTags(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    const existing = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    setTagSuggestions(result.data.filter((t) => !existing.includes(t)));
  }

  function handleAcceptTag(tag: string) {
    const existing = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (!existing.includes(tag)) {
      setField("tags", [...existing, tag].join(", "));
    }
    setTagSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  function handleRejectTag(tag: string) {
    setTagSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  function handleUploadComplete(data: UploadedFile) {
    setField("fileKey", data.key);
    setField("fileName", data.fileName);
    setField("fileSize", data.fileSize);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await createItem({
      typeSlug,
      title: form.title,
      description: form.description || null,
      content: form.content || null,
      language: form.language || null,
      url: form.url || null,
      fileUrl: form.fileKey || null,
      fileName: form.fileName || null,
      fileSize: form.fileSize || null,
      tags,
      collectionIds,
    });

    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Item created");
    handleClose(false);
    router.refresh();
  }

  return {
    creatableTypes,
    typeSlug,
    form,
    collectionIds,
    uploadKey,
    submitting,
    canSubmit,
    accent,
    showContent,
    showLanguage,
    showUrl,
    showFile,
    showUpgradePrompt,
    tagSuggestions,
    suggestingTags,
    setField,
    setCollectionIds,
    handleTypeChange,
    handleClose,
    handleUploadComplete,
    handleSubmit,
    handleSuggestTags,
    handleAcceptTag,
    handleRejectTag,
    generatingDescription,
    handleGenerateDescription,
  };
}
