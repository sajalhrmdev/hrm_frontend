"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

type CompanyForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
};

export default function CompanySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CompanyForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "",
  });

  const fetchCompany = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/company/myCompany");

      setForm({
        name: res.data.data.name || "",
        email: res.data.data.email || "",
        phone: res.data.data.phone || "",
        address: res.data.data.address || "",
        status: res.data.data.status || "",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      await axiosInstance.put("/company/myCompany", form);

      alert("Company settings updated successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to update company");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="company-settings-page">
          <div className="loading-card">Loading company settings...</div>
        </div>

        <style jsx>{`
          .company-settings-page {
            padding: 24px;
          }

          .loading-card {
            background: #fff;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            font-size: 18px;
            font-weight: 600;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="company-settings-page">
            <div className="header-card">
              <div>
                <h2>Company Settings</h2>
                <p>Manage company profile and business information</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="settings-grid">
                <div className="settings-card">
                  <div className="card-header">Company Information</div>

                  <div className="card-body">
                    <div className="form-group">
                      <label>Company Name</label>

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Company Name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Company Email"
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone</label>

                      <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                      />
                    </div>

                    <div className="form-group">
                      <label>Address</label>

                      <textarea
                        name="address"
                        rows={5}
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Company Address"
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="card-header">Company Status</div>

                  <div className="card-body">
                    <div className="status-wrapper">
                      <label>Current Status</label>

                      <div
                        className={`status-badge ${
                          form.status === "ACTIVE" ? "active" : "inactive"
                        }`}
                      >
                        {form.status}
                      </div>
                    </div>

                    <div className="info-box">
                      <h5>Company Information</h5>

                      <ul>
                        <li>Update company profile details</li>

                        <li>Manage business contact information</li>

                        <li>Changes apply instantly across the HRMS</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="action-bar">
                <button type="submit" disabled={saving} className="save-btn">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .company-settings-page {
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .header-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
        }

        .header-card h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #111827;
        }

        .header-card p {
          margin-top: 8px;
          color: #6b7280;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .settings-card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
        }

        .card-header {
          padding: 20px;
          font-size: 18px;
          font-weight: 700;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-body {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 14px;
          transition: 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .status-wrapper {
          margin-bottom: 24px;
        }

        .status-wrapper label {
          display: block;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 10px 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
        }

        .status-badge.active {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .info-box {
          background: #f9fafb;
          border-radius: 16px;
          padding: 18px;
        }

        .info-box h5 {
          margin-bottom: 12px;
          font-size: 15px;
          font-weight: 700;
        }

        .info-box ul {
          padding-left: 18px;
          margin: 0;
        }

        .info-box li {
          margin-bottom: 10px;
          color: #6b7280;
          font-size: 14px;
        }

        .action-bar {
          display: flex;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .save-btn {
          border: none;
          background: #111827;
          color: white;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
        }

        .save-btn:hover {
          transform: translateY(-2px);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 992px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
