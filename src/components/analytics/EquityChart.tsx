import { useMemo, useRef, useState } from "react";
import type { EquityCurvePoint } from "../../utils/performance";
import { formatMoney, shortMoney, formatChartDate, valueTone } from "./formatters";

type ChartMode =

  | "equity"

  | "pnl";



interface ChartPoint {

  date: string;

  value: number;

  dailyPnl: number;

  cashFlow: number;

}



function getPointX(

  index: number,

  count: number,

  width: number,

  paddingX: number,

): number {

  if (count <= 1) {

    return width / 2;

  }



  return (

    paddingX +

    (index / (count - 1)) *

      (width - paddingX * 2)

  );

}



function getPointY(

  value: number,

  height: number,

  paddingY: number,

  minValue: number,

  maxValue: number,

): number {

  const range =

    maxValue - minValue || 1;



  return (

    paddingY +

    ((maxValue - value) /

      range) *

      (height - paddingY * 2)

  );

}



export default function EquityChart({

  points,

  currency,

}: {

  points: EquityCurvePoint[];

  currency: string;

}) {

  const width = 1000;

  const height = 320;

  const paddingX = 16;

  const paddingY = 24;



  const [

    mode,

    setMode,

  ] = useState<ChartMode>(

    "equity",

  );



  const [

    activeIndex,

    setActiveIndex,

  ] = useState<

    number | null

  >(null);



  const chartRef =

    useRef<HTMLDivElement>(

      null,

    );



  const chartPoints =

    useMemo<ChartPoint[]>(

      () => {

        let cumulativePnl = 0;



        return points.map(

          (point) => {

            cumulativePnl +=

              point.pnl;



            return {

              date: point.date,

              value:

                mode ===

                "equity"

                  ? point.equity

                  : cumulativePnl,

              dailyPnl:

                point.pnl,

              cashFlow:

                point.cashFlow,

            };

          },

        );

      },

      [points, mode],

    );



  if (

    chartPoints.length === 0

  ) {

    return (

      <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/30 backdrop-blur-md">

        <div className="flex h-72 items-center justify-center text-sm text-neutral-600">

          No chart data is

          available for this

          period.

        </div>

      </div>

    );

  }



  const values =

    chartPoints.map(

      (point) => point.value,

    );



  const actualMin =

    Math.min(...values);

  const actualMax =

    Math.max(...values);



  const spread =

    actualMax - actualMin;



  const visualPadding =

    spread > 0

      ? spread * 0.12

      : Math.max(

          Math.abs(

            actualMax,

          ) * 0.05,

          100,

        );



  const minValue =

    actualMin - visualPadding;

  const maxValue =

    actualMax + visualPadding;



  const path =

    chartPoints

      .map(

        (point, index) => {

          const x = getPointX(

            index,

            chartPoints.length,

            width,

            paddingX,

          );



          const y = getPointY(

            point.value,

            height,

            paddingY,

            minValue,

            maxValue,

          );



          return `${

            index === 0

              ? "M"

              : "L"

          } ${x.toFixed(

            2,

          )} ${y.toFixed(

            2,

          )}`;

        },

      )

      .join(" ");



  const areaPath =

    `${path} L ${

      width - paddingX

    } ${height} L ${paddingX} ${height} Z`;



  const firstPoint =

    chartPoints[0];



  const lastPoint =

    chartPoints[

      chartPoints.length - 1

    ];



  const chartChange =

    lastPoint.value -

    firstPoint.value;



  const gridValues =

    Array.from(

      { length: 5 },

      (_, index) =>

        maxValue -

        ((maxValue -

          minValue) /

          4) *

          index,

    );



  const dateIndexes =

    Array.from(

      new Set(

        [

          0,

          0.25,

          0.5,

          0.75,

          1,

        ].map(

          (ratio) =>

            Math.round(

              (chartPoints.length -

                1) *

                ratio,

            ),

        ),

      ),

    );



  const selectedPoint =

    activeIndex === null

      ? null

      : chartPoints[

          activeIndex

        ];



  const selectedX =

    activeIndex === null

      ? null

      : getPointX(

          activeIndex,

          chartPoints.length,

          width,

          paddingX,

        );



  const selectedY =

    selectedPoint === null

      ? null

      : getPointY(

          selectedPoint.value,

          height,

          paddingY,

          minValue,

          maxValue,

        );



  const handlePointerPosition = (

    clientX: number,

  ) => {

    const element =

      chartRef.current;



    if (!element) {

      return;

    }



    const rect =

      element.getBoundingClientRect();



    if (rect.width <= 0) {

      return;

    }



    const ratio =

      Math.min(

        1,

        Math.max(

          0,

          (clientX -

            rect.left) /

            rect.width,

        ),

      );



    const index =

      Math.round(

        ratio *

          (chartPoints.length -

            1),

      );



    setActiveIndex(index);

  };



  const headlineValue =

    mode === "equity"

      ? lastPoint.value

      : lastPoint.value;



  const headlineDetail =

    mode === "equity"

      ? `Equity change ${formatMoney(

          chartChange,

          true,

        )}`

      : "Cumulative realized P/L";



  return (

    <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-black/30 backdrop-blur-md">

      <div className="flex flex-col gap-5 border-b border-white/[0.06] px-5 py-5 lg:flex-row lg:items-start lg:justify-between sm:px-6">

        <div className="flex flex-col gap-4">

          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">

              {mode ===

              "equity"

                ? "Equity Curve"

                : "Cumulative P/L"}

            </p>



            <p className="mt-2 text-sm text-neutral-500">

              {mode ===

              "equity"

                ? "Tracked account value over the selected period."

                : "Cumulative realized trading profit over the selected period."}

            </p>

          </div>



          <div className="flex w-fit rounded-xl border border-white/[0.07] bg-black/40 p-1">

            <button

              type="button"

              onClick={() => {

                setMode(

                  "equity",

                );

                setActiveIndex(

                  null,

                );

              }}

              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition ${

                mode ===

                "equity"

                  ? "bg-white/[0.09] text-white"

                  : "text-neutral-500 hover:text-neutral-200"

              }`}

            >

              Equity

            </button>



            <button

              type="button"

              onClick={() => {

                setMode("pnl");

                setActiveIndex(

                  null,

                );

              }}

              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition ${

                mode === "pnl"

                  ? "bg-white/[0.09] text-white"

                  : "text-neutral-500 hover:text-neutral-200"

              }`}

            >

              Cumulative P/L

            </button>

          </div>

        </div>



        <div className="lg:text-right">

          <p

            className={`text-2xl font-semibold tracking-tight ${

              mode === "pnl"

                ? valueTone(

                    headlineValue,

                  )

                : "text-white"

            }`}

          >

            {formatMoney(

              headlineValue,

              mode === "pnl",

            )}

          </p>



          <p

            className={`mt-1 text-xs font-medium ${

              mode === "equity"

                ? valueTone(

                    chartChange,

                  )

                : valueTone(

                    headlineValue,

                  )

            }`}

          >

            {headlineDetail}

          </p>

        </div>

      </div>



      <div className="px-4 pb-5 pt-6 sm:px-6">

        <div className="flex gap-3">

          <div className="flex h-[320px] w-14 shrink-0 flex-col justify-between py-5 text-right text-[11px] text-neutral-600">

            {gridValues.map(

              (value) => (

                <span

                  key={value}

                >

                  {shortMoney(

                    value,

                  )}

                </span>

              ),

            )}

          </div>



          <div className="min-w-0 flex-1">

            <div

              ref={chartRef}

              className="relative h-[320px] touch-pan-y overflow-hidden rounded-lg"

              onPointerMove={(

                event,

              ) =>

                handlePointerPosition(

                  event.clientX,

                )

              }

              onPointerDown={(

                event,

              ) =>

                handlePointerPosition(

                  event.clientX,

                )

              }

              onPointerLeave={(

                event,

              ) => {

                if (

                  event.pointerType ===

                  "mouse"

                ) {

                  setActiveIndex(

                    null,

                  );

                }

              }}

            >

              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-6">

                {gridValues.map(

                  (value) => (

                    <div

                      key={value}

                      className="border-t border-white/[0.055]"

                    />

                  ),

                )}

              </div>



              <svg

                viewBox={`0 0 ${width} ${height}`}

                preserveAspectRatio="none"

                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"

                role="img"

                aria-label={`${

                  mode === "equity"

                    ? "Equity"

                    : "Cumulative realized profit and loss"

                } curve in ${currency}`}

              >

                <defs>

                  <linearGradient

                    id={`analytics-area-${mode}`}

                    x1="0"

                    y1="0"

                    x2="0"

                    y2="1"

                  >

                    <stop

                      offset="0%"

                      stopColor="rgb(52 211 153)"

                      stopOpacity="0.18"

                    />

                    <stop

                      offset="100%"

                      stopColor="rgb(52 211 153)"

                      stopOpacity="0"

                    />

                  </linearGradient>

                </defs>



                <path

                  d={areaPath}

                  fill={`url(#analytics-area-${mode})`}

                />



                <path

                  d={path}

                  fill="none"

                  stroke="rgb(110 231 183)"

                  strokeWidth="3"

                  vectorEffect="non-scaling-stroke"

                  strokeLinecap="round"

                  strokeLinejoin="round"

                />



                {selectedX !==

                  null && (

                  <>

                    <line

                      x1={

                        selectedX

                      }

                      x2={

                        selectedX

                      }

                      y1="0"

                      y2={

                        height

                      }

                      stroke="rgb(163 163 163)"

                      strokeOpacity="0.35"

                      strokeWidth="1"

                      vectorEffect="non-scaling-stroke"

                      strokeDasharray="4 5"

                    />



                    {selectedY !==

                      null && (

                      <circle

                        cx={

                          selectedX

                        }

                        cy={

                          selectedY

                        }

                        r="5"

                        fill="rgb(110 231 183)"

                        stroke="rgb(10 10 10)"

                        strokeWidth="3"

                        vectorEffect="non-scaling-stroke"

                      />

                    )}

                  </>

                )}

              </svg>



              {selectedPoint &&

                selectedX !==

                  null && (

                  <div

                    className={`pointer-events-none absolute top-3 z-10 w-52 rounded-xl border border-white/[0.1] bg-neutral-950/95 p-3 shadow-xl backdrop-blur-md ${

                      selectedX >

                      width / 2

                        ? "right-3"

                        : "left-3"

                    }`}

                  >

                    <p className="text-xs font-semibold text-neutral-300">

                      {formatChartDate(

                        selectedPoint.date,

                      )}

                    </p>



                    <div className="mt-3 space-y-2">

                      <div className="flex items-center justify-between gap-4">

                        <span className="text-xs text-neutral-500">

                          {mode ===

                          "equity"

                            ? "Equity"

                            : "Cumulative P/L"}

                        </span>



                        <span

                          className={`text-xs font-semibold ${

                            mode ===

                            "pnl"

                              ? valueTone(

                                  selectedPoint.value,

                                )

                              : "text-white"

                          }`}

                        >

                          {formatMoney(

                            selectedPoint.value,

                            mode ===

                              "pnl",

                          )}

                        </span>

                      </div>



                      <div className="flex items-center justify-between gap-4">

                        <span className="text-xs text-neutral-500">

                          Daily P/L

                        </span>



                        <span

                          className={`text-xs font-semibold ${valueTone(

                            selectedPoint.dailyPnl,

                          )}`}

                        >

                          {formatMoney(

                            selectedPoint.dailyPnl,

                            true,

                          )}

                        </span>

                      </div>



                      {mode ===

                        "equity" && (

                        <div className="flex items-center justify-between gap-4">

                          <span className="text-xs text-neutral-500">

                            Cash Flow

                          </span>



                          <span

                            className={`text-xs font-semibold ${valueTone(

                              selectedPoint.cashFlow,

                            )}`}

                          >

                            {formatMoney(

                              selectedPoint.cashFlow,

                              true,

                            )}

                          </span>

                        </div>

                      )}

                    </div>

                  </div>

                )}

            </div>



            <div className="mt-3 flex justify-between gap-2 text-[11px] text-neutral-600">

              {dateIndexes.map(

                (index) => (

                  <span

                    key={`${chartPoints[index].date}-${index}`}

                    className="whitespace-nowrap"

                  >

                    {formatChartDate(

                      chartPoints[

                        index

                      ].date,

                    )}

                  </span>

                ),

              )}

            </div>

          </div>

        </div>



        <p className="mt-4 text-xs text-neutral-700">

          Hover the chart for

          exact values. On touch

          devices, tap or drag

          across the chart.

        </p>

      </div>

    </div>

  );

}
