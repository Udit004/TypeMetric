"use client";

export { AuthProvider } from "@/share/contexts/authContext";

import { useAuthContext } from "@/share/contexts/authContext";

export function useAuth() {
  return useAuthContext();
}
