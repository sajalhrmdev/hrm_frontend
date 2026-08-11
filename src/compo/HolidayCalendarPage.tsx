"use client";

import React, { useEffect, useMemo, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

type Holiday = {
  id: number;

  title: string;

  date: string;

  type: "NATIONAL" | "FESTIVAL" | "COMPANY" | "OPTIONAL";

  isPaid: boolean;

  isObserved: boolean;
};

const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const HolidayCalendarPage = () => {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [loading, setLoading] = useState(false);

  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // ============================================
  // FETCH HOLIDAYS
  // ============================================

  const fetchHolidays = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/holiday");

      setHolidays(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // ============================================
  // MONTH DATA
  // ============================================

  const monthData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);

    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const daysInMonth = lastDay.getDate();

    const startDay = firstDay.getDay();

    const calendarDays = [];

    // PREVIOUS EMPTY

    for (let i = 0; i < startDay; i++) {
      calendarDays.push(null);
    }

    // CURRENT MONTH DAYS

    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(currentYear, currentMonth, day));
    }

    return calendarDays;
  }, [currentMonth, currentYear]);

  // ============================================
  // FILTER HOLIDAYS
  // ============================================

  const currentMonthHolidays = holidays.filter((holiday) => {
    const date = new Date(holiday.date);

    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });

  // ============================================
  // FIND HOLIDAY
  // ============================================

  const getHoliday = (date: Date) => {
    return currentMonthHolidays.find((holiday) => {
      const hDate = new Date(holiday.date);

      return hDate.getDate() === date.getDate();
    });
  };

  // ============================================
  // MONTH CHANGE
  // ============================================

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);

      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);

      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  return (
    <div className="">
      <div className="">
        {/* TITLE */}

        <div className="text-center mb-4">
          <h1 className="fw-bold display-5 mb-2">Holiday Calendar</h1>

          <div
            style={{
              //   width: 220,

              height: 4,

              background: "#dc3545",

              margin: "0 auto",

              borderRadius: 20,
            }}
          />
        </div>

        {/* MAIN CARD */}

        <div className="calendar-wrapper">
          {/* TOP BAR */}

          <div className="calendar-top">
            {/* LEFT */}

            <div className="d-flex align-items-center gap-3">
              <button className="nav-btn" onClick={handlePrevMonth}>
                ❮
              </button>

              <h2 className="month-title mb-0">
                {new Date(currentYear, currentMonth).toLocaleDateString(
                  "en-IN",
                  {
                    month: "long",

                    year: "numeric",
                  },
                )}
              </h2>

              <button className="nav-btn" onClick={handleNextMonth}>
                ❯
              </button>
            </div>
          </div>

          {/* BODY */}

          <div className="row g-4">
            {/* CALENDAR */}

            <div className="col-lg-7">
              {/* WEEK HEADER */}

              <div className="calendar-grid">
                {weekDays.map((day) => (
                  <div key={day} className="week-day">
                    {day}
                  </div>
                ))}

                {/* DAYS */}

                {monthData.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="empty-day" />;
                  }

                  const holiday = getHoliday(date);

                  const isToday =
                    date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      className={`calendar-day ${
                        holiday
                          ? !holiday.isObserved
                            ? "holiday-optional"
                            : holiday.isPaid
                              ? "holiday-paid"
                              : "holiday-unpaid"
                          : ""
                      } ${isToday ? "today-day" : ""}`}
                    >
                      <div className="day-number">{date.getDate()}</div>

                      {holiday && <div className="holiday-dot" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HOLIDAY LIST */}

            <div className="col-lg-5">
              <div className="holiday-list-card">
                <div className="holiday-list-header">Holidays of the Month</div>

                <div className="holiday-list-body">
                  {loading ? (
                    <SkeletonTable />
                  ) : currentMonthHolidays.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      No Holidays
                    </div>
                  ) : (
                    currentMonthHolidays
                      .sort(
                        (a, b) =>
                          new Date(a.date).getTime() -
                          new Date(b.date).getTime(),
                      )
                      .map((item) => {
                        const date = new Date(item.date);

                        return (
                          <div key={item.id} className="holiday-row">
                            {/* DATE */}

                            <div
                              className={`holiday-date ${
                                item.isObserved
                                  ? item.isPaid
                                    ? "paid-date"
                                    : "unpaid-date"
                                  : "optional-date"
                              }`}
                            >
                              {date.getDate()}
                            </div>

                            {/* TITLE */}

                            <div className="holiday-name">{item.title}</div>

                            {!item.isObserved && (
                              <span className="badge bg-secondary">
                                Display Only
                              </span>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STYLE */}

      <style jsx>{`
        .page-wrapper {
          display: flex;

          justify-content: center;
        }

        .content {
          width: 100%;

          max-width: 1140px;

          margin: 0 auto;
        }

        .calendar-wrapper {
          background: #f2f5fa;

          padding: 30px;

          border-radius: 12px;

          border: 1px solid #ddd;

          margin: 0 auto;

          max-width: 1100px;
        }

        .calendar-top {
          display: flex;

          justify-content: center;

          align-items: center;

          margin-bottom: 30px;
        }

        .month-title {
          font-size: 34px;

          font-weight: 700;

          color: #1d4ed8;
        }

        .nav-btn {
          border: none;

          background: white;

          width: 45px;

          height: 45px;

          border-radius: 50%;

          font-size: 20px;

          font-weight: bold;

          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

          transition: 0.2s;
        }

        .nav-btn:hover {
          transform: scale(1.08);

          background: #1d4ed8;

          color: white;
        }

        .calendar-grid {
          display: grid;

          grid-template-columns: repeat(7, 1fr);

          gap: 14px;
        }

        .week-day {
          background: #1663a8;

          color: white;

          text-align: center;

          padding: 14px;

          font-weight: 700;

          border-radius: 6px;
        }

        .calendar-day {
          background: white;

          min-height: 82px;

          border-radius: 6px;

          display: flex;

          justify-content: center;

          align-items: center;

          position: relative;

          font-size: 22px;

          font-weight: 700;

          border: 1px solid #ddd;

          transition: 0.2s;
        }

        .calendar-day:hover {
          transform: translateY(-2px);

          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        }

        .holiday-paid {
          background: #dc2626;

          color: white;
        }

        .holiday-unpaid {
          background: #15803d;

          color: white;
        }

        .holiday-optional {
          background: #f59e0b;

          color: white;

          border: 1px dashed #b45309;
        }

        .today-day {
          border: 3px solid #2563eb;
        }

        .holiday-dot {
          width: 8px;

          height: 8px;

          background: white;

          border-radius: 50%;

          position: absolute;

          bottom: 10px;
        }

        .holiday-list-card {
          background: white;

          border-radius: 8px;

          overflow: hidden;

          border: 1px solid #ddd;
        }

        .holiday-list-header {
          background: #ffe45c;

          padding: 16px;

          font-size: 24px;

          font-weight: 700;
        }

        .holiday-list-body {
          padding: 10px;
        }

        .holiday-row {
          display: flex;

          gap: 16px;

          align-items: center;

          padding: 14px;

          border-bottom: 1px solid #eee;
        }

        .holiday-date {
          width: 42px;

          height: 42px;

          border-radius: 4px;

          display: flex;

          justify-content: center;

          align-items: center;

          color: white;

          font-weight: 700;
        }

        .paid-date {
          background: #dc2626;
        }

        .unpaid-date {
          background: #15803d;
        }

        .optional-date {
          background: #f59e0b;
        }

        .holiday-name {
          font-size: 16px;

          font-weight: 600;
        }

        .empty-day {
          min-height: 82px;
        }

        @media (max-width: 768px) {
          .calendar-grid {
            gap: 8px;
          }

          .calendar-day {
            min-height: 60px;

            font-size: 16px;
          }

          .week-day {
            padding: 10px;

            font-size: 12px;
          }

          .month-title {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
};

export default HolidayCalendarPage;
