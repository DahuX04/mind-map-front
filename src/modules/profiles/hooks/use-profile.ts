import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/profiles.client";

export function useProfile() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });
}
