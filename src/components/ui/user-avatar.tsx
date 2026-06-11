import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  /** GitHub (or other OAuth) image URL; falls back to initials when absent. */
  image?: string | null;
  className?: string;
}

// Derive up-to-two uppercase initials from a name, e.g. "Brad Traversy" -> "BT".
// Guards against empty segments from stray spaces so we never index undefined.
function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Reusable avatar: shows the user's image when present, otherwise an initials
// fallback. Used in the sidebar user area and anywhere a user is represented.
export function UserAvatar({ name, image, className }: UserAvatarProps) {
  const base =
    "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground";

  if (image) {
    // Plain <img> (not next/image): avatars come from arbitrary OAuth hosts, and
    // a 32px thumbnail doesn't justify configuring images.remotePatterns per host.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        width={32}
        height={32}
        className={cn(base, "object-cover", className)}
      />
    );
  }

  const initials = getInitials(name);
  return (
    <div className={cn(base, className)} aria-hidden="true">
      {initials || "?"}
    </div>
  );
}
