"use client";

import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LEAVE"
  | "HALF_DAY"
  | "HOLIDAY"
  | "UNKNOWN";

interface Employee {
  id: number;
  name: string;
}

interface Attendance {
  id: number;
  employeeId: number;
  date: string;
  status: string;
  employee: Employee;
}

interface EmployeeAttendance {
  id: number;
  name: string;
  attendance: Record<number, AttendanceStatus>;
  totals: {
    present: number;
    absent: number;
    leave: number;
    halfDay: number;
    holiday: number;
  };
}

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const yearOptions = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

function normalizeStatus(status?: string): AttendanceStatus {
  switch (status) {
    case "PRESENT":
    case "ABSENT":
    case "LEAVE":
    case "HALF_DAY":
    case "HOLIDAY":
      return status;
    default:
      return "UNKNOWN";
  }
}

function getShortText(status?: AttendanceStatus) {
  switch (status) {
    case "PRESENT":
      return "P";
    case "ABSENT":
      return "A";
    case "LEAVE":
      return "L";
    case "HALF_DAY":
      return "HD";
    case "HOLIDAY":
      return "H";
    default:
      return "-";
  }
}

function getCellClass(status?: AttendanceStatus) {
  switch (status) {
    case "PRESENT":
      return "attendance-present";
    case "ABSENT":
      return "attendance-absent";
    case "LEAVE":
      return "attendance-leave";
    case "HALF_DAY":
      return "attendance-halfday";
    case "HOLIDAY":
      return "attendance-holiday";
    default:
      return "attendance-empty";
  }
}

const MonthlyAttendanceReport: React.FC = () => {
  const today = new Date();

  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [loading, setLoading] = useState<boolean>(false);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [error, setError] = useState<string>("");

  const selectedMonthLabel =
    months.find((m) => m.value === month)?.label ?? "Month";

  const daysInMonth = useMemo(
    () => new Date(year, month, 0).getDate(),
    [year, month],
  );

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  );

  const fetchAttendance = async (
    selectedYear = year,
    selectedMonth = month,
  ) => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.get<{
        success: boolean;
        data: Attendance[];
      }>(
        `/attendance/monthly-attendance-all?year=${selectedYear}&month=${selectedMonth}`,
      );

      setAttendanceData(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Attendance data load korte parini.");
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const employees = useMemo<EmployeeAttendance[]>(() => {
    const map: Record<number, EmployeeAttendance> = {};

    attendanceData.forEach((item) => {
      const employeeId = item.employee?.id ?? item.employeeId;
      const employeeName = item.employee?.name ?? `Employee ${employeeId}`;

      if (!map[employeeId]) {
        map[employeeId] = {
          id: employeeId,
          name: employeeName,
          attendance: {},
          totals: {
            present: 0,
            absent: 0,
            leave: 0,
            halfDay: 0,
            holiday: 0,
          },
        };
      }

      const day = new Date(item.date).getDate();
      const status = normalizeStatus(item.status);
      map[employeeId].attendance[day] = status;
    });

    return Object.values(map)
      .map((emp) => {
        const attendance: Record<number, AttendanceStatus> = {
          ...emp.attendance,
        };

        const totals = {
          present: 0,
          absent: 0,
          leave: 0,
          halfDay: 0,
          holiday: 0,
        };

        days.forEach((day) => {
          const status = attendance[day];

          switch (status) {
            case "PRESENT":
              totals.present += 1;
              break;
            case "ABSENT":
              totals.absent += 1;
              break;
            case "LEAVE":
              totals.leave += 1;
              break;
            case "HALF_DAY":
              totals.halfDay += 1;
              break;
            case "HOLIDAY":
              totals.holiday += 1;
              break;
            default:
              break;
          }
        });

        return {
          ...emp,
          attendance,
          totals,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [attendanceData, days]);

  const summary = useMemo(() => {
    const totalEmployees = employees.length;
    const totalPresent = employees.reduce(
      (sum, e) => sum + e.totals.present,
      0,
    );
    const totalAbsent = employees.reduce((sum, e) => sum + e.totals.absent, 0);
    const totalLeave = employees.reduce((sum, e) => sum + e.totals.leave, 0);
    const totalHalfDay = employees.reduce(
      (sum, e) => sum + e.totals.halfDay,
      0,
    );
    const totalHoliday = employees.reduce(
      (sum, e) => sum + e.totals.holiday,
      0,
    );

    return {
      totalEmployees,
      totalPresent,
      totalAbsent,
      totalLeave,
      totalHalfDay,
      totalHoliday,
    };
  }, [employees]);

  const exportToExcel = () => {
    if (typeof window === "undefined") return;

    const headers = [
      "Employee",
      ...days.map((day) => String(day)),
      "TP",
      "TA",
      "TL",
      "THD",
      "TH",
    ];

    const rows = employees.map((emp) => {
      const dayValues = days.map((day) => getShortText(emp.attendance[day]));
      return [
        emp.name,
        ...dayValues,
        String(emp.totals.present),
        String(emp.totals.absent),
        String(emp.totals.leave),
        String(emp.totals.halfDay),
        String(emp.totals.holiday),
      ].join("\t");
    });

    const content = [headers.join("\t"), ...rows].join("\n");

    const blob = new Blob([content], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-report-${selectedMonthLabel}-${year}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="attendance-page">
          <div className="attendance-toolbar card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-md-4 col-lg-3">
                  <label className="form-label fw-semibold text-muted mb-1">
                    Month
                  </label>
                  <select
                    className="form-select form-select-lg attendance-input"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-3 col-lg-2">
                  <label className="form-label fw-semibold text-muted mb-1">
                    Year
                  </label>
                  <select
                    className="form-select form-select-lg attendance-input"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-auto">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg px-4 me-2"
                    onClick={() => fetchAttendance(year, month)}
                    disabled={loading}
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-success btn-lg px-4"
                    onClick={exportToExcel}
                    disabled={!employees.length}
                  >
                    Export to Excel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="attendance-report card border-0 shadow-sm mt-0">
            <div className="card-body p-0">
              <div className="report-header text-center px-3 px-md-3 py-3 py-md-3">
                <h2 className="report-title mb-1">
                  Attendance Report {selectedMonthLabel.slice(0, 3)} {year}
                </h2>
                <div className="report-subtitle">
                  Generated At : <strong>{generatedAt}</strong>
                </div>

                <div className="legend-wrap mt-1 d-flex justify-content-center flex-wrap gap-3">
                  <span className="legend-item legend-present">P = Present</span>
                  <span className="legend-item legend-absent">A = Absent</span>
                  <span className="legend-item legend-halfday">HD = Half Day</span>
                  <span className="legend-item legend-holiday">H = Holiday</span>
                  <span className="legend-item legend-leave">L = Leave</span>
                </div>

                {/* <div className="summary-grid mt-4">
                  <div className="summary-card">
                    <div className="summary-label">Employees</div>
                    <div className="summary-value">{summary.totalEmployees}</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Present</div>
                    <div className="summary-value text-success">
                      {summary.totalPresent}
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Absent</div>
                    <div className="summary-value text-danger">
                      {summary.totalAbsent}
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Leave</div>
                    <div className="summary-value text-warning">
                      {summary.totalLeave}
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Half Day</div>
                    <div className="summary-value text-info">
                      {summary.totalHalfDay}
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Holiday</div>
                    <div className="summary-value text-primary">
                      {summary.totalHoliday}
                    </div>
                  </div>
                </div> */}
              </div>

              <div className="table-wrap">
                {error ? (
                  <div className="p-4">
                    <div className="alert alert-danger mb-0">{error}</div>
                  </div>
                ) : loading ? (
                  <div className="p-5 text-center">
                    <div className="spinner-border text-primary" role="status" />
                    <div className="mt-2 fw-semibold text-muted">
                      Loading attendance...
                    </div>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="p-5 text-center">
                    <div className="empty-state">
                      <div className="empty-state-icon">📅</div>
                      <h5 className="mt-2 mb-2">No attendance found</h5>
                      <p className="text-muted mb-0">
                        Ei month-er jonno kono attendance data pachhi na.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive attendance-scroll">
                    <table className="table attendance-table mb-0 align-middle">
                      <thead>
                        <tr>
                          <th className="sticky-col employee-head">Employee</th>

                          {days.map((day) => (
                            <th key={day} className="day-head text-center">
                              {day}
                            </th>
                          ))}

                          <th className="text-center totals-head">TP</th>
                          <th className="text-center totals-head">TA</th>
                          <th className="text-center totals-head">TL</th>
                          <th className="text-center totals-head">THD</th>
                          <th className="text-center totals-head">TH</th>
                        </tr>
                      </thead>

                      <tbody>
                        {employees.map((employee) => (
                          <tr key={employee.id}>
                            <td className="sticky-col employee-cell">
                              <div className="employee-name">{employee.name}</div>
                              <div className="employee-meta">ID: {employee.id}</div>
                            </td>

                            {days.map((day) => {
                              const status = employee.attendance[day];
                              return (
                                <td key={day} className="text-center day-cell">
                                  <span
                                    className={`attendance-pill ${getCellClass(status)}`}
                                  >
                                    {getShortText(status)}
                                  </span>
                                </td>
                              );
                            })}

                            <td className="text-center total-cell">
                              {employee.totals.present}
                            </td>
                            <td className="text-center total-cell">
                              {employee.totals.absent}
                            </td>
                            <td className="text-center total-cell">
                              {employee.totals.leave}
                            </td>
                            <td className="text-center total-cell">
                              {employee.totals.halfDay}
                            </td>
                            <td className="text-center total-cell">
                              {employee.totals.holiday}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .attendance-page {
            min-height: 100vh;
            padding: 2px;
            background:
              radial-gradient(circle at top left, rgba(255, 255, 255, 0.9), transparent 28%),
              radial-gradient(circle at top right, rgba(255, 255, 255, 0.7), transparent 22%),
              linear-gradient(180deg, #dff4ff 0%, #eef8ff 36%, #f8fbff 100%);
          }

          .attendance-toolbar,
          .attendance-report {
            border-radius: 22px;
            overflow: hidden;
          }

          .attendance-input {
            border-radius: 14px;
            box-shadow: none;
          }

          .report-header {
            background:
              linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.98)),
              linear-gradient(135deg, rgba(67, 122, 255, 0.08), rgba(42, 199, 165, 0.05));
            border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          }

          .report-title {
            font-size: clamp(1.4rem, 2vw, 2.1rem);
            font-weight: 800;
            letter-spacing: -0.03em;
            color: #111827;
          }

          .report-subtitle {
            color: #475569;
            font-size: 0.95rem;
          }

          .legend-wrap {
            row-gap: 10px;
          }

          .legend-item {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 34px;
            padding: 0 12px;
            border-radius: 999px;
            font-size: 0.9rem;
            font-weight: 700;
            border: 1px solid transparent;
          }

          .legend-present {
            background: #dcfce7;
            color: #15803d;
          }

          .legend-absent {
            background: #fee2e2;
            color: #dc2626;
          }

          .legend-halfday {
            background: #cffafe;
            color: #0891b2;
          }

          .legend-holiday {
            background: #dbeafe;
            color: #2563eb;
          }

          .legend-leave {
            background: #fef3c7;
            color: #d97706;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 12px;
            max-width: 1100px;
            margin-inline: auto;
          }

          .summary-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 14px 12px;
            box-shadow: 0 8px 25px rgba(15, 23, 42, 0.04);
          }

          .summary-label {
            font-size: 0.82rem;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .summary-value {
            font-size: 1.35rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #111827;
          }

          .table-wrap {
            background: #fff;
          }

          .attendance-scroll {
            max-height: 72vh;
            overflow: auto;
          }

          .attendance-table {
            white-space: nowrap;
            margin-bottom: 0;
          }

          .attendance-table thead th {
            position: sticky;
            top: 0;
            z-index: 20;
            background: #f8fafc;
            border-bottom: 1px solid #e5e7eb;
            font-weight: 800;
            color: #334155;
            font-size: 0.92rem;
            padding: 14px 10px;
          }

          .employee-head {
            min-width: 270px;
            left: 0;
            z-index: 30 !important;
            text-align: left !important;
            background: #f8fafc !important;
            border-right: 1px solid #e5e7eb;
          }

          .sticky-col {
            position: sticky;
            left: 0;
            z-index: 10;
            background: #fff;
          }

          .employee-cell {
            min-width: 270px;
            border-right: 1px solid #e5e7eb;
            padding: 14px 14px !important;
            background: #fff;
          }

          .employee-name {
            font-weight: 800;
            color: #111827;
            line-height: 1.2;
          }

          .employee-meta {
            margin-top: 3px;
            font-size: 0.82rem;
            color: #94a3b8;
            font-weight: 600;
          }

          .day-head {
            min-width: 44px;
            text-align: center;
          }

          .totals-head {
            min-width: 56px;
            background: #eef2ff !important;
            color: #3730a3 !important;
          }

          .day-cell,
          .total-cell {
            padding: 11px 8px !important;
            border-color: #edf2f7;
          }

          .attendance-pill {
            width: 30px;
            height: 30px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            font-weight: 800;
            font-size: 0.82rem;
            line-height: 1;
            transition:
              transform 0.15s ease,
              box-shadow 0.15s ease;
            user-select: none;
          }

          .attendance-pill:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
          }

          .attendance-present {
            background: #dcfce7;
            color: #15803d;
          }

          .attendance-absent {
            background: #fee2e2;
            color: #dc2626;
          }

          .attendance-leave {
            background: #fef3c7;
            color: #d97706;
          }

          .attendance-halfday {
            background: #cffafe;
            color: #0891b2;
          }

          .attendance-holiday {
            background: #dbeafe;
            color: #2563eb;
          }

          .attendance-empty {
            background: transparent;
            color: #94a3b8;
          }

          .attendance-table tbody tr:hover {
            background: #f8fbff;
          }

          .attendance-table tbody tr:hover .employee-cell {
            background: #f8fbff;
          }

          .empty-state {
            max-width: 420px;
            margin: 0 auto;
            padding: 12px 0;
          }

          .empty-state-icon {
            width: 70px;
            height: 70px;
            margin: 0 auto;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #eff6ff;
            font-size: 2rem;
          }

          @media (max-width: 991.98px) {
            .summary-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .attendance-page {
              padding: 16px;
            }
          }

          @media (max-width: 575.98px) {
            .summary-grid {
              grid-template-columns: repeat(1, minmax(0, 1fr));
            }

            .employee-head,
            .employee-cell {
              min-width: 220px;
            }

            .attendance-pill {
              width: 28px;
              height: 28px;
              font-size: 0.76rem;
            }

            .attendance-table thead th,
            .day-cell,
            .total-cell {
              padding-left: 6px !important;
              padding-right: 6px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default MonthlyAttendanceReport;