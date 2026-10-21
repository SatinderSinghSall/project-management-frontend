import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Plus,
  Search,
  FolderOpen,
  SlidersHorizontal,
  X,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  FolderKanban,
  ArrowRight,
} from "lucide-react";

import ProjectCard from "../components/ProjectCard";
import CreateProjectDialog from "../components/CreateProjectDialog";

export default function Projects() {
  const workspace = useSelector((state) => state?.workspace || {});

  const projects = workspace.currentWorkspace?.projects || [];
  const loading = workspace.loading || false;
  const error = workspace.error || null;

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "ALL",
    priority: "ALL",
  });

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    filters.status !== "ALL" ||
    filters.priority !== "ALL";

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const name = String(project.name || "").toLowerCase();
      const description = String(project.description || "").toLowerCase();

      const matchesSearch =
        !query || name.includes(query) || description.includes(query);

      const matchesStatus =
        filters.status === "ALL" || project.status === filters.status;

      const matchesPriority =
        filters.priority === "ALL" || project.priority === filters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projects, searchTerm, filters]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      status: "ALL",
      priority: "ALL",
    });
  };

  const retryLoading = () => {
    // Connect this to your workspace fetch thunk if needed.
    window.location.reload();
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 sm:space-y-8">
      {/* Page heading */}
      <section className="flex flex-col gap-5 border-b border-slate-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Projects
            </h1>

            {!loading && !error && (
              <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium tabular-nums text-slate-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
              </span>
            )}
          </div>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-zinc-400">
            Organize your work, monitor progress, and manage project priorities
            from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:bg-blue-800"
        >
          <Plus size={17} />
          New Project
        </button>
      </section>

      {/* Search and filters */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={16}
            className="text-slate-500 dark:text-zinc-400"
          />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            Find a project
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_190px_180px_auto]">
          {/* Search */}
          <div className="relative min-w-0">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by project name or description"
              aria-label="Search projects"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:hover:border-zinc-700 dark:focus:border-blue-500"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((previous) => ({
                ...previous,
                status: event.target.value,
              }))
            }
            aria-label="Filter by project status"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-700"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PLANNING">Planning</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Priority */}
          <select
            value={filters.priority}
            onChange={(event) =>
              setFilters((previous) => ({
                ...previous,
                priority: event.target.value,
              }))
            }
            aria-label="Filter by project priority"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-700"
          >
            <option value="ALL">All priorities</option>
            <option value="HIGH">High priority</option>
            <option value="MEDIUM">Medium priority</option>
            <option value="LOW">Low priority</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              <X size={15} />
              Clear filters
            </button>
          )}
        </div>

        {!loading && !error && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-zinc-500">
            <p>
              Showing{" "}
              <span className="font-semibold text-slate-700 dark:text-zinc-300">
                {filteredProjects.length}
              </span>{" "}
              of {projects.length} projects
            </p>

            {hasActiveFilters && (
              <p>Results update automatically as you filter.</p>
            )}
          </div>
        )}
      </section>

      {/* Loading state */}
      {loading ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-slate-200 bg-white px-5 py-16 text-center dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <LoaderCircle size={23} className="animate-spin" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
            Loading projects
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Please wait while your workspace projects load.
          </p>
        </div>
      ) : error ? (
        /* Error state */
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50/70 p-6 dark:border-red-900/60 dark:bg-red-950/20 sm:p-8"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-300">
                We couldn't load your projects
              </h3>
              <p className="mt-1 text-sm leading-6 text-red-800/80 dark:text-red-300/80">
                {typeof error === "string"
                  ? error
                  : error.message || "Something went wrong. Please try again."}
              </p>

              <button
                type="button"
                onClick={retryLoading}
                className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20"
              >
                <RefreshCw size={15} />
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        /* Empty states */
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center dark:border-zinc-700 dark:bg-zinc-950 sm:py-16">
          <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            {hasActiveFilters ? (
              <Search size={24} strokeWidth={1.7} />
            ) : (
              <FolderOpen size={25} strokeWidth={1.7} />
            )}
          </div>

          <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">
            {hasActiveFilters ? "No matching projects" : "No projects yet"}
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-zinc-400">
            {hasActiveFilters
              ? "Try another search term or adjust your filters to find what you're looking for."
              : "Create a project to start organizing tasks, collaborating with your team, and tracking progress."}
          </p>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <X size={15} />
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              <Plus size={16} />
              Create your first project
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      ) : (
        /* Project grid */
        <section aria-label="Project results">
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      <CreateProjectDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </div>
  );
}
