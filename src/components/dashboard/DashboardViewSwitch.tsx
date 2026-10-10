export type DashboardView = "calendar" | "analytics" | "journal";

interface DashboardViewSwitchProps {
  selected: DashboardView;
  onChange: (view: DashboardView) => void;
}

const views: { id: DashboardView; label: string }[] = [
  { id: "calendar", label: "Calendar" },
  { id: "analytics", label: "Analytics" },
  { id: "journal", label: "Journal" },
];

export default function DashboardViewSwitch({ selected, onChange }: DashboardViewSwitchProps) {
  return (
    <div className="mb-6 flex justify-center">
      <div className="inline-flex rounded-xl border border-white/[0.08] bg-black/30 p-1 backdrop-blur-md">
        {views.map(view => (
          <button key={view.id} type="button" onClick={() => onChange(view.id)}
            aria-pressed={selected === view.id}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${selected === view.id
              ? "bg-white/[0.09] text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-200"}`}>
            {view.label}
          </button>
        ))}
      </div>
    </div>
  );
}
