import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { CreateOrganization, useAuth, useUser } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWorkspaces } from "../features/workspaceSlice";
import { loadTheme } from "../features/themeSlice";
import { BriefcaseBusiness, LoaderCircle, Layers3 } from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SignInPage from "../components/SignInPage";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const { workspaces, loading } = useSelector((state) => state.workspace);

  // Initialize the saved theme.
  useEffect(() => {
    dispatch(loadTheme());
  }, [dispatch]);

  // Fetch workspaces once authentication is ready and no request is active.
  useEffect(() => {
    if (isLoaded && user && workspaces.length === 0 && !loading) {
      dispatch(fetchWorkspaces({ getToken }));
    }
  }, [isLoaded, user, workspaces.length, loading, getToken, dispatch]);

  // Close the mobile drawer when entering desktop viewport size.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Authentication initialization.
  if (!isLoaded) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-50 px-6 dark:bg-zinc-950">
        {/* Subtle background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 size-80 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/10" />
          <div className="absolute -bottom-32 -right-32 size-80 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-500/10" />
        </div>

        <div className="relative flex w-full max-w-sm flex-col items-center text-center">
          {/* Brand icon */}
          <div className="relative mb-7">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Layers3 size={30} strokeWidth={1.8} />
            </div>

            {/* Loading indicator */}
            <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-white shadow-sm dark:bg-zinc-900">
              <LoaderCircle
                size={15}
                className="animate-spin text-indigo-600 dark:text-indigo-400"
              />
            </span>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Project Management
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">
            Preparing your workspace
          </p>

          {/* Progress indicator */}
          <div className="mt-7 h-1 w-44 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-indigo-600 dark:bg-indigo-400" />
          </div>

          <p className="mt-4 text-xs text-slate-400 dark:text-zinc-500">
            Securely initializing your session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SignInPage />;
  }

  // Workspace request in progress.

  {
    /* Workspace loading screen */
  }
  if (loading) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-50 px-6 dark:bg-zinc-950">
        {/* Soft background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 size-80 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/10" />
          <div className="absolute -bottom-32 -right-32 size-80 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-500/10" />
        </div>

        <div className="relative flex w-full max-w-sm flex-col items-center text-center">
          {/* Workspace icon */}
          <div className="relative mb-7">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <BriefcaseBusiness size={29} strokeWidth={1.8} />
            </div>

            <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-white shadow-sm dark:bg-zinc-900">
              <LoaderCircle
                size={15}
                className="animate-spin text-indigo-600 dark:text-indigo-400"
              />
            </span>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Loading your workspace
          </h1>

          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-zinc-400">
            Fetching your projects, tasks, and team information.
          </p>

          {/* Indeterminate progress bar */}
          <div className="mt-7 h-1 w-44 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-indigo-600 dark:bg-indigo-400" />
          </div>

          <p className="mt-4 text-xs text-slate-400 dark:text-zinc-500">
            This should only take a moment
          </p>
        </div>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4 dark:bg-zinc-950">
        <CreateOrganization />
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-white text-slate-900 dark:bg-zinc-950 dark:text-slate-100">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain p-4 sm:p-6 lg:p-8 xl:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
