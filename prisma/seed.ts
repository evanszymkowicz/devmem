// prisma/seed.ts

import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const systemItemTypes = [
  { name: "Snippet", slug: "snippets", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "Prompt", slug: "prompts", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "Command", slug: "commands", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "Note", slug: "notes", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "File", slug: "files", icon: "File", color: "#6b7280", isSystem: true },
  { name: "Image", slug: "images", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "Link", slug: "links", icon: "Link", color: "#10b981", isSystem: true },
];

async function main() {
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
    }
  }

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
