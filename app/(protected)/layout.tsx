import { ProtectedShell } from "@/src/modules/auth";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
