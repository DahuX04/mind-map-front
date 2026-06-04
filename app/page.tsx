import Link from "next/link";
import { ArrowRight, BrainCircuit, Network, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/src/shared/theme";

export default function Home() {
  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-slate-950">
      <section className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-5 py-5 sm:px-8">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-9 place-items-center rounded-md bg-slate-950 text-white">
              <BrainCircuit className="size-5" aria-hidden />
            </span>
            MindMap Live
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link className="btn btn-ghost" href="/login">
              Ingresar
            </Link>
            <Link className="btn btn-primary" href="/register">
              Crear cuenta
            </Link>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              <Sparkles className="size-4" aria-hidden />
              MVP colaborativo con IA bajo control humano
            </p>
            <h1 className="text-5xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              MindMap Live
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Crea mapas mentales para clases en vivo, comparte sesiones con estudiantes y usa IA para proponer ramas sin modificar el canvas hasta que el docente lo apruebe.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn btn-primary h-12 px-5" href="/dashboard">
                Abrir dashboard
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link className="btn btn-secondary h-12 px-5" href="/join/demo">
                Probar enlace de sesión
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex h-12 items-center justify-between border-b border-slate-200 px-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Fotosintesis</p>
                <p className="text-xs text-slate-500">Sincronizado · 8 participantes</p>
              </div>
              <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                IA lista
              </span>
            </div>
            <div className="grid h-[calc(100%-3rem)] grid-cols-[1fr_15rem]">
              <div className="relative bg-[radial-gradient(circle_at_1px_1px,#d7dee8_1px,transparent_0)] [background-size:24px_24px]">
                <div className="absolute left-[38%] top-[34%] rounded-lg border-2 border-slate-950 bg-white px-5 py-3 text-sm font-semibold shadow-sm">
                  Fotosintesis
                </div>
                <div className="absolute left-[14%] top-[16%] rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-950">
                  Fase luminosa
                </div>
                <div className="absolute right-[13%] top-[21%] rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-950">
                  Ciclo de Calvin
                </div>
                <div className="absolute bottom-[18%] left-[21%] rounded-lg border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-950">
                  ATP y NADPH
                </div>
                <Network className="absolute left-[30%] top-[43%] size-32 rotate-12 text-slate-300" aria-hidden />
              </div>
              <aside className="border-l border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Sugerencias</p>
                <div className="mt-4 space-y-3">
                  {["Fotolisis del agua", "Cloroplastos", "Estomas"].map((item) => (
                    <div key={item} className="rounded-md border border-slate-200 bg-white p-3">
                      <p className="text-sm font-medium">{item}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Propuesta pendiente de aprobacion.</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
