import { FolderOpen, CheckCircle2, Users, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function StatsGrid() {
  const currentWorkspace = useSelector(
    (state) => state?.workspace?.currentWorkspace || null,
  );

  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    myTasks: 0,
    overdueIssues: 0,
  });

  const statCards = [
    {
      icon: FolderOpen,
      title: "Total Projects",
      value: stats.totalProjects,
      subtitle: `projects in ${currentWorkspace?.name || "your workspace"}`,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      accent: "group-hover:border-blue-300 dark:group-hover:border-blue-500/40",
    },
    {
      icon: CheckCircle2,
      title: "Completed Projects",
      value: stats.completedProjects,
      subtitle: `of ${stats.totalProjects} total`,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      accent:
        "group-hover:border-emerald-300 dark:group-hover:border-emerald-500/40",
    },
    {
      icon: Users,
      title: "My Tasks",
      value: stats.myTasks,
      subtitle: "assigned to me",
      iconBg: "bg-violet-50 dark:bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
      accent:
        "group-hover:border-violet-300 dark:group-hover:border-violet-500/40",
    },
    {
      icon: AlertTriangle,
      title: "Overdue",
      value: stats.overdueIssues,
      subtitle: "need attention",
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      accent:
        "group-hover:border-amber-300 dark:group-hover:border-amber-500/40",
    },
  ];

  useEffect(() => {
    if (currentWorkspace) {
      const projects = currentWorkspace.projects || [];

      setStats({
        totalProjects: projects.length,

        activeProjects: projects.filter(
          (project) =>
            project.status !== "CANCELLED" && project.status !== "COMPLETED",
        ).length,

        completedProjects: projects
          .filter((project) => project.status === "COMPLETED")
          .reduce((total, project) => total + (project.tasks?.length || 0), 0),

        myTasks: projects.reduce(
          (total, project) =>
            total +
            (project.tasks || []).filter(
              (task) => task.assignee?.email === currentWorkspace.owner?.email,
            ).length,
          0,
        ),

        overdueIssues: projects.reduce(
          (total, project) =>
            total +
            (project.tasks || []).filter((task) => {
              if (!task.due_date) return false;

              return (
                new Date(task.due_date) < new Date() &&
                task.status !== "COMPLETED" &&
                task.status !== "CANCELLED"
              );
            }).length,
          0,
        ),
      });
    } else {
      setStats({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        myTasks: 0,
        overdueIssues: 0,
      });
    }
  }, [currentWorkspace]);

  return (
    <div className="my-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map(
        (
          { icon: Icon, title, value, subtitle, iconBg, iconColor, accent },
          index,
        ) => (
          <article
            key={title}
            className={`group relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-950 ${accent}`}
          >
            <div className="p-5 sm:p-5">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-500 dark:text-zinc-400">
                    {title}
                  </p>

                  <p
                    className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-white"
                    aria-label={`${title}: ${value}`}
                  >
                    {value}
                  </p>

                  <p
                    className="mt-2 min-h-8 break-words text-xs leading-5 text-slate-500 dark:text-zinc-500"
                    title={subtitle}
                  >
                    {subtitle}
                  </p>
                </div>

                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
                >
                  <Icon
                    size={19}
                    strokeWidth={1.9}
                    className={iconColor}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            <div
              className={`absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100 ${
                index === 0
                  ? "bg-blue-500"
                  : index === 1
                    ? "bg-emerald-500"
                    : index === 2
                      ? "bg-violet-500"
                      : "bg-amber-500"
              }`}
            />
          </article>
        ),
      )}
    </div>
  );
}
