"use client";

import React, {
  useEffect,
  useState,
} from "react";

import axiosInstance from "@/utils/axiosInstance";

type Holiday = {

  id: number;

  title: string;

  date: string;

  type:
    | "NATIONAL"
    | "FESTIVAL"
    | "COMPANY"
    | "OPTIONAL";

  isPaid: boolean;
};

const UpcomingHolidayWidget = () => {

  const [loading, setLoading] =
    useState(false);

  const [holidays, setHolidays] =
    useState<Holiday[]>([]);

  // ============================================
  // FETCH HOLIDAYS
  // ============================================

  const fetchUpcomingHolidays =
    async () => {

      try {

        setLoading(true);

        const res =
          await axiosInstance.get(
            "/holiday"
          );

        const allHolidays =
          res?.data?.data || [];

        // ======================================
        // FILTER UPCOMING
        // ======================================

        const today =
          new Date();

        const upcoming =
          allHolidays
            .filter(
              (
                item: Holiday
              ) =>
                new Date(
                  item.date
                ) >= today
            )
            .sort(
              (
                a: Holiday,
                b: Holiday
              ) =>
                new Date(
                  a.date
                ).getTime() -
                new Date(
                  b.date
                ).getTime()
            )
            .slice(0, 5);

        setHolidays(
          upcoming
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  // ============================================
  // USE EFFECT
  // ============================================

  useEffect(() => {

    fetchUpcomingHolidays();

  }, []);

  // ============================================
  // BADGE
  // ============================================

  const getBadgeClass =
    (
      type: string
    ) => {

      switch (type) {

        case "NATIONAL":
          return "bg-primary";

        case "FESTIVAL":
          return "bg-success";

        case "COMPANY":
          return "bg-warning text-dark";

        case "OPTIONAL":
          return "bg-secondary";

        default:
          return "bg-dark";
      }
    };

  // ============================================
  // DAYS LEFT
  // ============================================

  const getDaysLeft =
    (
      date: string
    ) => {

      const today =
        new Date();

      const holidayDate =
        new Date(date);

      const diff =
        holidayDate.getTime() -
        today.getTime();

      return Math.ceil(
        diff /
          (1000 *
            60 *
            60 *
            24)
      );
    };

  return (

    <div className="card border-0 shadow-sm h-100">

      {/* HEADER */}

      <div className="card-header bg-white border-0 pb-0">

        <div className="d-flex justify-content-between align-items-center">

          <div>

            <h5 className="fw-bold mb-1">
              🎉 Upcoming Holidays
            </h5>

            <small className="text-muted">
              Next company holidays
            </small>

          </div>

        </div>

      </div>

      {/* BODY */}

      <div className="card-body">

        {loading ? (

          <div className="text-center py-4">

            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            />

            <p className="mt-2 mb-0 small">
              Loading...
            </p>

          </div>

        ) : holidays.length ===
          0 ? (

          <div className="text-center py-4 text-muted">

            No upcoming holidays

          </div>

        ) : (

          <div className="d-flex flex-column gap-3">

            {holidays.map(
              (item) => {

                const daysLeft =
                  getDaysLeft(
                    item.date
                  );

                return (

                  <div
                    key={item.id}
                    className="d-flex justify-content-between align-items-center border rounded p-3"
                  >

                    {/* LEFT */}

                    <div>

                      <div className="fw-semibold">

                        {
                          item.title
                        }

                      </div>

                      <div className="small text-muted">

                        {new Date(
                          item.date
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",

                            month:
                              "short",

                            year:
                              "numeric",
                          }
                        )}

                      </div>

                      <div className="mt-1">

                        <span
                          className={`badge ${getBadgeClass(item.type)}`}
                        >

                          {
                            item.type
                          }

                        </span>

                        {item.isPaid && (

                          <span className="badge bg-success ms-1">

                            Paid

                          </span>
                        )}

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="text-end">

                      <div className="fw-bold text-primary">

                        {daysLeft ===
                        0
                          ? "Today"
                          : `${daysLeft} Days`}

                      </div>

                      <small className="text-muted">
                        Left
                      </small>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default UpcomingHolidayWidget;