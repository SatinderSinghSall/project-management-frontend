import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Users,
  FolderOpen,
  Plus,
  CircleDot,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { useSelector } from "react-redux";
import CreateProjectDialog from "./CreateProjectDialog";

const statusStyles = {
  PLANNING:
    "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
  ACTIVE:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  ON_HOLD:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  COMPLETED:
    "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  CANCELLED:
    "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
};

const priorityStyles = {
  LOW: "text-slate-400 dark:text-zinc-500",
  MEDIUM: "text-amber-500 dark:text-amber-400",
  HIGH: "text-red-500 dark:text-red-400",
};

const formatLabel = (value = "") =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const ProjectOverview = () => {
  const currentWorkspace = useSelector(
    (state) => state?.workspace?.currentWorkspace || null,
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(currentWorkspace?.projects || []);
  }, [currentWorkspace]);

  if (!currentWorkspace) return null;

  return (
    <>
      <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {/* Section header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5 dark:border-zinc-800">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
              Project Overview
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
              A quick look at your workspace projects
            </p>
          </div>

          <Link
            to="/projects"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 sm:text-sm dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            View all
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Empty state */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center sm:py-16">
            <div className="flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <FolderOpen size={25} strokeWidth={1.7} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
              No projects yet
            </h3>

            <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500 dark:text-zinc-400">
              Create your first project to organize work, assign tasks, and
              track progress.
            </p>

            <button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              <Plus size={16} />
              Create project
            </button>
          </div>
        ) : (
          /* Project list */
          <div className="divide-y divide-slate-200 dark:divide-zinc-800">
            {projects.slice(0, 5).map((project) => {
              const progress = Math.min(
                100,
                Math.max(0, Number(project.progress) || 0),
              );

              const status =
                statusStyles[project.status] || statusStyles.PLANNING;
              const priority =
                priorityStyles[project.priority] || priorityStyles.LOW;

              const endDate = project.end_date
                ? new Date(project.end_date)
                : null;

              const formattedEndDate =
                endDate && isValid(endDate)
                  ? format(endDate, "MMM d, yyyy")
                  : null;

              return (
                <Link
                  key={project.id}
                  to={`/projectsDetail?id=${project.id}&tab=tasks`}
                  className="group block min-w-0 px-4 py-5 transition-colors hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 sm:px-5 sm:py-5 dark:hover:bg-zinc-900/60"
                >
                  {/* Title and status */}
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-700 dark:text-zinc-100 dark:group-hover:text-blue-400">
                        {project.name}
                      </h3>

                      <p className="mt-1.5 line-clamp-2 break-words text-sm leading-5 text-slate-500 dark:text-zinc-400">
                        {project.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex max-w-[45%] shrink-0 flex-col items-end gap-2">
                      <span
                        className={`inline-flex max-w-full items-center rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset sm:text-[11px] ${status}`}
                      >
                        <span className="truncate">
                          {formatLabel(project.status || "PLANNING")}
                        </span>
                      </span>

                      <span
                        title={`Priority: ${formatLabel(project.priority || "LOW")}`}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${priority}`}
                      >
                        <CircleDot size={12} />
                        {formatLabel(project.priority || "LOW")}
                      </span>
                    </div>
                  </div>

                  {/* Project metadata */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-zinc-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={14} className="shrink-0" />
                      {project.members?.length || 0}{" "}
                      {(project.members?.length || 0) === 1
                        ? "member"
                        : "members"}
                    </span>

                    {formattedEndDate && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} className="shrink-0" />
                        Due {formattedEndDate}
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                      <span className="font-medium text-slate-500 dark:text-zinc-400">
                        Progress
                      </span>
                      <span className="font-semibold tabular-nums text-slate-700 dark:text-zinc-300">
                        {progress}%
                      </span>
                    </div>

                    <div
                      className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
                      role="progressbar"
                      aria-label={`${project.name} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                    >
                      <div
                        className={`h-full rounded-full transition-[width] duration-500 ${
                          project.status === "COMPLETED"
                            ? "bg-emerald-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <CreateProjectDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </>
  );
};

export default ProjectOverview;
