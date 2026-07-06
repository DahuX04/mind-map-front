import Link from "next/link";
import { BrainCircuit, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-[var(--app-bg)] px-4 py-8">
      <article className="panel mx-auto max-w-3xl p-6 sm:p-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-9 place-items-center rounded-md bg-slate-950 text-white">
            <BrainCircuit className="size-5" aria-hidden />
          </span>
          MindMap Live
        </Link>
        <div className="mt-8 flex items-start gap-3">
          <ShieldCheck className="mt-1 size-6 shrink-0 text-teal-700" aria-hidden />
          <div>
            <h1 className="text-3xl font-semibold">Privacidad y uso responsable de IA</h1>
            <p className="mt-2 text-sm text-slate-500">Resumen informativo para el piloto educativo del MVP.</p>
          </div>
        </div>

        <div className="mt-8 space-y-7 text-sm leading-7 text-slate-700">
          <Policy title="Datos de cuenta">
            Se usan el correo, nombre visible, rol y avatar para autenticarte, mostrar tu identidad a colaboradores y aplicar permisos. La sesion se gestiona con Supabase Auth.
          </Policy>
          <Policy title="Contenido de mapas">
            Los nodos y conexiones activos se sincronizan mediante Liveblocks. El backend conserva metadatos, permisos y snapshots controlados; no recibe un request por cada movimiento del canvas.
          </Policy>
          <Policy title="Inteligencia artificial">
            Solo se procesa contenido cuando solicitas una sugerencia, pregunta o resumen. La interfaz avisa antes de usar IA y ninguna sugerencia modifica el mapa hasta que una persona la acepta.
          </Policy>
          <Policy title="Acceso y seguridad">
            El backend valida el token y vuelve a autorizar cada workspace, curso, mapa y sesion. Los enlaces pueden expirar, limitar usos y conceder solo lectura.
          </Policy>
          <Policy title="Minimizacion">
            La telemetria no debe registrar tokens, claves, preguntas completas ni contenido academico sensible. Comparte unicamente informacion apropiada para el entorno educativo.
          </Policy>
        </div>

        <Link className="btn btn-primary mt-8" href="/register">
          Volver al registro
        </Link>
      </article>
    </main>
  );
}

function Policy({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <p className="mt-1">{children}</p>
    </section>
  );
}
