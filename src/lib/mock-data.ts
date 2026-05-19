// Single source of truth for mock data used by the dashboard UI
// until the database is implemented. Display-only — no helper logic.

export type ContentType = "TEXT" | "FILE" | "URL";

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
}

export interface ItemType {
  id: string;
  name: string;
  slug: string; // used in /items/[slug] routes
  icon: string; // Lucide icon name
  color: string; // hex
  isSystem: boolean;
}

export interface Item {
  id: string;
  title: string;
  contentType: ContentType;
  content: string | null;
  url: string | null;
  description: string | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  itemTypeId: string;
  tags: string[];
  collectionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
  // item types present in the collection (for the type-icon row + card color)
  itemTypeIds: string[];
}

export const mockUser: User = {
  id: "user_1",
  name: "Demo User",
  email: "demo@devmem.io",
  image: null,
  isPro: true,
};

export const mockItemTypes: ItemType[] = [
  {
    id: "type_snippet",
    name: "Snippets",
    slug: "snippets",
    icon: "Code",
    color: "#3b82f6",
    isSystem: true,
  },
  {
    id: "type_prompt",
    name: "Prompts",
    slug: "prompts",
    icon: "Sparkles",
    color: "#8b5cf6",
    isSystem: true,
  },
  {
    id: "type_command",
    name: "Commands",
    slug: "commands",
    icon: "Terminal",
    color: "#f97316",
    isSystem: true,
  },
  {
    id: "type_note",
    name: "Notes",
    slug: "notes",
    icon: "StickyNote",
    color: "#fde047",
    isSystem: true,
  },
  {
    id: "type_file",
    name: "Files",
    slug: "files",
    icon: "File",
    color: "#6b7280",
    isSystem: true,
  },
  {
    id: "type_image",
    name: "Images",
    slug: "images",
    icon: "Image",
    color: "#ec4899",
    isSystem: true,
  },
  {
    id: "type_link",
    name: "Links",
    slug: "links",
    icon: "Link",
    color: "#10b981",
    isSystem: true,
  },
];

// Sidebar type counts (derived data — kept separate from the type models).
export const mockItemTypeCounts: Record<string, number> = {
  type_snippet: 24,
  type_prompt: 18,
  type_command: 15,
  type_note: 12,
  type_file: 5,
  type_image: 3,
  type_link: 8,
};

export const mockCollections: Collection[] = [
  {
    id: "col_react_patterns",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    isFavorite: true,
    itemCount: 12,
    itemTypeIds: ["type_snippet", "type_note", "type_link"],
  },
  {
    id: "col_python_snippets",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    isFavorite: false,
    itemCount: 8,
    itemTypeIds: ["type_snippet", "type_file"],
  },
  {
    id: "col_context_files",
    name: "Context Files",
    description: "AI context files for projects",
    isFavorite: true,
    itemCount: 5,
    itemTypeIds: ["type_file", "type_note"],
  },
  {
    id: "col_interview_prep",
    name: "Interview Prep",
    description: "Technical interview preparation",
    isFavorite: false,
    itemCount: 24,
    itemTypeIds: ["type_file", "type_snippet", "type_link", "type_prompt"],
  },
  {
    id: "col_git_commands",
    name: "Git Commands",
    description: "Frequently used git commands",
    isFavorite: true,
    itemCount: 15,
    itemTypeIds: ["type_command", "type_file"],
  },
  {
    id: "col_ai_prompts",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    isFavorite: false,
    itemCount: 18,
    itemTypeIds: ["type_prompt", "type_snippet", "type_file"],
  },
];

export const mockItems: Item[] = [
  {
    id: "item_use_auth",
    title: "useAuth Hook",
    contentType: "TEXT",
    content:
      "export function useAuth() {\n  const { data: session } = useSession();\n  return { user: session?.user, isAuthenticated: !!session };\n}",
    url: null,
    description: "Custom authentication hook for React applications",
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    itemTypeId: "type_snippet",
    tags: ["react", "auth", "hooks"],
    collectionIds: ["col_react_patterns", "col_interview_prep"],
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },
  {
    id: "item_api_error_handling",
    title: "API Error Handling Pattern",
    contentType: "TEXT",
    content:
      "async function fetchWithRetry(url, options, retries = 3) {\n  // exponential backoff retry logic\n}",
    url: null,
    description: "Fetch wrapper with exponential backoff retry logic",
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    itemTypeId: "type_snippet",
    tags: ["api", "error-handling", "fetch"],
    collectionIds: ["col_react_patterns"],
    createdAt: "2026-01-12",
    updatedAt: "2026-01-12",
  },
  {
    id: "item_code_review_prompt",
    title: "Code Review Prompt",
    contentType: "TEXT",
    content: "Review this code for security and performance issues...",
    url: null,
    description: "Prompt for AI code reviews",
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_prompt",
    tags: ["ai", "code-review"],
    collectionIds: ["col_ai_prompts"],
    createdAt: "2026-01-13",
    updatedAt: "2026-01-13",
  },
  {
    id: "item_git_reset_hard",
    title: "git reset --hard HEAD~1",
    contentType: "TEXT",
    content: "git reset --hard HEAD~1",
    url: null,
    description: "Reset to previous commit (destructive)",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_command",
    tags: ["git", "reset"],
    collectionIds: ["col_git_commands"],
    createdAt: "2026-01-12",
    updatedAt: "2026-01-12",
  },
  {
    id: "item_use_local_storage",
    title: "useLocalStorage Hook",
    contentType: "TEXT",
    content: "const useLocalStorage = (key, initialValue) => { ... }",
    url: null,
    description: "Persistent state management with localStorage",
    language: "typescript",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_snippet",
    tags: ["react", "hooks", "storage"],
    collectionIds: ["col_react_patterns"],
    createdAt: "2026-01-11",
    updatedAt: "2026-01-11",
  },
  {
    id: "item_docker_compose_up",
    title: "Docker Compose Up",
    contentType: "TEXT",
    content: "docker-compose up -d --build",
    url: null,
    description: "Start containers in detached mode with rebuild",
    language: "bash",
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_command",
    tags: ["docker", "devops"],
    collectionIds: ["col_git_commands"],
    createdAt: "2026-01-10",
    updatedAt: "2026-01-10",
  },
  {
    id: "item_explain_code_prompt",
    title: "Explain Code Prompt",
    contentType: "TEXT",
    content: "Explain this code step by step, highlighting key concepts...",
    url: null,
    description: "AI prompt for code explanations",
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_prompt",
    tags: ["ai", "learning"],
    collectionIds: ["col_ai_prompts", "col_interview_prep"],
    createdAt: "2026-01-09",
    updatedAt: "2026-01-09",
  },
  {
    id: "item_meeting_notes_template",
    title: "Meeting Notes Template",
    contentType: "TEXT",
    content:
      "# Meeting Notes\n\n## Date:\n## Attendees:\n## Agenda:\n## Action Items:",
    url: null,
    description: "Markdown template for meeting notes",
    language: "markdown",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_note",
    tags: ["template", "meetings"],
    collectionIds: ["col_context_files"],
    createdAt: "2026-01-08",
    updatedAt: "2026-01-08",
  },
  {
    id: "item_prisma_migration",
    title: "Prisma Migration Command",
    contentType: "TEXT",
    content: "npx prisma migrate dev --name migration_name",
    url: null,
    description: "Create and apply Prisma database migration",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_command",
    tags: ["prisma", "database"],
    collectionIds: ["col_git_commands"],
    createdAt: "2026-01-07",
    updatedAt: "2026-01-07",
  },
  {
    id: "item_python_list_comprehension",
    title: "List Comprehension Cheatsheet",
    contentType: "TEXT",
    content: "squares = [x**2 for x in range(10) if x % 2 == 0]",
    url: null,
    description: "Common Python list comprehension patterns",
    language: "python",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_snippet",
    tags: ["python", "cheatsheet"],
    collectionIds: ["col_python_snippets"],
    createdAt: "2026-01-06",
    updatedAt: "2026-01-06",
  },
  {
    id: "item_project_context_file",
    title: "Project Context File",
    contentType: "TEXT",
    content:
      "# Project Context\n\nArchitecture, conventions, and constraints for AI assistants.",
    url: null,
    description: "Reusable AI context file for new projects",
    language: "markdown",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_note",
    tags: ["ai", "context"],
    collectionIds: ["col_context_files"],
    createdAt: "2026-01-05",
    updatedAt: "2026-01-05",
  },
  {
    id: "item_tailwind_docs",
    title: "Tailwind CSS Docs",
    contentType: "URL",
    content: null,
    url: "https://tailwindcss.com/docs",
    description: "Official Tailwind CSS documentation",
    language: null,
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_link",
    tags: ["css", "docs"],
    collectionIds: ["col_react_patterns"],
    createdAt: "2026-01-04",
    updatedAt: "2026-01-04",
  },
];
