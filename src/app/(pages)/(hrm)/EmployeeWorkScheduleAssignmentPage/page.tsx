"use client";

import React, { useEffect, useMemo, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

// ======================================================

const EmployeeWorkScheduleAssignmentPage = () => {
  // ======================================================

  const [loading, setLoading] = useState(false);

  const [assigning, setAssigning] = useState(false);

  const [employees, setEmployees] = useState<any[]>([]);

  const [policies, setPolicies] = useState<any[]>([]);

  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  const [selectedPolicy, setSelectedPolicy] = useState("");

  const [search, setSearch] = useState("");

  // ======================================================
  // FETCH
  // ======================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const [employeeRes, policyRes] = await Promise.all([
        axiosInstance.get("/employee"),

        axiosInstance.get("/work-schedule-policy"),
      ]);

      setEmployees(employeeRes?.data?.data?.employees || []);

      setPolicies(policyRes?.data?.data || []);
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
  // FILTER
  // ======================================================

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp: any) => {
      const name = emp?.name?.toLowerCase() || "";

      const code = emp?.employeeCode?.toLowerCase() || "";

      return (
        name.includes(search.toLowerCase()) ||
        code.includes(search.toLowerCase())
      );
    });
  }, [employees, search]);

  // ======================================================
  // SELECT
  // ======================================================

  const toggleEmployee = (id: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // ======================================================
  // SELECT ALL
  // ======================================================

  const toggleSelectAll = () => {
    const allIds = filteredEmployees.map((emp: any) => emp.id);

    const isAllSelected = allIds.every((id: number) =>
      selectedEmployees.includes(id),
    );

    if (isAllSelected) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(allIds);
    }
  };

  // ======================================================
  // ASSIGN
  // ======================================================

  const handleAssign = async () => {
    try {
      if (!selectedEmployees.length) {
        return alert("Select employees");
      }

      if (!selectedPolicy) {
        return alert("Select policy");
      }

      setAssigning(true);

      await axiosInstance.post(
        "/work-schedule-policy/assign",

        {
          employeeIds: selectedEmployees,

          workSchedulePolicyId: selectedPolicy,
        },
      );

      alert("Policy assigned successfully");

      setSelectedEmployees([]);

      fetchData();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="assignment-page">
          {/* ====================================================== */}
          {/* HEADER */}
          {/* ====================================================== */}

          <div className="top-header">
            <div>
              <h1>Employee Work Schedule Assignment</h1>

              <p>Assign work schedule policies to employees</p>
            </div>
          </div>

          {/* ====================================================== */}
          {/* ACTION BAR */}
          {/* ====================================================== */}

          <div className="action-bar">
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={selectedPolicy}
              onChange={(e) => setSelectedPolicy(e.target.value)}
            >
              <option value="">Select Policy</option>

              {policies.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>

            <button
              className="assign-btn"
              disabled={assigning}
              onClick={handleAssign}
            >
              {assigning
                ? "Assigning..."
                : `Assign Policy (${selectedEmployees.length})`}
            </button>
          </div>

          {/* ====================================================== */}
          {/* TABLE */}
          {/* ====================================================== */}

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={
                        filteredEmployees.length > 0 &&
                        filteredEmployees.every((emp: any) =>
                          selectedEmployees.includes(emp.id),
                        )
                      }
                    />
                  </th>

                  <th>Employee</th>

                  <th>Department</th>

                  <th>Current Policy</th>

                  <th>Shift</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}><SkeletonTable rows={5} columns={5} /></td>
                  </tr>
                ) : filteredEmployees.length ? (
                  filteredEmployees.map((emp: any) => (
                    <tr key={emp.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(emp.id)}
                          onChange={() => toggleEmployee(emp.id)}
                        />
                      </td>

                      <td>
                        <div className="employee-box">
                          <div className="avatar">{emp?.name?.[0]}</div>

                          <div>
                            <h4>{emp?.name}</h4>

                            <p>{emp?.employeeCode}</p>
                          </div>
                        </div>
                      </td>

                      <td>{emp?.department?.title || "--"}</td>

                      <td>
                        <div className="policy-badge">
                          {emp?.workSchedulePolicy?.title || "Not Assigned"}
                        </div>
                      </td>

                      <td>{emp?.workSchedulePolicy?.shift?.title || "--"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>No employees found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ====================================================== */}
          {/* STYLE */}
          {/* ====================================================== */}

          <style jsx>{`
            .assignment-page {
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

            .action-bar {
              display: grid;

              grid-template-columns:
                1fr
                280px
                auto;

              gap: 16px;

              margin-bottom: 24px;
            }

            .action-bar input,
            .action-bar select {
              height: 52px;

              border-radius: 14px;

              border: 1px solid #d1d5db;

              padding: 0 16px;

              outline: none;

              background: white;
            }

            .assign-btn {
              height: 52px;

              border: none;

              background: #111827;

              color: white;

              border-radius: 14px;

              padding: 0 20px;

              font-weight: 700;

              cursor: pointer;
            }

            .assign-btn:disabled {
              opacity: 0.7;

              cursor: not-allowed;
            }

            .table-card {
              background: white;

              border-radius: 24px;

              overflow: auto;

              border: 1px solid #e5e7eb;

              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            }

            table {
              width: 100%;

              border-collapse: collapse;
            }

            th {
              background: #f9fafb;

              padding: 18px;

              text-align: left;

              font-size: 13px;

              font-weight: 800;

              color: #374151;
            }

            td {
              padding: 18px;

              border-top: 1px solid #f3f4f6;
            }

            .employee-box {
              display: flex;

              align-items: center;

              gap: 14px;
            }

            .avatar {
              width: 48px;

              height: 48px;

              border-radius: 50%;

              background: #111827;

              color: white;

              display: flex;

              align-items: center;

              justify-content: center;

              font-weight: 700;

              font-size: 18px;
            }

            .employee-box h4 {
              margin: 0;

              font-size: 15px;

              color: #111827;
            }

            .employee-box p {
              margin: 4px 0 0;

              color: #6b7280;

              font-size: 13px;
            }

            .policy-badge {
              display: inline-flex;

              align-items: center;

              justify-content: center;

              padding: 8px 14px;

              border-radius: 999px;

              background: #eef2ff;

              color: #4338ca;

              font-size: 12px;

              font-weight: 700;
            }

            @media (max-width: 768px) {
              .assignment-page {
                padding: 16px;
              }

              .top-header h1 {
                font-size: 24px;
              }

              .action-bar {
                grid-template-columns: 1fr;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default EmployeeWorkScheduleAssignmentPage;
