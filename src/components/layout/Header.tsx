import { supabase } from "../../lib/supabase";

export default function Header() {
  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold text-white">
          Esparon Portfolio
        </h1>

        <p className="mt-2 text-neutral-400">
          Track your daily trading performance.
        </p>
      </div>

      <button
        type="button"
        onClick={() => void handleLogout()}
        className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-300 hover:border-neutral-600 hover:text-white"
      >
        Log out
      </button>
    </header>
  );
}