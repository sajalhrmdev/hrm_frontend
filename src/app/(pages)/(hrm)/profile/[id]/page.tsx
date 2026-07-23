"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import axiosInstance from "@/utils/axiosInstance";
import { useAuth } from "@/providers/AuthContext";
import PersonalInfoTab from "@/compo/PersonalInfoTab";
import AddressTab from "@/compo/AddressTab";
import DocumentTab from "@/compo/DocumentItem";
import EmployeeBankDetailTab from "@/compo/EmployeeBankDetailTab";
import EmployeeEmergencyContactTab from "@/compo/EmployeeEmergencyContactTab";
import EmployeeSalaryTab from "@/compo/EmployeeSalaryTab";
import EmployeePayrollTab from "@/compo/EmployeePayrollTab";
import EmployeeLeaveTab from "@/compo/EmployeeLeaveTab";
import EmployeeExperienceTab from "@/compo/EmployeeExperienceTab";
import EmployeeFaceRegister from "@/compo/EmployeeFaceRegister";
import { SkeletonPage } from "@/core/common/Skeleton";

type Employee = {
  id: number;

  name: string;

  email: string;

  phone: string;

  employeeCode?: string;

  joiningDate?: string;

  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";

  role?: {
    id: number;
    name: string;
  };

  department?: {
    id: number;
    title: string;
  };

  designation?: {
    id: number;
    title: string;
  };

  shift?: {
    id: number;
    title: string;
  };
};

const EmployeeProfilePage = () => {
  const params = useParams();
  const { permissions } = useAuth();

  const employeeId = Number(params?.id);

  const canEdit = permissions?.includes("*") || permissions?.includes("update-employee");

  const [loading, setLoading] = useState(true);

  const [employee, setEmployee] = useState<Employee | null>(null);

  const [activeTab, setActiveTab] = useState("basic");

  // ============================================
  // FETCH EMPLOYEE
  // ============================================

  const fetchEmployee = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`/employee/${employeeId}`);

      setEmployee(res?.data?.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return <SkeletonPage />;
  }

  // ============================================
  // NO EMPLOYEE
  // ============================================

  if (!employee) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">Employee not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">👨‍💼 Employee Profile</h3>

            <p className="text-muted mb-0">Employee details and records</p>
          </div>

          <Link href="/employee" className="btn btn-dark">
            ← Back
          </Link>
        </div>

        {/* ====================================== */}
        {/* PROFILE CARD */}
        {/* ====================================== */}

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              {/* AVATAR */}

              <div className="col-md-2 text-center">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                  style={{
                    width: "90px",
                    height: "90px",
                    fontSize: "32px",
                    fontWeight: "bold",
                  }}
                >
                  {employee.name?.charAt(0)?.toUpperCase()}
                </div>
              </div>

              {/* DETAILS */}

              <div className="col-md-10">
                <div className="d-flex flex-wrap justify-content-between">
                  <div>
                    <h4 className="fw-bold mb-1">{employee.name}</h4>

                    <p className="text-muted mb-1">
                      {employee.designation?.title} -{" "}
                      {employee.department?.title}
                    </p>

                    <p className="mb-1">📧 {employee.email}</p>

                    <p className="mb-1">📱 {employee.phone}</p>

                    <p className="mb-0">🆔 {employee.employeeCode}</p>
                  </div>

                  <div className="text-md-end mt-3 mt-md-0">
                    <div className="mb-2">
                      {employee.status === "ACTIVE" ? (
                        <span className="badge bg-success px-3 py-2">
                          ACTIVE
                        </span>
                      ) : employee.status === "SUSPENDED" ? (
                        <span className="badge bg-warning px-3 py-2">
                          SUSPENDED
                        </span>
                      ) : (
                        <span className="badge bg-danger px-3 py-2">
                          INACTIVE
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <strong>Role:</strong> {employee.role?.name}
                    </div>

                    <div className="mb-2">
                      <strong>Shift:</strong> {employee.shift?.title || "-"}
                    </div>

                    <div>
                      <strong>Joining:</strong>{" "}
                      {employee.joiningDate
                        ? new Date(employee.joiningDate).toLocaleDateString()
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================== */}
        {/* TABS */}
        {/* ====================================== */}

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            {/* TAB BUTTONS */}

            <div className="d-flex flex-wrap gap-2 mb-4">
              <button
                className={`btn ${
                  activeTab === "basic" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("basic")}
              >
                Basic Info
              </button>

              <button
                className={`btn ${
                  activeTab === "personal"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("personal")}
              >
                Personal Info
              </button>
              <button
                className={`btn ${
                  activeTab === "face-register"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("face-register")}
              >
                Face Register
              </button>
              <button
                className={`btn ${
                  activeTab === "address"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("address")}
              >
                Address
              </button>

              <button
                className={`btn ${
                  activeTab === "emergency"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("emergency")}
              >
                Emergency Contact
              </button>
              <button
                className={`btn ${
                  activeTab === "salary" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("salary")}
              >
                Salary Structure
              </button>
              <button
                className={`btn ${
                  activeTab === "payroll"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("payroll")}
              >
                Payroll
              </button>
              <button
                className={`btn ${
                  activeTab === "bank" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("bank")}
              >
                Bank
              </button>

              <button
                className={`btn ${
                  activeTab === "documents"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("documents")}
              >
                Documents
              </button>

              <button
                className={`btn ${
                  activeTab === "attendance"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("attendance")}
              >
                Attendance
              </button>

              <button
                className={`btn ${
                  activeTab === "leave" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("leave")}
              >
                Leave
              </button>
              <button
                className={`btn ${
                  activeTab === "experience"
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab("experience")}
              >
                Experience
              </button>
            </div>

            {/* ================================== */}
            {/* TAB CONTENT */}
            {/* ================================== */}

            {activeTab === "basic" && (
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="border rounded p-3">
                    <h6 className="fw-bold mb-3">Basic Information</h6>

                    <p>
                      <strong>Name:</strong> {employee.name}
                    </p>

                    <p>
                      <strong>Email:</strong> {employee.email}
                    </p>

                    <p>
                      <strong>Phone:</strong> {employee.phone}
                    </p>

                    <p className="mb-0">
                      <strong>Employee Code:</strong> {employee.employeeCode}
                    </p>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="border rounded p-3">
                    <h6 className="fw-bold mb-3">Office Information</h6>

                    <p>
                      <strong>Department:</strong> {employee.department?.title}
                    </p>

                    <p>
                      <strong>Designation:</strong>{" "}
                      {employee.designation?.title}
                    </p>

                    <p>
                      <strong>Role:</strong> {employee.role?.name}
                    </p>

                    <p className="mb-0">
                      <strong>Shift:</strong> {employee.shift?.title || "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ================================== */}
            {/* PERSONAL INFO */}
            {/* ================================== */}

            {activeTab === "personal" && (
              <div className="alert alert-info">
                <PersonalInfoTab employeeId={employeeId} isViewOnly={!canEdit} />
              </div>
            )}
            {/* Face register======================= */}
            {activeTab === "face-register" && (
              <div className="alert alert-info">
                <EmployeeFaceRegister employeeId={employeeId} isViewOnly={!canEdit} />
              </div>
            )}
            {/* ================================== */}
            {/* ADDRESS */}
            {/* ================================== */}

            {activeTab === "address" && (
              <div className="alert alert-warning">
                <AddressTab employeeId={employeeId} isViewOnly={!canEdit} />
              </div>
            )}
            {/* EMERGENCY */}
            {activeTab === "emergency" && (
              <div className="alert alert-warning">
                {/* <AddressTab employeeId={employeeId} /> */}
                <EmployeeEmergencyContactTab employeeId={employeeId} isViewOnly={!canEdit} />
              </div>
            )}
            {activeTab === "salary" && (
              <EmployeeSalaryTab employeeId={employeeId} isViewOnly={!canEdit} />
            )}

            {activeTab === "payroll" && (
              <EmployeePayrollTab employeeId={employeeId} />
            )}
            {/* ================================== */}
            {/* BANK */}
            {/* ================================== */}

            {activeTab === "bank" && (
              <div className="alert alert-warning">
                <EmployeeBankDetailTab employeeId={employeeId} isViewOnly={!canEdit} />
              </div>
            )}

            {/* ================================== */}
            {/* DOCUMENTS */}
            {/* ================================== */}

            {activeTab === "documents" && (
              <div className="alert alert-warning">
                <DocumentTab employeeId={employeeId} isViewOnly={!canEdit} />
              </div>
            )}

            {/* ================================== */}
            {/* ATTENDANCE */}
            {/* ================================== */}

            {activeTab === "attendance" && (
              <div className="alert alert-warning">
                🚀 Attendance Module Coming Soon
              </div>
            )}
            {activeTab === "leave" && (
              <EmployeeLeaveTab employeeId={employeeId} isViewOnly={!canEdit} />
            )}
            {activeTab === "experience" && (
              <EmployeeExperienceTab employeeId={employeeId} isViewOnly={!canEdit} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
