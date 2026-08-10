"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

// ======================================================

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",

  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ======================================================

const statusColors: any = {
  PRESENT: "#22c55e",

  HALF_DAY: "#f59e0b",

  ABSENT: "#ef4444",

  PAID_LEAVE: "#3b82f6",

  UNPAID_LEAVE: "#8b5cf6",

  HOLIDAY: "#06b6d4",

  WEEKLY_OFF: "#64748b",
};

// ======================================================

const MonthlyAttendanceCalendar = () => {
  // ======================================================

  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());

  const [month, setMonth] = useState(today.getMonth() + 1);

  const [loading, setLoading] = useState(false);

  const [attendances, setAttendances] = useState<any[]>([]);

  const [selectedDay, setSelectedDay] = useState<any>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // ======================================================
  // MODAL CONTROLS (Escape + body scroll lock + scroll reset)
  // ======================================================

  const closeModal = () => setSelectedDay(null);

  useEffect(() => {
    if (!selectedDay) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedDay(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    document.body.style.overflow = "hidden";

    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);

      document.body.style.overflow = "";
    };
  }, [selectedDay]);

  // ======================================================
  // FETCH
  // ======================================================

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/attendance/monthly-attendance?year=${year}&month=${month}`,
      );

      setAttendances(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================

  useEffect(() => {
    fetchAttendance();
  }, [year, month]);

  // ======================================================
  // MAP
  // ======================================================

  const attendanceMap = useMemo(() => {
    const map: any = {};

    attendances.forEach((item: any) => {
      const date = new Date(item.date).getDate();

      map[date] = item;
    });

    return map;
  }, [attendances]);

  // ======================================================
  // CALENDAR
  // ======================================================

  const firstDay = new Date(year, month - 1, 1).getDay();

  const totalDays = new Date(year, month, 0).getDate();

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    calendarDays.push(day);
  }

  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime = (value: string) => {
    if (!value) return "--";

    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "2-digit",

      minute: "2-digit",
    });
  };

  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="attendance-page">
          {/* ====================================================== */}
          {/* HEADER */}
          {/* ====================================================== */}

          <div className="top-header">
            <div>
              <h1>Monthly Attendance</h1>

              <p>Employee self attendance calendar overview</p>
            </div>

            <div className="header-right">
              <div className="attendance-count">
                <h3>{attendances.length}</h3>

                <span>Total Records</span>
              </div>
            </div>
          </div>

          {/* ====================================================== */}
          {/* FILTER */}
          {/* ====================================================== */}

          <div className="filter-wrapper">
            <div className="filter-card">
              <label>Select Month</label>

              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {monthNames.map((item, index) => (
                  <option key={index} value={index + 1}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-card">
              <label>Select Year</label>

              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ====================================================== */}
          {/* LEGEND */}
          {/* ====================================================== */}

          <div className="legend-wrapper">
            {Object.keys(statusColors).map((status) => (
              <div className="legend-item" key={status}>
                <span
                  className="legend-color"
                  style={{
                    background: statusColors[status],
                  }}
                />

                <span>{status.replaceAll("_", " ")}</span>
              </div>
            ))}
          </div>

          {/* ====================================================== */}
          {/* CALENDAR */}
          {/* ====================================================== */}

          <div className="calendar-card">
            {/* HEADER */}

            <div className="calendar-header">
              {weekDays.map((day) => (
                <div key={`${year}-${month}-${day}`} className="week-name">
                  {day}
                </div>
              ))}
            </div>

            {/* BODY */}

            <div className="calendar-grid">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={index} className="empty-box" />;
                }

                const attendance = attendanceMap[day];

                const status = attendance?.status;

                const isToday =
                  today.getDate() === day &&
                  today.getMonth() + 1 === month &&
                  today.getFullYear() === year;

                return (
                  <div
                   key={`${year}-${month}-${day}`}
                    className={`
                          day-card
                          ${isToday ? "today-card" : ""}
                        `}
                    style={{
                      background: status
                        ? `${statusColors[status]}20`
                        : "#ffffff",

                      border: status
                        ? `1px solid ${statusColors[status]}40`
                        : "1px solid #eef2f7",
                    }}
                    onClick={() => attendance && setSelectedDay(attendance)}
                  >
                    {/* TOP */}

                    <div className="day-top">
                      <span className="day-number">{day}</span>

                      {status && (
                        <span
                          className="mini-badge"
                          style={{
                            background: statusColors[status],
                          }}
                        />
                      )}
                    </div>

                    {/* STATUS */}

                    {status ? (
                      <div className="attendance-info">
                        <p
                          className="status-text"
                          style={{
                            color: statusColors[status],
                          }}
                        >
                          {status.replaceAll("_", " ")}
                        </p>

                        <small>{formatTime(attendance?.check_in_time)}</small>
                      </div>
                    ) : (
                      <div className="no-data">No Attendance</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ====================================================== */}
          {/* LOADING */}
          {/* ====================================================== */}

          {loading && (
            <div className="loading-wrapper">
              <div className="loader" />
            </div>
          )}

          {/* ====================================================== */}
          {/* DETAILS MODAL */}
          {/* ====================================================== */}

          {selectedDay && (
            <div className="modal-overlay" onClick={closeModal}>
              <div
                className="details-modal"
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Attendance Details</h2>

                  <button
                    type="button"
                    className="modal-close"
                    aria-label="Close"
                    onClick={closeModal}
                  >
                    ✖
                  </button>
                </div>

                <div className="details-grid">
                  <div className="detail-card">
                    <label>Date</label>

                    <h4>{new Date(selectedDay.date).toDateString()}</h4>
                  </div>

                  <div className="detail-card">
                    <label>Status</label>

                    <h4>{selectedDay.status?.replaceAll("_", " ")}</h4>
                  </div>

                  <div className="detail-card">
                    <label>Check In</label>

                    <h4>{formatTime(selectedDay.check_in_time)}</h4>
                  </div>

                  <div className="detail-card">
                    <label>Check Out</label>

                    <h4>{formatTime(selectedDay.check_out_time)}</h4>
                  </div>

                  <div className="detail-card">
                    <label>Total Work</label>

                    <h4>{selectedDay.total_work_minutes || 0} mins</h4>
                  </div>

                  <div className="detail-card">
                    <label>Overtime</label>

                    <h4>{selectedDay.overtime_minutes || 0} mins</h4>
                  </div>
                </div>

                <button
                  type="button"
                  className="modal-bottom-close"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/* STYLE */}
          {/* ====================================================== */}

          <style jsx>{`
            .attendance-page {
              padding: 2px;
            }

            .top-header {
              display: flex;

              justify-content: space-between;

              align-items: center;

              margin-bottom: 10px;

              gap: 20px;
            }

            .top-header h1 {
              font-size: 34px;

              font-weight: 900;

              color: #0f172a;

              margin-bottom: 6px;
            }

            .top-header p {
              color: #64748b;

              font-size: 15px;
            }

            .attendance-count {
              background: linear-gradient(135deg, #deed08, #de0e19);

              color: white;

              padding: 20px 26px;

              border-radius: 24px;

              text-align: center;

              min-width: 140px;

              box-shadow: 0 12px 35px rgba(0, 0, 0, 0.18);
            }

            .attendance-count h3 {
              margin: 0;

              font-size: 30px;

              font-weight: 900;
            }

            .attendance-count span {
              font-size: 13px;

              opacity: 0.8;
            }

            .filter-wrapper {
              display: flex;

              gap: 20px;

              margin-bottom: 10px;
            }

            .filter-card {
              flex: 1;

              background: white;

              padding: 10px;

              border-radius: 22px;

              border: 1px solid #e2e8f0;

              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.04);
            }

            .filter-card label {
              display: block;

              margin-bottom: 1px;

              font-size: 13px;

              font-weight: 700;

              color: #166ae0;
            }

            .filter-card select {
              width: 100%;

              height: 52px;

              border-radius: 14px;

              border: 1px solid #dbe2ea;

              padding: 0 16px;

              font-size: 14px;

              outline: none;

              background: #f8fafc;
            }

            .legend-wrapper {
              display: flex;

              flex-wrap: wrap;

              gap: 12px;

              margin-bottom: 10px;
            }

            .legend-item {
              display: flex;

              align-items: center;

              gap: 10px;

              padding: 10px 16px;

              background: white;

              border-radius: 999px;

              border: 1px solid #e2e8f0;

              font-size: 13px;

              font-weight: 700;

              color: #334155;
            }

            .legend-color {
              width: 14px;

              height: 14px;

              border-radius: 50%;
            }

            .calendar-card {
              background: rgba(255, 255, 255, 0.8);

              backdrop-filter: blur(14px);

              border-radius: 30px;

              overflow: hidden;

              border: 1px solid rgba(255, 255, 255, 0.5);

              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
            }

            .calendar-header {
              display: grid;

              grid-template-columns: repeat(7, 1fr);

              background: linear-gradient(to right, #f8fafc, #f1f5f9);
            }

            .week-name {
              padding: 6px;

              text-align: center;

              font-size: 13px;

              font-weight: 800;

              color: #475569;

              text-transform: uppercase;

              letter-spacing: 1px;
            }

            .calendar-grid {
              display: grid;

              grid-template-columns: repeat(7, 1fr);
            }

            .empty-box {
           
              border-top: 1px solid #f1f5f9;

              border-right: 1px solid #f1f5f9;

              background: rgba(248, 250, 252, 0.5);
            }

            .day-card {
            min-height: 80px;
              padding: 10px;

              position: relative;

              overflow: hidden;

              cursor: pointer;

              transition: all 0.25s ease;

              backdrop-filter: blur(10px);
            }

            .day-card:hover {
              transform: translateY(-4px) scale(1.02);

              box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);

              z-index: 2;
            }

            .today-card {
              box-shadow: inset 0 0 0 2px #111827;
            }

            .today-card::after {
              content: "TODAY";

              position: absolute;

              top: 10px;

              right: 10px;

              font-size: 10px;

              font-weight: 800;

              background: #111827;

              color: white;

              padding: 4px 8px;

              border-radius: 999px;
            }

            .day-top {
              display: flex;

              justify-content: space-between;

              align-items: center;

              margin-bottom: 1px;
            }

            .day-number {
              font-size: 20px;

              font-weight: 900;

              color: #0f172a;
            }

            .mini-badge {
              width: 24px;

              height: 24px;

              border-radius: 50%;

              box-shadow: 0 0 15px rgba(0, 0, 0, 0.15);
            }

            .attendance-info {
              display: flex;

              flex-direction: column;

              gap: 8px;
            }

            .status-text {
              margin: 0;

              font-size: 13px;

              font-weight: 800;

              letter-spacing: 0.5px;
            }

            .attendance-info small {
              font-size: 12px;

              color: #475569;

              font-weight: 600;
            }

            .no-data {
              min-height: 60px;
              display: flex;

              align-items: center;

              justify-content: center;

              border-radius: 16px;

              background: rgba(248, 250, 252, 0.7);

              color: #94a3b8;

              font-size: 12px;

              font-weight: 600;
            }

            .loading-wrapper {
              display: flex;

              justify-content: center;

              margin-top: 24px;
            }

            .loader {
              width: 42px;

              height: 42px;

              border-radius: 50%;

              border: 4px solid #e2e8f0;

              border-top: 4px solid #111827;

              animation: spin 1s linear infinite;
            }

            @keyframes spin {
              100% {
                transform: rotate(360deg);
              }
            }

            .modal-overlay {
              position: fixed;

              inset: 0;

              background: rgba(0, 0, 0, 0.5);

              display: flex;

              justify-content: center;

              align-items: center;

              z-index: 9999;

              padding: 20px;

              animation: modalFadeIn 0.2s ease;
            }

            .details-modal {
              width: 100%;

              max-width: 760px;

              max-height: 88vh;

              overflow-y: auto;

              -webkit-overflow-scrolling: touch;

              background: rgba(255, 255, 255, 0.95);

              backdrop-filter: blur(18px);

              border-radius: 30px;

              padding: 30px;

              box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);

              animation: modalScaleIn 0.25s ease;
            }

            .modal-header {
              position: sticky;

              top: 0;

              display: flex;

              justify-content: space-between;

              align-items: center;

              margin-bottom: 24px;

              padding-bottom: 12px;

              background: rgba(255, 255, 255, 0.92);

              backdrop-filter: blur(10px);

              z-index: 1;
            }

            .modal-header h2 {
              font-size: 28px;

              font-weight: 900;

              color: #0f172a;
            }

            .modal-close {
              display: flex;

              align-items: center;

              justify-content: center;

              width: 44px;

              height: 44px;

              min-width: 44px;

              border: 1px solid #e2e8f0;

              background: #f8fafc;

              color: #334155;

              font-size: 18px;

              font-weight: 700;

              border-radius: 50%;

              cursor: pointer;

              transition: all 0.2s ease;
            }

            .modal-close:hover {
              background: #fee2e2;

              color: #b91c1c;

              border-color: #fecaca;
            }

            .modal-close:active {
              transform: scale(0.92);
            }

            .modal-bottom-close {
              width: 100%;

              margin-top: 22px;

              padding: 15px;

              border: none;

              border-radius: 16px;

              background: #111827;

              color: white;

              font-size: 16px;

              font-weight: 800;

              cursor: pointer;

              transition: all 0.2s ease;
            }

            .modal-bottom-close:hover {
              background: #1f2937;
            }

            .modal-bottom-close:active {
              transform: scale(0.99);
            }

            @keyframes modalFadeIn {
              from {
                opacity: 0;
              }

              to {
                opacity: 1;
              }
            }

            @keyframes modalScaleIn {
              from {
                opacity: 0;

                transform: scale(0.96) translateY(8px);
              }

              to {
                opacity: 1;

                transform: scale(1) translateY(0);
              }
            }

            .details-grid {
              display: grid;

              grid-template-columns: repeat(2, 1fr);

              gap: 18px;
            }

            .detail-card {
              border: 1px solid #eef2f7;

              border-radius: 20px;

              padding: 22px;

              background: linear-gradient(
                to bottom right,
                rgba(255, 255, 255, 0.95),
                rgba(248, 250, 252, 0.9)
              );

              transition: 0.2s ease;
            }

            .detail-card:hover {
              transform: translateY(-2px);

              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
            }

            .detail-card label {
              font-size: 12px;

              font-weight: 700;

              color: #64748b;

              margin-bottom: 10px;

              display: block;

              text-transform: uppercase;

              letter-spacing: 1px;
            }

            .detail-card h4 {
              margin: 0;

              font-size: 17px;

              font-weight: 800;

              color: #0f172a;
            }

            @media (max-width: 992px) {
              .calendar-grid {
                grid-template-columns: repeat(7, 1fr);
              }

              .calendar-header {
                // display: none;
              }
            }

            @media (max-width: 768px) {
              .top-header {
                flex-direction: column;

                align-items: flex-start;
              }

              .filter-wrapper {
                flex-direction: column;
              }

              .calendar-grid {
                grid-template-columns: repeat(3, 1fr);
              }

              .details-grid {
                grid-template-columns: 1fr;
              }

              .calendar-header {
                display: none;
              }

              .modal-overlay {
                padding: 0;

                align-items: flex-end;
              }

              .details-modal {
                max-width: 100%;

                max-height: 90vh;

                border-radius: 24px 24px 0 0;

                padding: 20px 20px 24px;

                animation: modalSheetIn 0.28s ease;
              }

              @keyframes modalSheetIn {
                from {
                  opacity: 0;

                  transform: translateY(100%);
                }

                to {
                  opacity: 1;

                  transform: translateY(0);
                }
              }
            }

            @media (max-width: 500px) {
              .calendar-grid {
                grid-template-columns: repeat(3, 1fr);
              }

              .day-card {
                min-height: 50px;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default MonthlyAttendanceCalendar;
