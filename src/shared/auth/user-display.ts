import type { User } from "@supabase/supabase-js";

export type AppRole = "teacher" | "student";

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function getUserDisplayName(user?: User | null) {
  const metadata = user?.user_metadata ?? {};

  return (
    asString(metadata.display_name) ??
    asString(metadata.full_name) ??
    asString(metadata.name) ??
    user?.email?.split("@")[0] ??
    "Usuario"
  );
}

export function getUserRole(user?: User | null): AppRole {
  return user?.user_metadata?.role === "student" ? "student" : "teacher";
}

export function formatPresenceName(name?: string | null) {
  const cleanName = asString(name);

  if (!cleanName) {
    return "Usuario";
  }

  const parts = cleanName.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 18);
  }

  return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
}
