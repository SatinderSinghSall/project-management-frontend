import { useState } from "react";
import { Plus, ArrowRight, CalendarDays, FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

import StatsGrid from "../components/StatsGrid";
import ProjectOverview from "../components/ProjectOverview";
import RecentActivity from "../components/RecentActivity";
import TasksSummary from "../components/TasksSummary";
import CreateProjectDialog from "../components/CreateProjectDialog";

const Dashboard = () => {
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const displayName = user?.firstName || user?.fullName || "there";

  return (
    <div className="mx-auto w-full max-w-[1600px] min-w-0 space-y-7 sm:space-y-8">
      {/* Page heading */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <span>Workspace</span>
            <span className="text-slate-300 dark:text-zinc-700">/</span>
            <span className="text-slate-700 dark:text-zinc-300">Dashboard</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Welcome back, {displayName}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">
            Here's an overview of your projects, tasks, and recent activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 active:scale-[0.99] sm:w-auto"
        >
          <Plus size={17} strokeWidth={2} />
          New project
        </button>
      </section>

      {/* Summary statistics */}
      <section aria-label="Project statistics" className="min-w-0">
        <StatsGrid />
      </section>

      {/* Main dashboard content */}
      <section className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-3 xl:gap-7">
        <div className="min-w-0 space-y-6 xl:col-span-2 xl:space-y-7">
          {/* Projects */}
          <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-zinc-800 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-300">
                  <FolderKanban size={18} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Project overview
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                    Progress across your projects
                  </p>
                </div>
              </div>

              <Link
                to="/projects"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-indigo-400"
              >
                <span className="hidden sm:inline">All projects</span>
                <span className="sm:hidden">View all</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="min-w-0 p-3 sm:p-5">
              <ProjectOverview />
            </div>
          </section>

          {/* Recent activity */}
          <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 dark:border-zinc-800 sm:px-5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-300">
                <CalendarDays size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Recent activity
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                  The latest updates from your workspace
                </p>
              </div>
            </div>

            <div className="min-w-0 p-3 sm:p-5">
              <RecentActivity />
            </div>
          </section>
        </div>

        {/* Task summaries */}
        <aside className="min-w-0 xl:sticky xl:top-6">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Your tasks
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Keep track of work that needs attention.
            </p>
          </div>

          <div className="min-w-0">
            <TasksSummary />
          </div>
        </aside>
      </section>

      {/* Create project modal */}
      <CreateProjectDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </div>
  );
};

export default Dashboard;
