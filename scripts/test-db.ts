// scripts/test-db.ts
//
// Quick connectivity + sanity check for the Neon/Prisma setup.
// Run with: npx tsx scripts/test-db.ts

import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Check your .env file.");
  }

  console.log("Testing database connection...\n");

  // 1. Raw round-trip to confirm we can reach the database.
  await prisma.$queryRaw`SELECT 1`;
  console.log("✓ Connected to the database");

  // 2. Confirm the system item types were seeded (expects 7).
  const systemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });
  console.log(`✓ Found ${systemTypes.length} system item type(s):`);
  for (const type of systemTypes) {
    console.log(`    - ${type.name} (/items/${type.slug})`);
  }

  // 3. Row counts across the core tables to verify tables exist.
  const [users, items, collections, tags] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.tag.count(),
  ]);
  console.log("\n✓ Table row counts:");
  console.log(`    users:       ${users}`);
  console.log(`    items:       ${items}`);
  console.log(`    collections: ${collections}`);
  console.log(`    tags:        ${tags}`);

  console.log("\nDatabase test passed.");
}

main()
  .catch((e) => {
    console.error("\nDatabase test failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
