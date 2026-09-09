import {
  BarChart3,
  BriefcaseBusiness,
  CheckSquare,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

const navItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Clients",
    path: "/clients",
    icon: Users,
  },
  {
    name: "Deals",
    path: "/deals",
    icon: BriefcaseBusiness,
  },
  {
    name: "Tasks",
    path: "/tasks",
    icon: CheckSquare,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function MainLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-gray-100 px-6">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                ClientFlow
              </h1>

              <p className="mt-0.5 text-xs text-gray-500">
                CRM Dashboard
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Workspace
            </p>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={19}
                          strokeWidth={isActive ? 2.3 : 2}
                        />

                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Account / Logout */}
          <div className="border-t border-gray-100 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={19} />

              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;

