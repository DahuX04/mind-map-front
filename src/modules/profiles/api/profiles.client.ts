import { api } from "@/src/shared/api/http-client";
import type { Profile } from "../types/profile.types";

export function getMe() {
  return api.get<Profile>("/me");
}

export function updateMe(input: { displayName?: string; avatarUrl?: string }) {
  return api.patch<Profile>("/me", input);
}
