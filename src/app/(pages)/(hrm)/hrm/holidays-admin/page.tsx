"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import UpcomingHolidayWidget from "@/compo/UpcomingHolidayWidge";
import HolidayCalendarPage from "@/compo/HolidayCalendarPage";
import { SkeletonTable } from "@/core/common/Skeleton";

type Holiday = {
  id: number;

  title: string;

  date: string;

  type: "NATIONAL" | "FESTIVAL" | "COMPANY" | "OPTIONAL";

  isPaid: boolean;

  description?: string;
};

const HolidayPage = () => {
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const [formData, setFormData] = useState({
    title: "",

    date: "",

    type: "NATIONAL",

    isPaid: true,

    description: "",
  });

  // ============================================
  // FETCH HOLIDAYS
  // ============================================

  const fetchHolidays = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/holiday");

      setHolidays(res?.data?.data || []);
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to fetch holidays");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // USE EFFECT
  // ============================================

  useEffect(() => {
    fetchHolidays();
  }, []);

  // ============================================
  // HANDLE CHANGE
  // ============================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // ============================================
  // RESET FORM
  // ============================================

  const resetForm = () => {
    setFormData({
      title: "",

      date: "",

      type: "NATIONAL",

      isPaid: true,

      description: "",
    });

    setEditingHoliday(null);
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

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);

    setFormData({
      title: holiday.title,

      date: holiday.date.slice(0, 10),

      type: holiday.type,

      isPaid: holiday.isPaid,

      description: holiday.description || "",
    });

    setShowModal(true);
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingHoliday) {
        await axiosInstance.patch(`/holiday/${editingHoliday.id}`, formData);

        alert("Holiday updated successfully");
      } else {
        await axiosInstance.post("/holiday", formData);

        alert("Holiday created successfully");
      }

      setShowModal(false);

      resetForm();

      fetchHolidays();
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
      const confirmDelete = window.confirm("Delete this holiday?");

      if (!confirmDelete) {
        return;
      }

      await axiosInstance.delete(`/holiday/${id}`);

      alert("Holiday deleted successfully");

      fetchHolidays();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  // ============================================
  // BADGE
  // ============================================

  const getBadgeClass = (type: string) => {
    switch (type) {
      case "NATIONAL":
        return "bg-primary";

      case "FESTIVAL":
        return "bg-success";

      case "COMPANY":
        return "bg-warning text-dark";

      case "OPTIONAL":
        return "bg-secondary";

      default:
        return "bg-dark";
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          {/* HEADER */}

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-1">🎉 Holiday Management</h3>

              <p className="text-muted mb-0">Manage company holidays</p>
            </div>

            <button className="btn btn-primary" onClick={handleOpenCreate}>
              ➕ Add Holiday
            </button>
          </div>

          {/* TABLE */}

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {loading ? (
                <SkeletonTable rows={5} columns={5} />
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>

                        <th>Title</th>

                        <th>Date</th>

                        <th>Type</th>

                        <th>Paid</th>

                        <th>Description</th>

                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {holidays.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-5">
                            No holidays found
                          </td>
                        </tr>
                      ) : (
                        holidays.map((item, index) => (
                          <tr key={item.id}>
                            <td>{index + 1}</td>

                            <td className="fw-semibold">{item.title}</td>

                            <td>{new Date(item.date).toLocaleDateString()}</td>

                            <td>
                              <span
                                className={`badge ${getBadgeClass(item.type)}`}
                              >
                                {item.type}
                              </span>
                            </td>

                            <td>
                              {item.isPaid ? (
                                <span className="badge bg-success">Paid</span>
                              ) : (
                                <span className="badge bg-danger">Unpaid</span>
                              )}
                            </td>

                            <td>{item.description || "-"}</td>

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
            tabIndex={-1}
            style={{
              background: "rgba(0,0,0,0.5)",
            }}
          >
            <div className="modal-dialog">
              <div className="modal-content border-0 shadow-lg">
                {/* HEADER */}

                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    {editingHoliday ? "✏ Edit Holiday" : "➕ Add Holiday"}
                  </h5>

                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                {/* BODY */}

                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {/* TITLE */}

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Holiday Name
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

                    {/* DATE */}

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Date</label>

                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* TYPE */}

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Holiday Type
                      </label>

                      <select
                        className="form-select"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                      >
                        <option value="NATIONAL">NATIONAL</option>

                        <option value="FESTIVAL">FESTIVAL</option>

                        <option value="COMPANY">COMPANY</option>

                        <option value="OPTIONAL">OPTIONAL</option>
                      </select>
                    </div>

                    {/* IS PAID */}

                    <div className="form-check mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="isPaid"
                        checked={formData.isPaid}
                        onChange={handleChange}
                      />

                      <label className="form-check-label">Paid Holiday</label>
                    </div>

                    {/* DESCRIPTION */}

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Description
                      </label>

                      <textarea
                        className="form-control"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                      />
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
                      {editingHoliday ? "Update Holiday" : "Create Holiday"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      
      
    </>
  );
};

export default HolidayPage;
