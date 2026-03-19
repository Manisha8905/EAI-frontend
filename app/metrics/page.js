import ModuleDashboard from "../Componets/Dashboard/ModuleDashboard";

export default function Page({ searchParams }) {
  const tab = searchParams?.tab ?? "Outbound Calls";
  return <ModuleDashboard moduleName="Sales" initialTab={tab} />;
}
