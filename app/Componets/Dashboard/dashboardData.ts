export type DashboardRole =
  | "Sales"
  | "Customer Support"
  | "General"
  | "Finance"
  | "HR"
  | "Marketing"
  | "Legal";

export type MainSection = "Outbound Calls" | "Inbound Calls" | "Email Campaign";

export type CardTone = "blue" | "green" | "violet" | "teal";

export interface KpiCardData {
  id: string;
  tone: CardTone;
  title: string;
  value: string;
  note: string;
  badgeText: string;
  badgeUp?: boolean;
  footer?: {
    label: string;
    sublabel?: string;
  }[];
  progress?: number;
}

export interface DashboardScenario {
  cards: KpiCardData[];
  leftChartTitle: string;
  rightChartTitle: string;
}

export const roles: DashboardRole[] = [
  "Sales",
  "Customer Support",
  "General",
  "Finance",
  "HR",
  "Marketing",
  "Legal",
];

export const mainSections: MainSection[] = ["Outbound Calls", "Inbound Calls", "Email Campaign"];

const salesOutbound: DashboardScenario = {
  cards: [
    {
      id: "leads",
      tone: "blue",
      title: "Leads Processed",
      value: "1247",
      note: "Month",
      badgeText: "12%",
      badgeUp: true,
      footer: [
        { label: "45", sublabel: "Today" },
        { label: "312", sublabel: "Week" },
        { label: "1247", sublabel: "Month" },
      ],
    },
    {
      id: "success-rate",
      tone: "green",
      title: "Call Success Rate",
      value: "78.5%",
      note: "target reached",
      badgeText: "3.2%",
      badgeUp: true,
      progress: 78,
    },
    {
      id: "duration",
      tone: "violet",
      title: "Avg Call Duration",
      value: "4:32",
      note: "minutes per call",
      badgeText: "2.1%",
      badgeUp: false,
    },
    {
      id: "meetings",
      tone: "teal",
      title: "Meetings Scheduled",
      value: "12",
      note: "this month",
      badgeText: "7%",
      badgeUp: true,
    },
  ],
  leftChartTitle: "Calls by Region",
  rightChartTitle: "Call Success Rate Trend",
};

function mutateScenario(base: DashboardScenario, roleShift: number, sectionShift: number): DashboardScenario {
  const aggregateShift = roleShift + sectionShift;

  return {
    leftChartTitle:
      sectionShift === 0
        ? base.leftChartTitle
        : sectionShift === 1
          ? "Inbound Volume by Region"
          : "Email Replies by Region",
    rightChartTitle:
      sectionShift === 0
        ? base.rightChartTitle
        : sectionShift === 1
          ? "Inbound Conversion Trend"
          : "Email Campaign Trend",
    cards: base.cards.map((card, index) => {
      if (index === 0 && card.footer) {
        const day = 40 + aggregateShift * 2;
        const week = 280 + aggregateShift * 9;
        const month = 1100 + aggregateShift * 24;

        return {
          ...card,
          value: String(month),
          footer: [
            { label: String(day), sublabel: "Today" },
            { label: String(week), sublabel: "Week" },
            { label: String(month), sublabel: "Month" },
          ],
        };
      }

      if (index === 1) {
        const success = Math.max(62, Math.min(92, 75 + aggregateShift));
        return {
          ...card,
          value: `${success.toFixed(1)}%`,
          progress: success,
        };
      }

      if (index === 2) {
        const minute = Math.max(2, 4 + Math.floor(aggregateShift / 3));
        const second = Math.max(10, 32 + aggregateShift);
        return {
          ...card,
          value: `${minute}:${String(second).padStart(2, "0")}`,
        };
      }

      if (index === 3) {
        return {
          ...card,
          value: String(Math.max(4, 10 + aggregateShift)),
        };
      }

      return card;
    }),
  };
}

export function getScenario(role: DashboardRole, section: MainSection): DashboardScenario {
  const roleIndex = roles.indexOf(role);
  const sectionIndex = mainSections.indexOf(section);

  return mutateScenario(salesOutbound, Math.max(0, roleIndex), Math.max(0, sectionIndex) * 2);
}
