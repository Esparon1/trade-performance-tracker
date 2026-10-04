import type {
  Account,
} from "../../types/account";

interface AccountSelectorProps {
  accounts: Account[];

  selectedAccountId: string | null;

  onAccountChange: (
    accountId: string,
  ) => void;

  onOpenSettings: () => void;
}

export default function AccountSelector({
  accounts,
  selectedAccountId,
  onAccountChange,
  onOpenSettings,
}: AccountSelectorProps) {
  if (accounts.length === 0) {
    return (
      <section className="mb-6 rounded-2xl border border-emerald-500/15 bg-black/30 p-5 backdrop-blur-md">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
              Active account
            </p>

            <p className="mt-2 text-sm text-neutral-300">
              Create your first account to start organizing your trades.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:border-emerald-400/45 hover:bg-emerald-500/[0.13]"
          >
            Create account
          </button>

        </div>

      </section>
    );
  }

  return (
    <section className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-white/[0.07] bg-black/25 px-5 py-4 shadow-[0_15px_45px_rgba(0,0,0,0.15)] backdrop-blur-md">

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
          Active account
        </p>

        <select
          value={
            selectedAccountId ?? ""
          }
          onChange={(event) =>
            onAccountChange(
              event.target.value,
            )
          }
          className="h-11 min-w-[220px] rounded-xl border border-white/[0.10] bg-[#151817] px-4 text-sm font-medium text-neutral-200 outline-none transition focus:border-emerald-500/40"
        >
          {accounts.map(
            (account) => (
              <option
                key={account.id}
                value={account.id}
              >
                {account.name} ·{" "}
                {account.defaultCurrency}
              </option>
            ),
          )}
        </select>
      </div>

      <div className="text-right">
        <p className="text-xs text-neutral-500">
          Calendar and statistics
        </p>

        <p className="mt-1 text-sm text-neutral-300">
          Selected account only
        </p>
      </div>

    </section>
  );
}