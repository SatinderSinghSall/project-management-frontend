import { useMemo, useState } from "react";
import {
  CheckSquare,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ListTodo,
  LoaderCircle,
  Clock3,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";

const STATUS_STYLES = {
  DONE: {
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    label: "Done",
  },
  IN_PROGRESS: {
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    label: "In progress",
  },
  TODO: {
    dot: "bg-slate-400 dark:bg-zinc-500",
    badge: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
    label: "To do",
  },
};

const getStatusStyle = (status) => {
  const normalized = String(status || "TODO").toUpperCase();
  return (
    STATUS_STYLES[normalized] || {
      dot: "bg-slate-400 dark:bg-zinc-500",
      badge: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
      label: normalized.replaceAll("_", " ").toLowerCase(),
    }
  );
};

function MyTasksSidebar() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const currentWorkspace = useSelector(
    (state) => state?.workspace?.currentWorkspace || null,
  );
  const location = useLocation();
  const [showMyTasks, setShowMyTasks] = useState(false);

  const myTasks = useMemo(() => {
    const userId = user?.id;
    const projects = Array.isArray(currentWorkspace?.projects)
      ? currentWorkspace.projects
      : [];

    if (!userId) return [];

    return projects.flatMap((project) =>
      (Array.isArray(project?.tasks) ? project.tasks : [])
        .filter((task) => task?.assignee?.id === userId)
        .map((task) => ({
          ...task,
          projectId: task.projectId || project.id,
          projectName: project.name || "Project",
        })),
    );
  }, [user?.id, currentWorkspace]);

  const activeCount = myTasks.filter(
    (task) => String(task.status || "TODO").toUpperCase() !== "DONE",
  ).length;

  const isTaskActive = (task) => {
    const params = new URLSearchParams(location.search);
    return (
      location.pathname === "/taskDetails" &&
      params.get("taskId") === String(task.id)
    );
  };

  return (
    <section className="mt-5 px-1.5" aria-label="My tasks navigation">
      <button
        type="button"
        onClick={() => setShowMyTasks((previous) => !previous)}
        aria-expanded={showMyTasks}
        aria-controls="my-tasks-subnav"
        className={`group flex min-h-12 w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
          showMyTasks
            ? "border-blue-100 bg-blue-50/80 dark:border-blue-500/20 dark:bg-blue-500/10"
            : "border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/80"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
              showMyTasks
                ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
                : "bg-slate-100 text-slate-500 group-hover:text-slate-700 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200"
            }`}
          >
            <CheckSquare className="size-4" strokeWidth={1.9} />
          </span>
          <span className="min-w-0 truncate text-[13px] font-semibold text-slate-800 dark:text-zinc-100">
            My Tasks
          </span>
          <span className="inline-flex min-w-5 items-center justify-center rounded-md border border-slate-200/80 bg-white px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {myTasks.length}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-1.5">
          {activeCount > 0 && (
            <span className="hidden rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 sm:inline-flex dark:bg-blue-500/15 dark:text-blue-300">
              {activeCount} open
            </span>
          )}
          {showMyTasks ? (
            <ChevronDown className="size-4 text-slate-400 transition-transform" />
          ) : (
            <ChevronRight className="size-4 text-slate-400 transition-transform" />
          )}
        </span>
      </button>

      {showMyTasks && (
        <div
          id="my-tasks-subnav"
          className="relative ml-[18px] mt-2 border-l border-slate-200 pl-2.5 dark:border-zinc-700"
        >
          {!isUserLoaded ? (
            <div
              className="flex items-center gap-2 rounded-lg px-2.5 py-3 text-xs text-slate-500 dark:text-zinc-400"
              role="status"
            >
              <LoaderCircle className="size-3.5 animate-spin text-blue-500" />
              Loading your tasks…
            </div>
          ) : !currentWorkspace ? (
            <div className="flex items-start gap-2 rounded-lg px-2.5 py-3">
              <CircleHelp className="mt-0.5 size-4 shrink-0 text-slate-400" />
              <p className="text-xs leading-5 text-slate-500 dark:text-zinc-400">
                Select a workspace to see your tasks.
              </p>
            </div>
          ) : myTasks.length === 0 ? (
            <div className="flex items-start gap-2 rounded-lg px-2.5 py-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-zinc-800">
                <CircleHelp className="size-3.5" />
              </span>
              <div className="min-w-0 py-0.5">
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  All caught up
                </p>
                <p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-zinc-500">
                  Tasks assigned to you will show up here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 pb-1">
              {myTasks.map((task) => {
                const status = getStatusStyle(task.status);
                const selected = isTaskActive(task);
                const taskUrl = `/taskDetails?projectId=${encodeURIComponent(
                  task.projectId || "",
                )}&taskId=${encodeURIComponent(task.id || "")}`;

                return (
                  <Link
                    key={task.id || `${task.projectId}-${task.title}`}
                    to={taskUrl}
                    title={`${task.title || "Untitled task"} · ${task.projectName}`}
                    aria-current={selected ? "page" : undefined}
                    className={`group/task flex min-w-0 items-start gap-2 rounded-xl border px-2 py-2.5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                      selected
                        ? "border-blue-100 bg-blue-50/80 dark:border-blue-500/20 dark:bg-blue-500/10"
                        : "border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        selected
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
                          : "bg-slate-100 text-slate-500 group-hover/task:text-blue-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      <ListTodo className="size-3.5" />
                    </span>

                    <span className="min-w-0 flex-1 pt-0.5">
                      <span
                        className={`block truncate text-xs font-semibold ${
                          selected
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-slate-700 group-hover/task:text-slate-950 dark:text-zinc-200 dark:group-hover/task:text-white"
                        }`}
                      >
                        {task.title || "Untitled task"}
                      </span>

                      <span className="mt-1.5 flex min-w-0 items-center gap-1.5">
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${status.dot}`}
                        />
                        <span className="truncate text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                          {status.label}
                        </span>
                      </span>

                      <span className="mt-1 block truncate text-[10px] text-slate-400 dark:text-zinc-500">
                        {task.projectName}
                      </span>
                    </span>

                    {String(task.status || "TODO").toUpperCase() ===
                      "IN_PROGRESS" && (
                      <Clock3
                        className="mt-1 size-3.5 shrink-0 text-amber-500"
                        aria-label="In progress"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default MyTasksSidebar;
