"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteAccount } from "@/actions/profile";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        toast.success("Account deleted");
        await signOut({ redirectTo: "/sign-in" });
      } else {
        toast.error(result.error ?? "Something went wrong");
        setOpen(false);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete account
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Delete account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This will permanently delete your account and all your items,
              collections, and data. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={pending}
              >
                {pending ? "Deleting…" : "Delete my account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
