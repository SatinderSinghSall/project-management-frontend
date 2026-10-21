import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  FolderKanban,
  Users,
} from "lucide-react";
import { format } from "date-fns";

const statusStyles = {
  PLANNING:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  ACTIVE:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-400",
  ON_HOLD:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-400",
  COMPLETED:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-400",
  CANCELLED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-400",
};

const priorityStyles = {
  LOW: "text-slate-500 dark:text-zinc-400",
  MEDIUM: "text-amber-600 dark:text-amber-400",
  HIGH: "text-red-600 dark:text-red-400",
};

const progressStyles = {
  PLANNING: "bg-slate-400 dark:bg-zinc-500",
  ACTIVE: "bg-blue-600 dark:bg-blue-500",
  ON_HOLD: "bg-amber-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-slate-400 dark:bg-zinc-500",
};

const formatLabel = (value) =>
  String(value || "Not set")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const ProjectCard = ({ project }) => {
  const status = project.status || "PLANNING";
  const priority = project.priority || "MEDIUM";

  const rawProgress = Number(project.progress) || 0;
  const progress = Math.min(100, Math.max(0, rawProgress));

  const tasks = Array.isArray(project.tasks) ? project.tasks : [];
  const members = Array.isArray(project.members) ? project.members : [];

  const completedTasks = tasks.filter((task) => task.status === "DONE").length;

  const dueDate = project.end_date ? new Date(project.end_date) : null;

  const validDueDate = dueDate && !Number.isNaN(dueDate.getTime());

  const StatusIcon =
    status === "COMPLETED"
      ? CheckCircle2
      : status === "ON_HOLD"
        ? Clock3
        : Circle;

  return (
    <Link
      to={`/projectsDetail?id=${project.id}&tab=tasks`}
      aria-label={`Open project ${project.name || "Untitled project"}`}
      className="group flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md hover:shadow-slate-200/60 focus:outline-none focus:ring-4 focus:ring-blue-500/15 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-900 dark:hover:shadow-black/20 sm:p-6"
    >
      {/* Project heading */}
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:border-blue-900 dark:group-hover:bg-blue-950/40 dark:group-hover:text-blue-400">
          <FolderKanban size={19} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-700 dark:text-zinc-100 dark:group-hover:text-blue-400 sm:text-base">
            {project.name || "Untitled project"}
          </h3>

          <p className="mt-1 line-clamp-2 min-h-10 break-words text-sm leading-5 text-slate-500 dark:text-zinc-400">
            {project.description || "No description provided."}
          </p>
        </div>

        <ArrowUpRight
          size={17}
          className="mt-0.5 shrink-0 text-slate-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600 group-hover:opacity-100 dark:group-hover:text-blue-400"
        />
      </div>

      {/* Status and priority */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
            statusStyles[status] || statusStyles.PLANNING
          }`}
        >
          <StatusIcon size={13} />
          {formatLabel(status)}
        </span>

        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            priorityStyles[priority] || priorityStyles.MEDIUM
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              priority === "HIGH"
                ? "bg-red-500"
                : priority === "MEDIUM"
                  ? "bg-amber-500"
                  : "bg-slate-400"
            }`}
          />
          {formatLabel(priority)} priority
        </span>
      </div>

      {/* Optional project details */}
      {(validDueDate || members.length > 0 || tasks.length > 0) && (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
          {members.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} />
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          )}

          {tasks.length > 0 && (
            <span>
              {completedTasks}/{tasks.length} tasks complete
            </span>
          )}

          {validDueDate && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} />
              {format(dueDate, "MMM d, yyyy")}
            </span>
          )}
        </div>
      )}

      {/* Progress */}
      <div className="mt-auto pt-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
            Project progress
          </span>

          <span className="text-xs font-semibold tabular-nums text-slate-800 dark:text-zinc-200">
            {progress}%
          </span>
        </div>

        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
          role="progressbar"
          aria-label={`${project.name || "Project"} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${
              progressStyles[status] || "bg-blue-600"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
