import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  AlertTriangle,
  UserRound,
  CheckCircle2,
  ListTodo,
  CalendarDays,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { useUser } from "@clerk/clerk-react";
import { useSelector } from "react-redux";

const cardConfig = {
  "My Tasks": {
    icon: UserRound,
    iconStyle:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    countStyle:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    emptyIcon: CheckCircle2,
    emptyMessage: "You're all caught up",
    emptyDescription: "Tasks assigned to you will appear here.",
  },
  Overdue: {
    icon: AlertTriangle,
    iconStyle: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    countStyle: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    emptyIcon: CheckCircle2,
    emptyMessage: "No overdue tasks",
    emptyDescription: "You're on track with your deadlines.",
  },
  "In Progress": {
    icon: Clock3,
    iconStyle:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    countStyle:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    emptyIcon: ListTodo,
    emptyMessage: "Nothing in progress",
    emptyDescription: "Tasks currently being worked on appear here.",
  },
};

const formatLabel = (value = "") =>
  String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getValidDate = (value) => {
  if (!value) return null;

  const date = new Date(value);
  return isValid(date) ? date : null;
};

export default function TasksSummary() {
  const { user } = useUser();

  const currentWorkspace = useSelector(
    (state) => state?.workspace?.currentWorkspace,
  );

  const tasks = useMemo(
    () =>
      currentWorkspace?.projects?.flatMap((project) => project.tasks || []) ||
      [],
    [currentWorkspace],
  );

  const now = Date.now();

  const myTasks = tasks.filter((task) => task.assigneeId === user?.id);

  const overdueTasks = tasks.filter((task) => {
    const dueDate = getValidDate(task.due_date);

    return dueDate && dueDate.getTime() < now && task.status !== "DONE";
  });

  const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS");

  const summaryCards = [
    { title: "My Tasks", items: myTasks },
    { title: "Overdue", items: overdueTasks },
    { title: "In Progress", items: inProgressTasks },
  ];

  return (
    <div className="space-y-5">
      {summaryCards.map((card) => {
        const config = cardConfig[card.title];
        const Icon = config.icon;
        const EmptyIcon = config.emptyIcon;
        const visibleTasks = card.items.slice(0, 3);
        const remainingCount = card.items.length - visibleTasks.length;

        return (
          <section
            key={card.title}
            className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
          >
            {/* Card header */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 dark:border-zinc-800">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${config.iconStyle}`}
                >
                  <Icon size={17} strokeWidth={1.8} />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-500">
                    {card.items.length}{" "}
                    {card.items.length === 1 ? "task" : "tasks"}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex min-w-8 shrink-0 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold tabular-nums ${config.countStyle}`}
              >
                {card.items.length}
              </span>
            </div>

            {/* Card content */}
            <div className="p-3 sm:p-4">
              {visibleTasks.length === 0 ? (
                <div className="flex flex-col items-center px-3 py-6 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 dark:bg-zinc-900 dark:text-zinc-500">
                    <EmptyIcon size={19} strokeWidth={1.7} />
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-700 dark:text-zinc-300">
                    {config.emptyMessage}
                  </p>

                  <p className="mt-1 max-w-52 text-xs leading-5 text-slate-500 dark:text-zinc-500">
                    {config.emptyDescription}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleTasks.map((task) => {
                    const dueDate = getValidDate(task.due_date);
                    const isOverdue =
                      dueDate &&
                      dueDate.getTime() < now &&
                      task.status !== "DONE";

                    return (
                      <div
                        key={task.id}
                        className="min-w-0 rounded-lg border border-slate-100 bg-slate-50/70 p-3 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:border-zinc-800/70 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                      >
                        <div className="flex min-w-0 items-start gap-2.5">
                          <span
                            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                              isOverdue
                                ? "text-red-500"
                                : task.status === "DONE"
                                  ? "text-emerald-500"
                                  : "text-slate-400 dark:text-zinc-500"
                            }`}
                          >
                            {isOverdue ? (
                              <AlertTriangle size={15} />
                            ) : task.status === "DONE" ? (
                              <CheckCircle2 size={15} />
                            ) : (
                              <ListTodo size={15} />
                            )}
                          </span>

                          <div className="min-w-0 flex-1">
                            <h4 className="break-words text-sm font-medium leading-5 text-slate-800 dark:text-zinc-200">
                              {task.title || "Untitled task"}
                            </h4>

                            <p className="mt-1.5 break-words text-xs text-slate-500 dark:text-zinc-500">
                              {formatLabel(task.type || "TASK")}
                              <span className="mx-1.5 text-slate-300 dark:text-zinc-700">
                                ·
                              </span>
                              {formatLabel(task.priority || "MEDIUM")} priority
                            </p>

                            {dueDate && (
                              <p
                                className={`mt-2 flex items-center gap-1.5 text-xs ${
                                  isOverdue
                                    ? "font-medium text-red-600 dark:text-red-400"
                                    : "text-slate-500 dark:text-zinc-500"
                                }`}
                              >
                                <CalendarDays size={13} />
                                {isOverdue ? "Overdue · " : "Due "}
                                {format(dueDate, "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {remainingCount > 0 && (
                    <Link
                      to="/projects"
                      className="flex min-h-9 w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                    >
                      View {remainingCount} more{" "}
                      {remainingCount === 1 ? "task" : "tasks"}
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
