"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

// ======================================================

type Props = {
  employeeId: number;
};

// ======================================================

const EmployeeSalaryTab = ({ employeeId }: Props) => {
  // ======================================================
  // STATES
  // ======================================================

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [salaryData, setSalaryData] = useState<any>(null);

  const [components, setComponents] = useState<any[]>([]);

  const [allSalaryComponents, setAllSalaryComponents] = useState<any[]>([]);

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const [salaryRes, componentRes] = await Promise.all([
        axiosInstance.get(`/employee-salary/${employeeId}`),

        axiosInstance.get("/salary-component"),
      ]);

      setSalaryData(salaryRes?.data?.data);

      setComponents(salaryRes?.data?.data?.salaryStructure || []);

      setAllSalaryComponents(componentRes?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleAmountChange = (index: number, value: string) => {
    const updated = [...components];

    updated[index].amount = value;

    setComponents(updated);
  };

  // ======================================================
  // ADD ROW
  // ======================================================

  const addRow = () => {
    setComponents([
      ...components,

      {
        salaryComponentId: "",

        amount: "",
      },
    ]);
  };

  // ======================================================
  // COMPONENT CHANGE
  // ======================================================

  const handleComponentChange = (index: number, value: string) => {
    const updated = [...components];

    updated[index].salaryComponentId = value;

    setComponents(updated);
  };

  // ======================================================
  // SAVE
  // ======================================================

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = components.map((item: any) => ({
        salaryComponentId: Number(
          item.salaryComponentId || item.salaryComponent?.id,
        ),

        amount: Number(item.amount),
      }));

      await axiosInstance.post(
        "/employee-salary/assign",

        {
          employeeId,

          components: payload,
        },
      );

      alert("Salary structure saved successfully");

      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Delete salary component?");

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/employee-salary/${id}`);

      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="salary-loading">
        <div className="spinner-border text-success" />

        <p className="mt-3 mb-0">Loading salary structure...</p>
      </div>
    );
  }

  // ======================================================
  // SUMMARY
  // ======================================================

  const summary = salaryData?.summary;

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="salary-page">
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="salary-top-card">
        <div>
          <h3 className="salary-title">💰 Salary Structure</h3>

          <p className="salary-subtitle">
            Manage employee earnings & deductions
          </p>
        </div>

        <button className="add-btn" onClick={addRow}>
          + Add Component
        </button>
      </div>

      {/* ====================================== */}
      {/* SUMMARY */}
      {/* ====================================== */}

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="summary-card earning-card">
            <h6>Total Earnings</h6>

            <h3>₹{summary?.totalEarning?.toLocaleString("en-IN") || 0}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="summary-card deduction-card">
            <h6>Total Deductions</h6>

            <h3>₹{summary?.totalDeduction?.toLocaleString("en-IN") || 0}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="summary-card net-card">
            <h6>Net Salary</h6>

            <h3>₹{summary?.netSalary?.toLocaleString("en-IN") || 0}</h3>
          </div>
        </div>
      </div>

      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <div className="salary-table-card">
        <div className="table-responsive">
          <table className="table salary-table align-middle">
            <thead>
              <tr>
                <th>Component</th>

                <th>Type</th>

                <th>Amount</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {components.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    No salary structure found
                  </td>
                </tr>
              ) : (
                components.map((item: any, index: number) => {
                  const component = item.salaryComponent;

                  return (
                    <tr key={item.id || index}>
                      {/* COMPONENT */}

                      <td
                        style={{
                          minWidth: "250px",
                        }}
                      >
                        <select
                          className="salary-input"
                          value={item.salaryComponentId || component?.id || ""}
                          onChange={(e) =>
                            handleComponentChange(
                              index,

                              e.target.value,
                            )
                          }
                        >
                          <option value="">Select Component</option>

                          {allSalaryComponents.map((comp: any) => (
                            <option key={comp.id} value={comp.id}>
                              {comp.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* TYPE */}

                      <td>
                        <span
                          className={`salary-badge ${
                            component?.type === "EARNING"
                              ? "earning"
                              : "deduction"
                          }`}
                        >
                          {component?.type || "-"}
                        </span>
                      </td>

                      {/* AMOUNT */}

                      <td>
                        <input
                          type="number"
                          className="salary-input"
                          value={item.amount}
                          onChange={(e) =>
                            handleAmountChange(
                              index,

                              e.target.value,
                            )
                          }
                        />
                      </td>

                      {/* ACTION */}

                      <td>
                        {item.id && (
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* SAVE */}

        <div className="save-wrapper">
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : (
              <>💾 Save Salary Structure</>
            )}
          </button>
        </div>
      </div>

      {/* ====================================== */}
      {/* STYLE */}
      {/* ====================================== */}

      <style jsx>{`
        .salary-page {
          width: 100%;
        }

        .salary-top-card {
          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-bottom: 24px;

          padding: 24px 28px;

          background: linear-gradient(135deg, #ffffff, #f0fdf4);

          border-radius: 18px;

          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.06);

          border: 1px solid #dcfce7;
        }

        .salary-title {
          font-size: 28px;

          font-weight: 800;

          color: #111827;

          margin-bottom: 6px;
        }

        .salary-subtitle {
          margin: 0;

          color: #6b7280;

          font-size: 14px;
        }

        .add-btn {
          border: none;

          background: linear-gradient(135deg, #16a34a, #15803d);

          color: white;

          height: 46px;

          padding: 0 22px;

          border-radius: 12px;

          font-size: 14px;

          font-weight: 700;

          box-shadow: 0 8px 22px rgba(22, 163, 74, 0.25);
        }

        .summary-card {
          border-radius: 18px;

          padding: 24px;

          color: white;

          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .summary-card h6 {
          margin-bottom: 12px;

          opacity: 0.9;
        }

        .summary-card h3 {
          margin: 0;

          font-size: 28px;

          font-weight: 800;
        }

        .earning-card {
          background: linear-gradient(135deg, #16a34a, #15803d);
        }

        .deduction-card {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
        }

        .net-card {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }

        .salary-table-card {
          background: white;

          border-radius: 20px;

          padding: 28px;

          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);

          border: 1px solid #edf2f7;
        }

        .salary-table th {
          background: #f9fafb;

          color: #111827;

          font-weight: 700;

          border-bottom: 1px solid #e5e7eb;

          padding: 16px;
        }

        .salary-table td {
          padding: 16px;

          vertical-align: middle;
        }

        .salary-input {
          width: 100%;

          height: 48px;

          border-radius: 12px;

          border: 1px solid #d1d5db;

          padding: 0 14px;

          font-size: 14px;

          background: #f9fafb;

          outline: none;

          transition: 0.2s ease;

          writing-mode: horizontal-tb !important;

          transform: none !important;
        }

        .salary-input:focus {
          background: white;

          border-color: #16a34a;

          box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.12);
        }

        .salary-badge {
          padding: 8px 14px;

          border-radius: 999px;

          font-size: 12px;

          font-weight: 700;
        }

        .earning {
          background: #dcfce7;

          color: #166534;
        }

        .deduction {
          background: #fee2e2;

          color: #991b1b;
        }

        .delete-btn {
          border: none;

          background: #fee2e2;

          color: #991b1b;

          padding: 10px 14px;

          border-radius: 10px;

          font-size: 13px;

          font-weight: 700;
        }

        .save-wrapper {
          margin-top: 28px;

          display: flex;

          justify-content: flex-end;
        }

        .save-btn {
          border: none;

          background: linear-gradient(135deg, #16a34a, #15803d);

          color: white;

          height: 52px;

          padding: 0 28px;

          border-radius: 14px;

          font-size: 15px;

          font-weight: 700;

          box-shadow: 0 10px 24px rgba(22, 163, 74, 0.25);
        }

        .salary-loading {
          height: 300px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;
        }

        @media (max-width: 768px) {
          .salary-top-card {
            flex-direction: column;

            align-items: flex-start;

            gap: 16px;
          }

          .salary-table-card {
            padding: 18px;
          }

          .save-btn {
            width: 100%;
          }

          .save-wrapper {
            justify-content: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeSalaryTab;
