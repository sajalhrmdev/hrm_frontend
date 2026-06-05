"use client";
import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useMemo, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  globalRole?: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
  role?: {
    id: number;
    name: string;
  } | null;
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "ACTIVE",
    roleId: null as number | null,
  });

  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [res, roleRes] = await Promise.all([
        axiosInstance.get("/user"),
        axiosInstance.get("/role"),
      ]);

      setUsers(res.data.data || []);
      setRoles(roleRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // FILTERED USERS
  // ==========================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const value = search.toLowerCase();

      return (
        user.name?.toLowerCase().includes(value) ||
        user.email?.toLowerCase().includes(value) ||
        (user.phone || "").toLowerCase().includes(value)
      );
    });
  }, [users, search]);

  // ==========================================
  // STATS
  // ==========================================

  const totalUsers = users.length;

  const activeUsers = users.filter((u) => u.status === "ACTIVE").length;

  const inactiveUsers = users.filter((u) => u.status === "INACTIVE").length;

  const suspendedUsers = users.filter((u) => u.status === "SUSPENDED").length;

  // ==========================================
  // OPEN EDIT
  // ==========================================

  const openEditModal = (user: User) => {
    setSelectedUser(user);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      status: user.status,
      roleId: user.role?.id || null,
    });

    setShowEditModal(true);
  };

  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure?");

    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/user/${id}`);

      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };
  const handleCreateUser = async () => {
    try {
      await axiosInstance.post("/user", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        roleId: formData.roleId,
      });

      setShowCreateModal(false);

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        status: "ACTIVE",
        roleId: null,
      });

      fetchUsers();
    } catch (err: any) {
      console.error(err);

      alert(err?.response?.data?.message || "Failed to create user");
    }
  };
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await axiosInstance.patch(`/user/${selectedUser.id}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password || undefined,
        status: formData.status,
      });

      setShowEditModal(false);

      setSelectedUser(null);

      fetchUsers();
    } catch (err: any) {
      console.error(err);

      alert(err?.response?.data?.message || "Failed to update user");
    }
  };
  return (
    <>
      <style jsx>{`
        .users-page {
          padding: 28px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .top-header h2 {
          font-size: 32px;
          font-weight: 800;
          margin: 0;
          color: #111827;
          letter-spacing: -0.5px;
        }

        .top-header p {
          margin-top: 6px;
          color: #64748b;
          font-size: 15px;
        }

        .create-btn {
          border: none;
          padding: 13px 24px;
          border-radius: 14px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.35);
        }

        .create-btn:hover {
          transform: translateY(-2px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: #fff;
          padding: 24px;
          border-radius: 22px;
          border: 1px solid #eef2f7;
          box-shadow:
            0 10px 30px rgba(15, 23, 42, 0.05),
            0 1px 3px rgba(15, 23, 42, 0.08);
          transition: 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-card h6 {
          margin-bottom: 10px;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
        }

        .stat-card h3 {
          margin: 0;
          font-size: 36px;
          font-weight: 800;
          color: #0f172a;
        }

        .stat-card.active {
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
        }

        .stat-card.inactive {
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        }

        .stat-card.suspended {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
        }

        .table-card {
          background: #fff;
          padding: 24px;
          border-radius: 24px;
          border: 1px solid #eef2f7;
          box-shadow:
            0 10px 30px rgba(15, 23, 42, 0.05),
            0 1px 3px rgba(15, 23, 42, 0.08);
        }

        .search-input {
          width: 100%;
          padding: 14px 18px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          outline: none;
          font-size: 15px;
          transition: 0.3s;
          background: #fafafa;
        }

        .search-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .table-responsive {
          overflow-x: auto;
        }

        .user-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .user-table thead th {
          padding: 18px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f8fafc;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }

        .user-table tbody tr {
          transition: 0.25s;
        }

        .user-table tbody tr:hover {
          background: #f8fafc;
        }

        .user-table td {
          padding: 18px;
          border-bottom: 1px solid #eef2f7;
          font-size: 14px;
          color: #334155;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .status-badge.active {
          background: #dcfce7;
          color: #15803d;
        }

        .status-badge.inactive {
          background: #e2e8f0;
          color: #475569;
        }

        .status-badge.suspended {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-group {
          display: flex;
          gap: 8px;
        }

        .edit-btn {
          border: none;
          padding: 10px 16px;
          border-radius: 12px;
          background: #dbeafe;
          color: #1d4ed8;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .edit-btn:hover {
          transform: translateY(-2px);
        }

        .delete-btn {
          border: none;
          padding: 10px 16px;
          border-radius: 12px;
          background: #fee2e2;
          color: #dc2626;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .delete-btn:hover {
          transform: translateY(-2px);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .user-modal {
          width: 100%;
          max-width: 550px;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
          animation: modalPop 0.25s ease;
        }

        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .modal-header {
          padding: 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eef2f7;
        }

        .modal-header h3 {
          margin: 0;
          font-weight: 800;
          font-size: 22px;
        }

        .modal-header button {
          border: none;
          background: none;
          font-size: 20px;
          cursor: pointer;
        }

        .modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .modal-body input,
        .modal-body select {
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          outline: none;
          font-size: 14px;
          transition: 0.3s;
        }

        .modal-body input:focus,
        .modal-body select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .modal-footer {
          padding: 20px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #eef2f7;
        }

        .cancel-btn {
          border: none;
          padding: 12px 18px;
          border-radius: 12px;
          background: #f1f5f9;
          font-weight: 600;
          cursor: pointer;
        }

        .save-btn {
          border: none;
          padding: 12px 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.25);
        }

        @media (max-width: 992px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .users-page {
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .top-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .user-modal {
            width: 95%;
          }
        }
      `}</style>
      <div className="page-wrapper">
        <div className="content">
          <div className="users-page">
            {/* ===================================== */}
            {/* HEADER */}
            {/* ===================================== */}

            <div className="top-header">
              <div>
                <h2>User Management</h2>

                <p>Manage all platform users</p>
              </div>

              <button
                className="create-btn"
                onClick={() => setShowCreateModal(true)}
              >
                + Create User
              </button>
            </div>

            {/* ===================================== */}
            {/* STATS */}
            {/* ===================================== */}

            <div className="stats-grid">
              <div className="stat-card">
                <h6>Total Users</h6>

                <h3>{totalUsers}</h3>
              </div>

              <div className="stat-card active">
                <h6>Active Users</h6>

                <h3>{activeUsers}</h3>
              </div>

              <div className="stat-card inactive">
                <h6>Inactive Users</h6>

                <h3>{inactiveUsers}</h3>
              </div>

              <div className="stat-card suspended">
                <h6>Suspended Users</h6>

                <h3>{suspendedUsers}</h3>
              </div>
            </div>

            {/* ===================================== */}
            {/* SEARCH */}
            {/* ===================================== */}

            <div className="table-card">
              <div className="table-header">
                <input
                  type="text"
                  placeholder="Search user..."
                  autoComplete="off"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
                <p>Search Value: {search}</p>
              </div>

              {/* ================================= */}
              {/* TABLE */}
              {/* ================================= */}

              <div className="table-responsive">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Name</th>

                      <th>Email</th>

                      <th>Phone</th>

                      <th>Status</th>

                      <th>Global Role</th>

                      <th>Created At</th>

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7}>Loading...</td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7}>No users found</td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.name}</td>

                          <td>{user.email}</td>

                          <td>{user.phone || "-"}</td>

                          <td>
                            <span
                              className={`status-badge ${user.status.toLowerCase()}`}
                            >
                              {user.status}
                            </span>
                          </td>

                          <td>{user.globalRole?.name || "-"}</td>

                          <td>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>

                          <td>
                            <div className="action-group">
                              <button
                                className="edit-btn"
                                onClick={() => openEditModal(user)}
                              >
                                Edit
                              </button>

                              <button
                                className="delete-btn"
                                onClick={() => handleDelete(user.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {showCreateModal && (
              <div className="modal-overlay">
                <div className="user-modal">
                  <div className="modal-header">
                    <h3>Create User</h3>

                    <button onClick={() => setShowCreateModal(false)}>✕</button>
                  </div>

                  <div className="modal-body">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                    />

                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                    />

                    <input
                      type="text"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value,
                        })
                      }
                    />

                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value,
                        })
                      }
                    />
                    <select
                      value={formData.roleId || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          roleId: Number(e.target.value),
                        })
                      }
                    >
                      <option value="">Select Role</option>

                      {roles.map((role: any) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="cancel-btn"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>

                    <button className="save-btn" onClick={handleCreateUser}>
                      Create User
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showEditModal && (
              <div className="modal-overlay">
                <div className="user-modal">
                  <div className="modal-header">
                    <h3>Edit User</h3>

                    <button onClick={() => setShowEditModal(false)}>✕</button>
                  </div>

                  <div className="modal-body">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                    />

                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                    />

                    <input
                      type="text"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value,
                        })
                      }
                    />

                    <input
                      type="password"
                      placeholder="New Password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value,
                        })
                      }
                    />

                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="ACTIVE">ACTIVE</option>

                      <option value="INACTIVE">INACTIVE</option>

                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="cancel-btn"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>

                    <button className="save-btn" onClick={handleUpdateUser}>
                      Update User
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Users;
