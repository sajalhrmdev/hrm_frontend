"use client";

import React, { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import PreviewTable from "@/components/import/PreviewTable";

interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  failed: number;
  errors: { row: number; field: string; message: string; value?: any }[];
  previewRows?: any[];
}

const EntityImportPage = () => {
  const params = useParams();
  const entity = params.entity as string;

  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<string>("skip");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);

  const entityLabels: Record<string, string> = {
    role: "Role",
    department: "Department",
    designation: "Designation",
    shift: "Shift",
    workSchedulePolicy: "Work Schedule Policy",
    leaveType: "Leave Type",
    salaryComponent: "Salary Component",
    holiday: "Holiday",
    officeLocation: "Office Location",
    employee: "Employee",
    employeePersonalInfo: "Employee Personal Info",
    employeeAddress: "Employee Address",
    employeeBankDetail: "Employee Bank Detail",
    employeeEmergencyContact: "Employee Emergency Contact",
    employeeSalaryComponent: "Employee Salary Component",
    leaveBalance: "Leave Balance",
    attendance: "Attendance",
    performanceReview: "Performance Review",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStep("upload");
      setResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await axiosInstance.get(`/import/template/${entity}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${entityLabels[entity] || entity} Template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to download template");
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post(`/import/${entity}/preview`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res?.data?.data;
      setResult(data);
      setPreviewRows(data.previewRows || []);
      setStep("preview");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Preview failed");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("duplicateStrategy", duplicateStrategy);

      const res = await axiosInstance.post(`/import/${entity}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res?.data?.data;
      setResult(data);
      setStep("result");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadErrors = () => {
    if (!result?.errors || result.errors.length === 0) return;
    const csv = ["Row,Field,Message,Value"];
    result.errors.forEach((e) => {
      csv.push(`${e.row},"${e.field}","${e.message}","${e.value || ""}"`);
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${entity}_errors.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <div className="d-flex align-items-center gap-2">
              <Link href="/import" className="btn btn-secondary btn-sm">
                <i className="ti ti-arrow-left"></i>
              </Link>
              <h4>Import {entityLabels[entity] || entity}</h4>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-4">
          <ul className="nav nav-tabs nav-tabs-solid">
            <li className="nav-item">
              <span className={`nav-link ${step === "upload" ? "active" : ""}`}>
                <i className="ti ti-upload me-1"></i> Upload
              </span>
            </li>
            <li className="nav-item">
              <span className={`nav-link ${step === "preview" ? "active" : ""}`}>
                <i className="ti ti-eye me-1"></i> Preview
              </span>
            </li>
            <li className="nav-item">
              <span className={`nav-link ${step === "result" ? "active" : ""}`}>
                <i className="ti ti-check me-1"></i> Result
              </span>
            </li>
          </ul>
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="mb-3">Upload Excel File</h6>
                  <div className="mb-3">
                    <label className="form-label">Select File (.xlsx, .xls, .csv)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Duplicate Handling</label>
                    <select
                      className="form-select"
                      value={duplicateStrategy}
                      onChange={(e) => setDuplicateStrategy(e.target.value)}
                    >
                      <option value="skip">Skip duplicates</option>
                      <option value="upsert">Update existing records</option>
                    </select>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary"
                      disabled={!file || loading}
                      onClick={handlePreview}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-1"></span>
                      ) : (
                        <i className="ti ti-eye me-1"></i>
                      )}
                      Preview
                    </button>

                    <button
                      className="btn btn-success"
                      disabled={!file || loading}
                      onClick={handleImport}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-1"></span>
                      ) : (
                        <i className="ti ti-upload me-1"></i>
                      )}
                      Import Now
                    </button>
                  </div>
                </div>

                <div className="col-md-6">
                  <h6 className="mb-3">Download Template</h6>
                  <p className="text-muted">
                    Download the Excel template with correct headers and format.
                  </p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleDownloadTemplate}
                  >
                    <i className="ti ti-download me-1"></i>
                    Download {entityLabels[entity]} Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && result && (
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Preview Results</h6>
                <div className="d-flex gap-2">
                  <button className="btn btn-secondary btn-sm" onClick={() => setStep("upload")}>
                    <i className="ti ti-arrow-left me-1"></i> Back
                  </button>
                  {result.errors.length > 0 && (
                    <button className="btn btn-outline-danger btn-sm" onClick={handleDownloadErrors}>
                      <i className="ti ti-download me-1"></i> Download Errors
                    </button>
                  )}
                  {result.imported > 0 && (
                    <button className="btn btn-success btn-sm" onClick={handleImport}>
                      <i className="ti ti-check me-1"></i> Import {result.imported} Rows
                    </button>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h3 className="mb-0">{result.total}</h3>
                      <small className="text-muted">Total Rows</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success-lights">
                    <div className="card-body text-center">
                      <h3 className="mb-0 text-success">{result.imported}</h3>
                      <small className="text-success">Valid Rows</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-danger-lights">
                    <div className="card-body text-center">
                      <h3 className="mb-0 text-danger">{result.failed}</h3>
                      <small className="text-danger">Invalid Rows</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning-lights">
                    <div className="card-body text-center">
                      <h3 className="mb-0 text-warning">{result.errors.length}</h3>
                      <small className="text-warning">Errors</small>
                    </div>
                  </div>
                </div>
              </div>

              {previewRows.length > 0 ? (
                <PreviewTable rows={previewRows} />
              ) : result.errors.length > 0 ? (
                <div className="alert alert-danger border-0" style={{ borderRadius: 14 }}>
                  <h6 className="alert-heading mb-3">
                    <i className="ti ti-alert-triangle me-1"></i> Validation Errors
                  </h6>
                  <ul className="mb-0" style={{ listStyle: "none", padding: 0 }}>
                    {result.errors.map((err, i) => (
                      <li key={i} className="mb-2 pb-2" style={{ borderBottom: i < result.errors.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none" }}>
                        <strong className="text-danger">{err.field}</strong>
                        {err.row > 0 && <span className="text-muted ms-2">(Row {err.row})</span>}
                        <span className="ms-2">{err.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === "result" && result && (
          <div className="card">
            <div className="card-body text-center py-5">
              <div className="mb-3">
                <span className="avatar avatar-xxl bg-success rounded-circle d-inline-flex align-items-center justify-content-center">
                  <i className="ti ti-check text-white" style={{ fontSize: "48px" }}></i>
                </span>
              </div>
              <h4>Import Complete!</h4>
              <div className="row justify-content-center mt-4">
                <div className="col-md-8">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h2 className="mb-0">{result.total}</h2>
                        <small className="text-muted">Total Rows</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h2 className="mb-0 text-success">{result.imported}</h2>
                        <small className="text-success">Imported</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h2 className="mb-0 text-danger">{result.failed}</h2>
                        <small className="text-danger">Failed</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-3">
                  <button className="btn btn-outline-danger" onClick={handleDownloadErrors}>
                    <i className="ti ti-download me-1"></i> Download Error Report
                  </button>
                </div>
              )}

              <div className="mt-4 d-flex gap-2 justify-content-center">
                <Link href="/import" className="btn btn-secondary">
                  <i className="ti ti-arrow-left me-1"></i> Back to Import
                </Link>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setStep("upload");
                    setFile(null);
                    setResult(null);
                    setPreviewRows([]);
                  }}
                >
                  <i className="ti ti-upload me-1"></i> Import More
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityImportPage;
