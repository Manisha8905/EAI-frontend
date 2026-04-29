import type { MainSection } from "./dashboardData";

import type { MetricFilter } from "./SalesDashboard";

interface SectionToggleProps {
  tabs: MainSection[];
  selectedTab: MainSection;
  onSelectTab: (tab: MainSection) => void;
  metricFilter: MetricFilter;
  onMetricFilterChange: (filter: MetricFilter) => void;
}

export default function SectionToggle({ tabs, selectedTab, onSelectTab, metricFilter, onMetricFilterChange }: SectionToggleProps) {
  const filters: MetricFilter[] = ["Today", "Week", "Month", "Year"];
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
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm ${
              metricFilter === filter ? "bg-blue-100 text-blue-700 border-blue-300" : "text-slate-700"
            }`}
            onClick={() => onMetricFilterChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
