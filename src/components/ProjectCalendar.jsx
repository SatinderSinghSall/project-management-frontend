import { useMemo, useState } from "react";
import {
  format,
  isSameDay,
  isBefore,
  isToday,
  startOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import {
  CalendarDays,
  Clock3,
  UserRound,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  ListTodo,
} from "lucide-react";

const typeStyles = {
  BUG: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20",
  FEATURE:
    "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
  TASK: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  IMPROVEMENT:
    "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20",
  OTHER:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
};

const priorityStyles = {
  LOW: "border-l-slate-300 dark:border-l-zinc-600",
  MEDIUM: "border-l-amber-400 dark:border-l-amber-400",
  HIGH: "border-l-red-500 dark:border-l-red-400",
};

const statusStyles = {
  TODO: "text-slate-600 dark:text-zinc-400",
  IN_PROGRESS: "text-blue-600 dark:text-blue-400",
  DONE: "text-emerald-600 dark:text-emerald-400",
};

const getSafeDate = (value) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getTypeStyle = (type) => typeStyles[type] || typeStyles.OTHER;

const ProjectCalendar = ({ tasks = [] }) => {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const today = startOfDay(new Date());

  const normalizedTasks = useMemo(
    () =>
      (Array.isArray(tasks) ? tasks : []).map((task) => ({
        ...task,
        parsedDueDate: getSafeDate(task.due_date),
      })),
    [tasks],
  );

  const getTasksForDate = (date) =>
    normalizedTasks.filter(
      (task) => task.parsedDueDate && isSameDay(task.parsedDueDate, date),
    );

  const selectedDayTasks = getTasksForDate(selectedDate);

  const upcomingTasks = useMemo(
    () =>
      normalizedTasks
        .filter(
          (task) =>
            task.parsedDueDate &&
            !isBefore(startOfDay(task.parsedDueDate), today) &&
            task.status !== "DONE",
        )
        .sort((a, b) => a.parsedDueDate.getTime() - b.parsedDueDate.getTime())
        .slice(0, 5),
    [normalizedTasks, today.getTime()],
  );

  const overdueTasks = useMemo(
    () =>
      normalizedTasks
        .filter(
          (task) =>
            task.parsedDueDate &&
            isBefore(startOfDay(task.parsedDueDate), today) &&
            task.status !== "DONE",
        )
        .sort((a, b) => a.parsedDueDate.getTime() - b.parsedDueDate.getTime()),
    [normalizedTasks, today.getTime()],
  );

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const leadingDays = Array.from(
    { length: getDay(startOfMonth(currentMonth)) },
    (_, index) => `leading-${index}`,
  );

  const handleMonthChange = (direction) => {
    setCurrentMonth((previous) =>
      direction === "next" ? addMonths(previous, 1) : subMonths(previous, 1),
    );
  };

  const cardClass =
    "rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";

  const secondaryText = "text-slate-500 dark:text-zinc-400";

  const renderTask = (task, compact = false) => (
    <div
      key={task.id}
      className={`group rounded-lg border border-slate-200 border-l-[3px] bg-white p-3 transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:border-l-[3px] dark:bg-zinc-900 dark:hover:bg-zinc-800/70 ${
        priorityStyles[task.priority] || priorityStyles.LOW
      }`}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <p className="min-w-0 break-words text-sm font-medium text-slate-800 dark:text-zinc-100">
          {task.title || "Untitled task"}
        </p>

        <span
          className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ${getTypeStyle(task.type)}`}
        >
          {(task.type || "TASK").replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
          {(task.priority || "LOW").toLowerCase()} priority
        </span>

        {task.assignee && (
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
            <UserRound size={13} className="shrink-0" />
            <span className="max-w-36 truncate">
              {task.assignee.name || task.assignee.email || "Assigned"}
            </span>
          </span>
        )}
      </div>

      {!compact && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5 text-xs dark:border-zinc-800">
          {task.status === "DONE" ? (
            <CheckCircle2 size={13} className="text-emerald-500" />
          ) : (
            <CircleDot
              size={13}
              className={statusStyles[task.status] || secondaryText}
            />
          )}
          <span className={statusStyles[task.status] || secondaryText}>
            {(task.status || "TODO").replaceAll("_", " ")}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-3">
      {/* Calendar and selected-day tasks */}
      <div className="min-w-0 space-y-5 xl:col-span-2">
        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <CalendarDays size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Task calendar
                </h2>
                <p className={`mt-0.5 text-xs ${secondaryText}`}>
                  Select a date to review scheduled tasks
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-1 dark:border-zinc-700 sm:justify-start">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => handleMonthChange("prev")}
                className="flex size-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="min-w-32 text-center text-sm font-semibold text-slate-800 dark:text-zinc-100">
                {format(currentMonth, "MMMM yyyy")}
              </span>

              <button
                type="button"
                aria-label="Next month"
                onClick={() => handleMonthChange("next")}
                className="flex size-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          <div className="p-3 sm:p-5">
            <div className="mb-2 grid grid-cols-7">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className={`py-2 text-center text-[11px] font-semibold uppercase tracking-wide ${secondaryText}`}
                >
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                  <span className="hidden sm:inline">{day}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {leadingDays.map((key) => (
                <div key={key} aria-hidden="true" />
              ))}

              {daysInMonth.map((day) => {
                const dayTasks = getTasksForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const dayHasOverdue = dayTasks.some(
                  (task) =>
                    task.status !== "DONE" &&
                    task.parsedDueDate &&
                    isBefore(startOfDay(task.parsedDueDate), today),
                );

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    aria-pressed={isSelected}
                    aria-label={`${format(day, "MMMM d, yyyy")}, ${dayTasks.length} task${dayTasks.length === 1 ? "" : "s"}`}
                    className={`relative flex min-h-[58px] min-w-0 flex-col items-center justify-start gap-1 rounded-lg border p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-[76px] sm:p-2 ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white shadow-sm dark:border-blue-500 dark:bg-blue-600"
                        : isToday(day)
                          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                          : "border-transparent bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-slate-100 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="text-xs font-semibold sm:text-sm">
                      {format(day, "d")}
                    </span>

                    {dayTasks.length > 0 && (
                      <>
                        <span
                          className={`hidden text-[10px] sm:block ${
                            isSelected ? "text-blue-100" : secondaryText
                          }`}
                        >
                          {dayTasks.length} task
                          {dayTasks.length === 1 ? "" : "s"}
                        </span>

                        <span className="flex items-center gap-0.5 sm:hidden">
                          {dayTasks.slice(0, 3).map((task, index) => (
                            <span
                              key={task.id || index}
                              className={`size-1 rounded-full ${
                                isSelected
                                  ? "bg-white"
                                  : task.status === "DONE"
                                    ? "bg-emerald-500"
                                    : dayHasOverdue
                                      ? "bg-red-500"
                                      : "bg-blue-500"
                              }`}
                            />
                          ))}
                        </span>
                      </>
                    )}

                    {dayHasOverdue && (
                      <span
                        className={`absolute right-1 top-1 size-1.5 rounded-full ${
                          isSelected ? "bg-white" : "bg-red-500"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div
              className={`mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs dark:border-zinc-800 ${secondaryText}`}
            >
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-500" />
                Today
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-red-500" />
                Overdue
              </span>
            </div>
          </div>
        </section>

        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5 dark:border-zinc-800">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {format(selectedDate, "EEEE, MMMM d")}
              </h3>
              <p className={`mt-1 text-xs ${secondaryText}`}>
                {selectedDayTasks.length} scheduled task
                {selectedDayTasks.length === 1 ? "" : "s"}
              </p>
            </div>
            {isToday(selectedDate) && (
              <span className="shrink-0 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                Today
              </span>
            )}
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            {selectedDayTasks.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <ListTodo size={21} />
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">
                  No tasks scheduled
                </p>
                <p className={`mt-1 text-xs ${secondaryText}`}>
                  Choose another date to view its tasks.
                </p>
              </div>
            ) : (
              selectedDayTasks.map((task) => renderTask(task))
            )}
          </div>
        </section>
      </div>

      {/* Upcoming and overdue task lists */}
      <aside className="min-w-0 space-y-5">
        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Clock3 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Upcoming tasks
                </h3>
                <p className={`mt-0.5 text-xs ${secondaryText}`}>
                  Your next deadlines
                </p>
              </div>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
              {upcomingTasks.length}
            </span>
          </div>

          <div className="space-y-2.5 p-4">
            {upcomingTasks.length === 0 ? (
              <p className={`py-5 text-center text-sm ${secondaryText}`}>
                No upcoming tasks
              </p>
            ) : (
              upcomingTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() =>
                    setSelectedDate(startOfDay(task.parsedDueDate))
                  }
                  className="block w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:hover:border-blue-500/30 dark:hover:bg-zinc-800/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="break-words text-sm font-medium text-slate-800 dark:text-zinc-100">
                      {task.title || "Untitled task"}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-zinc-400">
                      {format(task.parsedDueDate, "MMM d")}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span
                      className={`rounded-md px-2 py-1 text-[10px] font-medium ring-1 ring-inset ${getTypeStyle(task.type)}`}
                    >
                      {(task.type || "TASK").replaceAll("_", " ")}
                    </span>
                    <span className={`text-xs ${secondaryText}`}>
                      {format(task.parsedDueDate, "EEE")}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Overdue tasks
                </h3>
                <p className={`mt-0.5 text-xs ${secondaryText}`}>
                  Past-due, unfinished work
                </p>
              </div>
            </div>
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                overdueTasks.length
                  ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                  : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {overdueTasks.length}
            </span>
          </div>

          <div className="space-y-2.5 p-4">
            {overdueTasks.length === 0 ? (
              <div className="py-5 text-center">
                <CheckCircle2 className="mx-auto mb-2 size-6 text-emerald-500" />
                <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">
                  All caught up
                </p>
                <p className={`mt-1 text-xs ${secondaryText}`}>
                  No overdue tasks right now.
                </p>
              </div>
            ) : (
              overdueTasks.slice(0, 5).map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() =>
                    setSelectedDate(startOfDay(task.parsedDueDate))
                  }
                  className="block w-full rounded-lg border border-red-100 bg-red-50/50 p-3 text-left transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-500/20 dark:bg-red-500/5 dark:hover:bg-red-500/10"
                >
                  <span className="block break-words text-sm font-medium text-slate-800 dark:text-zinc-100">
                    {task.title || "Untitled task"}
                  </span>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      Due {format(task.parsedDueDate, "MMM d")}
                    </span>
                    <span
                      className={`rounded-md px-2 py-1 text-[10px] font-medium ring-1 ring-inset ${getTypeStyle(task.type)}`}
                    >
                      {(task.type || "TASK").replaceAll("_", " ")}
                    </span>
                  </div>
                </button>
              ))
            )}

            {overdueTasks.length > 5 && (
              <p className={`pt-1 text-center text-xs ${secondaryText}`}>
                And {overdueTasks.length - 5} more overdue task
                {overdueTasks.length - 5 === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
};

export default ProjectCalendar;
