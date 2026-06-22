import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getItemDetail } from "@/lib/db/items";
import { getR2Object } from "@/lib/r2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const item = await getItemDetail(session.user.id, id);

  if (!item?.fileUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  let obj;
  try {
    obj = await getR2Object(item.fileUrl);
  } catch (e) {
    console.error("R2 fetch failed:", e);
    return new NextResponse("File unavailable", { status: 503 });
  }

  if (!obj.Body) {
    return new NextResponse("File not found", { status: 404 });
  }

  const filename = (item.fileName ?? "download").replace(/"/g, '\\"');
  const headers = new Headers();
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  if (obj.ContentType) headers.set("Content-Type", obj.ContentType);
  if (obj.ContentLength) headers.set("Content-Length", String(obj.ContentLength));

  const stream = obj.Body.transformToWebStream();
  return new NextResponse(stream as ReadableStream, { headers });
}
