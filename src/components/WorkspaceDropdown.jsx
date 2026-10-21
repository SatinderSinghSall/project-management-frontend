import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  CircleHelp,
  FolderKanban,
  LoaderCircle,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { useClerk, useOrganizationList } from "@clerk/clerk-react";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "W";

function WorkspaceDropdown() {
  const { setActive, userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  const { openCreateOrganization } = useClerk();
  const { workspaces = [], currentWorkspace = null } = useSelector(
    (state) => state.workspace || {},
  );

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [imageErrors, setImageErrors] = useState({});
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const memberships = userMemberships?.data || [];

  const filteredMemberships = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return memberships;
    return memberships.filter(({ organization }) =>
      String(organization?.name || "")
        .toLowerCase()
        .includes(query),
    );
  }, [memberships, search]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearch("");
  }, []);

  const onSelectWorkspace = async (organizationId) => {
    if (
      !organizationId ||
      organizationId === currentWorkspace?.id ||
      isSwitching
    ) {
      closeDropdown();
      return;
    }

    setIsSwitching(true);
    try {
      await setActive({ organization: organizationId });
      dispatch(setCurrentWorkspace(organizationId));
      closeDropdown();
      navigate("/");
    } catch (error) {
      console.error("Failed to switch workspace:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  useEffect(() => {
    if (currentWorkspace?.id && isLoaded) {
      setActive({ organization: currentWorkspace.id }).catch((error) => {
        console.error("Failed to sync active workspace:", error);
      });
    }
  }, [currentWorkspace?.id, isLoaded, setActive]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDropdown();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeDropdown]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  const renderWorkspaceIcon = (organization, size = "size-9") => {
    const name = organization?.name || "Workspace";
    const imageUrl = organization?.imageUrl || organization?.image_url;
    const imageKey = `${organization?.id || name}-${imageUrl || ""}`;

    if (imageUrl && !imageErrors[imageKey]) {
      return (
        <img
          src={imageUrl}
          alt=""
          onError={() =>
            setImageErrors((previous) => ({ ...previous, [imageKey]: true }))
          }
          className={`${size} shrink-0 rounded-xl border border-black/5 bg-zinc-100 object-cover dark:border-white/10 dark:bg-zinc-800`}
        />
      );
    }

    return (
      <span
        aria-hidden="true"
        className={`${size} flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm shadow-blue-600/20`}
      >
        {getInitials(name)}
      </span>
    );
  };

  const currentWorkspaceImage = currentWorkspace
    ? {
        id: currentWorkspace.id,
        name: currentWorkspace.name || "Workspace",
        imageUrl: currentWorkspace.image_url || currentWorkspace.imageUrl,
      }
    : null;

  return (
    <div className="relative mx-2 my-3" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
        className={`group flex min-h-[68px] w-full items-center gap-2.5 rounded-xl border px-2.5 py-3 text-left transition duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15 ${
          isOpen
            ? "border-blue-200 bg-blue-50/70 dark:border-blue-500/30 dark:bg-blue-500/10"
            : "border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900"
        }`}
      >
        {currentWorkspaceImage ? (
          renderWorkspaceIcon(currentWorkspaceImage, "size-9")
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
            <FolderKanban className="size-4" />
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
            {currentWorkspace?.name || "Select workspace"}
          </span>
          <span className="mt-0.5 block truncate text-xs text-zinc-500 dark:text-zinc-400">
            {workspaces.length} workspace{workspaces.length === 1 ? "" : "s"}
          </span>
        </span>

        {isSwitching ? (
          <LoaderCircle className="size-4 shrink-0 animate-spin text-blue-600" />
        ) : (
          <ChevronDown
            className={`size-4 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-[100] w-[min(320px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/10 ring-1 ring-black/5 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/30 dark:ring-white/5"
          role="dialog"
          aria-label="Choose workspace"
        >
          <div className="border-b border-zinc-100 p-3 dark:border-zinc-800">
            <div className="flex items-center justify-between px-1 pb-2">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Your workspaces
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Switch the workspace you’re working in
                </p>
              </div>
              <button
                type="button"
                onClick={closeDropdown}
                aria-label="Close workspace menu"
                className="flex size-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                ref={searchRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search workspaces…"
                aria-label="Search workspaces"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:bg-zinc-950"
              />
            </div>
          </div>

          <div
            className="max-h-64 overflow-y-auto p-2"
            role="listbox"
            aria-label="Available workspaces"
          >
            {!isLoaded ? (
              <div className="flex items-center justify-center gap-2 px-3 py-7 text-sm text-zinc-500 dark:text-zinc-400">
                <LoaderCircle className="size-4 animate-spin" />
                Loading workspaces…
              </div>
            ) : filteredMemberships.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-7 text-center">
                <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <CircleHelp className="size-5" />
                </span>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  {search ? "No matching workspaces" : "No workspaces found"}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {search
                    ? "Try another name."
                    : "Create a workspace to start collaborating."}
                </p>
              </div>
            ) : (
              filteredMemberships.map(({ organization }) => {
                const selected = currentWorkspace?.id === organization.id;

                return (
                  <button
                    key={organization.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={isSwitching}
                    onClick={() => onSelectWorkspace(organization.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-wait disabled:opacity-60 ${
                      selected
                        ? "bg-blue-50 dark:bg-blue-500/10"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {renderWorkspaceIcon(organization, "size-9")}
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm font-semibold ${
                          selected
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-zinc-800 dark:text-zinc-100"
                        }`}
                      >
                        {organization.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                        {typeof organization.membersCount === "number"
                          ? `${organization.membersCount} member${organization.membersCount === 1 ? "" : "s"}`
                          : "Workspace"}
                      </span>
                    </span>
                    {selected && (
                      <Check className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    )}
                    {isSwitching && !selected && (
                      <LoaderCircle className="size-4 shrink-0 animate-spin text-zinc-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-zinc-100 bg-zinc-50/80 p-2 dark:border-zinc-800 dark:bg-zinc-950/60">
            <button
              type="button"
              onClick={() => {
                closeDropdown();
                openCreateOrganization();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:hover:bg-zinc-900"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                <Plus className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  Create workspace
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                  Start a new team space
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceDropdown;
