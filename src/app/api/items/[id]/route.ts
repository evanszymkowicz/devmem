import { NextRequest, NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api/session";
import { getItemDetail } from "@/lib/db/items";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await requireApiSession();
  if (authed instanceof NextResponse) return authed;

  const { id } = await params;
  const item = await getItemDetail(authed.userId, id);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}
