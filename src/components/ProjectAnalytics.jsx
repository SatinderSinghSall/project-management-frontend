import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Users,
  ListTodo,
  ChartNoAxesCombined,
} from "lucide-react";

const CHART_COLORS = {
  status: "#3b82f6",
  TODO: "#94a3b8",
  IN_PROGRESS: "#f59e0b",
  DONE: "#10b981",
  TASK: "#3b82f6",
  BUG: "#ef4444",
  FEATURE: "#8b5cf6",
  IMPROVEMENT: "#f59e0b",
  OTHER: "#64748b",
};

const PRIORITY_STYLES = {
  LOW: {
    text: "text-slate-600 dark:text-slate-300",
    bar: "bg-slate-400",
    dot: "bg-slate-400",
  },
  MEDIUM: {
    text: "text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  HIGH: {
    text: "text-red-700 dark:text-red-400",
    bar: "bg-red-500",
    dot: "bg-red-500",
  },
};

const formatLabel = (value) =>
  String(value || "Unknown")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const MetricCard = ({ label, value, icon: Icon, tone, description }) => {
  const tones = {
    blue: {
      icon: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      value: "text-slate-900 dark:text-white",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      value: "text-emerald-700 dark:text-emerald-400",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      value: "text-amber-700 dark:text-amber-400",
    },
    red: {
      icon: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
      value: "text-red-700 dark:text-red-400",
    },
    purple: {
      icon: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
      value: "text-violet-700 dark:text-violet-400",
    },
  };

  const style = tones[tone] || tones.blue;

  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            {label}
          </p>
          <p
            className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${style.value}`}
          >
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${style.icon}`}
        >
          <Icon size={19} strokeWidth={1.8} />
        </div>
      </div>
    </article>
  );
};

const ChartCard = ({ title, description, children, className = "" }) => (
  <section
    className={`min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${className}`}
  >
    <div className="border-b border-slate-100 px-5 py-4 dark:border-zinc-800 sm:px-6">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-400">
          {description}
        </p>
      )}
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </section>
);

const EmptyChart = ({ message = "No data available yet." }) => (
  <div className="flex h-[260px] flex-col items-center justify-center text-center">
    <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-zinc-900 dark:text-zinc-500">
      <ChartNoAxesCombined size={21} />
    </div>
    <p className="mt-3 text-sm font-medium text-slate-600 dark:text-zinc-300">
      Nothing to display
    </p>
    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">{message}</p>
  </div>
);

const ProjectAnalytics = ({ project, tasks = [] }) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const { stats, statusData, typeData, priorityData } = useMemo(() => {
    const now = new Date();

    const stats = {
      total: safeTasks.length,
      completed: 0,
      inProgress: 0,
      todo: 0,
      overdue: 0,
    };

    const statusMap = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    const typeMap = {
      TASK: 0,
      BUG: 0,
      FEATURE: 0,
      IMPROVEMENT: 0,
      OTHER: 0,
    };
    const priorityMap = { LOW: 0, MEDIUM: 0, HIGH: 0 };

    safeTasks.forEach((task) => {
      if (task.status === "DONE") stats.completed += 1;
      if (task.status === "IN_PROGRESS") stats.inProgress += 1;
      if (task.status === "TODO") stats.todo += 1;

      if (
        task.due_date &&
        !Number.isNaN(new Date(task.due_date).getTime()) &&
        new Date(task.due_date) < now &&
        task.status !== "DONE"
      ) {
        stats.overdue += 1;
      }

      if (statusMap[task.status] !== undefined) {
        statusMap[task.status] += 1;
      }

      if (typeMap[task.type] !== undefined) {
        typeMap[task.type] += 1;
      }

      if (priorityMap[task.priority] !== undefined) {
        priorityMap[task.priority] += 1;
      }
    });

    return {
      stats,
      statusData: Object.entries(statusMap).map(([key, value]) => ({
        name: formatLabel(key),
        key,
        value,
      })),
      typeData: Object.entries(typeMap)
        .filter(([, value]) => value > 0)
        .map(([key, value]) => ({
          name: formatLabel(key),
          key,
          value,
        })),
      priorityData: Object.entries(priorityMap).map(([key, value]) => ({
        name: formatLabel(key),
        key,
        value,
        percentage:
          safeTasks.length > 0
            ? Math.round((value / safeTasks.length) * 100)
            : 0,
      })),
    };
  }, [safeTasks]);

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const metrics = [
    {
      label: "Completion rate",
      value: `${completionRate}%`,
      description: `${stats.completed} of ${stats.total} tasks completed`,
      icon: CheckCircle2,
      tone: "green",
    },
    {
      label: "In progress",
      value: stats.inProgress,
      description: "Currently being worked on",
      icon: Clock3,
      tone: "blue",
    },
    {
      label: "Overdue tasks",
      value: stats.overdue,
      description: "Unfinished tasks past their due date",
      icon: AlertTriangle,
      tone: "red",
    },
    {
      label: "Team members",
      value: project?.members?.length || 0,
      description: "People on this project",
      icon: Users,
      tone: "purple",
    },
  ];

  const chartTheme = {
    tick: { fill: "#64748b", fontSize: 12 },
    axis: { stroke: "#e2e8f0" },
    grid: "#e2e8f0",
  };

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      {/* Section introduction */}
      <div>
        <div className="flex items-center gap-2">
          <ChartNoAxesCombined
            size={20}
            className="text-slate-500 dark:text-zinc-400"
          />
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Project analytics
          </h2>
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-zinc-400">
          A breakdown of task completion, workload, and priorities
          {project?.name ? ` for ${project.name}` : ""}.
        </p>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {stats.total === 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-10 dark:border-zinc-800 dark:bg-zinc-950 sm:py-14">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
              <ListTodo size={23} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              Analytics will appear here
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">
              This project has no tasks yet. Once your team creates tasks,
              you’ll see status, type, and priority breakdowns here.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Charts */}
          <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
            <ChartCard
              title="Tasks by status"
              description="See how work is distributed across task stages."
            >
              {statusData.some((item) => item.value > 0) ? (
                <div className="h-[280px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statusData}
                      margin={{ top: 10, right: 8, left: -18, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={chartTheme.grid}
                      />
                      <XAxis
                        dataKey="name"
                        tick={chartTheme.tick}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        domain={[0, "dataMax"]}
                        tick={chartTheme.tick}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(148, 163, 184, 0.10)" }}
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid #e2e8f0",
                          fontSize: 12,
                        }}
                        formatter={(value) => [value, "Tasks"]}
                      />
                      <Bar
                        dataKey="value"
                        name="Tasks"
                        fill={CHART_COLORS.status}
                        radius={[5, 5, 0, 0]}
                        maxBarSize={56}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart />
              )}
            </ChartCard>

            <ChartCard
              title="Tasks by type"
              description="Understand the mix of work within this project."
            >
              {typeData.length > 0 ? (
                <>
                  <div className="h-[250px] min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={92}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {typeData.map((item) => (
                            <Cell
                              key={item.key}
                              fill={CHART_COLORS[item.key] || "#64748b"}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            fontSize: 12,
                          }}
                          formatter={(value, name) => [
                            `${value} task${value === 1 ? "" : "s"}`,
                            name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {typeData.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400"
                      >
                        <span
                          className="size-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_COLORS[item.key] || "#64748b",
                          }}
                        />
                        <span>{item.name}</span>
                        <span className="font-semibold tabular-nums text-slate-800 dark:text-zinc-200">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyChart message="Task types will appear as tasks are categorized." />
              )}
            </ChartCard>
          </div>

          {/* Priority breakdown */}
          <ChartCard
            title="Tasks by priority"
            description="Compare the number and proportion of tasks at each priority level."
          >
            <div className="space-y-6">
              {priorityData.map((item) => {
                const style = PRIORITY_STYLES[item.key];

                return (
                  <div key={item.key} className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`size-2.5 rounded-full ${style.dot}`}
                        />
                        <span className="text-sm font-medium text-slate-800 dark:text-zinc-200">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                          {item.value} {item.value === 1 ? "task" : "tasks"}
                        </span>
                        <span
                          className={`min-w-[48px] rounded-md border border-slate-200 px-2 py-1 text-center text-xs font-medium dark:border-zinc-700 ${style.text}`}
                        >
                          {item.percentage}%
                        </span>
                      </div>
                    </div>

                    <div
                      className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"
                      role="progressbar"
                      aria-label={`${item.name} priority tasks`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={item.percentage}
                    >
                      <div
                        className={`h-full rounded-full transition-[width] duration-500 ${style.bar}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </>
      )}
    </div>
  );
};

export default ProjectAnalytics;
