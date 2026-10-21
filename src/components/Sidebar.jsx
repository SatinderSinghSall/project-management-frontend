import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  FolderKanban,
  UsersRound,
  Settings,
  X,
  Layers3,
  ChevronRight,
  BriefcaseBusiness,
} from "lucide-react";

import WorkspaceDropdown from "./WorkspaceDropdown";
import MyTasksSidebar from "./MyTasksSidebar";
import ProjectSidebar from "./ProjectsSidebar";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { openUserProfile } = useClerk();
  const { user } = useUser();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Team", href: "/team", icon: UsersRound },
  ];

  // Close the mobile drawer after navigation.
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname, setIsSidebarOpen]);

  // Prevent the page behind the drawer from scrolling.
  useEffect(() => {
    if (!isSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen, setIsSidebarOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/35 transition-opacity duration-200 md:hidden ${
          isSidebarOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(280px,86vw)] shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-950 md:sticky md:top-0 md:z-20 md:h-dvh md:w-[260px] md:min-w-[260px] md:translate-x-0 md:shadow-none ${
          isSidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
        }`}
      >
        {/* Workspace selector */}
        <div className="relative z-30 shrink-0 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex min-h-[76px] items-center gap-2 px-3 sm:px-4 md:min-h-[96px]">
            <div className="min-w-0 flex-1">
              <WorkspaceDropdown />
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable navigation */}
        <nav className="relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-zinc-500">
            Workspace
          </p>

          <div className="space-y-1">
            {menuItems.map(({ name, href, icon: Icon }) => (
              <NavLink
                key={name}
                to={href}
                end={href === "/"}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex min-h-10 items-center gap-3 rounded-lg border px-3 text-sm transition-colors ${
                    isActive
                      ? "border-slate-200 bg-slate-100 font-semibold text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      : "border-transparent font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2 : 1.7}
                      className={`shrink-0 ${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400 dark:text-zinc-500"
                      }`}
                    />
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                    {isActive && (
                      <span className="size-1.5 shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={openUserProfile}
              className="group flex min-h-10 w-full items-center gap-3 rounded-lg border border-transparent px-3 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            >
              <Settings
                size={18}
                strokeWidth={1.7}
                className="shrink-0 text-slate-400 dark:text-zinc-500"
              />
              <span className="flex-1">Settings</span>
              <ChevronRight
                size={15}
                className="text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600"
              />
            </button>
          </div>

          <div className="my-5 border-t border-slate-100 dark:border-zinc-800" />

          <div className="min-w-0">
            <MyTasksSidebar />
          </div>

          <div className="mt-5 min-w-0">
            <ProjectSidebar />
          </div>
        </nav>

        {/* Bottom account and application section */}
        <div className="shrink-0 border-t border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
          <div className="mb-3 flex min-w-0 items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-zinc-900">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Layers3 size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Project Management
              </p>
              <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-zinc-500">
                Workspace dashboard
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openUserProfile}
            className="flex w-full min-w-0 items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900"
          >
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-9",
                },
              }}
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800 dark:text-zinc-200">
                {user?.fullName || user?.firstName || "Your account"}
              </p>
              <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-zinc-500">
                Account settings
              </p>
            </div>

            <BriefcaseBusiness
              size={16}
              className="shrink-0 text-slate-400 dark:text-zinc-500"
            />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
