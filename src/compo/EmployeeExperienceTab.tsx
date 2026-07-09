"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

// ======================================================

type Props = {
  employeeId: number;
  isViewOnly?: boolean;
};

// ======================================================

const EmployeeExperienceTab = ({ employeeId, isViewOnly }: Props) => {
  // ======================================================
  // STATES
  // ======================================================

  const [loading, setLoading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [experiences, setExperiences] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",

    designation: "",

    startDate: "",

    endDate: "",

    currentlyWorking: false,

    skills: "",

    responsibilities: "",

    documentUrl: "",
  });

  // ======================================================
  // FETCH
  // ======================================================

  const fetchExperiences = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/employee-experience/employee/${employeeId}`,
      );

      setExperiences(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchExperiences();
    }
  }, [employeeId]);

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,

      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ======================================================
  // RESET
  // ======================================================

  const resetForm = () => {
    setEditingId(null);

    setShowForm(false);

    setFormData({
      companyName: "",

      designation: "",

      startDate: "",

      endDate: "",

      currentlyWorking: false,

      skills: "",

      responsibilities: "",

      documentUrl: "",
    });
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      if (editingId) {
        await axiosInstance.patch(
          `/employee-experience/${editingId}`,

          formData,
        );

        alert("Experience updated successfully");
      } else {
        await axiosInstance.post(
          "/employee-experience",

          {
            employeeId,

            ...formData,
          },
        );

        alert("Experience added successfully");
      }

      resetForm();

      fetchExperiences();
    } catch (err: any) {
      alert(err?.response?.data?.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (item: any) => {
    setShowForm(true);

    setEditingId(item.id);

    setFormData({
      companyName: item.companyName || "",

      designation: item.designation || "",

      startDate: item.startDate?.split("T")[0] || "",

      endDate: item.endDate?.split("T")[0] || "",

      currentlyWorking: item.currentlyWorking || false,

      skills: item.skills || "",

      responsibilities: item.responsibilities || "",

      documentUrl: item.documentUrl || "",
    });

    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Delete this experience?");

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/employee-experience/${id}`);

      alert("Deleted successfully");

      fetchExperiences();
    } catch (err: any) {
      alert(err?.response?.data?.message);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="experience-page">
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="experience-header">
        <div>
          <h3 className="experience-title">💼 Employee Experience</h3>

          <p className="experience-subtitle">
            Manage previous work experience & career timeline
          </p>
        </div>

        {!isViewOnly && (
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? <>✖ Close</> : <>＋ Add Experience</>}
        </button>
        )}
      </div>

      {/* ====================================== */}
      {/* FORM */}
      {/* ====================================== */}

      {showForm && (
        <div className="experience-card">
          <div className="card-header-custom">
            <div>
              <h5 className="card-title-custom">
                {editingId ? "Edit Experience" : "Add Experience"}
              </h5>

              <p className="card-subtitle-custom">
                Add employee previous company details
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* COMPANY */}

              <div className="col-md-6">
                <label className="custom-label">Company Name</label>

                <input
                  type="text"
                  className="custom-input"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  required
                  disabled={isViewOnly}
                />
              </div>

              {/* DESIGNATION */}

              <div className="col-md-6">
                <label className="custom-label">Designation</label>

                <input
                  type="text"
                  className="custom-input"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Enter designation"
                  required
                  disabled={isViewOnly}
                />
              </div>

              {/* START DATE */}

              <div className="col-md-6">
                <label className="custom-label">Start Date</label>

                <input
                  type="date"
                  className="custom-input"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  disabled={isViewOnly}
                />
              </div>

              {/* END DATE */}

              <div className="col-md-6">
                <label className="custom-label">End Date</label>

                <input
                  type="date"
                  className="custom-input"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={formData.currentlyWorking || isViewOnly}
                />
              </div>

              {/* CHECKBOX */}

              <div className="col-12">
                <div className="check-wrapper">
                  <input
                    type="checkbox"
                    name="currentlyWorking"
                    checked={formData.currentlyWorking}
                    onChange={handleChange}
                    disabled={isViewOnly}
                  />

                  <span>Currently Working Here</span>
                </div>
              </div>

              {/* SKILLS */}

              <div className="col-md-6">
                <label className="custom-label">Skills</label>

                <textarea
                  className="custom-textarea"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js..."
                  disabled={isViewOnly}
                />
              </div>

              {/* RESPONSIBILITIES */}

              <div className="col-md-6">
                <label className="custom-label">Responsibilities</label>

                <textarea
                  className="custom-textarea"
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  placeholder="Handled APIs..."
                  disabled={isViewOnly}
                />
              </div>

              {/* DOCUMENT */}

              <div className="col-12">
                <label className="custom-label">Certificate URL</label>

                <input
                  type="text"
                  className="custom-input"
                  name="documentUrl"
                  value={formData.documentUrl}
                  onChange={handleChange}
                  placeholder="Paste certificate url"
                  disabled={isViewOnly}
                />
              </div>
            </div>

            {/* BUTTONS */}
            {!isViewOnly && (
            <div className="btn-group-custom">
              <button
                type="submit"
                className="save-btn"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : editingId ? (
                  <>✏️ Update Experience</>
                ) : (
                  <>➕ Add Experience</>
                )}
              </button>

              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            </div>
            )}
          </form>
        </div>
      )}

      {/* ====================================== */}
      {/* EXPERIENCE LIST */}
      {/* ====================================== */}

      <div className="experience-card">
        <div className="card-header-custom">
          <div>
            <h5 className="card-title-custom">Experience History</h5>

            <p className="card-subtitle-custom">
              Employee previous work timeline
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-box">
            <div className="spinner-border text-primary" />
          </div>
        ) : experiences.length === 0 ? (
          <div className="empty-box">No experience found</div>
        ) : (
          <div className="timeline">
            {experiences.map((item: any) => {
              return (
                <div className="timeline-item" key={item.id}>
                  <div className="timeline-dot" />

                  <div className="timeline-content">
                    <div className="timeline-top">
                      <div>
                        <h5 className="company-name">{item.companyName}</h5>

                        <div className="designation">{item.designation}</div>
                      </div>

                      {!isViewOnly && (
                      <div className="timeline-actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                      )}
                    </div>

                    <div className="date-range">
                      {new Date(item.startDate).toLocaleDateString()}

                      {" - "}

                      {item.currentlyWorking
                        ? "Present"
                        : item.endDate
                          ? new Date(item.endDate).toLocaleDateString()
                          : "-"}
                    </div>

                    {item.skills && (
                      <div className="info-box">
                        <strong>Skills:</strong>

                        <p>{item.skills}</p>
                      </div>
                    )}

                    {item.responsibilities && (
                      <div className="info-box">
                        <strong>Responsibilities:</strong>

                        <p>{item.responsibilities}</p>
                      </div>
                    )}

                    {item.documentUrl && (
                      <a
                        href={item.documentUrl}
                        target="_blank"
                        className="doc-link"
                      >
                        📄 View Certificate
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ====================================== */}
      {/* STYLE */}
      {/* ====================================== */}

      <style jsx>{`
        .experience-page {
          width: 100%;
        }

        .experience-header {
          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-bottom: 24px;

          padding: 28px;

          border-radius: 22px;

          background: linear-gradient(135deg, #ffffff, #f5f3ff);

          border: 1px solid #ddd6fe;

          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
        }

        .experience-title {
          font-size: 30px;

          font-weight: 800;

          margin-bottom: 6px;

          color: #111827;
        }

        .experience-subtitle {
          margin: 0;

          color: #6b7280;

          font-size: 14px;
        }

        .add-btn {
          border: none;

          height: 52px;

          padding: 0 24px;

          border-radius: 14px;

          color: white;

          font-size: 14px;

          font-weight: 700;

          background: linear-gradient(135deg, #7c3aed, #6d28d9);
        }

        .experience-card {
          background: white;

          border-radius: 22px;

          padding: 28px;

          margin-bottom: 24px;

          border: 1px solid #edf2f7;

          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
        }

        .custom-label {
          display: block;

          margin-bottom: 10px;

          font-size: 14px;

          font-weight: 700;

          color: #111827;
        }

        .custom-input {
          width: 100%;

          height: 52px;

          border-radius: 14px;

          border: 1px solid #d1d5db;

          background: #f9fafb;

          padding: 0 16px;

          font-size: 14px;

          outline: none;

          writing-mode: horizontal-tb;

          text-orientation: mixed;

          transform: none;

          display: block;
        }

        .custom-input:focus,
        .custom-textarea:focus {
          background: white;

          border-color: #7c3aed;

          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
        }

        .custom-textarea {
          width: 100%;

          min-height: 120px;

          border-radius: 14px;

          border: 1px solid #d1d5db;

          background: #f9fafb;

          padding: 16px;

          font-size: 14px;

          resize: vertical;

          outline: none;
        }

        .check-wrapper {
          display: flex;

          align-items: center;

          gap: 10px;
        }

        .btn-group-custom {
          display: flex;

          gap: 14px;

          margin-top: 28px;
        }

        .save-btn {
          border: none;

          height: 52px;

          padding: 0 28px;

          border-radius: 14px;

          color: white;

          font-size: 15px;

          font-weight: 700;

          background: linear-gradient(135deg, #7c3aed, #6d28d9);
        }

        .cancel-btn {
          border: none;

          height: 52px;

          padding: 0 24px;

          border-radius: 14px;

          font-size: 14px;

          font-weight: 700;

          background: #f3f4f6;
        }

        .timeline {
          position: relative;
          padding-left: 24px;
        }

        .timeline::before {
          content: "";

          position: absolute;

          left: 8px;

          top: 0;

          width: 2px;

          height: 100%;

          background: #ddd6fe;
        }

        .timeline-item {
          position: relative;

          margin-bottom: 28px;
        }

        .timeline-dot {
          position: absolute;

          left: -24px;

          top: 8px;

          width: 16px;

          height: 16px;

          border-radius: 50%;

          background: #7c3aed;

          border: 3px solid #ede9fe;
        }

        .timeline-content {
          background: #fafafa;

          border-radius: 18px;

          padding: 22px;

          border: 1px solid #ececec;
        }

        .timeline-top {
          display: flex;

          justify-content: space-between;

          gap: 20px;
        }

        .company-name {
          margin: 0;

          font-size: 20px;

          font-weight: 800;

          color: #111827;
        }

        .designation {
          margin-top: 4px;

          color: #6b7280;

          font-size: 14px;
        }

        .timeline-actions {
          display: flex;

          gap: 10px;
        }

        .edit-btn,
        .delete-btn {
          border: none;

          padding: 8px 14px;

          border-radius: 10px;

          font-size: 12px;

          font-weight: 700;
        }

        .edit-btn {
          background: #dbeafe;

          color: #1d4ed8;
        }

        .delete-btn {
          background: #fee2e2;

          color: #b91c1c;
        }

        .date-range {
          margin-top: 14px;

          color: #7c3aed;

          font-size: 13px;

          font-weight: 700;
        }

        .info-box {
          margin-top: 18px;
        }

        .info-box strong {
          display: block;

          margin-bottom: 6px;

          color: #111827;
        }

        .info-box p {
          margin: 0;

          color: #4b5563;

          line-height: 1.7;
        }

        .doc-link {
          display: inline-block;

          margin-top: 18px;

          color: #7c3aed;

          font-size: 14px;

          font-weight: 700;

          text-decoration: none;
        }

        .loading-box,
        .empty-box {
          display: flex;

          align-items: center;

          justify-content: center;

          height: 220px;

          color: #6b7280;
        }

        @media (max-width: 768px) {
          .experience-header {
            flex-direction: column;

            align-items: flex-start;

            gap: 16px;
          }

          .timeline-top {
            flex-direction: column;
          }

          .btn-group-custom {
            flex-direction: column;
          }

          .save-btn,
          .cancel-btn,
          .add-btn {
            width: 100%;
          }

          .experience-card {
            padding: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeExperienceTab;
