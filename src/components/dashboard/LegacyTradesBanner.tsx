import type { Account } from "../../types/account";

interface LegacyTradesBannerProps {
  count: number;
  account: Account | null;
  loading: boolean;
  onAssign: () => void;
}

export default function LegacyTradesBanner({
  count, account: selectedAccount, loading: migrationLoading, onAssign,
}: LegacyTradesBannerProps) {
  return (
    <>
{count >

          0 &&

          selectedAccount && (

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4 backdrop-blur-md">

              <div>

                <p className="text-sm font-medium text-amber-200">

                  {

                    count

                  }{" "}

                  older{" "}

                  {count ===

                  1

                    ? "trade"

                    : "trades"}{" "}

                  need an account.

                </p>

                <p className="mt-1 text-xs text-neutral-400">

                  Assign them to{" "}

                  <span className="font-medium text-neutral-200">

                    {

                      selectedAccount.name

                    }

                  </span>{" "}

                  using{" "}

                  {

                    selectedAccount.defaultCurrency

                  }{" "}

                  as their currency.

                </p>

              </div>

              <button

                type="button"

                disabled={

                  migrationLoading

                }

                onClick={() =>

                  onAssign()

                }

                className="rounded-xl border border-amber-400/25 bg-amber-500/[0.08] px-4 py-2.5 text-sm font-medium text-amber-200 transition hover:border-amber-400/45 hover:bg-amber-500/[0.13] disabled:cursor-not-allowed disabled:opacity-50"

              >

                {migrationLoading

                  ? "Assigning..."

                  : `Assign to ${selectedAccount.name}`}

              </button>

            </div>

          )}
    </>
  );
}
