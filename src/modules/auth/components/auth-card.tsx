"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { BrainCircuit } from "lucide-react";
import { hasSupabaseConfig } from "@/src/shared/config/env";
import { supabase } from "@/src/shared/auth/supabase";
import { ThemeToggle } from "@/src/shared/theme";
import type { AppRole } from "@/src/shared/auth/user-display";

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<AppRole>("teacher");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para autenticar usuarios.");
      return;
    }

    setLoading(true);
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: displayName || email.split("@")[0], role } },
          });
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--app-bg)] px-4">
      <form className="panel w-full max-w-md p-6" onSubmit={submit}>
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-9 place-items-center rounded-md bg-slate-950 text-white">
              <BrainCircuit className="size-5" aria-hidden />
            </span>
            MindMap Live
          </Link>
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-semibold">{mode === "login" ? "Ingresar" : "Crear cuenta"}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {mode === "login" ? "Usa tu cuenta Supabase para abrir tus mapas." : "Crea tu perfil para participar en sesiones colaborativas."}
        </p>

        {!hasSupabaseConfig ? (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            Falta configurar Supabase en `.env.local`. Puedes revisar la interfaz, pero las llamadas protegidas necesitan sesion real.
          </div>
        ) : null}

        {mode === "register" ? (
          <>
            <label className="mt-5 block text-sm font-medium">
              Nombre visible
              <input className="field mt-2" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Prof. Rivera" />
            </label>
            <div className="mt-4">
              <p className="text-sm font-medium">Tipo de cuenta</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button className={`btn ${role === "teacher" ? "btn-primary" : "btn-secondary"}`} type="button" onClick={() => setRole("teacher")}>
                  Profesor
                </button>
                <button className={`btn ${role === "student" ? "btn-primary" : "btn-secondary"}`} type="button" onClick={() => setRole("student")}>
                  Alumno
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Profesores crean cursos y mapas. Alumnos entran por invitacion al canvas colaborativo.
              </p>
            </div>
          </>
        ) : null}
        <label className="mt-5 block text-sm font-medium">
          Correo
          <input className="field mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="correo@institucion.edu" />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Contrasena
          <input className="field mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
        </label>
        {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
        <button className="btn btn-primary mt-6 w-full" type="submit" disabled={loading}>
          {loading ? "Procesando..." : mode === "login" ? "Ingresar" : "Registrarme"}
        </button>
        <p className="mt-5 text-center text-sm text-slate-500">
          {mode === "login" ? "No tienes cuenta?" : "Ya tienes cuenta?"}{" "}
          <Link
            className="font-semibold text-slate-950"
            href={`${mode === "login" ? "/register" : "/login"}${nextPath !== "/dashboard" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
          >
            {mode === "login" ? "Registrate" : "Ingresa"}
          </Link>
        </p>
      </form>
    </main>
  );
}
