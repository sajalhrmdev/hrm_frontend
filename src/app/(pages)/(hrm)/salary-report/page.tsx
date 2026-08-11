"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { downloadSalarySheet } from "@/utils/salarySheetExcel";

const SalaryReportPage = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [payrollRun, setPayrollRun] = useState<any>(null);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [loadingPayrolls, setLoadingPayrolls] = useState(false);

  const fetchRuns = async () => {
    try {
      setLoadingRuns(true);
      const res = await axiosInstance.get("/payroll/run");
      setRuns(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingRuns(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchPayrolls = async (runId: number) => {
    try {
      setLoadingPayrolls(true);
      const res = await axiosInstance.get(`/payroll/run/${runId}`);
      setPayrolls(res?.data?.data?.payrolls || []);
      setPayrollRun(res?.data?.data?.payrollRun || null);
    } catch (err) {
      console.log(err);
      setPayrolls([]);
      setPayrollRun(null);
    } finally {
      setLoadingPayrolls(false);
    }
  };

  const handleRunChange = (runId: number | null) => {
    setSelectedRunId(runId);
    setPayrolls([]);
    setPayrollRun(null);
    if (runId) {
      fetchPayrolls(runId);
    }
  };

  useEffect(() => {
    if (runs.length > 0 && selectedRunId === null) {
      const latest = runs[0];
      setSelectedRunId(latest.id);
      fetchPayrolls(latest.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs]);

  const handleExcelDownload = () => {
    downloadSalarySheet(payrolls, payrollRun?.company?.name || "", monthLabel);
  };

  const earningComponents = Array.from(
    new Set(
      payrolls.flatMap((payroll) =>
        payroll.payrollSnapComponents
          ?.filter((c: any) => c.type === "EARNING")
          ?.map((c: any) => c.componentName),
      ),
    ),
  );

  const deductionComponents = Array.from(
    new Set(
      payrolls.flatMap((payroll) =>
        payroll.payrollSnapComponents
          ?.filter((c: any) => c.type === "DEDUCTION")
          ?.map((c: any) => c.componentName),
      ),
    ),
  );

  const employerComponents = Array.from(
    new Set(
      payrolls.flatMap((payroll) =>
        payroll.payrollSnapComponents
          ?.filter((c: any) => c.type === "EMPLOYER_CONTRIBUTION")
          ?.map((c: any) => c.componentName),
      ),
    ),
  );

  const totalNetSalary = payrolls.reduce((acc, item) => acc + item.net_salary, 0);
  const totalEmployerContribution = payrolls.reduce(
    (acc, item) => acc + (item.employer_contribution ?? 0),
    0,
  );
  const totalCtc = payrolls.reduce(
    (acc, item) => acc + (item.gross_salary ?? 0) + (item.employer_contribution ?? 0),
    0,
  );

  const monthLabel = payrollRun?.periodStart
    ? new Date(payrollRun.periodStart).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "";

  const runLabel = (run: any) => {
    const period = run?.periodStart
      ? new Date(run.periodStart).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        })
      : "";
    const title = run?.title ? `${run.title} - ` : "";
    return `${title}${period} (${run?._count?.payrolls ?? 0} employees)`;
  };

  const componentCount =
    5 + earningComponents.length + deductionComponents.length + employerComponents.length;

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container-fluid py-3">
          {/* ====================================== */}
          {/* TOOLBAR */}
          {/* ====================================== */}

          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-3">
            <div>
              <h4 className="mb-1 fw-bold">Salary Report</h4>
              <div className="text-muted">Payroll runs and salary sheets</div>
            </div>

            <div className="d-flex align-items-end gap-2 flex-wrap">
              <div>
                <label className="form-label fw-semibold text-muted mb-1">
                  Payroll Period
                </label>
                <select
                  className="form-select"
                  style={{ minWidth: "260px" }}
                  value={selectedRunId ?? ""}
                  onChange={(e) =>
                    handleRunChange(e.target.value ? Number(e.target.value) : null)
                  }
                  disabled={loadingRuns}
                >
                  {loadingRuns ? (
                    <option>Loading runs...</option>
                  ) : runs.length === 0 ? (
                    <option value="">No payroll run found</option>
                  ) : (
                    runs.map((run) => (
                      <option key={run.id} value={run.id}>
                        {runLabel(run)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                className="btn btn-success"
                onClick={handleExcelDownload}
                disabled={payrolls.length === 0}
              >
                ⬇ Download Excel Salary Sheet
              </button>
            </div>
          </div>

          {/* ====================================== */}
          {/* COMPANY HEADER */}
          {/* ====================================== */}

          {payrollRun && (
            <div className="salary-header">
              <h2>{payrollRun?.company?.name}</h2>
              <h5>Salary Sheet - {monthLabel}</h5>
            </div>
          )}

          {/* ====================================== */}
          {/* TABLE */}
          {/* ====================================== */}

          <div className="salary-sheet-wrapper">
            {loadingPayrolls ? (
              <div className="text-center py-5 text-muted">Loading...</div>
            ) : runs.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No payroll run found. Create a payroll run from the Payroll module first.
              </div>
            ) : payrolls.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No payroll found for this run.
              </div>
            ) : (
              <table className="salary-sheet-table">
                <thead>
                  <tr>
                    <th rowSpan={2}>SL</th>
                    <th rowSpan={2}>Employee Code</th>
                    <th rowSpan={2}>Employee Name</th>
                    <th rowSpan={2}>Present Days</th>
                    <th rowSpan={2}>Total Days</th>

                    {earningComponents.length > 0 && (
                      <th colSpan={earningComponents.length} className="earning-header">
                        Earnings
                      </th>
                    )}

                    {deductionComponents.length > 0 && (
                      <th colSpan={deductionComponents.length} className="deduction-header">
                        Deductions
                      </th>
                    )}

                    {employerComponents.length > 0 && (
                      <th colSpan={employerComponents.length} className="employer-header">
                        Employer Contribution
                      </th>
                    )}

                    <th rowSpan={2}>Net Payable</th>
                    <th rowSpan={2}>CTC</th>
                  </tr>
                  <tr>
                    {earningComponents.map((item: any) => (
                      <th key={item}>{item}</th>
                    ))}
                    {deductionComponents.map((item: any) => (
                      <th key={item}>{item}</th>
                    ))}
                    {employerComponents.map((item: any) => (
                      <th key={item}>{item}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {payrolls.map((payroll, index) => {
                    const findAmount = (comp: string) =>
                      payroll.payrollSnapComponents?.find(
                        (c: any) => c.componentName === comp,
                      )?.amount ?? 0;

                    return (
                      <tr key={payroll.id}>
                        <td>{index + 1}</td>
                        <td>{payroll.employee?.employeeCode}</td>
                        <td className="employee-name">{payroll.employee?.name}</td>
                        <td>{payroll.present_days}</td>
                        <td>{payroll.total_days}</td>

                        {earningComponents.map((comp: any) => (
                          <td key={comp}>
                            ₹{findAmount(comp).toLocaleString("en-IN")}
                          </td>
                        ))}
                        {deductionComponents.map((comp: any) => (
                          <td key={comp}>
                            ₹{findAmount(comp).toLocaleString("en-IN")}
                          </td>
                        ))}
                        {employerComponents.map((comp: any) => (
                          <td key={comp}>
                            ₹{findAmount(comp).toLocaleString("en-IN")}
                          </td>
                        ))}

                        <td className="net-salary">
                          ₹{payroll.net_salary?.toLocaleString("en-IN")}
                        </td>
                        <td className="ctc-cell">
                          ₹
                          {(
                            (payroll.gross_salary ?? 0) +
                            (payroll.employer_contribution ?? 0)
                          ).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr>
                    <th colSpan={componentCount} className="text-end">
                      Total Net Salary
                    </th>
                    <th className="footer-total">₹{totalNetSalary.toLocaleString("en-IN")}</th>
                    <th></th>
                  </tr>

                  {employerComponents.length > 0 && (
                    <tr>
                      <th
                        colSpan={5 + earningComponents.length + deductionComponents.length}
                        className="text-end"
                      >
                        Total Employer Contribution
                      </th>
                      <th colSpan={employerComponents.length} className="footer-total">
                        ₹{totalEmployerContribution.toLocaleString("en-IN")}
                      </th>
                      <th></th>
                      <th className="footer-total">₹{totalCtc.toLocaleString("en-IN")}</th>
                    </tr>
                  )}
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .salary-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .salary-header h2 {
          font-size: 30px;
          font-weight: 800;
          margin-bottom: 4px;
          color: #111827;
        }
        .salary-header h5 {
          font-size: 17px;
          font-weight: 600;
          color: #374151;
        }
        .salary-sheet-wrapper {
          width: 100%;
          overflow-x: auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
          padding: 10px;
          min-height: 200px;
        }
        .salary-sheet-table {
          width: max-content;
          min-width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          color: #111;
          background: white;
        }
        .salary-sheet-table th {
          background: #f3f4f6;
          color: #111827;
          font-weight: 700;
          border: 1px solid #d1d5db;
          padding: 10px 12px;
          text-align: center;
          vertical-align: middle;
          white-space: nowrap;
        }
        .salary-sheet-table td {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          text-align: center;
          vertical-align: middle;
          white-space: nowrap;
          color: #111827;
          font-weight: 500;
        }
        .salary-sheet-table tbody tr:nth-child(even) {
          background: #fafafa;
        }
        .salary-sheet-table tbody tr:hover {
          background: #f9fafb;
        }
        .earning-header {
          background: #e8f5e9 !important;
          color: #111827 !important;
          font-size: 15px;
        }
        .deduction-header {
          background: #ffebee !important;
          color: #111827 !important;
          font-size: 15px;
        }
        .employer-header {
          background: #ede7f6 !important;
          color: #111827 !important;
          font-size: 15px;
        }
        .employee-name {
          text-align: left !important;
          font-weight: 700;
        }
        .net-salary {
          font-weight: 800 !important;
          color: #065f46 !important;
          background: #ecfdf5;
        }
        .ctc-cell {
          font-weight: 700;
        }
        .footer-total {
          font-size: 16px;
          font-weight: 800;
          color: #111827;
          background: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default SalaryReportPage;
