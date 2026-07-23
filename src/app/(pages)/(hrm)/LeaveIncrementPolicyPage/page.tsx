"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

// ======================================================

const defaultForm = {
  leaveTypeId: "",

  title: "",

  incrementAmount: "",

  frequency: "MONTHLY",

  maxLimit: "",

  effectiveFrom: "",

  effectiveTo: "",

  isActive: true,
};

// ======================================================

const LeaveIncrementPolicyPage = () => {
  // ======================================================

  const [policies, setPolicies] = useState<any[]>([]);

  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState<any>(defaultForm);

  // ======================================================
  // FETCH POLICIES
  // ======================================================

  const fetchPolicies = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/leave-increment");

      setPolicies(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FETCH LEAVE TYPES
  // ======================================================

  const fetchLeaveTypes = async () => {
    try {
      const res = await axiosInstance.get("/leave/types");

      setLeaveTypes(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================

  useEffect(() => {
    fetchPolicies();

    fetchLeaveTypes();
  }, []);

  // ======================================================
  // CHANGE
  // ======================================================

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm((prev: any) => ({
      ...prev,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,

        leaveTypeId: Number(form.leaveTypeId),

        incrementAmount: Number(form.incrementAmount),

        maxLimit: form.maxLimit ? Number(form.maxLimit) : null,
      };

      if (editId) {
        await axiosInstance.put(
          `/leave/increment-policy/${editId}`,

          payload,
        );

        alert("Policy updated successfully");
      } else {
        await axiosInstance.post(
          "/leave-increment",

          payload,
        );

        alert("Policy created successfully");
      }

      setModalOpen(false);

      setEditId(null);

      setForm(defaultForm);

      fetchPolicies();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Something went wrong");
    }
  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (item: any) => {
    setEditId(item.id);

    setForm({
      leaveTypeId: item.leaveTypeId,

      title: item.title || "",

      incrementAmount: item.incrementAmount,

      frequency: item.frequency,

      maxLimit: item.maxLimit || "",

      effectiveFrom: item.effectiveFrom?.split("T")[0] || "",

      effectiveTo: item.effectiveTo?.split("T")[0] || "",

      isActive: item.isActive,
    });

    setModalOpen(true);
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Delete this policy?");

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/leave/increment-policy/${id}`);

      alert("Policy deleted successfully");

      fetchPolicies();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="leave-policy-page">
          {/* ====================================================== */}
          {/* HEADER */}
          {/* ====================================================== */}

          <div className="top-header">
            <div>
              <h1>Leave Increment Policies</h1>

              <p>Manage automated leave increment rules</p>
            </div>

            <button
              className="add-btn"
              onClick={() => {
                setEditId(null);

                setForm(defaultForm);

                setModalOpen(true);
              }}
            >
              + Create Policy
            </button>
          </div>

          {/* ====================================================== */}
          {/* TABLE */}
          {/* ====================================================== */}

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Leave Type</th>

                  <th>Title</th>

                  <th>Frequency</th>

                  <th>Increment</th>

                  <th>Max Limit</th>

                  <th>Status</th>

                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}><SkeletonTable rows={5} columns={7} /></td>
                  </tr>
                ) : policies.length ? (
                  policies.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item?.leaveType?.name}</td>

                      <td>{item.title}</td>

                      <td>
                        <span className="badge">{item.frequency}</span>
                      </td>

                      <td>+{item.incrementAmount}</td>

                      <td>{item.maxLimit || "--"}</td>

                      <td>
                        <span className={item.isActive ? "active" : "inactive"}>
                          {item.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>

                      <td>
                        <div className="action-group">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>No policies found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ====================================================== */}
          {/* MODAL */}
          {/* ====================================================== */}

          {modalOpen && (
            <div className="modal-overlay">
              <div className="modal-box">
                <div className="modal-header">
                  <h2>{editId ? "Update Policy" : "Create Policy"}</h2>

                  <button
                    className="close-btn"
                    onClick={() => setModalOpen(false)}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid">
                    <div className="form-group">
                      <label>Leave Type</label>

                      <select
                        name="leaveTypeId"
                        value={form.leaveTypeId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select</option>

                        {leaveTypes.map((item: any) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Title</label>

                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Increment Amount</label>

                      <input
                        type="number"
                        step="0.1"
                        name="incrementAmount"
                        value={form.incrementAmount}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Frequency</label>

                      <select
                        name="frequency"
                        value={form.frequency}
                        onChange={handleChange}
                      >
                        <option value="DAILY">DAILY</option>

                        <option value="WEEKLY">WEEKLY</option>

                        <option value="MONTHLY">MONTHLY</option>

                        <option value="YEARLY">YEARLY</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Max Limit</label>

                      <input
                        type="number"
                        name="maxLimit"
                        value={form.maxLimit}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Effective From</label>

                      <input
                        type="date"
                        name="effectiveFrom"
                        value={form.effectiveFrom}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Effective To</label>

                      <input
                        type="date"
                        name="effectiveTo"
                        value={form.effectiveTo}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                      />

                      <span>Active Policy</span>
                    </div>
                  </div>

                  <button type="submit" className="submit-btn">
                    {editId ? "Update Policy" : "Create Policy"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================== */}
      {/* CSS */}
      {/* ====================================================== */}

      <style jsx>{`
        .leave-policy-page {
          padding: 24px;
        }

        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .add-btn {
          border: none;
          background: #111827;
          color: white;
          height: 50px;
          padding: 0 22px;
          border-radius: 14px;
          cursor: pointer;
          font-weight: 700;
        }

        .table-card {
          background: white;
          border-radius: 24px;
          overflow: auto;
          border: 1px solid #e5e7eb;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #f9fafb;
          padding: 18px;
          text-align: left;
          font-size: 14px;
        }

        td {
          padding: 18px;
          border-top: 1px solid #f3f4f6;
        }

        .badge {
          background: #eef2ff;
          color: #4338ca;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .active {
          color: #15803d;
          font-weight: 700;
        }

        .inactive {
          color: #dc2626;
          font-weight: 700;
        }

        .action-group {
          display: flex;
          gap: 10px;
        }

        .edit-btn,
        .delete-btn {
          border: none;
          height: 38px;
          padding: 0 14px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .edit-btn {
          background: #dbeafe;
        }

        .delete-btn {
          background: #fee2e2;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }

        .modal-box {
          width: 100%;
          max-width: 760px;
          background: white;
          border-radius: 24px;
          padding: 24px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h2 {
          font-size: 24px;
          font-weight: 800;
        }

        .close-btn {
          border: none;
          background: none;
          font-size: 30px;
          cursor: pointer;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 700;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          height: 48px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 0 14px;
          outline: none;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
        }

        .submit-btn {
          width: 100%;
          height: 54px;
          border: none;
          border-radius: 16px;
          background: #111827;
          color: white;
          margin-top: 24px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .top-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default LeaveIncrementPolicyPage;
