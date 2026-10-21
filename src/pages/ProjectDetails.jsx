import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Settings,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Users,
  CheckCircle2,
  Clock3,
  FolderKanban,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

import ProjectAnalytics from "../components/ProjectAnalytics";
import ProjectSettings from "../components/ProjectSettings";
import CreateTaskDialog from "../components/CreateTaskDialog";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectTasks from "../components/ProjectTasks";

const VALID_TABS = ["tasks", "calendar", "analytics", "settings"];

const STATUS_STYLES = {
  PLANNING:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  ACTIVE:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400",
  ON_HOLD:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400",
  COMPLETED:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-400",
  CANCELLED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400",
};

const formatLabel = (value) =>
  String(value || "Unknown")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function ProjectDetail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const id = searchParams.get("id");
  const requestedTab = searchParams.get("tab");

  const workspaceState = useSelector((state) => state?.workspace || {});
  const projects = workspaceState.currentWorkspace?.projects || [];
  const workspaceLoading = Boolean(workspaceState.loading);
  const workspaceError = workspaceState.error || null;

  const [showCreateTask, setShowCreateTask] = useState(false);

  const activeTab = VALID_TABS.includes(requestedTab) ? requestedTab : "tasks";

  const project = useMemo(
    () => projects.find((item) => item.id === id) || null,
    [projects, id],
  );

  const tasks = project?.tasks || [];

  useEffect(() => {
    if (requestedTab && !VALID_TABS.includes(requestedTab)) {
      setSearchParams({ id: id || "", tab: "tasks" }, { replace: true });
    }
  }, [requestedTab, id, setSearchParams]);

  const stats = useMemo(
    () => [
      {
        label: "Total tasks",
        value: tasks.length,
        icon: ClipboardList,
        color: "text-slate-700 dark:text-zinc-200",
        iconColor: "text-slate-500 dark:text-zinc-400",
        iconBg: "bg-slate-100 dark:bg-zinc-800",
      },
      {
        label: "Completed",
        value: tasks.filter((task) => task.status === "DONE").length,
        icon: CheckCircle2,
        color: "text-emerald-700 dark:text-emerald-400",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
      },
      {
        label: "In progress",
        value: tasks.filter((task) => task.status === "IN_PROGRESS").length,
        icon: Clock3,
        color: "text-amber-700 dark:text-amber-400",
        iconColor: "text-amber-600 dark:text-amber-400",
        iconBg: "bg-amber-50 dark:bg-amber-950/50",
      },
      {
        label: "Team members",
        value: project?.members?.length || 0,
        icon: Users,
        color: "text-blue-700 dark:text-blue-400",
        iconColor: "text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-50 dark:bg-blue-950/50",
      },
    ],
    [tasks, project],
  );

  const tabs = [
    { key: "tasks", label: "Tasks", icon: ClipboardList },
    { key: "calendar", label: "Calendar", icon: CalendarDays },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const goToTab = (tab) => {
    setSearchParams({ id: id || "", tab });
  };

  // Wait for workspace loading to finish before deciding the project is missing.
  if (workspaceLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mx-auto flex min-h-[55vh] w-full max-w-5xl items-center justify-center"
      >
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <LoaderCircle size={25} className="animate-spin" />
          </div>

          <h2 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">
            Loading project
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">
            Preparing your project details and workspace data.
          </p>

          <div className="mt-6 space-y-2">
            <div className="h-2 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />
            <div className="h-2 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  // Handle failed workspace loading separately from a missing project.
  if (workspaceError) {
    const message =
      typeof workspaceError === "string"
        ? workspaceError
        : workspaceError.message || "Please try again.";

    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-2xl items-center justify-center">
        <div
          role="alert"
          className="w-full rounded-xl border border-red-200 bg-white p-6 dark:border-red-900/60 dark:bg-zinc-950 sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Unable to load project data
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
                {message}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <RefreshCw size={15} />
                  Try again
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/projects")}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Back to projects
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Missing or invalid project ID.
  if (!id || !project) {
    return (
      <div className="mx-auto flex min-h-[55vh] w-full max-w-2xl items-center justify-center">
        <div className="w-full rounded-xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-950 sm:px-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <FolderKanban size={25} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
            Project not found
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-zinc-400">
            This project may have been removed, or the link may be invalid.
            Return to your projects to select another one.
          </p>

          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            Back to projects
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 sm:space-y-8">
      {/* Project heading */}
      <section className="flex flex-col gap-5 border-b border-slate-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            aria-label="Back to projects"
            className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="break-words text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                {project.name || "Untitled project"}
              </h1>

              <span
                className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${
                  STATUS_STYLES[project.status] || STATUS_STYLES.PLANNING
                }`}
              >
                {formatLabel(project.status)}
              </span>
            </div>

            <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-zinc-400">
              Manage tasks, review progress, and coordinate your team.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateTask(true)}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:bg-blue-800"
        >
          <Plus size={17} />
          New task
        </button>
      </section>

      {/* Project statistics */}
      <section
        aria-label="Project statistics"
        className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 sm:p-5"
            >
              <div className="min-w-0">
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  {card.label}
                </p>
                <p
                  className={`mt-2 text-2xl font-semibold tabular-nums ${card.color}`}
                >
                  {card.value}
                </p>
              </div>

              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg} ${card.iconColor}`}
              >
                <Icon size={19} strokeWidth={1.8} />
              </div>
            </div>
          );
        })}
      </section>

      {/* Project tabs */}
      <section>
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <div
            role="tablist"
            aria-label="Project sections"
            className="inline-flex min-w-max items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            {tabs.map((item) => {
              const Icon = item.icon;
              const selected = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => goToTab(item.key)}
                  className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:px-4 ${
                    selected
                      ? "border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      : "border border-transparent text-slate-500 hover:bg-white hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 min-w-0 sm:mt-6">
          {activeTab === "tasks" && <ProjectTasks tasks={tasks} />}

          {activeTab === "calendar" && <ProjectCalendar tasks={tasks} />}

          {activeTab === "analytics" && (
            <ProjectAnalytics tasks={tasks} project={project} />
          )}

          {activeTab === "settings" && <ProjectSettings project={project} />}
        </div>
      </section>

      {/* Create task dialog */}
      {showCreateTask && (
        <CreateTaskDialog
          showCreateTask={showCreateTask}
          setShowCreateTask={setShowCreateTask}
          projectId={id}
        />
      )}
    </div>
  );
}
