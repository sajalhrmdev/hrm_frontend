"use client";

import React, { useEffect, useMemo, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonCard } from "@/core/common/Skeleton";

// ======================================================

const ShiftWiseEmployeePage = () => {
  // ======================================================

  const [loading, setLoading] = useState(false);

  const [shifts, setShifts] = useState<any[]>([]);

  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [selectedDate, setSelectedDate] = useState("");

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(
    null,
  );

  // ======================================================
  // FETCH
  // ======================================================

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftRes, policyRes] = await Promise.all([
        axiosInstance.get("/shift"),
        axiosInstance.get("/work-schedule-policy"),
      ]);

      setShifts(shiftRes?.data?.data?.shifts || []);

      setPolicies(policyRes?.data?.data || []);

      if (shiftRes?.data?.data?.shifts?.length) {
        setSelectedShift(shiftRes.data.data.shifts[0]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================

  useEffect(() => {
    fetchData();
  }, []);

  // ======================================================
  // DATE -> DAY + WEEK NUMBER
  // ======================================================

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDay(null);

      setSelectedWeekNumber(null);

      return;
    }

    const date = new Date(selectedDate);

    // ==========================================
    // DAY
    // ==========================================

    setSelectedDay(date.getDay());

    // ==========================================
    // WEEK NUMBER
    // ==========================================

    const dayOfMonth = date.getDate();

    const weekNumber = Math.ceil(dayOfMonth / 7);

    setSelectedWeekNumber(weekNumber);
  }, [selectedDate]);

  const flexiblePolicies = useMemo(() => {
  return (policies || []).filter(
    (policy: any) =>
      policy.attendanceType === "FLEXIBLE",
  );
}, [policies]);
  const flexibleEmployeeCount = flexiblePolicies.reduce(
    (acc: number, policy: any) => acc + (policy?.employees?.length || 0),
    0,
  );
  // ======================================================
  // FILTER
  // ======================================================

  const filteredPolicies = useMemo(() => {
    if (!selectedShift) return [];
    if (selectedShift.id === "FLEXIBLE") {
      return flexiblePolicies
        .filter((policy: any) => {
          if (selectedDay === null) return true;

          const rules = policy.weeklyOffPattern || [];

          const isOff = rules.some((r: any) => {
            if (r.day !== selectedDay) {
              return false;
            }

            if (r.weekNumber === null || r.weekNumber === undefined) {
              return true;
            }

            return r.weekNumber === selectedWeekNumber;
          });

          return !isOff;
        })
        .map((policy: any) => {
          const employees = (policy.employees || []).filter((emp: any) => {
            const name = emp?.name?.toLowerCase() || "";

            const code = emp?.employeeCode?.toLowerCase() || "";

            return (
              name.includes(search.toLowerCase()) ||
              code.includes(search.toLowerCase())
            );
          });

          return {
            ...policy,
            employees,
          };
        })
        .filter((policy: any) => policy.employees.length > 0);
    }

    return (
      (selectedShift.WorkSchedulePolicies || [])

        // ==========================================
        // POLICY FILTER
        // ==========================================

        .filter((policy: any) => {
          // ======================================
          // NO DATE SELECTED
          // ======================================

          if (selectedDay === null) {
            return true;
          }

          const rules = policy.weeklyOffPattern || [];

          // ======================================
          // CHECK OFF
          // ======================================

          const isOff = rules.some((r: any) => {
            // ==================================
            // DAY NOT MATCH
            // ==================================

            if (r.day !== selectedDay) {
              return false;
            }

            // ==================================
            // EVERY WEEK OFF
            // ==================================

            if (r.weekNumber === null || r.weekNumber === undefined) {
              return true;
            }

            // ==================================
            // SPECIFIC WEEK OFF
            // ==================================

            return r.weekNumber === selectedWeekNumber;
          });

          // ======================================
          // SHOW ONLY WORKING POLICY
          // ======================================

          return !isOff;
        })

        // ==========================================
        // EMPLOYEE SEARCH FILTER
        // ==========================================

        .map((policy: any) => {
          const employees = (policy.employees || []).filter((emp: any) => {
            const name = emp?.name?.toLowerCase() || "";

            const code = emp?.employeeCode?.toLowerCase() || "";

            return (
              name.includes(search.toLowerCase()) ||
              code.includes(search.toLowerCase())
            );
          });

          return {
            ...policy,

            employees,
          };
        })

        // ==========================================
        // REMOVE EMPTY POLICY
        // ==========================================

        .filter((policy: any) => policy.employees.length > 0)
    );
  }, [selectedShift, search, selectedDay,selectedWeekNumber , flexiblePolicies]);

  // ======================================================
  // FORMAT
  // ======================================================

  const formatWeeklyOff = (rules: any[]) => {
    if (!rules?.length) return "--";

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return rules
      .map((r: any) => {
        if (r.weekNumber) {
          const suffixMap: any = {
            1: "1st",

            2: "2nd",

            3: "3rd",

            4: "4th",

            5: "5th",
          };

          return `${suffixMap[r.weekNumber]} ${days[r.day]}`;
        }

        return `Every ${days[r.day]}`;
      })
      .join(", ");
  };

  // ======================================================

  const totalEmployeeCount = filteredPolicies.reduce(
    (
      acc: number,

      policy: any,
    ) => acc + (policy?.employees?.length || 0),

    0,
  );

  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="shift-page">
          {/* ====================================================== */}
          {/* HEADER */}
          {/* ====================================================== */}

          <div className="top-header">
            <div>
              <h1>
                {selectedShift?.id === "FLEXIBLE"
                  ? "Flexible Shift Employees"
                  : "Shift Wise Employees"}
              </h1>

              <p>View employees grouped by shift and work schedule policy</p>
            </div>
          </div>

          {/* ====================================================== */}
          {/* FILTER */}
          {/* ====================================================== */}

          <div className="filter-bar">
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

          {/* ====================================================== */}
          {/* DATE INFO */}
          {/* ====================================================== */}

          {selectedDay !== null && (
            <div className="selected-day-box">
              <div>
                <strong>Selected Day:</strong>{" "}
                {
                  [
                    "Sunday",

                    "Monday",

                    "Tuesday",

                    "Wednesday",

                    "Thursday",

                    "Friday",

                    "Saturday",
                  ][selectedDay]
                }
              </div>

              <div>
                <strong>Week:</strong> {selectedWeekNumber}
              </div>

              <div>
                <strong>Working Employees:</strong> {totalEmployeeCount}
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/* BODY */}
          {/* ====================================================== */}

          <div className="main-layout">
            {/* ====================================================== */}
            {/* SIDEBAR */}
            {/* ====================================================== */}

            <div className="shift-sidebar">
              {loading ? (
                <SkeletonCard />
              ) : shifts.length ? (
                <>
                  {shifts.map((shift: any) => {
                    const totalEmployees = shift?.WorkSchedulePolicies?.reduce(
                      (
                        acc: number,

                        policy: any,
                      ) => acc + (policy?.employees?.length || 0),

                      0,
                    );

                    return (
                      <div
                        key={shift.id}
                        className={`shift-card ${selectedShift?.id === shift.id ? "active" : ""}`}
                        onClick={() => setSelectedShift(shift)}
                      >
                        <h3>{shift.title}</h3>

                        <p>
                          {shift.startTime} - {shift.endTime}
                        </p>

                        <div className="count-badge">
                          {totalEmployees} Employees
                        </div>
                      </div>
                    );
                  })}
                  <div
                    className={`shift-card ${
                      selectedShift?.id === "FLEXIBLE" ? "active" : ""
                    }`}
                    onClick={() =>
                      setSelectedShift({
                        id: "FLEXIBLE",
                        title: "Flexible Shift",
                      })
                    }
                  >
                    <h3>Flexible Shift</h3>

                    <p>No Shift Assigned</p>

                    <div className="count-badge">
                      {flexibleEmployeeCount} Employees
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty">No shift found</div>
              )}
            </div>

            {/* ====================================================== */}
            {/* CONTENT */}
            {/* ====================================================== */}

            <div className="content-area">
              {selectedShift ? (
                filteredPolicies.length ? (
                  filteredPolicies.map((policy: any) => (
                    <div className="policy-card" key={policy.id}>
                      {/* ====================================================== */}

                      <div className="policy-header">
                        <div>
                          <h2>
                            {policy.title}

                            {policy.attendanceType === "FLEXIBLE" && (
                              <span
                                style={{
                                  marginLeft: 10,
                                  fontSize: 12,
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  background: "#fef3c7",
                                  color: "#92400e",
                                }}
                              >
                                Flexible
                              </span>
                            )}
                          </h2>

                          <p>{formatWeeklyOff(policy.weeklyOffPattern)}</p>
                        </div>

                        <div className="employee-count">
                          {policy?.employees?.length} Employees
                        </div>
                      </div>

                      {/* ====================================================== */}

                      {policy?.employees?.length ? (
                        <div className="employee-grid">
                          {policy.employees.map((emp: any) => (
                            <div className="employee-card" key={emp.id}>
                              <div className="avatar">{emp?.name?.[0]}</div>

                              <div className="employee-info">
                                <h4>{emp.name}</h4>

                                <p>{emp.employeeCode}</p>

                                <span>{emp?.department?.title || "--"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-policy">
                          No employees assigned
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty">No working employees found</div>
                )
              ) : (
                <div className="empty">Select shift</div>
              )}
            </div>
          </div>

          {/* STYLE */}

          <style jsx>{`
            .shift-page {
              padding: 24px;
            }
            .top-header {
              margin-bottom: 24px;
            }
            .top-header h1 {
              font-size: 32px;
              font-weight: 800;
              color: #111827;
              margin-bottom: 6px;
            }
            .top-header p {
              color: #6b7280;
            }
            .filter-bar {
              display: grid;
              grid-template-columns:
                1fr
                220px;
              gap: 16px;
              margin-bottom: 20px;
            }
            .filter-bar input {
              width: 100%;
              height: 52px;
              border-radius: 14px;
              border: 1px solid #d1d5db;
              padding: 0 16px;
              outline: none;
              background: white;
            }
            .selected-day-box {
              display: flex;
              gap: 20px;
              flex-wrap: wrap;
              margin-bottom: 24px;
              padding: 16px 20px;
              border-radius: 18px;
              background: #eef2ff;
              color: #312e81;
              font-size: 14px;
              font-weight: 600;
            }
            .main-layout {
              display: grid;
              grid-template-columns:
                320px
                1fr;
              gap: 24px;
            }
            .shift-sidebar {
              display: flex;
              flex-direction: column;
              gap: 16px;
            }
            .shift-card {
              background: white;
              border-radius: 22px;
              padding: 22px;
              border: 1px solid #e5e7eb;
              cursor: pointer;
              transition: 0.3s ease;
            }
            .shift-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
            }
            .shift-card.active {
              border-color: #111827;
              background: #111827;
              color: white;
            }
            .shift-card h3 {
              font-size: 18px;
              font-weight: 800;
              margin-bottom: 6px;
            }
            .shift-card p {
              font-size: 14px;
              opacity: 0.8;
              margin-bottom: 14px;
            }
            .count-badge {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 8px 14px;
              border-radius: 999px;
              background: rgba(255, 255, 255, 0.15);
              font-size: 12px;
              font-weight: 700;
            }
            .content-area {
              display: flex;
              flex-direction: column;
              gap: 24px;
            }
            .policy-card {
              background: white;
              border-radius: 28px;
              padding: 24px;
              border: 1px solid #e5e7eb;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
            }
            .policy-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 20px;
              margin-bottom: 24px;
            }
            .policy-header h2 {
              font-size: 22px;
              font-weight: 800;
              color: #111827;
              margin-bottom: 6px;
            }
            .policy-header p {
              color: #6b7280;
            }
            .employee-count {
              padding: 10px 16px;
              border-radius: 999px;
              background: #eef2ff;
              color: #4338ca;
              font-size: 13px;
              font-weight: 700;
            }
            .employee-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
              gap: 18px;
            }
            .employee-card {
              border: 1px solid #e5e7eb;
              border-radius: 22px;
              padding: 18px;
              display: flex;
              align-items: center;
              gap: 14px;
              transition: 0.3s ease;
            }
            .employee-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
            }
            .avatar {
              width: 54px;
              height: 54px;
              border-radius: 50%;
              background: #111827;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              font-weight: 800;
              flex-shrink: 0;
            }
            .employee-info h4 {
              margin: 0;
              font-size: 15px;
              color: #111827;
            }
            .employee-info p {
              margin: 4px 0;
              font-size: 13px;
              color: #6b7280;
            }

            .employee-info span {
              display: inline-flex;
              margin-top: 4px;
              font-size: 12px;
              font-weight: 700;
              color: #4338ca;
              background: #eef2ff;
              padding: 6px 10px;
              border-radius: 999px;
            }

            .empty,
            .empty-policy {
              background: white;
              border-radius: 24px;
              padding: 50px;
              text-align: center;
              color: #6b7280;
              border: 1px solid #e5e7eb;
            }

            @media (max-width: 992px) {
              .main-layout {
                grid-template-columns: 1fr;
              }
              .shift-sidebar {
                flex-direction: row;
                overflow-x: auto;
              }
              .shift-card {
                min-width: 260px;
              }
            }
            @media (max-width: 768px) {
              .shift-page {
                padding: 16px;
              }
              .top-header h1 {
                font-size: 24px;
              }
              .policy-header {
                flex-direction: column;
                align-items: flex-start;
              }
              .employee-grid {
                grid-template-columns: 1fr;
              }
              .filter-bar {
                grid-template-columns: 1fr;
              }
              .selected-day-box {
                flex-direction: column;
                gap: 10px;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};
export default ShiftWiseEmployeePage;
