"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

type Props = {
  employeeId: number;
  isViewOnly?: boolean;
};

const PersonalInfoTab = ({ employeeId, isViewOnly }: Props) => {
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  // ============================================
  // FORM
  // ============================================

  const [formData, setFormData] = useState({
    dob: "",

    gender: "",

    bloodGroup: "",

    maritalStatus: "",

    fatherName: "",

    motherName: "",

    nationality: "",

    religion: "",
  });

  // ============================================
  // FETCH DATA
  // ============================================

  const fetchPersonalInfo = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/employee-personal-info/${employeeId}`,
      );

      const data = res?.data?.data;

      if (data) {
        setFormData({
          dob: data?.dob ? new Date(data.dob).toISOString().split("T")[0] : "",

          gender: data?.gender || "",

          bloodGroup: data?.bloodGroup || "",

          maritalStatus: data?.maritalStatus || "",

          fatherName: data?.fatherName || "",

          motherName: data?.motherName || "",

          nationality: data?.nationality || "",

          religion: data?.religion || "",
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
      fetchPersonalInfo();
    }
  }, [employeeId]);

  // ============================================
  // CHANGE
  // ============================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      await axiosInstance.post(
        `/employee-personal-info/${employeeId}`,
        formData,
      );

      alert("Personal info saved successfully");
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* DOB */}

          <div className="col-md-6">
            <label className="form-label fw-semibold">Date of Birth</label>

            <input
              type="date"
              className="form-control"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              disabled={isViewOnly}
            />
          </div>

          {/* GENDER */}

          <div className="col-md-6">
            <label className="form-label fw-semibold">Gender</label>

            <select
              className="form-select"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={isViewOnly}
            >
              <option value="">Select Gender</option>

              <option value="Male">Male</option>

              <option value="Female">Female</option>

              <option value="Other">Other</option>
            </select>
          </div>

          {/* BLOOD GROUP */}

          <div className="col-md-6">
            <label className="form-label fw-semibold">Blood Group</label>

            <select
              className="form-select"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              disabled={isViewOnly}
            >
              <option value="">Select Blood Group</option>

              <option value="A+">A+</option>

              <option value="A-">A-</option>

              <option value="B+">B+</option>

              <option value="B-">B-</option>

              <option value="O+">O+</option>

              <option value="O-">O-</option>

              <option value="AB+">AB+</option>

              <option value="AB-">AB-</option>
            </select>
          </div>

          {/* MARITAL STATUS */}

          <div className="col-md-6">
            <label className="form-label fw-semibold">Marital Status</label>

            <select
              className="form-select"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              disabled={isViewOnly}
            >
              <option value="">Select Status</option>

              <option value="Single">Single</option>

              <option value="Married">Married</option>

              <option value="Divorced">Divorced</option>
            </select>
          </div>

          {/* FATHER NAME */}

          <div className="col-md-6">
            <label className="form-label fw-semibold">Father Name</label>

            <input
              type="text"
              className="form-control"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              disabled={isViewOnly}
            />
          </div>

          {/* MOTHER NAME */}

          <div className="col-md-6">
            <label className="form-label fw-semibold">Mother Name</label>

            <input
              type="text"
              className="form-control"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              disabled={isViewOnly}
            />
          </div>

          {/* NATIONALITY */}

          <div className="col-md-6">
            <label className="form-label fw-semibold">Nationality</label>

            <input
              type="text"
              className="form-control"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              disabled={isViewOnly}
            />
          </div>

          {/* RELIGION */}

          <div className="col-md-6">
            <label className="form-label fw-semibold">Religion</label>

            <input
              type="text"
              className="form-control"
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              disabled={isViewOnly}
            />
          </div>
        </div>

        {/* SAVE */}
        {!isViewOnly && (
        <div className="mt-4">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Personal Info"}
          </button>
        </div>
        )}
      </form>
    </div>
  );
};

export default PersonalInfoTab;
