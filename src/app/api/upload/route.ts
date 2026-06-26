import { randomUUID } from "crypto";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPresignedUploadUrl } from "@/lib/r2";
import { uploadLimiter, checkRateLimit, getIp, rateLimitResponse } from "@/lib/rate-limit";
import {
  IMAGE_MIME_TYPES,
  FILE_MIME_TYPES,
  MAX_IMAGE_SIZE,
  MAX_FILE_SIZE,
} from "@/lib/files";
import { FEATURE_GATING_ENABLED } from "@/lib/config/features";

const UPLOAD_SLUGS = new Set(["files", "images"]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await checkRateLimit(uploadLimiter, `upload:${getIp(req)}:${session.user.id}`);
  if (rl.limited) return rateLimitResponse(rl.retryAfter);

  if (FEATURE_GATING_ENABLED) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true },
    });
    if (!user?.isPro) {
      return NextResponse.json(
        { error: "File uploads require a Pro subscription" },
        { status: 403 },
      );
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { typeSlug, fileName, contentType, fileSize } = body;

  if (
    typeof typeSlug !== "string" ||
    typeof fileName !== "string" ||
    typeof contentType !== "string" ||
    typeof fileSize !== "number"
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!UPLOAD_SLUGS.has(typeSlug)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const isImage = typeSlug === "images";
  const allowed = isImage ? IMAGE_MIME_TYPES : FILE_MIME_TYPES;
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

  if (!allowed.has(contentType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  if (fileSize > maxSize) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const ext = path.extname(fileName).toLowerCase();
  const key = `users/${session.user.id}/${randomUUID()}${ext}`;

  try {
    const uploadUrl = await getPresignedUploadUrl(key, contentType);
    return NextResponse.json({ uploadUrl, key });
  } catch (e) {
    console.error("Failed to generate presigned URL:", e);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 503 });
  }
}
