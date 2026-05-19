"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

// ======================================================
// TYPES
// ======================================================

type Role = {
  id: number;

  name: string;

  description?: string;

  _count?: {
    employees: number;

    rolePermissions: number;
  };
};

// ======================================================
// COMPONENT
// ======================================================

const RolePage = () => {
  // ======================================================
  // STATES
  // ======================================================

  const [roles, setRoles] = useState<Role[]>([]);

  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",

    description: "",
  });

  // ======================================================
  // FETCH
  // ======================================================

  const fetchRoles = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/role");

      setRoles(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // ======================================================
  // INPUT
  // ======================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editId) {
        await axiosInstance.put(
          `/role/${editId}`,

          formData,
        );

        alert("✅ Role updated");
      } else {
        await axiosInstance.post(
          "/role",

          formData,
        );

        alert("✅ Role created");
      }

      // reset

      setFormData({
        name: "",

        description: "",
      });

      setEditId(null);

      setOpenModal(false);

      fetchRoles();
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

  const handleEdit = (role: Role) => {
    setEditId(role.id);

    setFormData({
      name: role.name,

      description: role.description || "",
    });

    setOpenModal(true);
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Delete this role?");

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/role/${id}`);

      alert("✅ Role deleted");

      fetchRoles();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="role-page">
          {/* HEADER */}

          <div className="role-header">
            <div>
              <h2>👥 Roles</h2>

              <p>Manage company roles</p>
            </div>

            <button
              className="create-btn"
              onClick={() => {
                setEditId(null);

                setFormData({
                  name: "",

                  description: "",
                });

                setOpenModal(true);
              }}
            >
              ➕ Create Role
            </button>
          </div>

          {/* TABLE */}

          <div className="table-wrapper">
            <table className="role-table">
              <thead>
                <tr>
                  <th>ID</th>

                  <th>Role</th>

                  <th>Description</th>

                  <th>Employees</th>

                  <th>Permissions</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.id}</td>

                    <td>
                      <span className="role-badge">{role.name}</span>
                    </td>

                    <td>{role.description || "-"}</td>

                    <td>{role._count?.employees || 0}</td>

                    <td>{role._count?.rolePermissions || 0}</td>

                    <td>
                      <div className="action-group">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(role)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(role.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!roles.length && !loading && (
              <div className="empty">No roles found</div>
            )}
          </div>

          {/* MODAL */}

          {openModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <div className="modal-header">
                  <h3>{editId ? "✏️ Update Role" : "➕ Create Role"}</h3>

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
                    <label>Role Name</label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="HR"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Role description"
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
                        ? "Update Role"
                        : "Create Role"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* STYLES */}

          <style jsx>{`
            .role-page {
              padding: 24px;
            }

            .role-header {
              display: flex;

              justify-content: space-between;

              align-items: center;

              margin-bottom: 24px;

              flex-wrap: wrap;

              gap: 20px;
            }

            .role-header h2 {
              margin: 0;

              font-size: 30px;

              font-weight: 700;
            }

            .role-header p {
              margin-top: 4px;

              color: #666;
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

            .table-wrapper {
              background: #fff;

              border-radius: 20px;

              overflow: hidden;

              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
            }

            .role-table {
              width: 100%;

              border-collapse: collapse;
            }

            .role-table th {
              background: #f8fafc;

              padding: 16px;

              text-align: left;
            }

            .role-table td {
              padding: 16px;

              border-top: 1px solid #eee;
            }

            .role-badge {
              background: #eff6ff;

              color: #2563eb;

              padding: 6px 12px;

              border-radius: 999px;

              font-size: 13px;

              font-weight: 700;
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

            .form-group input,
            .form-group textarea {
              width: 100%;

              padding: 12px;

              border-radius: 12px;

              border: 1px solid #ddd;
            }

            .form-group textarea {
              resize: none;

              min-height: 90px;
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
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default RolePage;
