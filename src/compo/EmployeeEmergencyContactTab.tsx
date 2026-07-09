"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

// ======================================================

type Props = {
  employeeId: number;
  isViewOnly?: boolean;
};

// ======================================================

const EmployeeEmergencyContactTab = ({ employeeId, isViewOnly }: Props) => {
  // ======================================================
  // STATES
  // ======================================================

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    contactName: "",

    relationship: "",

    phone: "",

    alternatePhone: "",

    email: "",

    address: "",
  });

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchEmergencyContact = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/employee-emergency-contact/${employeeId}`,
      );

      if (res?.data?.data) {
        setFormData({
          contactName: res.data.data.contactName || "",

          relationship: res.data.data.relationship || "",

          phone: res.data.data.phone || "",

          alternatePhone: res.data.data.alternatePhone || "",

          email: res.data.data.email || "",

          address: res.data.data.address || "",
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchEmergencyContact();
    }
  }, [employeeId]);

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  // ======================================================
  // SAVE
  // ======================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      await axiosInstance.post(
        "/employee-emergency-contact",

        {
          employeeId,

          ...formData,
        },
      );

      alert("Emergency contact saved successfully");
    } catch (err: any) {
      alert(err?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="emergency-loading">
        <div className="spinner-border text-danger" />

        <p className="mt-3 mb-0">Loading emergency contact...</p>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="emergency-page">
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="emergency-top-card">
        <div>
          <h3 className="emergency-title">🚨 Emergency Contact</h3>

          <p className="emergency-subtitle">
            Manage employee emergency contact details
          </p>
        </div>

        <div className="emergency-badge">Emergency Ready</div>
      </div>

      {/* ====================================== */}
      {/* FORM */}
      {/* ====================================== */}

      <div className="emergency-form-card">
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* CONTACT NAME */}

            <div className="col-md-6">
              <label className="emergency-label">Contact Name</label>

              <input
                type="text"
                name="contactName"
                className="emergency-input"
                placeholder="Enter contact name"
                value={formData.contactName}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>

            {/* RELATIONSHIP */}

            <div className="col-md-6">
              <label className="emergency-label">Relationship</label>

              <input
                type="text"
                name="relationship"
                className="emergency-input"
                placeholder="Father / Mother / Wife"
                value={formData.relationship}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>

            {/* PHONE */}

            <div className="col-md-6">
              <label className="emergency-label">Primary Phone</label>

              <input
                type="text"
                name="phone"
                className="emergency-input"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>

            {/* ALT PHONE */}

            <div className="col-md-6">
              <label className="emergency-label">Alternate Phone</label>

              <input
                type="text"
                name="alternatePhone"
                className="emergency-input"
                placeholder="Enter alternate phone"
                value={formData.alternatePhone}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>

            {/* EMAIL */}

            <div className="col-md-6">
              <label className="emergency-label">Email Address</label>

              <input
                type="email"
                name="email"
                className="emergency-input"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>

            {/* ADDRESS */}

            <div className="col-md-6">
              <label className="emergency-label">Address</label>

              <textarea
                name="address"
                className="emergency-textarea"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
          </div>

          {/* BUTTON */}
          {!isViewOnly && (
          <div className="save-btn-wrapper">
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </>
              ) : (
                <>🚨 Save Emergency Contact</>
              )}
            </button>
          </div>
          )}
        </form>
      </div>

      {/* ====================================== */}
      {/* STYLE */}
      {/* ====================================== */}

      <style jsx>{`
        .emergency-page {
          width: 100%;
        }

        .emergency-top-card {
          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-bottom: 24px;

          padding: 24px 28px;

          background: linear-gradient(135deg, #fff5f5, #ffffff);

          border-radius: 18px;

          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.06);

          border: 1px solid #fee2e2;
        }

        .emergency-title {
          font-size: 28px;

          font-weight: 800;

          color: #111827;

          margin-bottom: 6px;
        }

        .emergency-subtitle {
          margin: 0;

          color: #6b7280;

          font-size: 14px;
        }

        .emergency-badge {
          background: linear-gradient(135deg, #dc2626, #b91c1c);

          color: white;

          padding: 10px 18px;

          border-radius: 999px;

          font-size: 13px;

          font-weight: 600;

          box-shadow: 0 6px 18px rgba(220, 38, 38, 0.25);
        }

        .emergency-form-card {
          background: white;

          border-radius: 20px;

          padding: 32px;

          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);

          border: 1px solid #edf2f7;
        }

        .emergency-label {
          display: block;

          margin-bottom: 10px;

          font-size: 14px;

          font-weight: 700;

          color: #111827;
        }

        .emergency-input {
          width: 100% !important;

          height: 54px !important;

          border-radius: 14px;

          border: 1px solid #d1d5db;

          background: #f9fafb;

          padding: 0 16px;

          font-size: 14px;

          color: #111827;

          transition: all 0.2s ease;

          outline: none;

          writing-mode: horizontal-tb !important;

          transform: none !important;

          rotate: 0deg !important;
        }

        .emergency-input:focus,
        .emergency-textarea:focus {
          background: white;

          border-color: #dc2626;

          box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.12);
        }

        .emergency-textarea {
          width: 100%;

          min-height: 120px;

          border-radius: 14px;

          border: 1px solid #d1d5db;

          background: #f9fafb;

          padding: 14px 16px;

          font-size: 14px;

          color: #111827;

          resize: vertical;

          transition: all 0.2s ease;

          outline: none;
        }

        .save-btn-wrapper {
          margin-top: 32px;
        }

        .save-btn {
          border: none;

          background: linear-gradient(135deg, #dc2626, #b91c1c);

          color: white;

          height: 52px;

          padding: 0 28px;

          border-radius: 14px;

          font-size: 15px;

          font-weight: 700;

          transition: all 0.2s ease;

          box-shadow: 0 10px 24px rgba(220, 38, 38, 0.25);
        }

        .save-btn:hover {
          transform: translateY(-2px);

          box-shadow: 0 14px 28px rgba(220, 38, 38, 0.3);
        }

        .save-btn:disabled {
          opacity: 0.7;

          cursor: not-allowed;
        }

        .emergency-loading {
          height: 300px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          color: #374151;
        }

        @media (max-width: 768px) {
          .emergency-top-card {
            flex-direction: column;

            align-items: flex-start;

            gap: 16px;

            padding: 20px;
          }

          .emergency-form-card {
            padding: 20px;
          }

          .emergency-title {
            font-size: 22px;
          }

          .save-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeEmergencyContactTab;
