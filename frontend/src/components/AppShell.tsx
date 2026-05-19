import { NavLink, Outlet } from "react-router-dom";

import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; end?: boolean };

const NAV_ITEMS: readonly NavItem[] = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/employees", label: "Employees" },
  { to: "/insights", label: "Insights" },
];

export function AppShell() {
  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            Salary Management
          </span>
          <nav aria-label="Primary">
            <ul className="flex items-center gap-1 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100",
                        isActive && "bg-slate-900 text-white hover:bg-slate-900",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
