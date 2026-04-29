"use client";

import { useMemo, useState } from "react";
import ChartPanels from "./ChartPanels";
import KpiCard from "./KpiCard";
import RoleToggle from "./RoleToggle";
import SectionToggle from "./SectionToggle";
import {
  getScenario,
  mainSections,
  roles,
  type DashboardRole,
  type MainSection,
} from "./dashboardData";

export type MetricFilter = "Today" | "Week" | "Month" | "Year";

export default function SalesDashboard() {
  const [selectedRole, setSelectedRole] = useState<DashboardRole>("Sales");
  const [selectedSection, setSelectedSection] = useState<MainSection>("Outbound Calls");
  const [metricFilter, setMetricFilter] = useState<MetricFilter>("Month");

  const scenario = useMemo(() => getScenario(selectedRole, selectedSection, metricFilter), [selectedRole, selectedSection, metricFilter]);

  return (
    <main className="h-[calc(100vh-64px)] overflow-auto bg-slate-50 p-6">
      <RoleToggle roles={roles} selectedRole={selectedRole} onSelectRole={setSelectedRole} />

      <SectionToggle
        tabs={mainSections}
        selectedTab={selectedSection}
        onSelectTab={setSelectedSection}
        metricFilter={metricFilter}
        onMetricFilterChange={setMetricFilter}
      />

      <section className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {scenario.cards.map((card) => (
          <KpiCard key={card.id} card={card} />
        ))}
      </section>

      <ChartPanels leftTitle={scenario.leftChartTitle} rightTitle={scenario.rightChartTitle} />
    </main>
  );
}
