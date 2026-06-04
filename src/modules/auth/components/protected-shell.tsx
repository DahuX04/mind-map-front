"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { BrainCircuit, LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/src/shared/auth/use-auth";
import { hasSupabaseConfig } from "@/src/shared/config/env";
import { cn } from "@/src/shared/lib/cn";
import { ThemeToggle } from "@/src/shared/theme";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Perfil", icon: User },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function ProtectedShell({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hasSupabaseConfig && !auth.loading && !auth.user) {
      router.replace("/login");
    }
  }, [auth.loading, auth.user, router]);

  if (hasSupabaseConfig && auth.loading) {
    return <main className="grid min-h-dvh place-items-center text-sm text-slate-500">Cargando sesion...</main>;
  }

  if (hasSupabaseConfig && !auth.user) {
    return <main className="grid min-h-dvh place-items-center text-sm text-slate-500">Redirigiendo a login...</main>;
  }

  return (
    <div className="min-h-dvh bg-[var(--app-bg)]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="grid size-8 place-items-center rounded-md bg-slate-950 text-white">
              <BrainCircuit className="size-4" aria-hidden />
            </span>
            MindMap Live
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={cn("btn btn-ghost", pathname === item.href && "bg-slate-100")}>
                  <Icon className="size-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="btn btn-secondary" type="button" onClick={() => auth.signOut()?.then(() => router.push("/login"))}>
              <LogOut className="size-4" aria-hidden />
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
