import { useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import { Search, PanelLeft, Moon, Sun, X, Command } from "lucide-react";
import { toggleTheme } from "../features/themeSlice";

const Navbar = ({ setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.theme);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isDark = theme === "dark";

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      setSearchValue("");
      event.currentTarget.blur();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex h-16 sm:h-[68px] w-full min-w-0 items-center gap-2 px-2.5 sm:gap-3 sm:px-6 xl:px-10">
        {/* Mobile menu and search */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-5">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((previous) => !previous)}
            aria-label="Toggle navigation sidebar"
            className="inline-flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 sm:hidden"
          >
            <PanelLeft size={19} />
          </button>

          <div
            className={`relative min-w-0 flex-1 transition-all duration-200 ${
              isSearchFocused ? "sm:max-w-lg" : "sm:max-w-md"
            }`}
          >
            <Search
              size={17}
              className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors sm:left-3.5 ${
                isSearchFocused
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400 dark:text-zinc-500"
              }`}
            />

            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search projects..."
              aria-label="Search projects and tasks"
              className="h-9 sm:h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-8 text-xs sm:pl-10 sm:pr-16 sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-700 dark:focus:border-indigo-500 dark:focus:bg-zinc-900 dark:focus:ring-indigo-500/10"
            />

            {searchValue ? (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                aria-label="Clear search"
                className="absolute right-1 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 sm:right-2 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <X size={15} />
              </button>
            ) : (
              <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-medium text-slate-400 sm:inline-flex dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
                <Command size={11} /> K
              </span>
            )}
          </div>
        </div>

        {/* Theme and profile */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <div className="mr-1 hidden h-8 w-px bg-slate-200 dark:bg-zinc-800 sm:block" />

          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            aria-label={
              isDark ? "Switch to light theme" : "Switch to dark theme"
            }
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="group inline-flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md active:translate-y-0 active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
          >
            {isDark ? (
              <Sun
                size={18}
                className="text-amber-400 transition-transform duration-300 group-hover:rotate-45"
              />
            ) : (
              <Moon
                size={18}
                className="transition-transform duration-300 group-hover:-rotate-12"
              />
            )}
          </button>

          <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800">
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "size-7 sm:size-8 rounded-full ring-2 ring-white dark:ring-zinc-800",
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
