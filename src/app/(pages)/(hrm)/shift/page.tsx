"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

type Shift = {
  id: number;

  title: string;

  code?: string;

  description?: string;

  startTime: string;

  endTime: string;

  breakMinutes: number;

  graceMinutes: number;

  lateAfterMinutes: number;

  halfDayAfterMinutes?: number;

  overtimeAfterMinutes: number;

  minimumWorkMinutes?: number;

  status: "ACTIVE" | "INACTIVE";

  createdAt: string;

  _count?: {
    employees: number;
  };
};

const ShiftPage = () => {
  const [loading, setLoading] = useState(false);

  const [shifts, setShifts] = useState<Shift[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [editingShift, setEditingShift] = useState<Shift | null>(null);

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

    code: "",

    description: "",

    startTime: "",

    endTime: "",

    breakMinutes: "",

    graceMinutes: "",

    lateAfterMinutes: "",

    halfDayAfterMinutes: "",

    overtimeAfterMinutes: "",

    minimumWorkMinutes: "",

    status: "ACTIVE",
  });

  // ============================================
  // FETCH SHIFTS
  // ============================================

  const fetchShifts = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/shift?page=${page}&limit=10&search=${search}`,
      );

      setShifts(res?.data?.data?.shifts || []);

      setPagination(res?.data?.data?.pagination);
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to fetch shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [page]);

  // ============================================
  // SEARCH
  // ============================================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    setPage(1);

    fetchShifts();
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
      title: "",

      code: "",

      description: "",

      startTime: "",

      endTime: "",

      breakMinutes: "",

      graceMinutes: "",

      lateAfterMinutes: "",

      halfDayAfterMinutes: "",

      overtimeAfterMinutes: "",

      minimumWorkMinutes: "",

      status: "ACTIVE",
    });

    setEditingShift(null);
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

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);

    setFormData({
      title: shift.title,

      code: shift.code || "",

      description: shift.description || "",

      startTime: shift.startTime,

      endTime: shift.endTime,

      breakMinutes: shift.breakMinutes?.toString() || "",

      graceMinutes: shift.graceMinutes?.toString() || "",

      lateAfterMinutes: shift.lateAfterMinutes?.toString() || "",

      halfDayAfterMinutes: shift.halfDayAfterMinutes?.toString() || "",

      overtimeAfterMinutes: shift.overtimeAfterMinutes?.toString() || "",

      minimumWorkMinutes: shift.minimumWorkMinutes?.toString() || "",

      status: shift.status,
    });

    setShowModal(true);
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,

        breakMinutes: Number(formData.breakMinutes || 0),

        graceMinutes: Number(formData.graceMinutes || 0),

        lateAfterMinutes: Number(formData.lateAfterMinutes || 0),

        halfDayAfterMinutes: formData.halfDayAfterMinutes
          ? Number(formData.halfDayAfterMinutes)
          : null,

        overtimeAfterMinutes: Number(formData.overtimeAfterMinutes || 0),

        minimumWorkMinutes: formData.minimumWorkMinutes
          ? Number(formData.minimumWorkMinutes)
          : null,
      };

      if (editingShift) {
        await axiosInstance.put(`/shift/${editingShift.id}`, payload);

        alert("Shift updated successfully");
      } else {
        await axiosInstance.post("/shift", payload);

        alert("Shift created successfully");
      }

      setShowModal(false);

      resetForm();

      fetchShifts();
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
      const confirmDelete = window.confirm("Delete shift?");

      if (!confirmDelete) {
        return;
      }

      await axiosInstance.delete(`/shift/${id}`);

      alert("Shift deleted");

      fetchShifts();
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
            <h3 className="fw-bold mb-1">⏰ Shift Management</h3>

            <p className="text-muted mb-0">Manage employee shifts</p>
          </div>

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            ➕ Add Shift
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
                    placeholder="Search shift..."
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

                      <th>Shift</th>

                      <th>Time</th>

                      <th>Break</th>

                      <th>Grace</th>

                      <th>Late After</th>

                      <th>Employees</th>

                      <th>Status</th>

                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {shifts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-4">
                          No shifts found
                        </td>
                      </tr>
                    ) : (
                      shifts.map((item, index) => (
                        <tr key={item.id}>
                          <td>{(page - 1) * 10 + index + 1}</td>

                          <td>
                            <div className="fw-semibold">{item.title}</div>

                            <small className="text-muted">{item.code}</small>
                          </td>

                          <td>
                            <div>
                              {item.startTime} - {item.endTime}
                            </div>
                          </td>

                          <td>{item.breakMinutes} mins</td>

                          <td>{item.graceMinutes} mins</td>

                          <td>{item.lateAfterMinutes} mins</td>

                          <td>{item._count?.employees}</td>

                          <td>
                            {item.status === "ACTIVE" ? (
                              <span className="badge bg-success">ACTIVE</span>
                            ) : (
                              <span className="badge bg-danger">INACTIVE</span>
                            )}
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
      </div>

      {/* MODAL */}

      {showModal && (
        <div
          className="modal d-block"
          style={{
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content border-0 shadow-lg">
              {/* HEADER */}

              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingShift ? "✏ Edit Shift" : "➕ Add Shift"}
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

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Shift Name
                        <span className="text-danger ms-1">*</span>
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

                    {/* CODE */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Shift Code
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                      />
                    </div>

                    {/* START TIME */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Start Time
                        <span className="text-danger ms-1">*</span>
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

                    {/* END TIME */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        End Time
                        <span className="text-danger ms-1">*</span>
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

                    {/* BREAK */}

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Break Minutes
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        name="breakMinutes"
                        value={formData.breakMinutes}
                        onChange={handleChange}
                      />
                    </div>

                    {/* GRACE */}

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Grace Minutes
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        name="graceMinutes"
                        value={formData.graceMinutes}
                        onChange={handleChange}
                      />
                    </div>

                    {/* LATE */}

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Late After
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        name="lateAfterMinutes"
                        value={formData.lateAfterMinutes}
                        onChange={handleChange}
                      />
                    </div>

                    {/* HALF DAY */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Half Day After
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        name="halfDayAfterMinutes"
                        value={formData.halfDayAfterMinutes}
                        onChange={handleChange}
                      />
                    </div>

                    {/* OT */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Overtime After
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        name="overtimeAfterMinutes"
                        value={formData.overtimeAfterMinutes}
                        onChange={handleChange}
                      />
                    </div>

                    {/* MIN WORK */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Minimum Work Minutes
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        name="minimumWorkMinutes"
                        value={formData.minimumWorkMinutes}
                        onChange={handleChange}
                      />
                    </div>

                    {/* STATUS */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Status <span className="text-danger ms-1">*</span>
                      </label>

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

                    {/* DESCRIPTION */}

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Description
                      </label>

                      <textarea
                        rows={3}
                        className="form-control"
                        name="description"
                        value={formData.description}
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
                    {editingShift ? "Update Shift" : "Create Shift"}
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

export default ShiftPage;
