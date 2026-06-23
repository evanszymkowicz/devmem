"use server";

import { auth } from "@/auth";
import { deleteFromR2 } from "@/lib/r2";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { changePasswordSchema } from "@/lib/validations/auth";
import {
  deleteUser,
  getUserFileUrls,
  getUserPasswordHash,
  updateUserPassword,
} from "@/lib/db/profile";

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

  const passwordHash = await getUserPasswordHash(session.user.id);

  if (!passwordHash) {
    return { success: false, error: "No password set on this account" };
  }

  const valid = await verifyPassword(currentPassword, passwordHash);
  if (!valid) {
    return { success: false, error: "Current password is incorrect" };
  }

  const hashed = await hashPassword(newPassword);
  await updateUserPassword(session.user.id, hashed);

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
    const fileUrls = await getUserFileUrls(session.user.id);

    await deleteUser(session.user.id);

    await Promise.allSettled(
      fileUrls.map((url) =>
        deleteFromR2(url).catch((e) =>
          console.error("R2 cleanup failed on account delete:", e),
        ),
      ),
    );

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete account" };
  }
}
