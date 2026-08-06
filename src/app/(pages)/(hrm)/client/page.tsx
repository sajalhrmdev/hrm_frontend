"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

type Client = {
  id: number;

  name: string;

  companyName?: string | null;

  email?: string | null;

  phone?: string | null;

  address?: string | null;

  contactPerson?: string | null;

  status: "ACTIVE" | "INACTIVE";

  createdAt: string;
};

const ClientPage = () => {
  const [loading, setLoading] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [editingClient, setEditingClient] = useState<Client | null>(null);

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
    name: "",

    companyName: "",

    email: "",

    phone: "",

    address: "",

    contactPerson: "",

    status: "ACTIVE",
  });

  // ============================================
  // FETCH
  // ============================================

  const fetchClients = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/client?page=${page}&limit=10&search=${search}`,
      );

      setClients(res?.data?.data?.clients || []);

      setPagination(res?.data?.data?.pagination);
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page]);

  // ============================================
  // SEARCH
  // ============================================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    setPage(1);

    fetchClients();
  };

  // ============================================
  // CHANGE
  // ============================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
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

      companyName: "",

      email: "",

      phone: "",

      address: "",

      contactPerson: "",

      status: "ACTIVE",
    });

    setEditingClient(null);
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

  const handleEdit = (client: Client) => {
    setEditingClient(client);

    setFormData({
      name: client.name,

      companyName: client.companyName || "",

      email: client.email || "",

      phone: client.phone || "",

      address: client.address || "",

      contactPerson: client.contactPerson || "",

      status: client.status,
    });

    setShowModal(true);
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClient) {
        await axiosInstance.put(`/client/${editingClient.id}`, formData);

        alert("Client updated successfully");
      } else {
        await axiosInstance.post("/client", formData);

        alert("Client created successfully");
      }

      setShowModal(false);

      resetForm();

      fetchClients();
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
      const confirmDelete = window.confirm("Delete client?");

      if (!confirmDelete) {
        return;
      }

      await axiosInstance.delete(`/client/${id}`);

      alert("Client deleted");

      fetchClients();
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
            <h3 className="fw-bold mb-1">👥 Client Management</h3>

            <p className="text-muted mb-0">Manage all clients</p>
          </div>

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            ➕ Add Client
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
                    placeholder="Search client..."
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
              <SkeletonTable rows={5} columns={6} />
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>

                      <th>Client Name</th>

                      <th>Company</th>

                      <th>Email</th>

                      <th>Phone</th>

                      <th>Contact Person</th>

                      <th>Status</th>

                      <th>Created</th>

                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-4">
                          No clients found
                        </td>
                      </tr>
                    ) : (
                      clients.map((item, index) => (
                        <tr key={item.id}>
                          <td>{(page - 1) * 10 + index + 1}</td>

                          <td>
                            <div className="fw-semibold">{item.name}</div>
                          </td>

                          <td>{item.companyName || "-"}</td>

                          <td>{item.email || "-"}</td>

                          <td>{item.phone || "-"}</td>

                          <td>{item.contactPerson || "-"}</td>

                          <td>
                            {item.status === "ACTIVE" ? (
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              {/* HEADER */}

              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingClient ? "✏ Edit Client" : "➕ Add Client"}
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
                        Client Name
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

                    {/* COMPANY NAME */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Company Name
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
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

                    {/* CONTACT PERSON */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Contact Person
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                      />
                    </div>

                    {/* STATUS */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Status</label>

                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="ACTIVE">ACTIVE</option>

                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>

                    {/* ADDRESS */}

                    <div className="col-12">
                      <label className="form-label fw-semibold">Address</label>

                      <textarea
                        className="form-control"
                        name="address"
                        rows={2}
                        value={formData.address}
                        onChange={handleChange}
                      />
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
                    {editingClient ? "Update Client" : "Create Client"}
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

export default ClientPage;
