"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

import { Empty, Skeleton } from "antd";

import { motion, AnimatePresence } from "framer-motion";

import CountUp from "react-countup";

import {
  Wallet,
  ReceiptText,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Building2,
  Coins,
  Eye,
  FileText,
} from "lucide-react";

import { premiumSalaryStyles } from "@/utils/premiumSalaryStyles";

// ======================================================

type Props = {
  employeeId: number;
};

// ======================================================

const toneClass = (type?: string) => {
  if (type === "EARNING") return "tone-emerald";
  if (type === "DEDUCTION") return "tone-rose";
  if (type === "EMPLOYER_CONTRIBUTION") return "tone-violet";
  return "tone-slate";
};

const accentOf = (type?: string) => {
  if (type === "EARNING") return "emerald";
  if (type === "DEDUCTION") return "rose";
  if (type === "EMPLOYER_CONTRIBUTION") return "violet";
  return "slate";
};

const fmt = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("en-IN");

// ======================================================

const EmployeePayrollTab = ({ employeeId }: Props) => {
  const [loading, setLoading] = useState(false);

  const [payrolls, setPayrolls] = useState<any[]>([]);

  const [summary, setSummary] = useState<any>(null);

  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);

  const [payrollLoading, setPayrollLoading] = useState(false);

  // ======================================================
  // FETCH EMPLOYEE PAYROLLS
  // ======================================================

  const fetchEmployeePayrolls = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`/payroll/employee/${employeeId}`);

      setPayrolls(res?.data?.data?.payrolls || []);

      setSummary(res?.data?.data?.summary || null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchEmployeePayrolls();
    }
  }, [employeeId]);

  // ======================================================
  // VIEW SINGLE PAYROLL
  // ======================================================

  const handleViewPayroll = async (payrollId: number) => {
    try {
      setPayrollLoading(true);

      const res = await axiosInstance.get(`/payroll/${payrollId}`);

      setSelectedPayroll(res?.data?.data || null);
    } catch (err) {
      console.log(err);
    } finally {
      setPayrollLoading(false);
    }
  };

  // ======================================================
  // HELPERS
  // ======================================================

  const getStatusClass = (status: string) => {
    if (status === "PAID") return "is-paid";

    if (status === "FINALIZED") return "is-finalized";

    return "is-draft";
  };

  const totalGross = summary?.totalGrossSalary ?? 0;

  const totalDeduction = summary?.totalDeduction ?? 0;

  const totalEmployer = summary?.totalEmployerContribution ?? 0;

  const totalNet = summary?.totalNetSalary ?? 0;

  const totalCtc = totalGross + totalEmployer;

  const sections = [
    {
      type: "EARNING",
      label: "Earnings",
      Icon: TrendingUp,
      hint: "Incomes that build up the gross salary",
    },
    {
      type: "DEDUCTION",
      label: "Deductions",
      Icon: TrendingDown,
      hint: "Amounts subtracted from gross salary",
    },
    {
      type: "EMPLOYER_CONTRIBUTION",
      label: "Employer Contribution",
      Icon: Building2,
      hint: "Employer-side costs that add to CTC",
    },
  ];

  const snap = selectedPayroll?.payrollSnapComponents || [];

  const snapByType: Record<string, any[]> = {};

  snap.forEach((item: any) => {
    (snapByType[item.type] = snapByType[item.type] || []).push(item);
  });

  const periodText = (run: any) =>
    run?.periodStart && run?.periodEnd
      ? `${new Date(run.periodStart).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })} — ${new Date(run.periodEnd).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`
      : "—";

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="premium-shell">
      <div className="payroll-wrap">
        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <div className="premium-card payroll-head-card">
          <div className="card-head">
            <div className="card-head-copy">
              <h3>Employee Payroll</h3>
              <p>Payroll history, salary breakdown & payment status</p>
            </div>

            <span className="card-head-tag">Payroll Analytics</span>
          </div>
        </div>

        {/* ====================================== */}
        {/* SUMMARY */}
        {/* ====================================== */}

        <div className="summary-grid">
          <div className="stat-card stat-run">
            <div className="stat-top">
              <span className="stat-icon">
                <ReceiptText size={20} />
              </span>
              <span className="stat-label">Total Payrolls</span>
            </div>
            <div className="stat-value">
              <CountUp end={summary?.totalPayrolls ?? 0} duration={0.5} />
            </div>
          </div>

          <div className="stat-card stat-earning">
            <div className="stat-top">
              <span className="stat-icon">
                <TrendingUp size={20} />
              </span>
              <span className="stat-label">Gross Salary</span>
            </div>
            <div className="stat-value">
              ₹<CountUp end={totalGross} duration={0.5} separator="," />
            </div>
          </div>

          <div className="stat-card stat-deduction">
            <div className="stat-top">
              <span className="stat-icon">
                <TrendingDown size={20} />
              </span>
              <span className="stat-label">Total Deduction</span>
            </div>
            <div className="stat-value">
              ₹<CountUp end={totalDeduction} duration={0.5} separator="," />
            </div>
          </div>

          <div className="stat-card stat-employer">
            <div className="stat-top">
              <span className="stat-icon">
                <Building2 size={20} />
              </span>
              <span className="stat-label">Employer Contribution</span>
            </div>
            <div className="stat-value">
              ₹<CountUp end={totalEmployer} duration={0.5} separator="," />
            </div>
          </div>

          <div className="stat-card stat-net">
            <div className="stat-top">
              <span className="stat-icon">
                <Wallet size={20} />
              </span>
              <span className="stat-label">Net Salary</span>
            </div>
            <div className="stat-value">
              ₹<CountUp end={totalNet} duration={0.6} separator="," />
            </div>
          </div>
        </div>

        {/* ====================================== */}
        {/* CTC STRIP */}
        {/* ====================================== */}

        {(summary?.totalPayrolls ?? 0) > 0 && (
          <div className="ctc-strip">
            <span className="ctc-strip-icon">
              <Coins size={18} />
            </span>
            <div className="ctc-strip-copy">
              <div className="ctc-strip-label">
                Total CTC (Gross + Employer Contribution)
              </div>
              <div className="ctc-strip-value">
                ₹<CountUp end={totalCtc} duration={0.6} separator="," />
              </div>
            </div>
          </div>
        )}

        {/* ====================================== */}
        {/* PAYROLL HISTORY */}
        {/* ====================================== */}

        <div className="premium-card payroll-list-card">
          <div className="card-head">
            <div className="card-head-copy">
              <h3>Payroll History</h3>
              <p>All payroll runs generated for this employee</p>
            </div>
          </div>

          {loading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : payrolls.length === 0 ? (
            <div className="payroll-empty">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No payroll history found for this employee"
              />
            </div>
          ) : (
            <div className="table-scroll">
              <table className="comp-table">
                <thead>
                  <tr>
                    <th className="th-comp">Payroll</th>
                    <th>Run</th>
                    <th>Status</th>
                    <th className="th-num">Gross</th>
                    <th className="th-num">Net Salary</th>
                    <th className="th-action">Action</th>
                  </tr>
                </thead>

                <tbody>
                  <AnimatePresence>
                    {payrolls.map((item: any) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td>
                          <div className="pr-cell">
                            <span className="pr-icon">
                              <CalendarDays size={14} />
                            </span>

                            <div>
                              <div className="pr-title">
                                {item.payrollRun?.title || "Payroll Run"}
                              </div>

                              <div className="pr-meta">
                                {periodText(item.payrollRun)}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="pr-status">
                            {item.payrollRun?.status || "—"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`pay-status-badge ${getStatusClass(
                              item.status,
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="cell-num tabular">₹{fmt(item.gross_salary)}</td>

                        <td className="cell-num tabular">
                          <span className="net-amt">₹{fmt(item.net_salary)}</span>
                        </td>

                        <td className="cell-action">
                          <div className="pay-actions">
                            <button
                              className="pay-btn pay-btn-view"
                              onClick={() => handleViewPayroll(item.id)}
                            >
                              <Eye size={14} />
                              View
                            </button>

                            <button
                              className="pay-btn pay-btn-slip"
                              onClick={() =>
                                window.open(
                                  `/payroll-slip/${item.id}`,
                                  "_blank",
                                )
                              }
                            >
                              <FileText size={14} />
                              Slip
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ====================================== */}
        {/* PAYROLL DETAILS */}
        {/* ====================================== */}

        {payrollLoading && (
          <div className="premium-card payroll-loading">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        )}

        <AnimatePresence>
          {selectedPayroll && (
            <motion.div
              className="premium-card payroll-details-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* DETAIL HEADER */}
              <div className="card-head">
                <div className="card-head-copy">
                  <h3>Salary Breakdown</h3>
                  <p>
                    {selectedPayroll?.employee?.name || "Employee"} ·{" "}
                    {selectedPayroll?.employee?.designation?.title || "—"}
                  </p>
                </div>

                <span
                  className={`pay-status-badge ${getStatusClass(
                    selectedPayroll.status,
                  )}`}
                >
                  {selectedPayroll.status}
                </span>
              </div>

              {/* DETAIL SUMMARY */}
              <div className="summary-grid">
                <div className="stat-card stat-earning">
                  <div className="stat-top">
                    <span className="stat-icon">
                      <TrendingUp size={20} />
                    </span>
                    <span className="stat-label">Gross Salary</span>
                  </div>
                  <div className="stat-value">
                    ₹{fmt(selectedPayroll.gross_salary)}
                  </div>
                </div>

                <div className="stat-card stat-deduction">
                  <div className="stat-top">
                    <span className="stat-icon">
                      <TrendingDown size={20} />
                    </span>
                    <span className="stat-label">Total Deduction</span>
                  </div>
                  <div className="stat-value">
                    ₹{fmt(selectedPayroll.total_deduction)}
                  </div>
                </div>

                <div className="stat-card stat-employer">
                  <div className="stat-top">
                    <span className="stat-icon">
                      <Building2 size={20} />
                    </span>
                    <span className="stat-label">Employer Contribution</span>
                  </div>
                  <div className="stat-value">
                    ₹{fmt(selectedPayroll.employer_contribution)}
                  </div>
                </div>

                <div className="stat-card stat-net">
                  <div className="stat-top">
                    <span className="stat-icon">
                      <Wallet size={20} />
                    </span>
                    <span className="stat-label">Net Salary</span>
                  </div>
                  <div className="stat-value">
                    ₹{fmt(selectedPayroll.net_salary)}
                  </div>
                </div>

                <div className="stat-card stat-ctc">
                  <div className="stat-top">
                    <span className="stat-icon">
                      <Coins size={20} />
                    </span>
                    <span className="stat-label">Monthly CTC</span>
                  </div>
                  <div className="stat-value">
                    ₹
                    {fmt(
                      (selectedPayroll.gross_salary || 0) +
                        (selectedPayroll.employer_contribution || 0),
                    )}
                  </div>
                </div>
              </div>

              {/* ATTENDANCE */}
              <div className="att-grid">
                <div className="att-box">
                  <span>Total Days</span>
                  <strong>{selectedPayroll.total_days}</strong>
                </div>

                <div className="att-box">
                  <span>Present</span>
                  <strong>{selectedPayroll.present_days}</strong>
                </div>

                <div className="att-box">
                  <span>Paid Leave</span>
                  <strong>{selectedPayroll.paid_leave_days}</strong>
                </div>

                <div className="att-box">
                  <span>LOP</span>
                  <strong>{selectedPayroll.lop_days}</strong>
                </div>

                <div className="att-box">
                  <span>Payable Days</span>
                  <strong>{selectedPayroll.payable_days}</strong>
                </div>

                <div className="att-box">
                  <span>Overtime</span>
                  <strong>₹{fmt(selectedPayroll.overtime_amount)}</strong>
                </div>
              </div>

              {/* SNAP COMPONENTS */}
              {snap.length > 0 && (
                <div className="snap-sections">
                  {sections.map((section) => {
                    const items = snapByType[section.type] || [];

                    if (!items.length) return null;

                    const Icon = section.Icon;

                    const accent = accentOf(section.type);

                    return (
                      <div
                        key={section.type}
                        className={`comp-section section-accent-${accent}`}
                      >
                        <div className="section-head">
                          <span className="section-title">
                            <span
                              className={`section-icon section-icon-${accent}`}
                            >
                              <Icon size={14} />
                            </span>
                            {section.label}
                            <span
                              className={`count-chip count-chip-${accent}`}
                            >
                              {items.length}
                            </span>
                          </span>

                          <span className="section-hint">
                            {section.hint}
                          </span>
                        </div>

                        <div className="table-scroll">
                          <table
                            className={`comp-table table-${accent}`}
                          >
                            <thead>
                              <tr>
                                <th className="th-comp">Component</th>
                                <th className="th-num">Standard</th>
                                <th className="th-num">Payable</th>
                              </tr>
                            </thead>

                            <tbody>
                              {items.map((item: any) => (
                                <tr key={item.id}>
                                  <td>
                                    <span
                                      className={`p-dot ${toneClass(
                                        item.type,
                                      )}`}
                                    />
                                    {item.componentName}
                                    <span className="p-code">
                                      {item.componentCode}
                                    </span>
                                  </td>

                                  <td className="cell-num tabular">
                                    ₹{fmt(item.standardAmount)}
                                  </td>

                                  <td className="cell-num tabular">
                                    <span className="net-amt">
                                      ₹{fmt(item.amount)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ====================================== */}
      {/* STYLE */}
      {/* ====================================== */}

      <style jsx global>{premiumSalaryStyles}</style>

      <style jsx>{`
        .payroll-wrap {
          width: 100%;
        }

        .payroll-head-card {
          margin-bottom: 20px;
        }

        .premium-shell .stat-run {
          background: linear-gradient(135deg, #38bdf8, #0284c7);
          box-shadow: 0 16px 34px rgba(2, 132, 199, 0.3);
        }

        .ctc-strip {
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(135deg, #fef3c7, #fffbeb);
          border: 1px solid #fde68a;
          border-radius: 16px;
          padding: 16px 22px;
          margin-bottom: 20px;
          box-shadow: 0 8px 20px rgba(245, 158, 11, 0.14);
        }

        .ctc-strip-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #fff;
          flex-shrink: 0;
        }

        .ctc-strip-copy {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ctc-strip-label {
          font-size: 12px;
          font-weight: 700;
          color: #92400e;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .ctc-strip-value {
          font-size: 22px;
          font-weight: 900;
          color: #78350f;
          font-variant-numeric: tabular-nums;
        }

        .pr-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pr-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: #eef2ff;
          color: #6366f1;
          flex-shrink: 0;
        }

        .pr-title {
          font-size: 13.5px;
          font-weight: 800;
          color: #0f172a;
          white-space: nowrap;
        }

        .pr-meta {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          margin-top: 2px;
          white-space: nowrap;
        }

        .pr-status {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          color: #475569;
          background: #f1f5f9;
          padding: 3px 10px;
          border-radius: 999px;
        }

        .pay-status-badge {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .pay-status-badge.is-paid {
          background: #dcfce7;
          color: #166534;
        }

        .pay-status-badge.is-finalized {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .pay-status-badge.is-draft {
          background: #fef3c7;
          color: #92400e;
        }

        .net-amt {
          font-weight: 800;
          color: #0f172a;
        }

        .pay-actions {
          display: inline-flex;
          gap: 8px;
        }

        .pay-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 34px;
          padding: 0 13px;
          border: none;
          border-radius: 9px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.12s, box-shadow 0.12s, background 0.12s;
        }

        .pay-btn:active {
          transform: scale(0.96);
        }

        .pay-btn-view {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.24);
        }

        .pay-btn-slip {
          background: #eef2ff;
          color: #4f46e5;
        }

        .payroll-empty {
          padding: 40px 0;
        }

        .payroll-loading {
          margin-bottom: 20px;
        }

        .att-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }

        .att-box {
          background: #f8fafc;
          border: 1px solid #eef2f7;
          border-radius: 14px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .att-box span {
          font-size: 11.5px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .att-box strong {
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          font-variant-numeric: tabular-nums;
        }

        .snap-sections {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .pay-actions {
            flex-direction: column;
            align-items: flex-end;
          }

          .ctc-strip {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeePayrollTab;
