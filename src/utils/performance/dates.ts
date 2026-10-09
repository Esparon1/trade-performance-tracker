

export function formatDate(

  date: Date,

): string {

  const year = date.getFullYear();

  const month = String(

    date.getMonth() + 1,

  ).padStart(

    2,

    "0",

  );

  const day = String(

    date.getDate(),

  ).padStart(

    2,

    "0",

  );

  return `${year}-${month}-${day}`;

}

export function createLocalDate(

  date: string,

): Date {

  const [

    year,

    month,

    day,

  ] = date

    .split("-")

    .map(Number);

  return new Date(

    year,

    month - 1,

    day,

  );

}

export function getMonthStartDate(

  year: number,

  month: number,

): string {

  return formatDate(

    new Date(

      year,

      month,

      1,

    ),

  );

}

export function getMonthEndDate(

  year: number,

  month: number,

): string {

  return formatDate(

    new Date(

      year,

      month + 1,

      0,

    ),

  );

}

export function addDays(

  date: string,

  days: number,

): string {

  const result = createLocalDate(date);

  result.setDate(

    result.getDate() + days,

  );

  return formatDate(result);

}

export function subtractMonths(

  date: string,

  months: number,

): string {

  const source = createLocalDate(date);

  const originalDay =

    source.getDate();

  const target = new Date(

    source.getFullYear(),

    source.getMonth() - months,

    1,

  );

  const lastDayOfTargetMonth =

    new Date(

      target.getFullYear(),

      target.getMonth() + 1,

      0,

    ).getDate();

  target.setDate(

    Math.min(

      originalDay,

      lastDayOfTargetMonth,

    ),

  );

  return formatDate(target);

}

export function subtractYears(

  date: string,

  years: number,

): string {

  const source = createLocalDate(date);

  const target = new Date(

    source.getFullYear() - years,

    source.getMonth(),

    1,

  );

  const lastDayOfTargetMonth =

    new Date(

      target.getFullYear(),

      target.getMonth() + 1,

      0,

    ).getDate();

  target.setDate(

    Math.min(

      source.getDate(),

      lastDayOfTargetMonth,

    ),

  );

  return formatDate(target);

}
