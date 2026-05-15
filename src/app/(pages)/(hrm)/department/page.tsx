"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

type Department = {
  id: number;

  title: string;

  statusId: number;

  createdAt: string;

  _count?: {
    employees: number;
  };
};

const DepartmentPage = () => {
  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,

    totalPages: 1,

    limit: 10,
  });

  // ============================================
  // FORM
  // ============================================

  const [formData, setFormData] = useState({
    title: "",

    statusId: 1,
  });

  // ============================================
  // FETCH
  // ============================================

  const fetchDepartments = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/department?page=${page}&limit=10&search=${search}`,
      );

      setDepartments(res?.data?.data?.departments || []);

      setPagination(res?.data?.data?.pagination);
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page]);

  // ============================================
  // SEARCH
  // ============================================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    setPage(1);

    fetchDepartments();
  };

  // ============================================
  // CHANGE
  // ============================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: name === "statusId" ? Number(value) : value,
    }));
  };

  // ============================================
  // RESET
  // ============================================

  const resetForm = () => {
    setFormData({
      title: "",

      statusId: 1,
    });

    setEditingDepartment(null);
  };

  // ============================================
  // OPEN CREATE
  // ============================================

  const handleOpenCreate = () => {
    resetForm();

    setShowModal(true);
  };

  // ============================================
  // OPEN EDIT
  // ============================================

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);

    setFormData({
      title: department.title,

      statusId: department.statusId,
    });

    setShowModal(true);
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDepartment) {
        await axiosInstance.put(
          `/department/${editingDepartment.id}`,
          formData,
        );

        alert("Department updated successfully");
      } else {
        await axiosInstance.post("/department", formData);

        alert("Department created successfully");
      }

      setShowModal(false);

      resetForm();

      fetchDepartments();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed");
    }
  };

  // ============================================
  // DELETE
  // ============================================

  const handleDelete = async (id: number) => {
    try {
      const confirmDelete = window.confirm("Delete department?");

      if (!confirmDelete) {
        return;
      }

      await axiosInstance.delete(`/department/${id}`);

      alert("Department deleted");

      fetchDepartments();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* HEADER */}

        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">🏢 Department Management</h3>

            <p className="text-muted mb-0">Manage all departments</p>
          </div>

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            ➕ Add Department
          </button>
        </div>

        {/* SEARCH */}

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch}>
              <div className="row g-3">
                <div className="col-md-10">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <button type="submit" className="btn btn-dark w-100">
                    🔍 Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* TABLE */}

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">Loading...</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>

                      <th>Department</th>

                      <th>Employees</th>

                      <th>Status</th>

                      <th>Created</th>

                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {departments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          No departments found
                        </td>
                      </tr>
                    ) : (
                      departments.map((item, index) => (
                        <tr key={item.id}>
                          <td>{(page - 1) * 10 + index + 1}</td>

                          <td>
                            <div className="fw-semibold">{item.title}</div>
                          </td>

                          <td>{item._count?.employees}</td>

                          <td>
                            {item.statusId === 1 ? (
                              <span className="badge bg-success">ACTIVE</span>
                            ) : (
                              <span className="badge bg-danger">INACTIVE</span>
                            )}
                          </td>

                          <td>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>

                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-dark"
                                onClick={() => handleEdit(item)}
                              >
                                ✏ Edit
                              </button>

                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(item.id)}
                              >
                                🗑 Delete
                              </button>
                            </div>
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

        {/* PAGINATION */}

        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">Total: {pagination?.total}</div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-dark"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </button>

            <button className="btn btn-dark">{page}</button>

            <button
              className="btn btn-outline-dark"
              disabled={page === pagination?.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}

      {showModal && (
        <div
          className="modal d-block"
          style={{
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow-lg">
              {/* HEADER */}

              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingDepartment
                    ? "✏ Edit Department"
                    : "➕ Add Department"}
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              {/* FORM */}

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* TITLE */}

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Department Name
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* STATUS */}

                    <div className="col-12">
                      <label className="form-label fw-semibold">Status</label>

                      <select
                        className="form-select"
                        name="statusId"
                        value={formData.statusId}
                        onChange={handleChange}
                      >
                        <option value={1}>ACTIVE</option>

                        <option value={0}>INACTIVE</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>

                  <button type="submit" className="btn btn-primary">
                    {editingDepartment
                      ? "Update Department"
                      : "Create Department"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentPage;
