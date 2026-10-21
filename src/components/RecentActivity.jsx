import { useMemo } from "react";
import {
  GitCommit,
  MessageSquare,
  Clock3,
  Bug,
  Zap,
  Square,
  Activity,
  UserRound,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { useSelector } from "react-redux";

const typeIcons = {
  BUG: {
    icon: Bug,
    color: "text-red-600 dark:text-red-400",
    background: "bg-red-50 dark:bg-red-500/10",
  },
  FEATURE: {
    icon: Zap,
    color: "text-blue-600 dark:text-blue-400",
    background: "bg-blue-50 dark:bg-blue-500/10",
  },
  TASK: {
    icon: Square,
    color: "text-emerald-600 dark:text-emerald-400",
    background: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  IMPROVEMENT: {
    icon: MessageSquare,
    color: "text-amber-600 dark:text-amber-400",
    background: "bg-amber-50 dark:bg-amber-500/10",
  },
  OTHER: {
    icon: GitCommit,
    color: "text-violet-600 dark:text-violet-400",
    background: "bg-violet-50 dark:bg-violet-500/10",
  },
};

const statusColors = {
  TODO: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
  IN_PROGRESS:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
};

const formatLabel = (value = "") =>
  String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const formatDate = (date) => {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (!isValid(parsedDate)) return null;

  return format(parsedDate, "MMM d, h:mm a");
};

const RecentActivity = () => {
  const { currentWorkspace } = useSelector((state) => state.workspace);

  // Derive tasks directly from the current workspace.
  const tasks = useMemo(() => {
    if (!currentWorkspace?.projects?.length) return [];

    return currentWorkspace.projects
      .flatMap((project) => project.tasks || [])
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();

        return (dateB || 0) - (dateA || 0);
      });
  }, [currentWorkspace]);

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5 dark:border-zinc-800">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
            Recent Activity
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
            Latest task updates across your projects
          </p>
        </div>

        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <Activity size={17} strokeWidth={1.8} />
        </div>
      </div>

      {/* Empty state */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center sm:py-16">
          <div className="flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <Clock3 size={25} strokeWidth={1.7} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
            No recent activity
          </h3>

          <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500 dark:text-zinc-400">
            Task updates from your workspace will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-zinc-800">
          {tasks.map((task) => {
            const typeConfig = typeIcons[task.type] || typeIcons.OTHER;

            const TypeIcon = typeConfig.icon;

            const statusStyle = statusColors[task.status] || statusColors.TODO;

            const assigneeName =
              task.assignee?.name || task.assignee?.email || null;

            const updatedDate = formatDate(task.updatedAt);

            return (
              <article
                key={task.id}
                className="px-4 py-4 transition-colors duration-200 hover:bg-slate-50/80 sm:px-5 sm:py-5 dark:hover:bg-zinc-900/60"
              >
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  {/* Task type icon */}
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${typeConfig.background}`}
                  >
                    <TypeIcon
                      size={18}
                      strokeWidth={1.8}
                      className={typeConfig.color}
                    />
                  </div>

                  {/* Task information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-2">
                      <h3 className="min-w-0 flex-1 break-words text-sm font-semibold leading-6 text-slate-900 dark:text-zinc-100">
                        {task.title}
                      </h3>

                      <span
                        className={`inline-flex shrink-0 items-center rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset sm:text-[11px] ${statusStyle}`}
                      >
                        {formatLabel(task.status || "TODO")}
                      </span>
                    </div>

                    {/* Task metadata */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-zinc-400">
                      <span className="font-medium text-slate-600 dark:text-zinc-400">
                        {formatLabel(task.type || "OTHER")}
                      </span>

                      {assigneeName && (
                        <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {assigneeName.charAt(0).toUpperCase()}
                          </span>

                          <span className="max-w-40 truncate sm:max-w-52">
                            {assigneeName}
                          </span>
                        </span>
                      )}

                      {!assigneeName && (
                        <span className="inline-flex items-center gap-1">
                          <UserRound size={13} />
                          Unassigned
                        </span>
                      )}
                    </div>

                    {/* Updated time */}
                    {updatedDate && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500">
                        <Clock3 size={13} strokeWidth={1.8} />

                        <time dateTime={task.updatedAt}>
                          Updated {updatedDate}
                        </time>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default RecentActivity;
