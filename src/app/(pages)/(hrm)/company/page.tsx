"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { useAuth } from "@/providers/AuthContext";
import { useRouter } from "next/navigation";

type Company = {
  id: number;

  name: string;

  slug: string;

  email: string;

  phone: string;

  address: string;

  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";

  _count?: {
    employees: number;
  };
};

const CompanyPage = () => {
  const router = useRouter();

  const { loadAuth ,user} = useAuth();
  const [loading, setLoading] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,

    totalPages: 1,

    limit: 10,
  });

  const handleSwitchCompany = async (companyId: number) => {
    try {
      const res = await axiosInstance.post("/super-admin/switch-company", {
        companyId,
      });

      localStorage.setItem("token", res.data.data.token);

      await loadAuth();

      alert("Company switched successfully");

      router.push("/CompanyDailyAttendanceDashboard");
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to switch company");
    }
  };
  // ============================================
  // FORM
  // ============================================

  const [formData, setFormData] = useState({
    name: "",

    slug: "",

    email: "",

    phone: "",

    address: "",

    status: "ACTIVE",
  });

  // ============================================
  // FETCH
  // ============================================

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/company?page=${page}&limit=10&search=${search}`,
      );

      setCompanies(res?.data?.data?.companies || []);

      setPagination(res?.data?.data?.pagination);
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page]);

  // ============================================
  // SEARCH
  // ============================================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    setPage(1);

    fetchCompanies();
  };

  // ============================================
  // CHANGE
  // ============================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  // ============================================
  // RESET
  // ============================================

  const resetForm = () => {
    setFormData({
      name: "",

      slug: "",

      email: "",

      phone: "",

      address: "",

      status: "ACTIVE",
    });

    setEditingCompany(null);
  };

  // ============================================
  // CREATE OPEN
  // ============================================

  const handleOpenCreate = () => {
    resetForm();

    setShowModal(true);
  };

  // ============================================
  // EDIT OPEN
  // ============================================

  const handleEdit = (company: Company) => {
    setEditingCompany(company);

    setFormData({
      name: company.name,

      slug: company.slug,

      email: company.email,

      phone: company.phone,

      address: company.address,

      status: company.status,
    });

    setShowModal(true);
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCompany) {
        await axiosInstance.put(`/company/${editingCompany.id}`, formData);

        alert("Company updated successfully");
      } else {
        await axiosInstance.post("/company", formData);

        alert("Company created successfully");
      }

      setShowModal(false);

      resetForm();

      fetchCompanies();
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
      const confirmDelete = window.confirm("Deactivate company?");

      if (!confirmDelete) {
        return;
      }

      await axiosInstance.delete(`/company/${id}`);

      alert("Company deactivated");

      fetchCompanies();
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
            <h3 className="fw-bold mb-1">🏢 Company Management</h3>

            <p className="text-muted mb-0">Manage all companies</p>
          </div>

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            ➕ Add Company
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
                    placeholder="Search company..."
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

                      <th>Company</th>

                      <th>Slug</th>

                      <th>Email</th>

                      <th>Phone</th>

                      <th>Employees</th>

                      <th>Status</th>

                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {companies.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-4">
                          No companies found
                        </td>
                      </tr>
                    ) : (
                      companies.map((item, index) => (
                        <tr key={item.id}>
                          <td>{(page - 1) * 10 + index + 1}</td>

                          <td>
                            <div className="fw-semibold">{item.name}</div>

                            <small className="text-muted">{item.address}</small>
                          </td>

                          <td>{item.slug}</td>

                          <td>{item.email}</td>

                          <td>{item.phone}</td>

                          <td>{item._count?.employees}</td>

                          <td>
                            {item.status === "ACTIVE" ? (
                              <span className="badge bg-success">ACTIVE</span>
                            ) : item.status === "SUSPENDED" ? (
                              <span className="badge bg-warning text-dark">
                                SUSPENDED
                              </span>
                            ) : (
                              <span className="badge bg-danger">INACTIVE</span>
                            )}
                          </td>

                          <td>
                            {/* <div className="d-flex gap-2">
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
                                🗑 Deactivate
                              </button>
                            </div> */}
                            <div className="d-flex gap-2 flex-wrap">
                              <button
                                className={
                                  user?.activeCompanyId === item.id
                                    ? "btn btn-sm btn-primary"
                                    : "btn btn-sm btn-success"
                                }
                                onClick={() => handleSwitchCompany(item.id)}
                              >
                                {user?.activeCompanyId === item.id
                                  ? "✓ Active"
                                  : "🔄 Switch"}
                              </button>

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
                                🗑 Deactivate
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
          <div className="text-muted">Total: {pagination.total}</div>

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
              disabled={page === pagination.totalPages}
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              {/* HEADER */}

              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingCompany ? "✏ Edit Company" : "➕ Add Company"}
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
                    {/* NAME */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Company Name
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* SLUG */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Slug</label>

                      <input
                        type="text"
                        className="form-control"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        disabled={!!editingCompany}
                      />
                    </div>

                    {/* EMAIL */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email</label>

                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* PHONE */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone</label>

                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    {/* ADDRESS */}

                    <div className="col-12">
                      <label className="form-label fw-semibold">Address</label>

                      <textarea
                        className="form-control"
                        rows={3}
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>

                    {/* STATUS */}

                    {editingCompany && (
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Status</label>

                        <select
                          className="form-select"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          <option value="ACTIVE">ACTIVE</option>

                          <option value="SUSPENDED">SUSPENDED</option>

                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </div>
                    )}
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
                    {editingCompany ? "Update Company" : "Create Company"}
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

export default CompanyPage;
