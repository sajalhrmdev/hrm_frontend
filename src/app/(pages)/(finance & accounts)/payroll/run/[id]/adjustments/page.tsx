"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

import { useParams } from "next/navigation";

// ======================================================
// TYPES
// ======================================================

type Employee = {
  id: number;

  name: string;

  employeeCode: string;
};

type SalaryComponent = {
  id: number;

  name: string;

  code: string;

  type: "EARNING" | "DEDUCTION" | "EMPLOYER_CONTRIBUTION";
};

type Adjustment = {
  id: number;

  amount: number;

  note?: string;

  employee: Employee;

  salaryComponent: SalaryComponent;
};

// ======================================================

const PayrollAdjustmentsPage = () => {
  const params = useParams();

  const payrollRunId = Number(params.id);

  // ======================================================
  // STATES
  // ======================================================

  const [loading, setLoading] = useState(false);

  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>(
    [],
  );

  // ======================================================
  // SINGLE FORM
  // ======================================================

  const [formData, setFormData] = useState({
    employeeId: "",

    salaryComponentId: "",

    amount: "",

    note: "",
  });

  // ======================================================
  // BULK FORM
  // ======================================================

  const [bulkForm, setBulkForm] = useState({
    salaryComponentId: "",

    amount: "",

    note: "",
  });

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const [adjustmentRes, employeeRes, componentRes] = await Promise.all([
        axiosInstance.get(`/payroll-adjustment/${payrollRunId}`),

        axiosInstance.get("/employee"),

        axiosInstance.get("/salary-component"),
      ]);

      setAdjustments(adjustmentRes.data.data || []);

      setEmployees(employeeRes.data.data.employees || []);

      setSalaryComponents(componentRes.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ======================================================
  // CREATE SINGLE
  // ======================================================

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axiosInstance.post(
        "/payroll-adjustment",

        {
          payrollRunId,

          employeeId: Number(formData.employeeId),

          salaryComponentId: Number(formData.salaryComponentId),

          amount: Number(formData.amount),

          note: formData.note,
        },
      );

      alert("Adjustment added");

      setFormData({
        employeeId: "",

        salaryComponentId: "",

        amount: "",

        note: "",
      });

      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message);
    }
  };

  // ======================================================
  // BULK CREATE
  // ======================================================

  const handleBulk = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axiosInstance.post(
        "/payroll-adjustment/bulk",

        {
          payrollRunId,

          salaryComponentId: Number(bulkForm.salaryComponentId),

          amount: Number(bulkForm.amount),

          applyTo: "ALL",

          note: bulkForm.note,
        },
      );

      alert("Bulk adjustment added");

      setBulkForm({
        salaryComponentId: "",

        amount: "",

        note: "",
      });

      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message);
    }
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Delete adjustment?");

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/payroll-adjustment/${id}`);

      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container py-4">
          {/* ====================================== */}
          {/* HEADER */}
          {/* ====================================== */}

          <div className="mb-4">
            <h3 className="fw-bold">🎁 Payroll Adjustments</h3>

            <p className="text-muted mb-0">
              Manage bonuses, incentives & deductions
            </p>
          </div>

          {/* ====================================== */}
          {/* BULK */}
          {/* ====================================== */}

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="mb-3">🌍 Bulk Adjustment</h5>

              <form onSubmit={handleBulk}>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Component</label>

                    <select
                      className="form-select"
                      value={bulkForm.salaryComponentId}
                      onChange={(e) =>
                        setBulkForm({
                          ...bulkForm,

                          salaryComponentId: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>

                      {salaryComponents.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Amount</label>

                    <input
                      type="number"
                      className="form-control"
                      value={bulkForm.amount}
                      onChange={(e) =>
                        setBulkForm({
                          ...bulkForm,

                          amount: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-5 mb-3">
                    <label className="form-label">Note</label>

                    <input
                      type="text"
                      className="form-control"
                      value={bulkForm.note}
                      onChange={(e) =>
                        setBulkForm({
                          ...bulkForm,

                          note: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  Add For All Employees
                </button>
              </form>
            </div>
          </div>

          {/* ====================================== */}
          {/* SINGLE */}
          {/* ====================================== */}

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="mb-3">👤 Employee Adjustment</h5>

              <form onSubmit={handleCreate}>
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Employee</label>

                    <select
                      className="form-select"
                      value={formData.employeeId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          employeeId: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>

                      {employees.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Component</label>

                    <select
                      className="form-select"
                      value={formData.salaryComponentId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          salaryComponentId: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>

                      {salaryComponents.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-2 mb-3">
                    <label className="form-label">Amount</label>

                    <input
                      type="number"
                      className="form-control"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          amount: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Note</label>

                    <input
                      type="text"
                      className="form-control"
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          note: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-success">
                  Add Adjustment
                </button>
              </form>
            </div>
          </div>

          {/* ====================================== */}
          {/* TABLE */}
          {/* ====================================== */}

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">📋 Added Adjustments</h5>

              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>

                        <th>Employee</th>

                        <th>Component</th>

                        <th>Type</th>

                        <th>Amount</th>

                        <th>Note</th>

                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {adjustments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4">
                            No adjustments found
                          </td>
                        </tr>
                      ) : (
                        adjustments.map((item, index) => (
                          <tr key={item.id}>
                            <td>{index + 1}</td>

                            <td>{item.employee.name}</td>

                            <td>{item.salaryComponent.name}</td>

                            <td>
                              <span
                                className={`badge ${
                                  item.salaryComponent.type === "EARNING"
                                    ? "bg-success"
                                    : item.salaryComponent.type ===
                                        "EMPLOYER_CONTRIBUTION"
                                      ? "bg-secondary"
                                      : "bg-danger"
                                }`}
                              >
                                {item.salaryComponent.type}
                              </span>
                            </td>

                            <td>₹{item.amount}</td>

                            <td>{item.note || "-"}</td>

                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </button>
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
    </div>
  );
};

export default PayrollAdjustmentsPage;
