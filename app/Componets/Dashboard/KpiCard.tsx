import type { KpiCardData } from "./dashboardData";

const toneClasses: Record<KpiCardData["tone"], string> = {
  blue: "from-blue-500 to-blue-600",
  green: "from-emerald-500 to-green-600",
  violet: "from-violet-500 to-fuchsia-600",
  teal: "from-cyan-500 to-teal-600",
};

export default function KpiCard({ card }: { card: KpiCardData }) {
  return (
    <article className={`rounded-2xl bg-gradient-to-br p-6 text-white shadow-lg ${toneClasses[card.tone]}`}>
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex rounded-xl bg-white/20 p-3">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18" />
            <path d="M5 17V9" />
            <path d="M12 17V5" />
            <path d="M19 17v-3" />
          </svg>
        </span>

        <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">{card.badgeText}</span>
      </div>

      <p className="text-2xl font-semibold leading-tight">{card.title}</p>
      <p className="mt-2 text-6xl font-bold tracking-tight">{card.value}</p>
      <p className="mt-1 text-sm text-white/80">{card.note}</p>

      {card.progress ? (
        <div className="mt-4 h-2 rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white" style={{ width: `${card.progress}%` }} />
        </div>
      ) : null}

      {card.footer ? (
        <div className="mt-5 grid grid-cols-3 gap-2">
          {card.footer.map((item) => (
            <div key={item.sublabel}>
              <p className="text-4xl font-bold leading-none">{item.label}</p>
              <p className="text-sm text-white/80">{item.sublabel}</p>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
