"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

// ============================================
// TYPES
// ============================================

type Employee = {
  id: number;

  name: string;

  employeeCode?: string;
};

type LeaveType = {
  id: number;

  name: string;

  code: string;
};

type LeaveBalance = {
  id: number;

  year: number;

  total_allocated: number;

  used: number;

  remaining: number;

  employee: {
    id: number;

    name: string;

    employeeCode?: string;
  };

  leaveType: {
    id: number;

    name: string;

    code: string;
  };
};

const LeaveAllocationPage = () => {
  // ============================================
  // STATES
  // ============================================

  const [loading, setLoading] = useState(false);

  const [tableLoading, setTableLoading] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  const [balances, setBalances] = useState<LeaveBalance[]>([]);

  const currentYear = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState(currentYear);
  const [searchName, setSearchName] = useState("");

  // ============================================
  // FORM
  // ============================================

  const [formData, setFormData] = useState({
    employeeId: "",

    leaveTypeId: "",

    year: currentYear,

    total_allocated: 0,
  });

  // ============================================
  // FETCH INITIAL DATA
  // ============================================

  const fetchInitialData = async () => {
    try {
      const [empRes, leaveRes] = await Promise.all([
        axiosInstance.get("/employee"),

        axiosInstance.get("/leave/types?is_active=true"),
      ]);

      setEmployees(empRes?.data?.data?.employees || []);

      setLeaveTypes(leaveRes?.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ============================================
  // FETCH BALANCES
  // ============================================

  const fetchBalances = async () => {
    try {
      setTableLoading(true);

      const params = new URLSearchParams();
      params.append("year", String(filterYear));
      if (searchName.trim()) params.append("search", searchName.trim());

      const res = await axiosInstance.get(`/leave/balance/all?${params.toString()}`);

      setBalances(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setTableLoading(false);
    }
  };

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [filterYear]);

  // ============================================
  // HANDLE CHANGE
  // ============================================

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        name === "year" || name === "total_allocated"
          ? Number(value)
          : value,
    }));
  };

  // ============================================
  // RESET
  // ============================================

  const resetForm = () => {
    setFormData({
      employeeId: "",

      leaveTypeId: "",

      year: currentYear,

      total_allocated: 0,
    });
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axiosInstance.post("/leave/allocate", formData);

      alert("✅ Leave balance allocated successfully");

      resetForm();

      fetchBalances();
    } catch (err: any) {
      console.log(err);

      alert(
        err?.response?.data?.message || "Allocation failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* ============================================
            HEADER
        ============================================ */}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">
              🎯 Leave Balance Allocation
            </h3>

            <p className="text-muted mb-0">
              Allocate leave balances to employees
            </p>
          </div>
        </div>

        {/* ============================================
            FORM CARD
        ============================================ */}

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* EMPLOYEE */}

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Employee *
                  </label>

                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">
                      Select Employee
                    </option>

                    {employees.map((emp) => (
                      <option
                        key={emp.id}
                        value={emp.id}
                      >
                        {emp.name}
                        {emp.employeeCode
                          ? ` (${emp.employeeCode})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LEAVE TYPE */}

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Leave Type *
                  </label>

                  <select
                    name="leaveTypeId"
                    value={formData.leaveTypeId}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">
                      Select Leave Type
                    </option>

                    {leaveTypes.map((lt) => (
                      <option
                        key={lt.id}
                        value={lt.id}
                      >
                        {lt.name} ({lt.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* YEAR */}

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Year *
                  </label>

                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                {/* TOTAL DAYS */}

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Total Allocated Days *
                  </label>

                  <input
                    type="number"
                    name="total_allocated"
                    value={formData.total_allocated}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                {/* BUTTON */}

                <div className="col-12">
                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading
                        ? "Allocating..."
                        : "Allocate Leave"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ============================================
            TABLE
        ============================================ */}

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                📋 Allocated Leave Balances
              </h5>

              <div className="d-flex gap-2 align-items-center">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search employee name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchBalances()}
                  style={{ width: 220 }}
                />

                <select
                  className="form-select form-select-sm"
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                  style={{ width: 100 }}
                >
                  {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={fetchBalances}
                >
                  Search
                </button>
              </div>
            </div>

            {tableLoading ? (
              <div className="text-center py-5">
                Loading...
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>

                      <th>Employee</th>

                      <th>Leave Type</th>

                      <th>Year</th>

                      <th>Allocated</th>

                      <th>Used</th>

                      <th>Remaining</th>
                    </tr>
                  </thead>

                  <tbody>
                    {balances.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-4"
                        >
                          No leave balances found
                        </td>
                      </tr>
                    ) : (
                      balances.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>

                          <td>
                            <div className="fw-semibold">
                              {item.employee?.name}
                            </div>

                            <small className="text-muted">
                              {item.employee
                                ?.employeeCode || "-"}
                            </small>
                          </td>

                          <td>
                            {item.leaveType?.name} (
                            {item.leaveType?.code})
                          </td>

                          <td>{item.year}</td>

                          <td>
                            <span className="badge bg-primary">
                              {
                                item.total_allocated
                              }
                            </span>
                          </td>

                          <td>
                            <span className="badge bg-warning text-dark">
                              {item.used}
                            </span>
                          </td>

                          <td>
                            <span className="badge bg-success">
                              {item.remaining}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveAllocationPage;