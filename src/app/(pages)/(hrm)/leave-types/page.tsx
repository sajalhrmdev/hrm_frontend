"use client";

import React, { use, useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import LeaveTypeForm from "@/components/hrm/attendance/leaves/LeaveTypeForm";

type LeaveType = {
  id: number;
  name: string;
  code: string;
  is_paid: boolean;
  is_active: boolean;
  carryForward: boolean;
  maxDays: number | null;
};

const LeaveTypeList: React.FC = () => {
  const [data, setData] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔥 edit modal state
  const [editing, setEditing] = useState<LeaveType | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 🚀 fetch
  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/leave/types");

      setData(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  // 🔥 toggle active
  const handleToggle = async (id: number) => {
    try {
      await axiosInstance.patch(`/leave/type/${id}/toggle`);

      fetchLeaveTypes();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Toggle failed");
    }
  };

  // 🔥 delete
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/leave/type/${id}`);

      alert("Deleted successfully");

      fetchLeaveTypes();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  // 🔥 update submit
  const handleUpdate = async () => {
    if (!editing) return;

    try {
      await axiosInstance.put(`/leave/type/${editing.id}`, editing);

      alert("Updated successfully");

      setEditing(null);

      fetchLeaveTypes();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div
          style={{
            padding: "20px",
            borderRadius: "20px",
            background: "#fff",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2>📋 Leave Types</h2>

            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  border: "none",
                  background: "#2563eb",
                  color: "#fff",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "22px",
                  fontWeight: "bold",
                  boxShadow: "0 6px 20px rgba(37,99,235,.25)",
                }}
              >
                +
              </button>

              <div
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                }}
              >
                {data.length} Types
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Code</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Carry</th>
                    <th style={thStyle}>Max Days</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <td style={tdStyle}>{item.name}</td>

                      <td style={tdStyle}>
                        <span className="code-badge">{item.code}</span>
                      </td>

                      <td style={tdStyle}>
                        <span
                          className={
                            item.is_paid ? "paid-badge" : "unpaid-badge"
                          }
                        >
                          {item.is_paid ? "Paid" : "Unpaid"}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {item.carryForward ? "✅ Yes" : "❌ No"}
                      </td>

                      <td style={tdStyle}>{item.maxDays ?? "-"}</td>

                      <td style={tdStyle}>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={item.is_active}
                            onChange={() => handleToggle(item.id)}
                          />
                          <span className="slider"></span>
                        </label>
                      </td>

                      {/* ACTIONS */}
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                          }}
                        >
                          {/* EDIT */}
                          <button
                            className="edit-btn"
                            onClick={() => setEditing(item)}
                          >
                            ✏️
                          </button>

                          {/* DELETE */}
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(item.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 🔥 EDIT MODAL */}
          {editing && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>Edit Leave Type</h3>

                <input
                  type="text"
                  value={editing.name}
                  placeholder="Name"
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      name: e.target.value,
                    })
                  }
                />

                <input
                  type="text"
                  value={editing.code}
                  placeholder="Code"
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      code: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  value={editing.maxDays || 0}
                  placeholder="Max Days"
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      maxDays: Number(e.target.value),
                    })
                  }
                />

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button className="save-btn" onClick={handleUpdate}>
                    Save
                  </button>

                  <button
                    className="cancel-btn"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CREATE MODAL */}

          {showCreateModal && (
            <div className="modal-overlay">
              <div
                className="modal-box"
                style={{
                //   width: "500px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",

                    alignItems: "center",

                    // marginBottom: "10px",
                  }}
                >
                  {/* <h3>➕ Create Leave Type</h3> */}

                  <button
                    className="cancel-btn"
                    onClick={() => setShowCreateModal(false)}
                  >
                    ✖
                  </button>
                </div>

                <LeaveTypeForm />
              </div>
            </div>
          )}

          {/* 🔥 STYLES */}
          <style>{`
        th, td {
          padding: 14px;
        }

        .code-badge {
          background: #e0e7ff;
          color: #3730a3;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .paid-badge {
          background: #dcfce7;
          color: #166534;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .unpaid-badge {
          background: #fee2e2;
          color: #991b1b;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .edit-btn,
        .delete-btn,
        .save-btn,
        .cancel-btn {
          border: none;
          cursor: pointer;
          border-radius: 10px;
          padding: 8px 12px;
          transition: 0.2s;
        }

        .edit-btn {
          background: #2563eb;
          color: white;
        }

        .delete-btn {
          background: #dc2626;
          color: white;
        }

        .save-btn {
          background: #16a34a;
          color: white;
        }

        .cancel-btn {
          background: #6b7280;
          color: white;
        }

        .edit-btn:hover,
        .delete-btn:hover,
        .save-btn:hover,
        .cancel-btn:hover {
          transform: scale(1.05);
        }

        /* SWITCH */
        .switch {
          position: relative;
          display: inline-block;
          width: 46px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: #ccc;
          transition: .3s;
          border-radius: 30px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: white;
          transition: .3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background: #16a34a;
        }

        input:checked + .slider:before {
          transform: translateX(22px);
        }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .modal-box {
          background: white;
          padding: 24px;
          border-radius: 18px;
          width: 400px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          animation: fadeIn .2s ease;
        }

        .modal-box input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 10px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
        </div>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: "14px",
};

const tdStyle: React.CSSProperties = {
  padding: "14px",
};

export default LeaveTypeList;
