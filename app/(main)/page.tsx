"use client";

import { GlowCard } from "@/components/ui/custom/glow-card";
import { LayoutDashboard, FolderOpen, Calendar, Computer } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative backgrounds */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-300 via-purple-300 to-pink-300 opacity-30 blur-3xl mix-blend-multiply pointer-events-none dark:opacity-20" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-tr from-cyan-200 via-blue-300 to-indigo-400 opacity-30 blur-3xl mix-blend-multiply pointer-events-none dark:opacity-20" />

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-10">
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500">Bienvenido</span>
            <span className="hidden sm:inline"> a la Intranet del Instituto</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            Accede a tus aplicaciones internas, consulta información y colabora con tu equipo.
          </p>
        </header>

        <main className="flex flex-col gap-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlowCard
              label="Dashboard"
              icon={<LayoutDashboard className="w-full h-full" strokeWidth={1.5} />}
              enableParallax
              href="/dashboard"
            />
            <GlowCard
              label="Projects"
              icon={<FolderOpen className="w-full h-full" strokeWidth={1.5} />}
              href="/projects"
            />
            <GlowCard
              label="Reservas"
              icon={<Calendar className="w-full h-full" strokeWidth={1.5} />}
              onClick={() => alert("Abrir RESERVAS app")}
            />
            <GlowCard
              label="Censo informático"
              icon={<Computer className="w-full h-full text-blue-300" strokeWidth={1.5} />}
              onClick={() => alert("Abrir CENSO app")}
            />
          </div>

          <section>
            <div className="mt-6 bg-white/60 dark:bg-black/40 rounded-xl p-6 shadow-md border border-transparent backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Accesos rápidos</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Atajos, avisos y enlaces útiles para comenzar tu jornada.</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
//             onClick={() => alert("Abrir CENSO app")}
//           />
//         </div>
//       </main>
//     </div>
//   );
// }
