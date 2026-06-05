// prisma/seed.ts

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient, ContentType } from "../src/generated/prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@devmemory.io";
const DEMO_PASSWORD = "12345678";

const systemItemTypes = [
  { name: "Snippets", slug: "snippets", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "Prompts", slug: "prompts", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "Commands", slug: "commands", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "Notes", slug: "notes", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "Files", slug: "files", icon: "File", color: "#6b7280", isSystem: true },
  { name: "Images", slug: "images", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "Links", slug: "links", icon: "Link", color: "#10b981", isSystem: true },
];

// Sample item shapes. `typeSlug` maps to a seeded system ItemType; the seed
// resolves it to the type's id at insert time.
type SeedItem = {
  title: string;
  typeSlug: string;
  contentType: ContentType;
  content?: string;
  url?: string;
  description?: string;
  language?: string;
};

type SeedCollection = {
  name: string;
  description: string;
  isFavorite?: boolean;
  items: SeedItem[];
};

const seedCollections: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    isFavorite: true,
    items: [
      {
        title: "useDebounce hook",
        typeSlug: "snippets",
        contentType: ContentType.TEXT,
        language: "typescript",
        description: "Debounce a rapidly changing value (search inputs, resize, etc.).",
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}`,
      },
      {
        title: "Theme context provider",
        typeSlug: "snippets",
        contentType: ContentType.TEXT,
        language: "typescript",
        description: "A typed Context provider with a companion hook (compound pattern).",
        content: `import { createContext, useContext, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type ThemeContextValue = { theme: Theme; toggle: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return <ThemeContext value={{ theme, toggle }}>{children}</ThemeContext>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}`,
      },
      {
        title: "cn() class merge utility",
        typeSlug: "snippets",
        contentType: ContentType.TEXT,
        language: "typescript",
        description: "Merge conditional Tailwind class names without conflicts.",
        content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    items: [
      {
        title: "Code review prompt",
        typeSlug: "prompts",
        contentType: ContentType.TEXT,
        description: "Ask the model for a focused, prioritized code review.",
        content: `You are a senior engineer reviewing a pull request. Review the diff below for:
1. Correctness bugs and edge cases
2. Security issues (auth, input validation, injection)
3. Performance (N+1 queries, unnecessary work)
4. Readability and adherence to existing patterns

Report findings as a prioritized list (most important first). For each, give the
file/line, why it matters, and a concrete fix. Skip nitpicks unless asked.

Diff:
{{diff}}`,
      },
      {
        title: "Documentation generation prompt",
        typeSlug: "prompts",
        contentType: ContentType.TEXT,
        description: "Generate reference docs for a function or module.",
        content: `Write clear reference documentation for the following code. Include:
- A one-sentence summary of what it does
- Parameters (name, type, description)
- Return value
- A short, realistic usage example
- Any thrown errors or edge cases

Match the tone of concise technical docs. Do not invent behavior that isn't in
the code.

Code:
{{code}}`,
      },
      {
        title: "Refactoring assistant prompt",
        typeSlug: "prompts",
        contentType: ContentType.TEXT,
        description: "Refactor code while preserving behavior.",
        content: `Refactor the code below to improve readability and maintainability WITHOUT
changing its observable behavior. Constraints:
- Preserve the public API and return types
- Keep changes minimal and well-scoped
- Explain each change in one line after the code

Return the refactored code first, then the change list.

Code:
{{code}}`,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    items: [
      {
        title: "Multi-stage Node Dockerfile",
        typeSlug: "snippets",
        contentType: ContentType.TEXT,
        language: "dockerfile",
        description: "Small production image via a multi-stage build.",
        content: `# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
CMD ["npm", "start"]`,
      },
      {
        title: "Deploy to production",
        typeSlug: "commands",
        contentType: ContentType.TEXT,
        language: "bash",
        description: "Run migrations then deploy the current build.",
        content: `npx prisma migrate deploy && npm run build && npm run start`,
      },
      {
        title: "Docker docs — multi-stage builds",
        typeSlug: "links",
        contentType: ContentType.URL,
        url: "https://docs.docker.com/build/building/multi-stage/",
        description: "Official guide to multi-stage Docker builds.",
      },
      {
        title: "GitHub Actions documentation",
        typeSlug: "links",
        contentType: ContentType.URL,
        url: "https://docs.github.com/en/actions",
        description: "CI/CD workflows with GitHub Actions.",
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    items: [
      {
        title: "Undo last commit (keep changes)",
        typeSlug: "commands",
        contentType: ContentType.TEXT,
        language: "bash",
        description: "Move HEAD back one commit but keep the working tree.",
        content: `git reset --soft HEAD~1`,
      },
      {
        title: "Remove all stopped containers",
        typeSlug: "commands",
        contentType: ContentType.TEXT,
        language: "bash",
        description: "Prune stopped Docker containers.",
        content: `docker container prune -f`,
      },
      {
        title: "Find process on a port",
        typeSlug: "commands",
        contentType: ContentType.TEXT,
        language: "bash",
        description: "Show the PID listening on a given port (e.g. 3000).",
        content: `lsof -i :3000`,
      },
      {
        title: "Show why a package is installed",
        typeSlug: "commands",
        contentType: ContentType.TEXT,
        language: "bash",
        description: "Trace the dependency chain pulling in a package.",
        content: `npm explain <package-name>`,
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    items: [
      {
        title: "Tailwind CSS documentation",
        typeSlug: "links",
        contentType: ContentType.URL,
        url: "https://tailwindcss.com/docs",
        description: "Utility-first CSS framework reference.",
      },
      {
        title: "shadcn/ui",
        typeSlug: "links",
        contentType: ContentType.URL,
        url: "https://ui.shadcn.com",
        description: "Accessible component library built on Radix + Tailwind.",
      },
      {
        title: "Radix UI Primitives",
        typeSlug: "links",
        contentType: ContentType.URL,
        url: "https://www.radix-ui.com/primitives",
        description: "Unstyled, accessible component primitives.",
      },
      {
        title: "Lucide Icons",
        typeSlug: "links",
        contentType: ContentType.URL,
        url: "https://lucide.dev/icons",
        description: "Open-source icon library used across the app.",
      },
    ],
  },
];

async function seedSystemItemTypes() {
  console.log("Seeding system item types...");

  // System types have userId = null. Prisma's compound-unique `where` input
  // (slug_userId) types userId as non-nullable, so we check for an existing
  // system type with findFirst (which accepts userId: null) and create if
  // absent. This keeps the seed idempotent.
  for (const type of systemItemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { slug: type.slug, userId: null },
    });

    if (!existing) {
      await prisma.itemType.create({ data: type });
    } else {
      await prisma.itemType.update({ where: { id: existing.id }, data: { name: type.name } });
    }
  }
}

async function seedDemoUser() {
  console.log("Seeding demo user...");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  return prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: "Demo User",
      password: passwordHash,
      isPro: false,
      emailVerified: new Date(),
    },
  });
}

async function seedCollectionsAndItems(userId: string) {
  console.log("Seeding collections and items...");

  // Resolve system type slugs -> ids once.
  const systemTypes = await prisma.itemType.findMany({
    where: { userId: null },
  });
  const typeIdBySlug = new Map(systemTypes.map((t) => [t.slug, t.id]));

  for (const col of seedCollections) {
    // Idempotent: reuse an existing collection of the same name for this user.
    let collection = await prisma.collection.findFirst({
      where: { name: col.name, userId },
    });

    if (!collection) {
      collection = await prisma.collection.create({
        data: { name: col.name, description: col.description, isFavorite: col.isFavorite ?? false, userId },
      });
    } else {
      collection = await prisma.collection.update({
        where: { id: collection.id },
        data: { isFavorite: col.isFavorite ?? false },
      });
    }

    for (const item of col.items) {
      const itemTypeId = typeIdBySlug.get(item.typeSlug);
      if (!itemTypeId) {
        throw new Error(`Unknown item type slug "${item.typeSlug}" for "${item.title}"`);
      }

      // Idempotent: one item per (title, user). Reuse if it already exists.
      let record = await prisma.item.findFirst({
        where: { title: item.title, userId },
      });

      if (!record) {
        record = await prisma.item.create({
          data: {
            title: item.title,
            contentType: item.contentType,
            content: item.content ?? null,
            url: item.url ?? null,
            description: item.description ?? null,
            language: item.language ?? null,
            userId,
            itemTypeId,
          },
        });
      }

      // Idempotent join via the compound primary key.
      await prisma.itemCollection.upsert({
        where: {
          itemId_collectionId: { itemId: record.id, collectionId: collection.id },
        },
        update: {},
        create: { itemId: record.id, collectionId: collection.id },
      });
    }
  }
}

async function main() {
  await seedSystemItemTypes();
  const user = await seedDemoUser();
  await seedCollectionsAndItems(user.id);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
