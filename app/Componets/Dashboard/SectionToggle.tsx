import type { MainSection } from "./dashboardData";

interface SectionToggleProps {
  tabs: MainSection[];
  selectedTab: MainSection;
  onSelectTab: (tab: MainSection) => void;
}

export default function SectionToggle({ tabs, selectedTab, onSelectTab }: SectionToggleProps) {
  return (
    <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex gap-3">
        {tabs.map((tab) => {
          const isActive = tab === selectedTab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onSelectTab(tab)}
              className={`rounded-xl px-6 py-2 text-sm font-semibold transition ${
                isActive ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
        >
          This Year
        </button>
        <button
          type="button"
          aria-label="Refresh"
          className="rounded-lg border border-slate-200 p-2 text-slate-500"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 11a8 8 0 0 0-15.5-2M4 13a8 8 0 0 0 15.5 2" />
            <path d="M4 5v4h4M20 19v-4h-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
