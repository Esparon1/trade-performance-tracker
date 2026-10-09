import { useState } from "react";

export function useCalendarNavigation() {
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [year, setYear] = useState(() => new Date().getFullYear());

  function handlePreviousMonth() {

    if (month === 0) {

      setMonth(11);

      setYear(

        (

          currentYear,

        ) =>

          currentYear - 1,

      );

      return;

    }

    setMonth(

      (

        currentMonth,

      ) =>

        currentMonth - 1,

    );

  }

  function handleNextMonth() {

    if (month === 11) {

      setMonth(0);

      setYear(

        (

          currentYear,

        ) =>

          currentYear + 1,

      );

      return;

    }

    setMonth(

      (

        currentMonth,

      ) =>

        currentMonth + 1,

    );

  }

  return { month, year, setMonth, setYear, handlePreviousMonth, handleNextMonth };
}
