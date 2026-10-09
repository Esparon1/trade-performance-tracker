export default function KpiCard({

  label,

  value,

  detail,

  valueClassName = "text-white",

}: {

  label: string;

  value: string;

  detail: string;

  valueClassName?: string;

}) {

  return (

    <div className="rounded-2xl border border-white/[0.07] bg-black/30 p-5 backdrop-blur-md">

      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">

        {label}

      </p>



      <p

        className={`mt-3 text-2xl font-semibold tracking-tight sm:text-3xl ${valueClassName}`}

      >

        {value}

      </p>



      <p className="mt-2 text-xs text-neutral-600">

        {detail}

      </p>

    </div>

  );

}
