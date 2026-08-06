"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

type Visit = {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  employeeId?: number | null;
  employee?: { id: number; name: string; employeeCode?: string | null } | null;
  clientId?: number | null;
  client?: { id: number; name: string; companyName?: string | null } | null;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
};

type Employee = {
  id: number;
  name: string;
  employeeCode?: string;
};

type Client = {
  id: number;
  name: string;
  companyName?: string;
};

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: "bg-primary",
  COMPLETED: "bg-success",
  CANCELLED: "bg-danger",
};

const toDateInputValue = (d: string) => {
  const dt = new Date(d);
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${m}-${day}`;
};

const VisitPage = () => {
  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Visit | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10,
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    employeeId: "",
    clientId: "",
    startTime: "",
    endTime: "",
    status: "SCHEDULED",
  });

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/visit?page=${page}&limit=10&search=${search}`,
      );
      setVisits(res?.data?.data?.visits || []);
      setPagination(res?.data?.data?.pagination);
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.message || "Failed to fetch visits");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/employee?limit=500");
      setEmployees(res?.data?.data?.employees || res?.data?.data || []);
    } catch (err: any) {
      console.log(err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axiosInstance.get("/client?limit=500");
      setClients(res?.data?.data?.clients || res?.data?.data || []);
    } catch (err: any) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchVisits();
    fetchEmployees();
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVisits();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      date: "",
      employeeId: "",
      clientId: "",
      startTime: "",
      endTime: "",
      status: "SCHEDULED",
    });
    setEditing(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item: Visit) => {
    setEditing(item);
    setFormData({
      title: item.title,
      description: item.description,
      location: item.location,
      date: toDateInputValue(item.date),
      employeeId: item.employeeId ? String(item.employeeId) : "",
      clientId: item.clientId ? String(item.clientId) : "",
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        employeeId: formData.employeeId
          ? Number(formData.employeeId)
          : null,
        clientId: formData.clientId ? Number(formData.clientId) : null,
      };
      if (editing) {
        await axiosInstance.put(`/visit/${editing.id}`, payload);
        alert("Visit updated successfully");
      } else {
        await axiosInstance.post("/visit", payload);
        alert("Visit created successfully");
      }
      setShowModal(false);
      resetForm();
      fetchVisits();
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const confirmDelete = window.confirm("Delete visit?");
      if (!confirmDelete) return;
      await axiosInstance.delete(`/visit/${id}`);
      alert("Visit deleted");
      fetchVisits();
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Visit Management</h3>
            <p className="text-muted mb-0">Manage employee field visits</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <i className="ti ti-plus me-1" /> Add Visit
          </button>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch}>
              <div className="row g-3">
                <div className="col-md-10">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search visit..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-dark w-100">
                    <i className="ti ti-search me-1" /> Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            {loading ? (
              <SkeletonTable rows={5} columns={9} />
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Visiting Employee</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center py-4">
                          No visits found
                        </td>
                      </tr>
                    ) : (
                      visits.map((item, index) => (
                        <tr key={item.id}>
                          <td>{(page - 1) * 10 + index + 1}</td>
                          <td>
                            <div className="fw-semibold">{item.title}</div>
                            {item.description && (
                              <small className="text-muted d-block">
                                {item.description}
                              </small>
                            )}
                          </td>
                          <td>{item.employee?.name || "-"}</td>
                          <td>{item.client?.name || "-"}</td>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td>{item.startTime}</td>
                          <td>{item.endTime}</td>
                          <td>{item.location || "-"}</td>
                          <td>
                            <span
                              className={`badge ${
                                STATUS_BADGE[item.status] || "bg-secondary"
                              }`}
                            >
                              {item.status}
                            </span>
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
                                <i className="ti ti-edit me-1" /> Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(item.id)}
                              >
                                <i className="ti ti-trash me-1" /> Delete
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

      {showModal && (
        <div
          className="modal d-block"
          style={{
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editing ? "Edit Visit" : "Add Visit"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter Title"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Location <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="location"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Date Schedule <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Visiting Employee <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- choose employee --</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name}
                            {emp.employeeCode ? ` (${emp.employeeCode})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Client</label>
                      <select
                        className="form-select"
                        name="clientId"
                        value={formData.clientId}
                        onChange={handleChange}
                      >
                        <option value="">-- choose client --</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                            {client.companyName
                              ? ` (${client.companyName})`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Start Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        End Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Status</label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        name="description"
                        rows={2}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter Description"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editing ? "Update Visit" : "Create Visit"}
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

export default VisitPage;
