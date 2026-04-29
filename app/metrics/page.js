import ModuleDashboard from "../Componets/Dashboard/ModuleDashboard";

export default async function Page({ searchParams }) {
  const resolvedParams = await searchParams;
  const tab = resolvedParams?.tab ?? "Outbound Calls";
  return <ModuleDashboard moduleName="Sales" initialTab={tab} />;
}
