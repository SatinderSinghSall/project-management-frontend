import { useEffect, useMemo, useState } from "react";
import {
  UsersIcon,
  Search,
  UserPlus,
  Mail,
  Shield,
  Activity,
  X,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { useSelector } from "react-redux";

import InviteMemberDialog from "../components/InviteMemberDialog";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

const Team = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dataError, setDataError] = useState("");
  const [avatarErrors, setAvatarErrors] = useState({});
  const [isChecking, setIsChecking] = useState(false);

  const currentWorkspace = useSelector(
    (state) => state?.workspace?.currentWorkspace ?? null,
  );

  const workspaceProjects = Array.isArray(currentWorkspace?.projects)
    ? currentWorkspace.projects
    : [];
  const users = Array.isArray(currentWorkspace?.members)
    ? currentWorkspace.members
    : [];
  const tasks = useMemo(
    () =>
      workspaceProjects.flatMap((project) =>
        Array.isArray(project?.tasks) ? project.tasks : [],
      ),
    [workspaceProjects],
  );

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;

    return users.filter((member) => {
      const name = member?.user?.name || "";
      const email = member?.user?.email || "";
      const role = member?.role || "";
      return [name, email, role].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [users, searchTerm]);

  useEffect(() => {
    setDataError("");
    setAvatarErrors({});
    if (
      currentWorkspace &&
      ((currentWorkspace.members != null &&
        !Array.isArray(currentWorkspace.members)) ||
        (currentWorkspace.projects != null &&
          !Array.isArray(currentWorkspace.projects)))
    ) {
      setDataError(
        "The workspace returned data in an unexpected format. Refresh the page or select the workspace again.",
      );
    }
  }, [currentWorkspace]);

  const handleCheckWorkspace = () => {
    setIsChecking(true);
    setDataError("");
    // Workspace data is managed by Redux; this checks the currently available state.
    if (!currentWorkspace) {
      setDataError(
        "No workspace is currently available. Select a workspace and try again.",
      );
    } else if (
      (currentWorkspace.members != null &&
        !Array.isArray(currentWorkspace.members)) ||
      (currentWorkspace.projects != null &&
        !Array.isArray(currentWorkspace.projects))
    ) {
      setDataError(
        "Workspace data could not be read. Refresh the page and try again.",
      );
    }
    setIsChecking(false);
  };

  const stats = [
    {
      label: "Total Members",
      value: users.length,
      icon: UsersIcon,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
      note: "In this workspace",
    },
    {
      label: "Active Projects",
      value: workspaceProjects.filter(
        (project) =>
          project?.status !== "CANCELLED" && project?.status !== "COMPLETED",
      ).length,
      icon: Activity,
      color:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
      note: "Currently underway",
    },
    {
      label: "Total Tasks",
      value: tasks.length,
      icon: Shield,
      color:
        "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300",
      note: "Across all projects",
    },
  ];

  const avatar = (member, size = "size-9") => {
    const name = member?.user?.name || "Unknown user";
    const avatarKey =
      member?.id || member?.user?.id || member?.user?.email || name;
    const image = member?.user?.image;

    return image && !avatarErrors[avatarKey] ? (
      <img
        src={image}
        alt=""
        loading="lazy"
        onError={() =>
          setAvatarErrors((previous) => ({ ...previous, [avatarKey]: true }))
        }
        className={`${size} shrink-0 rounded-full bg-gray-100 object-cover ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10`}
      />
    ) : (
      <span
        aria-label={name}
        className={`${size} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-semibold text-indigo-700 ring-1 ring-black/5 dark:from-blue-500/20 dark:to-indigo-500/20 dark:text-indigo-200 dark:ring-white/10`}
      >
        {getInitials(name)}
      </span>
    );
  };

  const roleBadge = (role) => {
    const isAdmin = role === "ADMIN";
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
          isAdmin
            ? "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-500/20"
            : "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700"
        }`}
      >
        {isAdmin ? (
          <Shield className="size-3" />
        ) : (
          <CheckCircle2 className="size-3" />
        )}
        {role || "MEMBER"}
      </span>
    );
  };

  return (
    <main className="w-full min-w-0 space-y-6 pb-8">
      <InviteMemberDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />

      {/* Header — same layout, with a little more refinement */}
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="size-2 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
              Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
            Team
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Manage team members and their contributions
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:translate-y-0"
        >
          <UserPlus className="mr-2 size-4" />
          Invite Member
        </button>
      </header>

      {dataError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800 shadow-sm dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">We couldn’t load the team properly</p>
            <p className="mt-1 leading-5">{dataError}</p>
            <button
              type="button"
              onClick={handleCheckWorkspace}
              className="mt-2 inline-flex items-center gap-1.5 font-semibold underline decoration-red-300 underline-offset-4 hover:no-underline"
            >
              <RefreshCw
                className={`size-3.5 ${isChecking ? "animate-spin" : ""}`}
              />
              Try again
            </button>
          </div>
          <button
            type="button"
            onClick={() => setDataError("")}
            aria-label="Dismiss error"
            className="rounded-md p-1 transition hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Stats — now evenly fill the available content width */}
      <section
        aria-label="Team statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {stats.map(({ label, value, icon: Icon, color, note }) => (
          <div
            key={label}
            className="group min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 dark:hover:border-zinc-700 sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
                  {value}
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
                  {note}
                </p>
              </div>
              <div
                className={`rounded-xl p-3 transition-transform duration-200 group-hover:scale-105 ${color}`}
              >
                <Icon className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Directory */}
      <section className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Team members
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              {searchTerm.trim()
                ? `${filteredUsers.length} matching ${filteredUsers.length === 1 ? "member" : "members"}`
                : `${users.length} ${users.length === 1 ? "person" : "people"} in your workspace`}
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <label className="relative block min-w-0 flex-1 sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
              <input
                type="search"
                placeholder="Search name, email, or role..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search team members"
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/80 pl-9 pr-9 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-white dark:placeholder:text-zinc-500 dark:focus:bg-zinc-800"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-zinc-700 dark:hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </label>
            <button
              type="button"
              onClick={handleCheckWorkspace}
              disabled={isChecking}
              title="Check workspace data"
              aria-label="Check workspace data"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-wait disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              <RefreshCw
                className={`size-4 ${isChecking ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {currentWorkspace == null ? (
          <div
            className="flex flex-col items-center px-5 py-14 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
              <LoaderCircle className="size-5 animate-spin text-blue-600 dark:text-blue-300" />
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              Loading your team…
            </p>
            <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-zinc-400">
              We’re getting your workspace members ready.
            </p>
          </div>
        ) : dataError ? (
          <div className="px-5 py-10 text-center">
            <AlertCircle className="mx-auto mb-2 size-6 text-red-500" />
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              Team data is temporarily unavailable
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              Use “Try again” above after checking your workspace.
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center sm:py-14">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gray-100 ring-1 ring-gray-200/70 dark:bg-zinc-800 dark:ring-zinc-700">
              <UsersIcon className="size-6 text-gray-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {searchTerm ? "No members found" : "No team members yet"}
            </h3>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-gray-500 dark:text-zinc-400">
              {searchTerm
                ? "Try another name, email, or role, or clear your search."
                : "Invite your teammates to start collaborating in this workspace."}
            </p>
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
              >
                Clear search
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                <UserPlus className="mr-2 size-4" />
                Invite your first member
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table uses the full available width instead of max-w-4xl */}
            <div className="hidden w-full overflow-x-auto sm:block">
              <table className="w-full min-w-[620px] border-collapse text-left">
                <thead className="bg-gray-50/80 dark:bg-zinc-800/60">
                  <tr className="border-b border-gray-100 dark:border-zinc-800">
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400"
                    >
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {filteredUsers.map((member, index) => {
                    const name = member?.user?.name || "Unknown user";
                    const email = member?.user?.email || "";
                    const key =
                      member?.id ||
                      member?.user?.id ||
                      email ||
                      `${name}-${index}`;
                    return (
                      <tr
                        key={key}
                        className="transition-colors duration-150 hover:bg-blue-50/40 dark:hover:bg-zinc-800/40"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex min-w-0 items-center gap-3">
                            {avatar(member, "size-9")}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {name}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-400 dark:text-zinc-500">
                                Workspace member
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {email ? (
                            <a
                              href={`mailto:${email}`}
                              className="inline-flex max-w-full items-center gap-2 text-sm text-gray-600 transition hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
                            >
                              <Mail className="size-3.5 shrink-0 text-gray-400" />
                              <span className="truncate">{email}</span>
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No email provided
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {roleBadge(member?.role)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile layout */}
            <div className="divide-y divide-gray-100 dark:divide-zinc-800 sm:hidden">
              {filteredUsers.map((member, index) => {
                const name = member?.user?.name || "Unknown user";
                const email = member?.user?.email || "";
                const key =
                  member?.id || member?.user?.id || email || `${name}-${index}`;
                return (
                  <article
                    key={key}
                    className="flex items-start gap-3 p-4 transition-colors hover:bg-gray-50/80 dark:hover:bg-zinc-800/40"
                  >
                    {avatar(member, "size-10")}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words text-sm font-semibold text-gray-900 dark:text-white">
                          {name}
                        </p>
                        {roleBadge(member?.role)}
                      </div>
                      {email ? (
                        <a
                          href={`mailto:${email}`}
                          className="mt-1.5 inline-flex max-w-full items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                        >
                          <Mail className="size-3.5 shrink-0" />
                          <span className="break-all">{email}</span>
                        </a>
                      ) : (
                        <p className="mt-1.5 text-sm text-gray-400">
                          No email provided
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {currentWorkspace && !dataError && users.length > 0 && (
          <footer className="flex flex-col gap-1 border-t border-gray-100 bg-gray-50/70 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-800/20 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Showing{" "}
              <span className="font-semibold text-gray-700 dark:text-zinc-200">
                {filteredUsers.length}
              </span>{" "}
              of {users.length} members
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              Team directory
            </p>
          </footer>
        )}
      </section>
    </main>
  );
};

export default Team;
