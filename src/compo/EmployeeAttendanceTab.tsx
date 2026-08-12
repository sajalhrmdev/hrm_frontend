"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { Tooltip } from "react-tooltip";

// ======================================================

type Props = {
  employeeId: number;
  companyId: number;
  isViewOnly?: boolean;
};

type CalendarDay = {
  day: number;
  status: string;
  record?: any;
};

// ======================================================

const STATUS_THEMES: Record<string, { label: string; bg: string; color: string }> = {
  PRESENT: { label: "Present", bg: "#dcfce7", color: "#166534" },
  ABSENT: { label: "Absent", bg: "#fee2e2", color: "#991b1b" },
  HALF_DAY: { label: "Half Day", bg: "#fef3c7", color: "#92400e" },
  HALF_DAY_LEAVE: { label: "Half Day Leave", bg: "#fef3c7", color: "#92400e" },
  WEEKLY_OFF: { label: "Weekly Off", bg: "#e0f2fe", color: "#075985" },
  HOLIDAY: { label: "Holiday", bg: "#e0e7ff", color: "#3730a3" },
  PAID_LEAVE: { label: "Paid Leave", bg: "#dbeafe", color: "#1d4ed8" },
  UNPAID_LEAVE: { label: "Unpaid Leave", bg: "#f3e8ff", color: "#6b21a8" },
  ON_DUTY: { label: "On Duty", bg: "#ccfbf1", color: "#0f766e" },
  WORK_FROM_HOME: { label: "Work From Home", bg: "#fef9c3", color: "#854d0e" },
};

// ======================================================

const EmployeeAttendanceTab = ({
  employeeId,
  companyId,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<any[]>([]);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchAttendance = async (y: number, m: number) => {
    try {
      setLoading(true);
      setError("");

      const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
      const endDate = `${y}-${String(m).padStart(2, "0")}-${new Date(
        y,
        m,
        0,
      ).getDate()}`;

      const res = await axiosInstance.get("/attendance/range", {
        params: {
          companyId,
          employeeId,
          startDate,
          endDate,
        },
      });

      setRecords(res?.data?.data || []);
    } catch (err: any) {
      console.log(err);
      setError(err?.response?.data?.message || "Failed to load attendance");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId && companyId) {
      fetchAttendance(year, month);
    }
  }, [employeeId, companyId, year, month]);

  // ======================================================
  // HELPERS
  // ======================================================

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;

    if (m < 1) {
      m = 12;
      y -= 1;
    }

    if (m > 12) {
      m = 1;
      y += 1;
    }

    setMonth(m);
    setYear(y);
  };

  const monthLabel = new Date(year, month - 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const formatTime = (value: string | null | undefined) => {
    if (!value) return "-";
    return new Date(value).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const formatMinutes = (minutes: number) => {
    if (!minutes || minutes <= 0) return "-";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  const getDay = (date: string) => {
    return Number(String(date).split("T")[0].split("-")[2]);
  };

  const statusTheme = (status: string) =>
    STATUS_THEMES[status] || { label: status || "-", bg: "#f3f4f6", color: "#374151" };

  // ======================================================
  // CALENDAR GENERATE
  // ======================================================

  const generateCalendar = (): (CalendarDay | null)[] => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();

    const map: Record<number, any> = {};
    records.forEach((r) => {
      map[getDay(r.date)] = r;
    });

    const days: (CalendarDay | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const record = map[i];
      days.push({
        day: i,
        status: record?.status || "NO_RECORD",
        record,
      });
    }

    return days;
  };

  const calendar = generateCalendar();

  // ======================================================
  // SUMMARY
  // ======================================================

  const summary = records.reduce(
    (acc, rec) => {
      if (
        rec.status === "PRESENT" ||
        rec.status === "ON_DUTY" ||
        rec.status === "WORK_FROM_HOME"
      ) {
        acc.present += 1;
      } else if (rec.status === "ABSENT" || rec.status === "UNPAID_LEAVE") {
        acc.absent += 1;
      } else if (rec.status === "HALF_DAY" || rec.status === "HALF_DAY_LEAVE") {
        acc.halfDay += 1;
      }

      acc.workMinutes += Number(rec.total_work_minutes) || 0;

      return acc;
    },
    { present: 0, absent: 0, halfDay: 0, workMinutes: 0 },
  );

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="attendance-page">
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="attendance-top-card">
        <div>
          <h3 className="attendance-title">📅 Employee Attendance</h3>
          <p className="attendance-subtitle">
            Monthly attendance calendar for the employee
          </p>
        </div>

        <div className="month-nav">
          <button
            type="button"
            className="month-btn"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className="month-label">{monthLabel}</span>
          <button
            type="button"
            className="month-btn"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
          >
            ›
          </button>
          <input
            type="month"
            className="month-input"
            value={`${year}-${String(month).padStart(2, "0")}`}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              if (!value) return;
              const [y, m] = value.split("-");
              setYear(Number(y));
              setMonth(Number(m));
            }}
          />
        </div>
      </div>

      {/* ====================================== */}
      {/* SUMMARY */}
      {/* ====================================== */}

      <div className="row g-4 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="summary-card st-card-present">
            <h6>Present</h6>
            <h3>{summary.present}</h3>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="summary-card st-card-absent">
            <h6>Absent</h6>
            <h3>{summary.absent}</h3>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="summary-card st-card-half">
            <h6>Half Day</h6>
            <h3>{summary.halfDay}</h3>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="summary-card st-card-hours">
            <h6>Total Work Hours</h6>
            <h3>{formatMinutes(summary.workMinutes)}</h3>
          </div>
        </div>
      </div>

      {/* ====================================== */}
      {/* CALENDAR */}
      {/* ====================================== */}

      <div className="attendance-card">
        <div className="card-header-custom">
          <div>
            <h5 className="card-title-custom">Attendance Calendar</h5>
            <p className="card-subtitle-custom">
              {monthLabel} • {records.length} day
              {records.length === 1 ? "" : "s"} with records
            </p>
          </div>
        </div>

        {loading ? (
          <div className="att-loading">
            <div className="loader" />
            <p className="mt-3 mb-0">Loading attendance…</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger mb-0">{error}</div>
        ) : (
          <>
            <div className="week-header">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <Tooltip
              id="attendance-tooltip"
              place="top"
              positionStrategy="fixed"
              offset={10}
              delayShow={200}
            />

            <div className="calendar-grid">
              {calendar.map((d, index) => {
                if (!d) return <div key={index}></div>;

                if (!d.record) {
                  return (
                    <div
                      key={index}
                      className="calendar-item calendar-empty"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <div className="day">{d.day}</div>
                      <div className="status">No record</div>
                    </div>
                  );
                }

                const content = `
                      <div>
                        <b>Date:</b>
                        ${String(d.record.date).split("T")[0]}
                        <br/>
                        <b>Status:</b>
                        ${statusTheme(d.record.status).label}
                        <br/>
                        <b>Check In:</b>
                        ${formatTime(d.record.check_in_time)}
                        <br/>
                        <b>Check Out:</b>
                        ${formatTime(d.record.check_out_time)}
                        <br/>
                        <b>Work:</b>
                        ${formatMinutes(d.record.total_work_minutes)}
                        <br/>
                        <b>OT:</b>
                        ${formatMinutes(d.record.overtime_minutes)}
                        <br/>
                        <b>Late:</b>
                        ${formatMinutes(d.record.late_minutes)}
                      </div>
                    `;

                const theme = statusTheme(d.status);

                return (
                  <div
                    key={index}
                    className="calendar-item"
                    data-tooltip-id="attendance-tooltip"
                    data-tooltip-html={content}
                    style={{
                      background: theme.bg,
                      color: theme.color,
                      animationDelay: `${index * 0.03}s`,
                    }}
                  >
                    <div className="day">{d.day}</div>
                    <div className="status">{theme.label}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ====================================== */}
      {/* STYLES */}
      {/* ====================================== */}

      <style jsx>{`
        .attendance-page {
          width: 100%;
        }

        .attendance-top-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 28px;
          border-radius: 22px;
          background: linear-gradient(
            135deg,
            #ffffff,
            #ecfeff
          );
          border: 1px solid #cffafe;
          box-shadow:
            0 8px 30px
            rgba(0, 0, 0, 0.06);
        }

        .attendance-title {
          font-size: 30px;
          font-weight: 800;
          margin-bottom: 6px;
          color: #111827;
        }

        .attendance-subtitle {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .month-nav {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .month-btn {
          width: 40px;
          height: 40px;
          border: 1px solid #a5f3fc;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            #f0fdfa,
            #ccfbf1
          );
          color: #0f766e;
          font-size: 22px;
          line-height: 1;
          font-weight: 700;
          cursor: pointer;
          box-shadow:
            0 6px 16px
            rgba(15, 118, 110, 0.12);
          transition: 0.2s ease;
        }

        .month-btn:hover {
          transform: translateY(-2px);
          box-shadow:
            0 10px 24px
            rgba(15, 118, 110, 0.18);
          background: linear-gradient(
            135deg,
            #ccfbf1,
            #99f6e4
          );
        }

        .month-label {
          min-width: 140px;
          text-align: center;
          font-size: 16px;
          font-weight: 800;
          color: #111827;
        }

        .month-input {
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          background: white;
          font-size: 14px;
          outline: none;
        }

        .summary-card {
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          box-shadow:
            0 8px 24px
            rgba(0, 0, 0, 0.05);
        }

        .summary-card h6 {
          margin-bottom: 12px;
          opacity: 0.75;
          font-size: 13px;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }

        .summary-card h3 {
          margin: 0;
          font-size: 32px;
          font-weight: 800;
        }

        .st-card-present {
          background: linear-gradient(
            135deg,
            #f0fdf4,
            #dcfce7
          );
          color: #166534;
        }

        .st-card-absent {
          background: linear-gradient(
            135deg,
            #fef2f2,
            #fee2e2
          );
          color: #991b1b;
        }

        .st-card-half {
          background: linear-gradient(
            135deg,
            #fffbeb,
            #fef3c7
          );
          color: #92400e;
        }

        .st-card-hours {
          background: linear-gradient(
            135deg,
            #eff6ff,
            #dbeafe
          );
          color: #1d4ed8;
        }

        .attendance-card {
          background: white;
          border-radius: 22px;
          padding: 28px;
          border: 1px solid #edf2f7;
          box-shadow:
            0 8px 30px
            rgba(0, 0, 0, 0.06);
        }

        .card-header-custom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .card-title-custom {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          color: #111827;
        }

        .card-subtitle-custom {
          margin: 4px 0 0;
          color: #6b7280;
          font-size: 13px;
        }

        .week-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-weight: bold;
          margin-bottom: 10px;
          color: #555;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 12px;
        }

        .calendar-item {
          padding: 14px;
          border-radius: 16px;
          text-align: center;
          font-weight: bold;
          cursor: pointer;
          transform: translateY(20px);
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
          box-shadow:
            0 4px 12px
            rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(15, 23, 42, 0.04);
          transition: all 0.25s ease;
          min-height: 90px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .calendar-item:hover {
          transform: scale(1.08) translateY(-3px);
          box-shadow:
            0 12px 28px
            rgba(15, 23, 42, 0.12);
          z-index: 5;
        }

        .day {
          font-size: 20px;
        }

        .status {
          font-size: 10px;
          opacity: 0.85;
          margin-top: 4px;
          word-break: break-word;
          line-height: 1.2;
        }

        .calendar-empty {
          background: #f9fafb;
          color: #9ca3af;
          cursor: default;
          box-shadow: none;
          border: 1px dashed #e5e7eb;
        }

        .calendar-empty .day,
        .calendar-empty .status {
          color: #c3c9d4;
          opacity: 1;
        }

        .calendar-empty:hover {
          transform: none;
          box-shadow: none;
        }

        .att-loading {
          height: 260px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .loader {
          width: 40px;
          height: 40px;
          border: 4px solid #ddd;
          border-top: 4px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: auto;
        }

        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .attendance-top-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .attendance-title {
            font-size: 24px;
          }

          .month-label {
            min-width: 120px;
          }

          .month-nav {
            flex-wrap: wrap;
          }

          .attendance-card {
            padding: 18px;
          }

          .calendar-grid {
            gap: 8px;
          }

          .calendar-item {
            padding: 10px;
            min-height: 75px;
          }

          .day {
            font-size: 16px;
          }

          .status {
            font-size: 9px;
          }
        }
      `}      </style>

      {/* GLOBAL TOOLTIP STYLE (not scoped, so it applies to the library-rendered tooltip) */}
      <style>{`
        .react-tooltip {
          z-index: 9999 !important;
          background: #ffffff !important;
          color: #111827 !important;
          border: 1px solid #eef2f7;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          line-height: 1.7;
        }

        .react-tooltip b {
          color: #111827;
        }

        .react-tooltip-arrow {
          background: #ffffff !important;
          border: 1px solid #eef2f7;
        }
      `}</style>
    </div>
  );
};

export default EmployeeAttendanceTab;
