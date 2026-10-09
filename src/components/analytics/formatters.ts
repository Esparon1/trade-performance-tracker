export function formatLocalDate(

  date: Date,

): string {

  const year = date.getFullYear();

  const month = String(

    date.getMonth() + 1,

  ).padStart(2, "0");

  const day = String(

    date.getDate(),

  ).padStart(2, "0");



  return `${year}-${month}-${day}`;

}



export function formatMoney(

  value: number | null,

  signed = false,

): string {

  if (value === null) {

    return "—";

  }



  const rounded =

    Math.round(value);

  const absolute =

    Math.abs(

      rounded,

    ).toLocaleString("en-CA");



  if (!signed) {

    return `$${absolute}`;

  }



  if (rounded > 0) {

    return `+$${absolute}`;

  }



  if (rounded < 0) {

    return `-$${absolute}`;

  }



  return "$0";

}



export function formatPercentage(

  value: number | null,

): string {

  if (value === null) {

    return "—";

  }



  const normalized =

    Math.abs(value) < 0.05

      ? 0

      : value;



  return `${normalized > 0 ? "+" : ""}${normalized.toFixed(1)}%`;

}



export function valueTone(

  value: number | null,

): string {

  if (

    value === null ||

    value === 0

  ) {

    return "text-white";

  }



  return value > 0

    ? "text-emerald-300"

    : "text-red-300";

}

export function shortMoney(

  value: number,

): string {

  const absolute =

    Math.abs(value);



  if (absolute >= 1_000_000) {

    return `$${(

      value / 1_000_000

    ).toFixed(1)}M`;

  }



  if (absolute >= 1_000) {

    return `$${(

      value / 1_000

    ).toFixed(0)}k`;

  }



  return `$${Math.round(

    value,

  )}`;

}



export function formatChartDate(

  dateString: string,

): string {

  const [

    year,

    month,

    day,

  ] = dateString

    .split("-")

    .map(Number);



  return new Intl.DateTimeFormat(

    "en-CA",

    {

      month: "short",

      day: "numeric",

      year: "numeric",

    },

  ).format(

    new Date(

      year,

      month - 1,

      day,

    ),

  );

}

export function formatRatio(

  value: number | null,

): string {

  if (value === null) {

    return "—";

  }



  return value.toFixed(2);

}
