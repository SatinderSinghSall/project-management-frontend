import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ChartNoAxesColumn,
  ChevronDown,
  FolderKanban,
  Kanban,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useSelector } from "react-redux";

const ProjectSidebar = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const projects = useSelector((state) => {
    const list = state?.workspace?.currentWorkspace?.projects;
    return Array.isArray(list) ? list : [];
  });

  const activeProjectId = searchParams.get("id");
  const activeTab = searchParams.get("tab");

  const activeProjectFromRoute = useMemo(() => {
    if (location.pathname !== "/projectsDetail" || !activeProjectId)
      return null;
    return activeProjectId;
  }, [location.pathname, activeProjectId]);

  const [expandedProjects, setExpandedProjects] = useState(() => new Set());

  useEffect(() => {
    if (!activeProjectFromRoute) return;
    setExpandedProjects((previous) => {
      if (previous.has(activeProjectFromRoute)) return previous;
      const next = new Set(previous);
      next.add(activeProjectFromRoute);
      return next;
    });
  }, [activeProjectFromRoute]);

  const projectSubItems = [
    { title: "Tasks", tab: "tasks", icon: Kanban },
    { title: "Analytics", tab: "analytics", icon: ChartNoAxesColumn },
    { title: "Calendar", tab: "calendar", icon: CalendarDays },
    { title: "Settings", tab: "settings", icon: Settings2 },
  ];

  const toggleProject = (projectId) => {
    setExpandedProjects((previous) => {
      const next = new Set(previous);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  return (
    <section className="mt-5 px-3" aria-label="Project navigation">
      <div className="mb-2 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <FolderKanban className="size-3.5 text-zinc-400" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Projects
          </h3>
          {projects.length > 0 && (
            <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {projects.length}
            </span>
          )}
        </div>

        <Link
          to="/projects"
          aria-label="View all projects"
          title="View all projects"
          className="flex size-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
        >
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mx-2 flex items-start gap-2.5 rounded-xl border border-dashed border-zinc-200 px-3 py-3 dark:border-zinc-800">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-zinc-400" />
          <div>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              No projects yet
            </p>
            <Link
              to="/projects"
              className="mt-1 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Create a project
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {projects.map((project) => {
            const isExpanded = expandedProjects.has(project.id);
            const isCurrentProject = activeProjectId === project.id;
            const safeName = project.name || "Untitled project";

            return (
              <div key={project.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => toggleProject(project.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`project-subnav-${project.id}`}
                  className={`group flex w-full min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                    isCurrentProject
                      ? "bg-blue-50/80 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <ChevronDown
                    className={`size-3.5 shrink-0 text-zinc-400 transition-transform duration-200 ${
                      isExpanded ? "" : "-rotate-90"
                    }`}
                  />
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isCurrentProject
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
                        : "bg-zinc-100 text-zinc-500 group-hover:bg-white dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700"
                    }`}
                  >
                    <FolderKanban className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                    {safeName}
                  </span>
                  {isCurrentProject && (
                    <span className="size-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>

                {isExpanded && (
                  <div
                    id={`project-subnav-${project.id}`}
                    className="relative ml-[22px] mt-1 space-y-0.5 border-l border-zinc-200 pb-1 pl-3 dark:border-zinc-700"
                  >
                    {projectSubItems.map((item) => {
                      const isActive =
                        location.pathname === "/projectsDetail" &&
                        activeProjectId === project.id &&
                        activeTab === item.tab;
                      const Icon = item.icon;
                      const url = `/projectsDetail?id=${encodeURIComponent(
                        project.id,
                      )}&tab=${item.tab}`;

                      return (
                        <Link
                          key={item.tab}
                          to={url}
                          aria-current={isActive ? "page" : undefined}
                          className={`group/sub flex min-h-8 items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                            isActive
                              ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                          }`}
                        >
                          <Icon
                            className={`size-3.5 shrink-0 ${
                              isActive
                                ? "text-white"
                                : "text-zinc-400 group-hover/sub:text-blue-500"
                            }`}
                          />
                          <span className="font-medium">{item.title}</span>
                          {isActive && (
                            <span className="ml-auto size-1.5 rounded-full bg-white/90" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ProjectSidebar;
