interface ChartPanelsProps {
  leftTitle: string;
  rightTitle: string;
}

function GridChart() {
  return (
    <svg viewBox="0 0 460 220" className="h-56 w-full">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="460" height="220" fill="url(#grid)" />
      <rect x="35" y="120" width="60" height="80" fill="#3b82f6" rx="8" />
      <rect x="115" y="145" width="60" height="55" fill="#60a5fa" rx="8" />
      <rect x="195" y="95" width="60" height="105" fill="#2563eb" rx="8" />
      <rect x="275" y="130" width="60" height="70" fill="#3b82f6" rx="8" />
      <rect x="355" y="110" width="60" height="90" fill="#1d4ed8" rx="8" />
    </svg>
  );
}

function TrendChart() {
  return (
    <svg viewBox="0 0 460 220" className="h-56 w-full">
      <defs>
        <pattern id="grid-2" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="460" height="220" fill="url(#grid-2)" />
      <path
        d="M20 170 C100 80, 160 120, 210 70 C260 30, 320 55, 360 95 C395 130, 420 145, 440 165"
        fill="none"
        stroke="#10b981"
        strokeWidth="4"
      />
      <circle cx="210" cy="70" r="7" fill="#10b981" />
      <circle cx="360" cy="95" r="7" fill="#10b981" />
    </svg>
  );
}

export default function ChartPanels({ leftTitle, rightTitle }: ChartPanelsProps) {
  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-3xl font-semibold text-slate-900">{leftTitle}</h3>
        <GridChart />
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-3xl font-semibold text-slate-900">{rightTitle}</h3>
        <TrendChart />
      </article>
    </section>
  );
}
