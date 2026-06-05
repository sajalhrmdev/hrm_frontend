"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

import {
  Plus,
  Pencil,
  Trash2,
  Megaphone,
  CalendarDays,
  AlertCircle,
  X,
  Sparkles,
  FileText,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

type NoticePriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

// ======================================================

interface Notice {
  id: number;

  title: string;

  description: string;

  noticeDate: string;

  expiryDate?: string;

  priority: NoticePriority;

  isPublished: boolean;

  attachmentUrl?: string;

  createdAt: string;

  updatedAt: string;
}

// ======================================================

interface NoticeForm {
  title: string;

  description: string;

  noticeDate: string;

  expiryDate: string;

  priority: NoticePriority;

  isPublished: boolean;

  attachmentUrl: string;
}

// ======================================================

const initialForm: NoticeForm = {
  title: "",

  description: "",

  noticeDate: "",

  expiryDate: "",

  priority: "NORMAL",

  isPublished: true,

  attachmentUrl: "",
};

// ======================================================

const priorityClassMap: Record<NoticePriority, string> = {
  LOW: "bg-secondary-subtle text-secondary",

  NORMAL: "bg-primary-subtle text-primary",

  HIGH: "bg-warning-subtle text-warning",

  URGENT: "bg-danger-subtle text-danger",
};

// ======================================================

const NoticeManagement: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [notices, setNotices] = useState<Notice[]>([]);

  const [showModal, setShowModal] = useState<boolean>(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<NoticeForm>(initialForm);

  // ======================================================
  // FETCH
  // ======================================================

  const fetchNotices = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/notice");

      setNotices(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================

  useEffect(() => {
    fetchNotices();
  }, []);

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ======================================================
  // RESET
  // ======================================================

  const resetForm = () => {
    setForm(initialForm);

    setEditingId(null);

    setShowModal(false);
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axiosInstance.put(`/notice/${editingId}`, form);
      } else {
        await axiosInstance.post("/notice", form);
      }

      fetchNotices();

      resetForm();
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (notice: Notice) => {
    setEditingId(notice.id);

    setForm({
      title: notice.title || "",

      description: notice.description || "",

      noticeDate: notice.noticeDate?.slice(0, 10) || "",

      expiryDate: notice.expiryDate?.slice(0, 10) || "",

      priority: notice.priority || "NORMAL",

      isPublished: notice.isPublished,

      attachmentUrl: notice.attachmentUrl || "",
    });

    setShowModal(true);
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Delete this notice?");

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/notice/${id}`);

      fetchNotices();
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================

  return (
    <>
      <style>
        {`

          .notice-page {

            min-height: 100vh;

            padding: 24px;

            background:
              linear-gradient(
                135deg,
                #eef2ff 0%,
                #f8fafc 50%,
                #dbeafe 100%
              );
          }

          /* ================================================= */

          .notice-header {

            background:
              rgba(255,255,255,0.72);

            backdrop-filter:
              blur(18px);

            border-radius: 30px;

            padding: 28px;

            border:
              1px solid rgba(255,255,255,0.5);

            box-shadow:
              0 10px 40px rgba(0,0,0,0.08);

            margin-bottom: 28px;
          }

          .notice-title {

            font-size: 36px;

            font-weight: 800;

            color: #111827;

            margin-bottom: 6px;
          }

          .notice-subtitle {

            color: #6b7280;

            font-size: 15px;
          }

          /* ================================================= */

          .notice-btn {

            border: none;

            border-radius: 18px;

            padding: 14px 24px;

            font-weight: 700;

            color: white;

            background:
              linear-gradient(
                135deg,
                #4f46e5,
                #2563eb
              );

            transition: 0.3s;

            box-shadow:
              0 10px 30px rgba(79,70,229,0.3);
          }

          .notice-btn:hover {

            transform:
              translateY(-3px);

            box-shadow:
              0 18px 40px rgba(79,70,229,0.4);
          }

          /* ================================================= */

          .notice-stat-card {

            background:
              rgba(255,255,255,0.75);

            backdrop-filter:
              blur(20px);

            border-radius: 28px;

            padding: 26px;

            border:
              1px solid rgba(255,255,255,0.5);

            box-shadow:
              0 10px 35px rgba(0,0,0,0.08);

            transition: 0.3s;
          }

          .notice-stat-card:hover {

            transform:
              translateY(-6px);
          }

          /* ================================================= */

          .notice-card {

            background:
              rgba(255,255,255,0.78);

            backdrop-filter:
              blur(18px);

            border-radius: 32px;

            padding: 26px;

            position: relative;

            overflow: hidden;

            border:
              1px solid rgba(255,255,255,0.5);

            box-shadow:
              0 10px 35px rgba(0,0,0,0.08);

            transition: 0.35s;

            height: 100%;
          }

          .notice-card::before {

            content: "";

            position: absolute;

            top: 0;

            left: 0;

            width: 100%;

            height: 5px;

            background:
              linear-gradient(
                90deg,
                #4f46e5,
                #2563eb,
                #06b6d4
              );
          }

          .notice-card:hover {

            transform:
              translateY(-8px);

            box-shadow:
              0 20px 50px rgba(0,0,0,0.12);
          }

          /* ================================================= */

          .notice-card-title {

            font-size: 24px;

            font-weight: 800;

            color: #111827;
          }

          .notice-desc {

            margin-top: 18px;

            color: #4b5563;

            line-height: 1.8;
          }

          /* ================================================= */

          .notice-priority {

            padding: 7px 14px;

            border-radius: 999px;

            font-size: 12px;

            font-weight: 700;
          }

          /* ================================================= */

          .notice-action-btn {

            width: 42px;

            height: 42px;

            border: none;

            border-radius: 14px;

            background: #f3f4f6;

            transition: 0.3s;
          }

          .notice-action-btn:hover {

            background: #e0e7ff;

            color: #4338ca;
          }

          .notice-delete-btn:hover {

            background: #fee2e2;

            color: #dc2626;
          }

          /* ================================================= */

          .notice-modal {

            border: none;

            border-radius: 36px;

            overflow: hidden;

            background:
              rgba(255,255,255,0.82);

            backdrop-filter:
              blur(24px);

            box-shadow:
              0 25px 70px rgba(0,0,0,0.15);
          }

          /* ================================================= */

          .notice-input {

            border-radius: 18px !important;

            border:
              1px solid #d1d5db !important;

            padding:
              14px 18px !important;

            transition: 0.3s !important;
          }

          .notice-input:focus {

            border-color:
              #4f46e5 !important;

            box-shadow:
              0 0 0 4px rgba(79,70,229,0.15) !important;
          }

          /* ================================================= */

          .notice-empty {

            background:
              rgba(255,255,255,0.75);

            border-radius: 34px;

            padding: 70px;

            text-align: center;

            border:
              1px solid rgba(255,255,255,0.5);

            box-shadow:
              0 10px 40px rgba(0,0,0,0.08);
          }

        `}
      </style>
      <div className="page-wrapper">
        <div className="content">
          <div className="notice-page">
            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="notice-header d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 className="notice-title">Notice Management</h1>

                <p className="notice-subtitle">
                  Manage company announcements & notices
                </p>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="notice-btn d-flex align-items-center"
              >
                <Plus size={18} className="me-2" />
                Create Notice
              </button>
            </div>

            {/* ================================================= */}
            {/* STATS */}
            {/* ================================================= */}

            <div className="row g-4 mb-4">
              <div className="col-md-6 col-xl-3">
                <div className="notice-stat-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-2">Total Notices</p>

                      <h2 className="fw-bold">{notices.length}</h2>
                    </div>

                    <FileText size={34} />
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div
                  className="notice-stat-card text-white"
                  style={{
                    background: "linear-gradient(135deg,#ef4444,#dc2626)",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-2">Urgent Notices</p>

                      <h2 className="fw-bold">
                        {notices.filter((n) => n.priority === "URGENT").length}
                      </h2>
                    </div>

                    <Sparkles size={34} />
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div
                  className="notice-stat-card text-white"
                  style={{
                    background: "linear-gradient(135deg,#f59e0b,#ea580c)",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-2">High Priority</p>

                      <h2 className="fw-bold">
                        {notices.filter((n) => n.priority === "HIGH").length}
                      </h2>
                    </div>

                    <AlertCircle size={34} />
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div
                  className="notice-stat-card text-white"
                  style={{
                    background: "linear-gradient(135deg,#10b981,#059669)",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-2">Published</p>

                      <h2 className="fw-bold">
                        {notices.filter((n) => n.isPublished).length}
                      </h2>
                    </div>

                    <Megaphone size={34} />
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* LIST */}
            {/* ================================================= */}

            <div className="row g-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" />
                </div>
              ) : notices.length === 0 ? (
                <div className="col-12">
                  <div className="notice-empty">
                    <Megaphone size={60} className="mb-3" />

                    <h3 className="fw-bold">No Notices Found</h3>

                    <p className="text-muted">
                      Create your first company notice
                    </p>
                  </div>
                </div>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="col-md-6 col-xl-4">
                    <div className="notice-card">
                      {/* TOP */}

                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h3 className="notice-card-title">{notice.title}</h3>

                          <div className="d-flex gap-2 mt-3">
                            <span
                              className={`notice-priority ${priorityClassMap[notice.priority]}`}
                            >
                              {notice.priority}
                            </span>

                            {!notice.isPublished && (
                              <span className="badge bg-secondary">Draft</span>
                            )}
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleEdit(notice)}
                            className="notice-action-btn"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(notice.id)}
                            className="notice-action-btn notice-delete-btn"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* DESC */}

                      <p className="notice-desc">{notice.description}</p>

                      {/* DATES */}

                      <div className="mt-4">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <CalendarDays size={18} />

                          <div>
                            <small className="text-muted">Notice Date</small>

                            <div className="fw-semibold">
                              {new Date(notice.noticeDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {notice.expiryDate && (
                          <div className="d-flex align-items-center gap-2">
                            <CalendarDays size={18} />

                            <div>
                              <small className="text-muted">Expiry Date</small>

                              <div className="fw-semibold">
                                {new Date(
                                  notice.expiryDate,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ATTACHMENT */}

                      {notice.attachmentUrl && (
                        <a
                          href={notice.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-link mt-3 p-0 text-decoration-none fw-semibold"
                        >
                          <FileText size={18} className="me-2" />
                          View Attachment
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ================================================= */}
            {/* MODAL */}
            {/* ================================================= */}

            {showModal && (
              <div
                className="modal fade show d-block"
                style={{
                  background: "rgba(0,0,0,0.45)",
                }}
              >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content notice-modal">
                    <div className="modal-body p-5 position-relative">
                      {/* CLOSE */}

                      <button
                        onClick={resetForm}
                        className="btn btn-light rounded-circle position-absolute top-0 end-0 m-4"
                      >
                        <X size={18} />
                      </button>

                      <h2 className="fw-bold mb-2">
                        {editingId ? "Update Notice" : "Create Notice"}
                      </h2>

                      <p className="text-muted mb-4">
                        Publish company announcements
                      </p>

                      {/* FORM */}

                      <form onSubmit={handleSubmit}>
                        {/* TITLE */}

                        <div className="mb-4">
                          <label className="form-label fw-semibold">
                            Notice Title
                          </label>

                          <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="form-control notice-input"
                          />
                        </div>

                        {/* DESC */}

                        <div className="mb-4">
                          <label className="form-label fw-semibold">
                            Description
                          </label>

                          <textarea
                            rows={5}
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            required
                            className="form-control notice-input"
                          />
                        </div>

                        {/* DATES */}

                        <div className="row">
                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-semibold">
                              Notice Date
                            </label>

                            <input
                              type="date"
                              name="noticeDate"
                              value={form.noticeDate}
                              onChange={handleChange}
                              required
                              className="form-control notice-input"
                            />
                          </div>

                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-semibold">
                              Expiry Date
                            </label>

                            <input
                              type="date"
                              name="expiryDate"
                              value={form.expiryDate}
                              onChange={handleChange}
                              className="form-control notice-input"
                            />
                          </div>
                        </div>

                        {/* PRIORITY */}

                        <div className="mb-4">
                          <label className="form-label fw-semibold">
                            Priority
                          </label>

                          <select
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                            className="form-select notice-input"
                          >
                            <option value="LOW">LOW</option>

                            <option value="NORMAL">NORMAL</option>

                            <option value="HIGH">HIGH</option>

                            <option value="URGENT">URGENT</option>
                          </select>
                        </div>

                        {/* ATTACHMENT */}

                        <div className="mb-4">
                          <label className="form-label fw-semibold">
                            Attachment URL
                          </label>

                          <input
                            type="text"
                            name="attachmentUrl"
                            value={form.attachmentUrl}
                            onChange={handleChange}
                            className="form-control notice-input"
                          />
                        </div>

                        {/* PUBLISH */}

                        <div className="form-check mb-4">
                          <input
                            type="checkbox"
                            name="isPublished"
                            checked={form.isPublished}
                            onChange={handleChange}
                            className="form-check-input"
                          />

                          <label className="form-check-label fw-semibold">
                            Publish Notice
                          </label>
                        </div>

                        {/* SUBMIT */}

                        <button type="submit" className="notice-btn w-100">
                          {editingId ? "Update Notice" : "Create Notice"}
                        </button>
                      </form>
                    </div>
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

export default NoticeManagement;
