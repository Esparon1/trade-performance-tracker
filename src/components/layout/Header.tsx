import { supabase } from "../../lib/supabase";

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({
  onOpenSettings,
}: HeaderProps) {
  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="mb-10 flex flex-wrap items-center justify-between gap-6 px-3 sm:px-6">

      {/* BRAND */}

      <div className="flex items-center gap-4">

        <div className="flex h-10 w-10 shrink-0 items-end justify-center gap-[3px] rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] pb-2.5 shadow-[0_0_25px_rgba(16,185,129,0.08)] backdrop-blur-md">
          <span className="h-2 w-[4px] rounded-full bg-emerald-500/70" />
          <span className="h-4 w-[4px] rounded-full bg-emerald-400" />
          <span className="h-6 w-[4px] rounded-full bg-emerald-300" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Performance Tracker
          </h1>
        </div>

      </div>

      {/* ACTIONS */}

      <div className="flex items-center gap-3">

        {/* SETTINGS */}

        <button
          type="button"
          onClick={
            onOpenSettings
          }
          className="
            group
            flex
            h-[42px]
            items-center
            gap-2
            rounded-xl
            border
            border-white/[0.10]
            bg-[#101513]/80
            px-4
            text-sm
            font-medium
            text-neutral-300
            backdrop-blur-md
            transition-all
            duration-300
            hover:border-emerald-400/40
            hover:bg-emerald-500/[0.08]
            hover:text-white
            hover:shadow-[0_0_25px_rgba(16,185,129,0.12)]
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-emerald-400"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="3"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1a1.7 1.7 0 0 0 1.1 1.5 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.15.37.36.7.6 1 .28.33.67.53 1.1.6h.1v4h-.1a1.7 1.7 0 0 0-1.7.4Z"
            />
          </svg>

          Settings
        </button>

        {/* LOGOUT */}

        <button
          type="button"
          onClick={() =>
            void handleLogout()
          }
          className="
            group
            relative
            overflow-hidden
            rounded-xl
            border
            border-emerald-500/20
            bg-[#101513]/80
            px-5
            py-2.5
            text-sm
            font-medium
            text-neutral-300
            shadow-[0_0_20px_rgba(16,185,129,0.05)]
            backdrop-blur-md
            transition-all
            duration-300
            hover:border-emerald-400/45
            hover:bg-emerald-500/[0.08]
            hover:text-white
            hover:shadow-[0_0_25px_rgba(16,185,129,0.14)]
          "
        >
          <span className="relative z-10 flex items-center gap-2">

            Log out

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-emerald-400"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 8l4 4-4 4"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 12H9"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"
              />
            </svg>

          </span>
        </button>

      </div>
    </header>
  );
}