"use client";

import React, { useEffect, useMemo, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

// ======================================================

const statusColors: any = {
  PRESENT: "success",

  HALF_DAY: "warning",

  ABSENT: "danger",

  HOLIDAY: "info",

  PAID_LEAVE: "primary",

  UNPAID_LEAVE: "secondary",

  WEEKLY_OFF: "dark",
};

// ======================================================

const CompanyDailyAttendanceDashboard = () => {
  // ====================================================

  const [loading, setLoading] = useState(false);

  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [search, setSearch] = useState("");

  // ====================================================
  // FETCH
  // ====================================================

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/attendance/company-day?date=${selectedDate}`,
      );

      setAttendanceData(res?.data?.data || []);
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  // ====================================================
  // FILTERED
  // ====================================================

  const filteredData = useMemo(() => {
    return attendanceData.filter((item: any) => {
      const name = item?.employee?.name?.toLowerCase() || "";

      const code = item?.employee?.employeeCode?.toLowerCase() || "";

      return (
        name.includes(search.toLowerCase()) ||
        code.includes(search.toLowerCase())
      );
    });
  }, [attendanceData, search]);

  // ====================================================
  // SUMMARY
  // ====================================================

  const summary = useMemo(() => {
    return {
      total: attendanceData.length,

      present: attendanceData.filter((a: any) => a.status === "PRESENT").length,

      absent: attendanceData.filter((a: any) => a.status === "ABSENT").length,

      halfDay: attendanceData.filter((a: any) => a.status === "HALF_DAY")
        .length,

      leave: attendanceData.filter(
        (a: any) => a.status === "PAID_LEAVE" || a.status === "UNPAID_LEAVE",
      ).length,
    };
  }, [attendanceData]);

  // ====================================================
  // FORMAT TIME
  // ====================================================

  const formatTime = (value: string) => {
    if (!value) return "--";

    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "2-digit",

      minute: "2-digit",
    });
  };

  // ====================================================
  // FORMAT WORK
  // ====================================================

  const formatWork = (minutes: number) => {
    if (!minutes) return "0m";

    const hrs = Math.floor(minutes / 60);

    const mins = minutes % 60;

    return `${hrs}h ${mins}m`;
  };

  // ====================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="attendance-page">
          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <div className="top-header">
            <div>
              <h2>Daily Attendance Dashboard</h2>

              <p>
                Monitor company-wide attendance, work hours, overtime & employee
                statuses.
              </p>
            </div>

            <button className="refresh-btn" onClick={fetchAttendance}>
              🔄 Refresh
            </button>
          </div>

          {/* ================================= */}
          {/* SUMMARY */}
          {/* ================================= */}

          <div className="summary-grid">
            <div className="summary-card">
              <span>Total</span>

              <h3>{summary.total}</h3>
            </div>

            <div className="summary-card success">
              <span>Present</span>

              <h3>{summary.present}</h3>
            </div>

            <div className="summary-card danger">
              <span>Absent</span>

              <h3>{summary.absent}</h3>
            </div>

            <div className="summary-card warning">
              <span>Half Day</span>

              <h3>{summary.halfDay}</h3>
            </div>

            <div className="summary-card primary">
              <span>Leave</span>

              <h3>{summary.leave}</h3>
            </div>
          </div>

          {/* ================================= */}
          {/* FILTER */}
          {/* ================================= */}

          <div className="filter-wrapper">
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* ================================= */}
          {/* TABLE */}
          {/* ================================= */}

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>

                  <th>Check In</th>

                  <th>Check Out</th>

                  <th>Work Hours</th>

                  <th>Overtime</th>

                  <th>Late</th>

                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <SkeletonTable rows={5} columns={7} />
                    </td>
                  </tr>
                ) : filteredData.length ? (
                  filteredData.map((item: any) => (
                    <tr key={item.id}>
                      <td>
                        <div className="employee-info">
                          <div className="avatar">
                            {item?.employee?.name?.[0]}
                          </div>

                          <div>
                            <h6>{item?.employee?.name}</h6>

                            <span>{item?.employee?.employeeCode}</span>
                          </div>
                        </div>
                      </td>

                      <td>{formatTime(item.check_in_time)}</td>

                      <td>{formatTime(item.check_out_time)}</td>

                      <td>{formatWork(item.total_work_minutes)}</td>

                      <td>{formatWork(item.overtime_minutes)}</td>

                      <td>{item.late_minutes || 0} mins</td>

                      <td>
                        <span
                          className={`badge bg-${statusColors[item.status]}`}
                        >
                          {item.status?.replaceAll("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="empty">
                      No attendance found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ================================= */}
          {/* STYLE */}
          {/* ================================= */}

          <style jsx>{`
            .attendance-page {
              width: 100%;

              padding: 24px;
            }

            .top-header {
              display: flex;

              justify-content: space-between;

              align-items: center;

              gap: 20px;

              margin-bottom: 24px;
            }

            .top-header h2 {
              font-size: 30px;

              font-weight: 800;

              margin-bottom: 6px;

              color: #111827;
            }

            .top-header p {
              margin: 0;

              color: #6b7280;

              font-size: 14px;
            }

            .refresh-btn {
              border: none;

              height: 48px;

              padding: 0 18px;

              border-radius: 12px;

              background: #111827;

              color: white;

              font-weight: 700;
            }

            .summary-grid {
              display: grid;

              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));

              gap: 18px;

              margin-bottom: 24px;
            }

            .summary-card {
              background: white;

              border-radius: 20px;

              padding: 22px;

              border: 1px solid #e5e7eb;

              box-shadow: 0 6px 24px rgba(0, 0, 0, 0.05);
            }

            .summary-card span {
              color: #6b7280;

              font-size: 14px;
            }

            .summary-card h3 {
              margin-top: 10px;

              margin-bottom: 0;

              font-size: 34px;

              font-weight: 800;
            }

            .summary-card.success h3 {
              color: #16a34a;
            }

            .summary-card.danger h3 {
              color: #dc2626;
            }

            .summary-card.warning h3 {
              color: #d97706;
            }

            .summary-card.primary h3 {
              color: #2563eb;
            }

            .filter-wrapper {
              display: flex;

              gap: 16px;

              margin-bottom: 24px;
            }

            .filter-wrapper input {
              height: 50px;

              border-radius: 14px;

              border: 1px solid #d1d5db;

              padding: 0 16px;

              background: white;

              outline: none;

              font-size: 14px;

              color: #111827;

              writing-mode: horizontal-tb;
            }

            .filter-wrapper input:first-child {
              flex: 1;
            }

            .table-wrapper {
              width: 100%;

              overflow-x: auto;

              background: white;

              border-radius: 22px;

              border: 1px solid #e5e7eb;

              box-shadow: 0 10px 35px rgba(0, 0, 0, 0.05);
            }

            table {
              width: 100%;

              border-collapse: collapse;
            }

            thead {
              background: #f9fafb;
            }

            th {
              padding: 18px;

              font-size: 13px;

              font-weight: 800;

              color: #374151;

              text-transform: uppercase;

              white-space: nowrap;
            }

            td {
              padding: 18px;

              border-top: 1px solid #f3f4f6;

              vertical-align: middle;

              white-space: nowrap;

              font-size: 14px;

              color: #111827;
            }

            tr:hover {
              background: #fafafa;
            }

            .employee-info {
              display: flex;

              align-items: center;

              gap: 14px;
            }

            .avatar {
              width: 42px;

              height: 42px;

              border-radius: 50%;

              background: #111827;

              color: white;

              display: flex;

              align-items: center;

              justify-content: center;

              font-weight: 700;
            }

            .employee-info h6 {
              margin: 0;

              font-size: 14px;

              font-weight: 700;
            }

            .employee-info span {
              font-size: 12px;

              color: #6b7280;
            }

            .badge {
              padding: 8px 12px;

              border-radius: 999px;

              font-size: 12px;

              font-weight: 700;
            }

            .empty {
              text-align: center;

              padding: 50px;

              color: #6b7280;
            }

            @media (max-width: 768px) {
              .top-header {
                flex-direction: column;

                align-items: flex-start;
              }

              .filter-wrapper {
                flex-direction: column;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default CompanyDailyAttendanceDashboard;
