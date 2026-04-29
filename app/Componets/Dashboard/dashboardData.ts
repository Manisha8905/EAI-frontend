export type DashboardRole =
  | "Sales"
  | "Customer Support"
  | "General"
  | "Finance"
  | "HR"
  | "Marketing"
  | "Legal";

export type MainSection = "Outbound Calls" | "Inbound Calls" | "Email Campaign" | "LinkedIn Campaign" | "WhatsApp Campaign";

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

import type { MetricFilter } from "./SalesDashboard";

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

export const mainSections: MainSection[] = ["Outbound Calls", "Inbound Calls", "Email Campaign", "LinkedIn Campaign", "WhatsApp Campaign"];

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

function mutateScenario(base: DashboardScenario, roleShift: number, sectionShift: number, metricFilter: MetricFilter): DashboardScenario {
  const aggregateShift = roleShift + sectionShift;

  return {
    leftChartTitle:
      sectionShift === 0
        ? base.leftChartTitle
        : sectionShift === 1
          ? "Inbound Volume by Region"
          : sectionShift === 2
            ? "Email Replies by Region"
            : sectionShift === 3
              ? "LinkedIn Connections by Region"
              : "WhatsApp Messages by Region",
    rightChartTitle:
      sectionShift === 0
        ? base.rightChartTitle
        : sectionShift === 1
          ? "Inbound Conversion Trend"
          : sectionShift === 2
            ? "Email Campaign Trend"
            : sectionShift === 3
              ? "LinkedIn Campaign Trend"
              : "WhatsApp Campaign Trend",
    cards: base.cards.map((card, index) => {
      let newCard = { ...card };

      // Change titles based on section
      if (sectionShift === 1) { // Inbound Calls
        if (index === 1) newCard.title = "Answer Rate";
        if (index === 2) newCard.title = "Avg Talk Duration";
        if (index === 3) newCard.title = "Callbacks Scheduled";
      } else if (sectionShift === 2) { // Email Campaign
        if (index === 0) newCard.title = "Emails Sent";
        if (index === 1) newCard.title = "Open Rate";
        if (index === 2) newCard.title = "Avg Response Time";
        if (index === 3) newCard.title = "Replies Received";
      } else if (sectionShift === 3) { // LinkedIn Campaign
        if (index === 0) newCard.title = "Connections Sent";
        if (index === 1) newCard.title = "Connection Rate";
        if (index === 2) newCard.title = "Avg Response Time";
        if (index === 3) newCard.title = "Messages Exchanged";
      } else if (sectionShift === 4) { // WhatsApp Campaign
        if (index === 0) newCard.title = "Messages Sent";
        if (index === 1) newCard.title = "Response Rate";
        if (index === 2) newCard.title = "Avg Response Time";
        if (index === 3) newCard.title = "Conversations Started";
      }

      if (index === 0 && card.footer) {
        const day = 40 + aggregateShift * 2;
        const week = 280 + aggregateShift * 9;
        const month = 1100 + aggregateShift * 24;
        const year = 12000 + aggregateShift * 100;

        let value = month;
        if (metricFilter === "Today") value = day;
        else if (metricFilter === "Week") value = week;
        else if (metricFilter === "Year") value = year;

        newCard.value = String(value);
        newCard.footer = [
          { label: String(day), sublabel: "Today" },
          { label: String(week), sublabel: "Week" },
          { label: String(month), sublabel: "Month" },
          { label: String(year), sublabel: "Year" },
        ];
      }

      if (index === 1) {
        const success = Math.max(62, Math.min(92, 75 + aggregateShift));
        newCard.value = `${success.toFixed(1)}%`;
        newCard.progress = success;
      }

      if (index === 2) {
        const minute = Math.max(2, 4 + Math.floor(aggregateShift / 3));
        const second = Math.max(10, 32 + aggregateShift);
        newCard.value = `${minute}:${String(second).padStart(2, "0")}`;
      }

      if (index === 3) {
        newCard.value = String(Math.max(4, 10 + aggregateShift));
      }

      return newCard;
    }),
  };
}

export function getScenario(role: DashboardRole, section: MainSection, metricFilter: MetricFilter = "Month"): DashboardScenario {
  const roleIndex = roles.indexOf(role);
  const sectionIndex = mainSections.indexOf(section);

  return mutateScenario(salesOutbound, Math.max(0, roleIndex), Math.max(0, sectionIndex) * 2, metricFilter);
}
