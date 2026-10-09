export type DashboardView = "calendar" | "analytics";

interface DashboardViewSwitchProps {
  selected: DashboardView;
  onChange: (view: DashboardView) => void;
}

export default function DashboardViewSwitch({
  selected: dashboardView, onChange: setDashboardView,
}: DashboardViewSwitchProps) {
  return (
    <>

          <div className="mb-6 flex justify-center">

            <div className="inline-flex rounded-xl border border-white/[0.08] bg-black/30 p-1 backdrop-blur-md">

              <button

                type="button"

                onClick={() => setDashboardView("calendar")}

                className={`rounded-lg px-5 py-2 text-sm font-medium transition ${

                  dashboardView === "calendar"

                    ? "bg-white/[0.09] text-white shadow-sm"

                    : "text-neutral-500 hover:text-neutral-200"

                }`}

              >

                Calendar

              </button>

              <button

                type="button"

                onClick={() => setDashboardView("analytics")}

                className={`rounded-lg px-5 py-2 text-sm font-medium transition ${

                  dashboardView === "analytics"

                    ? "bg-white/[0.09] text-white shadow-sm"

                    : "text-neutral-500 hover:text-neutral-200"

                }`}

              >

                Analytics

              </button>

            </div>

          </div>

    </>
  );
}
