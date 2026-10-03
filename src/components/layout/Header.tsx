import { supabase } from "../../lib/supabase";

export default function Header() {
  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="mb-10 flex flex-wrap items-center justify-between gap-6 px-3 sm:px-6">

      {/* ============================================= */}
      {/* BRAND                                         */}
      {/* ============================================= */}

      <div className="flex items-center gap-4">

        {/* Logo */}
        <div className="flex h-10 w-10 shrink-0 items-end justify-center gap-[3px] rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] pb-2.5 shadow-[0_0_25px_rgba(16,185,129,0.08)] backdrop-blur-md">
          <span className="h-2 w-[4px] rounded-full bg-emerald-500/70" />
          <span className="h-4 w-[4px] rounded-full bg-emerald-400" />
          <span className="h-6 w-[4px] rounded-full bg-emerald-300" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Performance Tracker
          </h1>

          
        </div>
      </div>

      {/* ============================================= */}
      {/* HEADER ACTIONS                                */}
      {/* ============================================= */}

      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={() => void handleLogout()}
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