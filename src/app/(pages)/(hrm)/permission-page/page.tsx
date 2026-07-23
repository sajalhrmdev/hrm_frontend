"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

// ======================================================
// TYPES
// ======================================================

type Permission = {
  id: number;

  name: string;

  label?: string;
};

// ======================================================
// COMPONENT
// ======================================================

const PermissionPage = () => {
  // ======================================================
  // STATES
  // ======================================================

  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",

    label: "",
  });

  const [bulkOpen, setBulkOpen] = useState(false);

  const [bulkText, setBulkText] = useState("");

  const [bulkLoading, setBulkLoading] = useState(false);

  const [bulkResult, setBulkResult] = useState<{
    created: number;
    skipped: number;
    skippedNames: string[];
  } | null>(null);

  // ======================================================
  // FETCH
  // ======================================================

  const fetchPermissions = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/permission");

      setPermissions(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // ======================================================
  // INPUT
  // ======================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  // ======================================================
  // CREATE / UPDATE
  // ======================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editId) {
        await axiosInstance.put(
          `/permission/${editId}`,

          formData,
        );

        alert("✅ Permission updated");
      } else {
        await axiosInstance.post(
          "/permission",

          formData,
        );

        alert("✅ Permission created");
      }

      // reset

      setFormData({
        name: "",

        label: "",
      });

      setEditId(null);

      setOpenModal(false);

      fetchPermissions();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (permission: Permission) => {
    setEditId(permission.id);

    setFormData({
      name: permission.name,

      label: permission.label || "",
    });

    setOpenModal(true);
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Delete permission?");

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/permission/${id}`);

      alert("✅ Permission deleted");

      fetchPermissions();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  // ======================================================
  // BULK CREATE
  // ======================================================

  const handleBulkCreate = async () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      alert("Paste at least one permission name");
      return;
    }

    try {
      setBulkLoading(true);

      const res = await axiosInstance.post("/permission/bulk", {
        permissions: lines.map((name) => ({ name })),
      });

      setBulkResult(res.data.data);

      fetchPermissions();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Bulk create failed");
    } finally {
      setBulkLoading(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="permission-page">
          {/* HEADER */}

          <div className="permission-header">
            <div>
              <h2>🔐 Permissions</h2>

              <p>Manage system permissions</p>
            </div>

            <div className="header-actions">
              <button
                className="create-btn"
                onClick={() => {
                  setEditId(null);

                  setFormData({
                    name: "",

                    label: "",
                  });

                  setOpenModal(true);
                }}
              >
                ➕ Create Permission
              </button>

              <button
                className="bulk-btn"
                onClick={() => {
                  setBulkText("");

                  setBulkResult(null);

                  setBulkOpen(true);
                }}
              >
                📋 Bulk Create
              </button>
            </div>
          </div>

          {/* TABLE */}

          <div className="table-wrapper">
            <table className="permission-table">
              <thead>
                <tr>
                  <th>ID</th>

                  <th>Name</th>

                  <th>Label</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.id}>
                    <td>{permission.id}</td>

                    <td>
                      <span className="permission-badge">
                        {permission.name}
                      </span>
                    </td>

                    <td>{permission.label || "-"}</td>

                    <td>
                      <div className="action-group">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(permission)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(permission.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!permissions.length && !loading && (
              <div className="empty">No permissions found</div>
            )}
          </div>

          {/* MODAL */}

          {openModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <div className="modal-header">
                  <h3>
                    {editId ? "✏️ Update Permission" : "➕ Create Permission"}
                  </h3>

                  <button
                    className="close-btn"
                    onClick={() => setOpenModal(false)}
                  >
                    ✖
                  </button>
                </div>

                {/* FORM */}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Permission Name</label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="employee.create"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Label</label>

                    <input
                      type="text"
                      name="label"
                      value={formData.label}
                      onChange={handleChange}
                      placeholder="Create Employee"
                    />
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editId
                        ? "Update Permission"
                        : "Create Permission"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* BULK CREATE MODAL */}

          {bulkOpen && (
            <div className="modal-overlay">
              <div className="modal-box bulk-modal">
                <div className="modal-header">
                  <h3>📋 Bulk Create Permissions</h3>

                  <button
                    className="close-btn"
                    onClick={() => setBulkOpen(false)}
                  >
                    ✖
                  </button>
                </div>

                {!bulkResult ? (
                  <>
                    <p className="bulk-hint">
                      Paste one permission name per line
                    </p>

                    <textarea
                      className="bulk-textarea"
                      rows={12}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder={`Sidebar Leave\nSidebar Leave Approval\nSidebar Leave Balance\nSidebar Salary\nSidebar Salary Component`}
                    />

                    <button
                      className="submit-btn"
                      onClick={handleBulkCreate}
                      disabled={bulkLoading}
                    >
                      {bulkLoading
                        ? "Creating..."
                        : `Create ${bulkText.split("\n").filter((l) => l.trim()).length} Permissions`}
                    </button>
                  </>
                ) : (
                  <div className="bulk-result">
                    <div className="bulk-result-stat">
                      <span className="bulk-created">
                        ✅ Created: {bulkResult.created}
                      </span>

                      <span className="bulk-skipped">
                        ⏭️ Skipped: {bulkResult.skipped}
                      </span>
                    </div>

                    {bulkResult.skippedNames.length > 0 && (
                      <div className="bulk-skipped-list">
                        <p>Already existing:</p>

                        {bulkResult.skippedNames.map((name) => (
                          <span key={name} className="bulk-skip-item">
                            {name}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      className="submit-btn"
                      onClick={() => {
                        setBulkOpen(false);

                        setBulkResult(null);
                      }}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STYLES */}

          <style jsx>{`
            .permission-page {
              padding: 24px;
            }

            .permission-header {
              display: flex;

              justify-content: space-between;

              align-items: center;

              margin-bottom: 24px;

              gap: 20px;

              flex-wrap: wrap;
            }

            .permission-header h2 {
              margin: 0;

              font-size: 30px;

              font-weight: 700;
            }

            .permission-header p {
              margin-top: 4px;

              color: #666;
            }

            .header-actions {
              display: flex;
              gap: 10px;
            }

            .create-btn {
              border: none;

              background: #2563eb;

              color: #fff;

              padding: 12px 18px;

              border-radius: 12px;

              font-weight: 600;

              cursor: pointer;

              transition: 0.2s;
            }

            .create-btn:hover {
              transform: translateY(-2px);
            }

            .bulk-btn {
              border: none;

              background: #7c3aed;

              color: #fff;

              padding: 12px 18px;

              border-radius: 12px;

              font-weight: 600;

              cursor: pointer;

              transition: 0.2s;
            }

            .bulk-btn:hover {
              transform: translateY(-2px);
            }

            .table-wrapper {
              background: #fff;

              border-radius: 20px;

              overflow: hidden;

              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
            }

            .permission-table {
              width: 100%;

              border-collapse: collapse;
            }

            .permission-table th {
              background: #f8fafc;

              padding: 16px;

              text-align: left;
            }

            .permission-table td {
              padding: 16px;

              border-top: 1px solid #eee;
            }

            .permission-badge {
              background: #eff6ff;

              color: #2563eb;

              padding: 6px 10px;

              border-radius: 999px;

              font-size: 13px;

              font-weight: 600;
            }

            .action-group {
              display: flex;

              gap: 10px;
            }

            .edit-btn {
              border: none;

              background: #f59e0b;

              color: #fff;

              padding: 8px 12px;

              border-radius: 10px;

              cursor: pointer;
            }

            .delete-btn {
              border: none;

              background: #dc2626;

              color: #fff;

              padding: 8px 12px;

              border-radius: 10px;

              cursor: pointer;
            }

            .empty {
              padding: 30px;

              text-align: center;

              color: #666;
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

              max-width: 500px;

              background: #fff;

              border-radius: 20px;

              padding: 24px;
            }

            .modal-header {
              display: flex;

              justify-content: space-between;

              align-items: center;

              margin-bottom: 20px;
            }

            .close-btn {
              border: none;

              background: none;

              font-size: 18px;

              cursor: pointer;
            }

            .form-group {
              margin-bottom: 18px;
            }

            .form-group label {
              display: block;

              margin-bottom: 8px;

              font-weight: 600;
            }

            .form-group input {
              width: 100%;

              padding: 12px;

              border-radius: 12px;

              border: 1px solid #ddd;
            }

            .submit-btn {
              width: 100%;

              border: none;

              background: #2563eb;

              color: #fff;

              padding: 14px;

              border-radius: 12px;

              font-weight: 700;

              cursor: pointer;
            }

            .bulk-modal {
              max-width: 600px;
            }

            .bulk-hint {
              color: #666;
              margin-bottom: 12px;
              font-size: 14px;
            }

            .bulk-textarea {
              width: 100%;
              padding: 12px;
              border-radius: 12px;
              border: 1px solid #ddd;
              font-family: monospace;
              font-size: 14px;
              resize: vertical;
              margin-bottom: 16px;
            }

            .bulk-textarea:focus {
              outline: none;
              border-color: #7c3aed;
            }

            .bulk-result {
              text-align: center;
            }

            .bulk-result-stat {
              display: flex;
              justify-content: center;
              gap: 24px;
              margin-bottom: 20px;
              font-size: 18px;
              font-weight: 600;
            }

            .bulk-created {
              color: #16a34a;
            }

            .bulk-skipped {
              color: #d97706;
            }

            .bulk-skipped-list {
              background: #fef3c7;
              padding: 12px;
              border-radius: 10px;
              margin-bottom: 20px;
              text-align: left;
            }

            .bulk-skipped-list p {
              margin: 0 0 8px;
              font-weight: 600;
              font-size: 13px;
            }

            .bulk-skip-item {
              display: inline-block;
              background: #fde68a;
              padding: 4px 10px;
              border-radius: 6px;
              margin: 2px 4px 2px 0;
              font-size: 12px;
              font-family: monospace;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default PermissionPage;
