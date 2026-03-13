import type { DashboardRole } from "./dashboardData";

interface RoleToggleProps {
  roles: DashboardRole[];
  selectedRole: DashboardRole;
  onSelectRole: (role: DashboardRole) => void;
}

export default function RoleToggle({ roles, selectedRole, onSelectRole }: RoleToggleProps) {
  return (
    <nav className="mb-4 overflow-x-auto rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex min-w-max items-center gap-3">
        {roles.map((role) => {
          const isActive = role === selectedRole;

          return (
            <button
              key={role}
              type="button"
              onClick={() => onSelectRole(role)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isActive ? "bg-blue-100 text-blue-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {role}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
