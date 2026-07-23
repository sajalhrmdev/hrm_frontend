"use client";

import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { SkeletonCard } from "@/core/common/Skeleton";

type AnyObj = Record<string, any>;

export default function AdminAttendancePage() {
  const [employees, setEmployees] = useState<AnyObj[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [selectedPolicy, setSelectedPolicy] = useState<AnyObj | null>(null);
  const [selectedShift, setSelectedShift] = useState<AnyObj | null>(null);

  const fetchEmployees = async (date = selectedDate) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/attendance/user-less?date=${date}`);
      setEmployees(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(selectedDate);
  }, [selectedDate]);

  const policyGroups = useMemo(() => {
    const map = new Map<number, AnyObj>();

    employees.forEach((emp) => {
      const policy = emp.workSchedulePolicy;
      if (!policy) return;

      const group: AnyObj = map.get(policy.id) ?? {
        ...policy,
        employees: [] as AnyObj[],
      };

      if (!map.has(policy.id)) {
        map.set(policy.id, group);
      }

      group.employees.push(emp);
    });

    return Array.from(map.values());
  }, [employees]);

  const shiftGroups = useMemo(() => {
    if (!selectedPolicy) return [];

    const attendanceType = String(
      selectedPolicy.attendanceType || "",
    ).toUpperCase();

    // FLEXIBLE policy -> one single group, no shift breakdown
    if (attendanceType === "FLEXIBLE") {
      return [
        {
          id: "flexible",
          title: "Flexible Shift",
          isFlexible: true,
          startTime: "--",
          endTime: "--",
          employees: selectedPolicy.employees || [],
        },
      ];
    }

    // FIXED policy -> group by real shifts
    const map = new Map<string | number, AnyObj>();

    selectedPolicy.employees.forEach((emp: AnyObj) => {
      const shift = emp.workSchedulePolicy?.shift;
      if (!shift) return;

      const group: AnyObj = map.get(shift.id) ?? {
        ...shift,
        isFlexible: false,
        employees: [] as AnyObj[],
      };

      if (!map.has(shift.id)) {
        map.set(shift.id, group);
      }

      group.employees.push(emp);
    });

    return Array.from(map.values());
  }, [selectedPolicy]);

  const visibleEmployees = selectedShift?.employees || [];
  const selectedCount = selectedEmployees.length;
  const totalVisible = visibleEmployees.length;

  const toggleEmployee = (id: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    const ids = visibleEmployees.map((e: AnyObj) => e.id);
    const allSelected =
      ids.length > 0 &&
      ids.every((id: number) => selectedEmployees.includes(id));

    if (allSelected) {
      setSelectedEmployees((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedEmployees((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const markAttendance = async () => {
    try {
      if (!selectedEmployees.length) {
        alert("Select at least one employee");
        return;
      }

      await axiosInstance.post("/attendance/admin-mark", {
        employeeIds: selectedEmployees,
        date: selectedDate,
      });

      alert("Attendance marked successfully");
      setSelectedEmployees([]);
      fetchEmployees(selectedDate);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Something went wrong");
    }
  };

  const resetToPolicies = () => {
    setSelectedShift(null);
    setSelectedPolicy(null);
    setSelectedEmployees([]);
  };

  const resetToShifts = () => {
    setSelectedShift(null);
    setSelectedEmployees([]);
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 24,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
    background: "#fff",
  };

  const softCardStyle: React.CSSProperties = {
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
    background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
    transition: "all .25s ease",
    cursor: "pointer",
  };

  const pillStyle: React.CSSProperties = {
    borderRadius: 999,
    padding: "0.45rem 0.85rem",
    fontWeight: 600,
    fontSize: 12,
  };

  const statBoxStyle: React.CSSProperties = {
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "#f8fafc",
    padding: "14px 16px",
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div
          className="min-vh-100"
          style={{
            background:
              "radial-gradient(circle at top, #eef4ff 0%, #f7faff 35%, #f8fafc 100%)",
            padding: "24px",
          }}
        >
          <div className="container-fluid px-0">
            <div className="card mb-4" style={cardStyle}>
              <div className="card-body p-4 p-lg-4">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span
                        className="d-inline-flex align-items-center justify-content-center"
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 14,
                          background:
                            "linear-gradient(135deg, #2563eb, #7c3aed)",
                          color: "#fff",
                          fontSize: 20,
                        }}
                      >
                        🕒
                      </span>
                      <div>
                        <h3
                          className="mb-0 fw-bold"
                          style={{ letterSpacing: "-0.02em" }}
                        >
                          Admin Attendance
                        </h3>
                        <div className="text-muted small">
                          Manage attendance by policy and shift with a clean
                          premium view
                        </div>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-2 mt-3">
                      <span className="bg-primary text-white" style={pillStyle}>
                        Employees: {employees.length}
                      </span>
                      <span className="bg-dark text-white" style={pillStyle}>
                        Policies: {policyGroups.length}
                      </span>
                      <span className="bg-success text-white" style={pillStyle}>
                        Selected: {selectedCount}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-lg-auto">
                    <div className="d-flex align-items-center gap-2 p-2 px-3 rounded-4 border bg-white shadow-sm">
                      <span className="text-muted fw-semibold">📅</span>
                      <input
                        type="date"
                        className="form-control border-0 shadow-none p-0"
                        style={{ minWidth: 170 }}
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedPolicy(null);
                          setSelectedShift(null);
                          setSelectedEmployees([]);
                        }}
                      />
                    </div>

                    <button
                      className="btn btn-primary btn-lg px-4 rounded-4 shadow-sm fw-semibold"
                      onClick={markAttendance}
                      style={{
                        background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                        border: "none",
                      }}
                    >
                      ✅ Mark Attendance
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loading && (<SkeletonCard />)}

            {!selectedPolicy && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="mb-1 fw-bold">Work Schedule Policies</h5>
                    <div className="text-muted small">
                      Pick a policy to drill down into shifts and employees
                    </div>
                  </div>

                  <span className="badge rounded-pill text-bg-light border px-3 py-2">
                    {policyGroups.length} found
                  </span>
                </div>

                {policyGroups.length === 0 ? (
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-5 text-center">
                      <div style={{ fontSize: 46 }}>🗂️</div>
                      <h5 className="fw-bold mt-2 mb-1">No policy found</h5>
                      <p className="text-muted mb-0">
                        No employees are available for the selected date.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="row g-4">
                    {policyGroups.map((policy: AnyObj) => (
                      <div className="col-12 col-md-6 col-xl-4" key={policy.id}>
                        <div
                          className="card h-100"
                          style={softCardStyle}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.transform = "translateY(-6px)";
                            el.style.boxShadow =
                              "0 18px 40px rgba(15,23,42,0.12)";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.transform = "translateY(0px)";
                            el.style.boxShadow =
                              "0 10px 24px rgba(15,23,42,0.06)";
                          }}
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setSelectedShift(null);
                            setSelectedEmployees([]);
                          }}
                        >
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div
                                className="d-inline-flex align-items-center justify-content-center"
                                style={{
                                  width: 52,
                                  height: 52,
                                  borderRadius: 18,
                                  background:
                                    "linear-gradient(135deg, #dbeafe, #ede9fe)",
                                  fontSize: 22,
                                }}
                              >
                                📋
                              </div>

                              <span className="badge rounded-pill text-bg-success px-3 py-2">
                                {policy.attendanceType || "Policy"}
                              </span>
                            </div>

                            <h5
                              className="fw-bold mb-2"
                              style={{ letterSpacing: "-0.01em" }}
                            >
                              {policy.title}
                            </h5>

                            <div
                              className="d-flex justify-content-between align-items-center mt-4"
                              style={statBoxStyle}
                            >
                              <div>
                                <div className="text-muted small">
                                  Employees
                                </div>
                                <div className="fw-bold fs-4 text-primary">
                                  {policy.employees.length}
                                </div>
                              </div>

                              <div className="text-end">
                                <div className="text-muted small">Type</div>
                                <div className="fw-semibold">
                                  {policy.attendanceType || "-"}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 text-primary fw-semibold">
                              View shifts →
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {selectedPolicy && !selectedShift && (
              <>
                <div className="card mb-4" style={cardStyle}>
                  <div className="card-body p-4">
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                      <div>
                        <button
                          className="btn btn-light border rounded-4 mb-3"
                          onClick={resetToPolicies}
                        >
                          ← Back to Policies
                        </button>

                        <h5 className="fw-bold mb-1">{selectedPolicy.title}</h5>
                        <div className="text-muted small">
                          Select one shift to mark attendance
                        </div>
                      </div>

                      <div className="d-flex gap-2 flex-wrap">
                        <span className="badge rounded-pill text-bg-primary px-3 py-2">
                          Policy Employees: {selectedPolicy.employees.length}
                        </span>
                        <span className="badge rounded-pill text-bg-dark px-3 py-2">
                          Groups: {shiftGroups.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {shiftGroups.length === 0 ? (
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-5 text-center">
                      <div style={{ fontSize: 46 }}>⏳</div>
                      <h5 className="fw-bold mt-2 mb-1">No shift available</h5>
                      <p className="text-muted mb-0">
                        This policy does not have any shift linked to it.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="row g-4">
                    {shiftGroups.map((shift: AnyObj) => (
                      <div className="col-12 col-md-6 col-xl-4" key={shift.id}>
                        <div
                          className="card h-100"
                          style={softCardStyle}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.transform = "translateY(-6px)";
                            el.style.boxShadow =
                              "0 18px 40px rgba(15,23,42,0.12)";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.transform = "translateY(0px)";
                            el.style.boxShadow =
                              "0 10px 24px rgba(15,23,42,0.06)";
                          }}
                          onClick={() => setSelectedShift(shift)}
                        >
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div
                                className="d-inline-flex align-items-center justify-content-center"
                                style={{
                                  width: 52,
                                  height: 52,
                                  borderRadius: 18,
                                  background: shift.isFlexible
                                    ? "linear-gradient(135deg, #fef3c7, #fde68a)"
                                    : "linear-gradient(135deg, #dbeafe, #e0f2fe)",
                                  fontSize: 22,
                                }}
                              >
                                {shift.isFlexible ? "✨" : "🕘"}
                              </div>

                              <span
                                className={`badge rounded-pill px-3 py-2 ${
                                  shift.isFlexible
                                    ? "text-bg-warning"
                                    : "text-bg-info"
                                }`}
                              >
                                {shift.isFlexible ? "FLEXIBLE" : "SHIFT"}
                              </span>
                            </div>

                            <h5
                              className="fw-bold mb-2"
                              style={{ letterSpacing: "-0.01em" }}
                            >
                              {shift.title}
                            </h5>

                            <div
                              className="d-flex justify-content-between align-items-center mt-4"
                              style={statBoxStyle}
                            >
                              <div>
                                <div className="text-muted small">Time</div>
                                <div className="fw-semibold">
                                  {shift.isFlexible
                                    ? "No Fixed Timing"
                                    : `${shift.startTime} - ${shift.endTime}`}
                                </div>
                              </div>

                              <div className="text-end">
                                <div className="text-muted small">
                                  Employees
                                </div>
                                <div className="fw-bold fs-4 text-primary">
                                  {shift.employees.length}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 text-primary fw-semibold">
                              Open employees →
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {selectedShift && (
              <>
                <div className="card mb-4" style={cardStyle}>
                  <div className="card-body p-4">
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                      <div>
                        <button
                          className="btn btn-light border rounded-4 mb-3 me-2"
                          onClick={resetToShifts}
                        >
                          ← Back to Shifts
                        </button>

                        <h5 className="fw-bold mb-1">{selectedShift.title}</h5>
                        <div className="text-muted small">
                          Select employees and mark attendance for{" "}
                          {selectedDate}
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        <span className="badge rounded-pill text-bg-primary px-3 py-2">
                          Total: {totalVisible}
                        </span>
                        <span className="badge rounded-pill text-bg-success px-3 py-2">
                          Selected: {selectedCount}
                        </span>
                        <span className="badge rounded-pill text-bg-dark px-3 py-2">
                          {selectedShift.isFlexible
                            ? "Flexible Group"
                            : `Shift: ${selectedShift.startTime} - ${selectedShift.endTime}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card border-0 rounded-4 shadow-lg overflow-hidden">
                  <div className="card-body p-0">
                    <div className="px-4 pt-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <h5 className="fw-bold mb-1">Employee List</h5>
                        <div className="text-muted small">
                          Tick the employees you want to mark present
                        </div>
                      </div>

                      <button
                        className="btn btn-outline-primary rounded-4 px-3"
                        onClick={toggleAll}
                        disabled={visibleEmployees.length === 0}
                      >
                        {visibleEmployees.length > 0 &&
                        visibleEmployees.every((e: AnyObj) =>
                          selectedEmployees.includes(e.id),
                        )
                          ? "Unselect All"
                          : "Select All"}
                      </button>
                    </div>

                    <div className="table-responsive">
                      <table className="table align-middle mb-0">
                        <thead style={{ background: "#f8fafc" }}>
                          <tr>
                            <th style={{ width: "60px" }} className="ps-4 py-3">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={
                                  visibleEmployees.length > 0 &&
                                  visibleEmployees.every((e: AnyObj) =>
                                    selectedEmployees.includes(e.id),
                                  )
                                }
                                onChange={toggleAll}
                              />
                            </th>
                            <th className="py-3">Code</th>
                            <th className="py-3">Name</th>
                            <th className="py-3">Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {visibleEmployees.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-5">
                                <div style={{ fontSize: 42 }}>👤</div>
                                <div className="fw-bold mt-2">
                                  No employees found
                                </div>
                                <div className="text-muted small">
                                  There are no employees under this shift.
                                </div>
                              </td>
                            </tr>
                          ) : (
                            visibleEmployees.map(
                              (employee: AnyObj, index: number) => {
                                const attendance = employee.attendances?.[0];
                                const isChecked = selectedEmployees.includes(
                                  employee.id,
                                );

                                return (
                                  <tr
                                    key={employee.id}
                                    style={{
                                      background: isChecked
                                        ? "rgba(37,99,235,0.04)"
                                        : "#fff",
                                      borderTop:
                                        index === 0 ? "none" : undefined,
                                    }}
                                  >
                                    <td className="ps-4 py-3">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={isChecked}
                                        onChange={() =>
                                          toggleEmployee(employee.id)
                                        }
                                      />
                                    </td>

                                    <td className="py-3">
                                      <span className="fw-semibold text-dark">
                                        {employee.employeeCode}
                                      </span>
                                    </td>

                                    <td className="py-3">
                                      <div className="d-flex align-items-center gap-3">
                                        <div
                                          className="d-inline-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                                          style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 14,
                                            fontSize: 14,
                                            background:
                                              "linear-gradient(135deg, #2563eb, #4f46e5)",
                                          }}
                                        >
                                          {(employee.name || "U")
                                            .split(" ")
                                            .slice(0, 2)
                                            .map((x: string) => x[0])
                                            .join("")
                                            .toUpperCase()}
                                        </div>

                                        <div>
                                          <div className="fw-semibold">
                                            {employee.name}
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    <td className="py-3">
                                      <span
                                        className={`badge rounded-pill px-3 py-2 ${
                                          attendance
                                            ? "text-bg-success"
                                            : "text-bg-danger"
                                        }`}
                                      >
                                        {attendance?.status || "ABSENT"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              },
                            )
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 border-top d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                      <div className="text-muted small">
                        Tip: select all visible employees, then click{" "}
                        <b>Mark Attendance</b>.
                      </div>

                      <button
                        className="btn btn-primary btn-lg px-4 rounded-4 shadow-sm fw-semibold"
                        onClick={markAttendance}
                        style={{
                          background:
                            "linear-gradient(135deg, #2563eb, #4f46e5)",
                          border: "none",
                        }}
                      >
                        ✅ Mark Attendance ({selectedCount})
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
