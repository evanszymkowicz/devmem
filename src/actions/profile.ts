"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { changePasswordSchema } from "@/lib/validations/auth";

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return { success: false, error: "No password set on this account" };
  }

  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid) {
    return { success: false, error: "Current password is incorrect" };
  }

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return { success: true };
}

export async function deleteAccount(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const fileItems = await prisma.item.findMany({
      where: { userId: session.user.id, fileUrl: { not: null } },
      select: { fileUrl: true },
    });

    await prisma.user.delete({ where: { id: session.user.id } });

    await Promise.allSettled(
      fileItems
        .filter((item): item is { fileUrl: string } => item.fileUrl !== null)
        .map((item) =>
          deleteFromR2(item.fileUrl).catch((e) =>
            console.error("R2 cleanup failed on account delete:", e),
          ),
        ),
    );

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete account" };
  }
}
