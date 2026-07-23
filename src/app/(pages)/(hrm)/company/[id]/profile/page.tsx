"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import axiosInstance from "@/utils/axiosInstance";
import OfficeLocationsTab from "@/components/company/OfficeLocationsTab";
import { SkeletonPage } from "@/core/common/Skeleton";

export default function CompanyProfilePage() {
  const params = useParams();

  const companyId = Number(params.id);

  const [loading, setLoading] = useState(true);

  const [company, setCompany] = useState<any>(null);

  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    {
      key: "overview",
      label: "Overview",
    },

    {
      key: "settings",
      label: "Company Settings",
    },

    {
      key: "locations",
      label: "Office Locations",
    },

    {
      key: "departments",
      label: "Departments",
    },

    {
      key: "roles",
      label: "Roles",
    },

    {
      key: "employees",
      label: "Employees",
    },
  ];

  const getCompany = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`/company/${companyId}`);

      setCompany(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCompany();
  }, [companyId]);

  if (loading) {
    return <SkeletonPage />;
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container-fluid py-4">
          {/* HEADER */}

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="fw-bold mb-1">{company?.name}</h3>

                  <p className="text-muted mb-1">{company?.email}</p>

                  <p className="mb-0">{company?.phone}</p>
                </div>

                <span
                  className={`badge ${
                    company?.status === "ACTIVE" ? "bg-success" : "bg-danger"
                  }`}
                >
                  {company?.status}
                </span>
              </div>
            </div>
          </div>

          {/* STATS */}

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted">Employees</h6>

                  <h2>{company?._count?.employees}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted">Roles</h6>

                  <h2>{company?._count?.roles}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="text-muted">Attendances</h6>

                  <h2>{company?._count?.attendances}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <div
                className="
              d-flex
              gap-2
              overflow-auto
            "
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    className={`btn ${
                      activeTab === tab.key ? "btn-primary" : "btn-light"
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-body">
              {/* OVERVIEW */}

              {activeTab === "overview" && (
                <div>
                  <h5 className="mb-4">Company Overview</h5>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="fw-semibold">Company Name</label>

                      <div>{company?.name}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="fw-semibold">Email</label>

                      <div>{company?.email}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="fw-semibold">Phone</label>

                      <div>{company?.phone}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="fw-semibold">Status</label>

                      <div>{company?.status}</div>
                    </div>

                    <div className="col-12">
                      <label className="fw-semibold">Address</label>

                      <div>{company?.address}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS */}

              {activeTab === "settings" && (
                <div>
                  <h5>Company Settings</h5>

                  <p>Company settings component here.</p>
                </div>
              )}

              {/* LOCATIONS */}

              {activeTab === "locations" && (
                <OfficeLocationsTab companyId={companyId} />
              )}

              {/* DEPARTMENTS */}

              {activeTab === "departments" && (
                <div>
                  <h5>Departments</h5>
                </div>
              )}

              {/* ROLES */}

              {activeTab === "roles" && (
                <div>
                  <h5>Roles</h5>
                </div>
              )}

              {/* EMPLOYEES */}

              {activeTab === "employees" && (
                <div>
                  <h5>Employees</h5>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
