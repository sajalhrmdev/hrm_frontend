"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";

type PayrollData = {
  id: number;
  gross_salary: number;
  total_deduction: number;
  net_salary: number;
  total_days: number;
  present_days: number;
  paid_leave_days: number;
  lop_days: number;
  payable_days: number;
  overtime_amount: number;
  createdAt: string;
  employee: {
    id: number;
    name: string;
    email: string;
    employeeCode: string;
    joiningDate: string | null;
    designation: { title: string } | null;
    department: { title: string } | null;
  };
  leaveSummary: {
    leaveTypeId: number;
    leaveTypeName: string;
    leaveTypeCode: string;
    totalDays: number;
    paidDays: number;
    unpaidDays: number;
  }[];
  payrollRun: {
    id: number;
    periodStart: string;
    periodEnd: string;
    status: string;
    company: {
      id: number;
      slug: string;
      logo: string | null;
      email: string;
      address: string;
      phone: string;
    };
  };
  payrollSnapComponents: {
    id: number;
    componentName: string;
    componentCode: string;
    type: "EARNING" | "DEDUCTION";
    standardAmount: number;
    amount: number;
  }[];
  attendanceSummary: {
    PRESENT: number;
    ABSENT: number;
    HALF_DAY: number;
    WEEKLY_OFF: number;
    HOLIDAY: number;
    PAID_LEAVE: number;
    UNPAID_LEAVE: number;
    WORK_FROM_HOME: number;
    ON_DUTY: number;
  };
};

const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function numberToWords(num: number): string {
  if (num === 0) return "Zero";

  const convertHundreds = (n: number): string => {
    let result = "";
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " Hundred";
      n %= 100;
      if (n > 0) result += " and ";
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      n %= 10;
      if (n > 0) result += " " + ones[n];
    } else if (n > 0) {
      result += ones[n];
    }
    return result;
  };

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  let words = "";

  if (intPart >= 10000000) {
    words += convertHundreds(Math.floor(intPart / 10000000)) + " Crore ";
  }
  if (intPart >= 100000) {
    words += convertHundreds(Math.floor((intPart % 10000000) / 100000)) + " Lakh ";
  }
  if (intPart >= 1000) {
    words += convertHundreds(Math.floor((intPart % 100000) / 1000)) + " Thousand ";
  }
  if (intPart >= 100) {
    words += convertHundreds(intPart % 1000);
  } else if (intPart > 0) {
    words += convertHundreds(intPart);
  }

  words = words.trim() + " Rupees";

  if (decPart > 0) {
    words += " and " + convertHundreds(decPart) + " Paise";
  }

  words += " Only";
  return words.toUpperCase();
}

const PayrollSlipPage = () => {
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PayrollData | null>(null);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/payroll/${id}`);
      setData(res?.data?.data);
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.message || "Failed to fetch payroll");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPayroll();
  }, [id]);

  useEffect(() => {
    if (data) {
      setTimeout(() => {
        window.print();
      }, 300);
    }
  }, [data]);

  const getMonthName = (month: number) => {
    return new Date(2025, month - 1).toLocaleString("default", {
      month: "long",
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Loading payslip...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-5 text-center">No payroll data found</div>
    );
  }

  const earnings = data.payrollSnapComponents.filter((i) => i.type === "EARNING");
  const deductions = data.payrollSnapComponents.filter((i) => i.type === "DEDUCTION");
  const att = data.attendanceSummary;
  const dayItems = [
    { label: "Present", val: att.PRESENT },
    { label: "Absent", val: att.ABSENT },
    { label: "Half Day", val: att.HALF_DAY },
    { label: "W/O", val: att.WEEKLY_OFF },
    { label: "Holiday", val: att.HOLIDAY },
    { label: "Paid Lv", val: att.PAID_LEAVE },
    { label: "Unpaid Lv", val: att.UNPAID_LEAVE },
    { label: "OT/OD", val: att.ON_DUTY },
    { label: "WFH", val: att.WORK_FROM_HOME },
    { label: "Total", val: data.total_days },
  ];
  const maxRows = Math.max(earnings.length, deductions.length);
  const monthStart = new Date(data.payrollRun.periodStart);
  const monthName = getMonthName(monthStart.getMonth() + 1);
  const yearShort = String(monthStart.getFullYear()).slice(-2);

  return (
    <div className="slip-wrapper" id="print-area">
      {/* HEADER */}
      <div className="slip-header">
        <div className="slip-header-left">
          {data.payrollRun.company.logo && (
            <img
              src={data.payrollRun.company.logo}
              alt="Logo"
              className="slip-logo"
            />
          )}
        </div>
        <div className="slip-header-center">
          <div className="slip-company-name">{data.payrollRun.company.slug}</div>
          <div className="slip-divider" />
          <div className="slip-company-address">{data.payrollRun.company.address}</div>
          <div className="slip-company-contact">
            <span className="slip-contact-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              {data.payrollRun.company.email}
            </span>
            <span className="slip-contact-sep">|</span>
            <span className="slip-contact-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {data.payrollRun.company.phone}
            </span>
          </div>
        </div>
        <div className="slip-header-right" />
      </div>

      {/* SALARY MONTH TITLE */}
      <div className="slip-title">Salary Slip for the month of {monthName}-{yearShort}</div>

      {/* EMPLOYEE INFO */}
      <table className="slip-info-table">
        <tbody>
          <tr>
            <td><span className="slip-label">Employee Code</span> : {data.employee.employeeCode || "-"}</td>
            <td><span className="slip-label">Employee Name</span> : {data.employee.name}</td>
          </tr>
          <tr>
            <td><span className="slip-label">Designation</span> : {data.employee.designation?.title || "-"}</td>
            <td><span className="slip-label">DOJ</span> : {formatDate(data.employee.joiningDate)}</td>
            <td><span className="slip-label">PF No</span> : -</td>
          </tr>
          <tr>
            <td><span className="slip-label">Department</span> : {data.employee.department?.title || "-"}</td>
            <td><span className="slip-label">ESIC No</span> : -</td>
            <td><span className="slip-label">UAN</span> : -</td>
          </tr>
        </tbody>
      </table>

      {/* MAIN TABLE */}
      <table className="slip-main-table">
        <thead>
          <tr className="slip-main-header">
            <th className="slip-earn-header" colSpan={3}>Earnings</th>
            <th className="slip-ded-header" colSpan={3}>Deductions</th>
            <th className="slip-net-header" rowSpan={2}>Net Payable</th>
          </tr>
          <tr className="slip-sub-header">
            <th>Particulars</th>
            <th>Std Amt</th>
            <th>Paid Amt</th>
            <th>Particulars</th>
            <th>Std Amt</th>
            <th>Paid Amt</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxRows }).map((_, i) => {
            const e = earnings[i];
            const d = deductions[i];
            return (
              <tr key={i} className={i % 2 === 0 ? "slip-row-even" : "slip-row-odd"}>
                <td>{e?.componentName || ""}</td>
                <td className="slip-amt">{e ? fmt(e.standardAmount) : ""}</td>
                <td className="slip-amt">{e ? fmt(e.amount) : ""}</td>
                <td>{d?.componentName || ""}</td>
                <td className="slip-amt">{d ? fmt(d.standardAmount) : ""}</td>
                <td className="slip-amt">{d ? fmt(d.amount) : ""}</td>
                {i === 0 && (
                  <td className="slip-net-cell" rowSpan={maxRows}>
                    <div className="slip-net-amount">{fmt(data.net_salary)}</div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="slip-footer-row">
            <td colSpan={3} className="slip-footer-earn">
              Total Earnings : {fmt(data.gross_salary)}
            </td>
            <td colSpan={3} className="slip-footer-ded">
              Total Deduction : {fmt(data.total_deduction)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>

      {/* DAYS SUMMARY */}
      <div className="slip-section">
        <div className="slip-section-title">Days Summary</div>
        <div className="slip-days-grid">
          {dayItems.filter((item) => item.val > 0).map((item, idx) => (
            <div className={`slip-days-cell ${idx === dayItems.length - 1 ? "slip-days-total" : ""}`} key={idx}>
              <span className="slip-days-label">{item.label}</span>
              <span className="slip-days-val">{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LEAVE SUMMARY */}
      {data.leaveSummary?.length > 0 ? (
        <div className="slip-section">
          <div className="slip-section-title">Leave Balance Details</div>
          <table className="slip-leave-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Total Days</th>
              </tr>
            </thead>
            <tbody>
              {data.leaveSummary.map((leave, idx) => (
                <tr key={idx}>
                  <td>{leave.leaveTypeName}</td>
                  <td>{leave.totalDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="slip-section">
          <div className="slip-section-title">Leave Balance Details</div>
          <div className="slip-no-leave">
            No leave has been taken during this payroll period
          </div>
        </div>
      )}

      {/* NET SALARY IN WORDS */}
      <div className="slip-words-section">
        <span className="slip-words-label">Net Salary (In Words) :</span>{" "}
        {numberToWords(Math.round(data.net_salary))}
      </div>

      {/* PRINT CSS */}
      <style jsx global>{`
        .slip-wrapper {
          max-width: 900px;
          margin: 30px auto;
          background: #fff;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 30px 35px;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          color: #1a1a2e;
          line-height: 1.5;
        }

        .slip-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-bottom: 16px;
          margin-bottom: 16px;
          position: relative;
        }
        .slip-header::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #1a237e 0%, #283593 25%, #3949ab 50%, #283593 75%, #1a237e 100%);
          border-radius: 2px;
        }
        .slip-header-left {
          flex-shrink: 0;
        }
        .slip-logo {
          height: 64px;
          width: auto;
          object-fit: contain;
          border-radius: 6px;
          padding: 4px;
          border: 2px solid #e8eaf6;
          background: #fff;
        }
        .slip-header-center {
          flex: 1;
          text-align: center;
        }
        .slip-header-right {
          flex-shrink: 0;
          width: 64px;
        }
        .slip-company-name {
          font-size: 22px;
          font-weight: 800;
          color: #1a237e;
          letter-spacing: 1px;
          text-transform: uppercase;
          line-height: 1.2;
        }
        .slip-divider {
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #1a237e, transparent);
          margin: 6px auto;
        }
        .slip-company-address {
          font-size: 12px;
          color: #444;
          font-weight: 500;
          text-transform: capitalize;
          margin-bottom: 4px;
        }
        .slip-company-contact {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 11.5px;
          color: #555;
        }
        .slip-contact-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .slip-contact-item svg {
          color: #1a237e;
          flex-shrink: 0;
        }
        .slip-contact-sep {
          color: #aaa;
          font-weight: 300;
        }
        .slip-title {
          font-size: 13px;
          font-weight: 600;
          margin-top: 10px;
          color: #fff;
          background: linear-gradient(135deg, #1a237e, #283593);
          padding: 5px 18px;
          display: inline-block;
          border-radius: 20px;
          letter-spacing: 0.3px;
        }

        /* EMPLOYEE INFO TABLE */
        .slip-info-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          border: 1px solid #bbb;
        }
        .slip-info-table td {
          padding: 6px 10px;
          border: 1px solid #ccc;
          font-size: 11.5px;
        }
        .slip-label {
          font-weight: 700;
          color: #1a237e;
        }

        /* MAIN TABLE */
        .slip-main-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          border: 1px solid #bbb;
        }
        .slip-main-table th,
        .slip-main-table td {
          padding: 5px 7px;
          border: 1px solid #ccc;
          font-size: 11px;
        }
        .slip-main-header th {
          text-align: center;
          font-weight: 700;
          font-size: 12px;
          color: #fff;
        }
        .slip-earn-header {
          background: #2e7d32 !important;
        }
        .slip-ded-header {
          background: #c62828 !important;
        }
        .slip-net-header {
          background: #1a237e !important;
          width: 14%;
          vertical-align: middle;
        }
        .slip-sub-header th {
          text-align: center;
          font-weight: 600;
          font-size: 10.5px;
          color: #fff;
        }
        .slip-sub-header th:nth-child(1),
        .slip-sub-header th:nth-child(2),
        .slip-sub-header th:nth-child(3) {
          background: #43a047;
        }
        .slip-sub-header th:nth-child(4),
        .slip-sub-header th:nth-child(5),
        .slip-sub-header th:nth-child(6) {
          background: #d32f2f;
        }

        .slip-row-even td {
          background: #fff;
        }
        .slip-row-odd td {
          background: #f8f9fa;
        }
        .slip-amt {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .slip-net-cell {
          text-align: center;
          vertical-align: middle;
          background: #e8eaf6 !important;
          border: 2px solid #1a237e !important;
        }
        .slip-net-amount {
          font-size: 20px;
          font-weight: 800;
          color: #1a237e;
        }
        .slip-footer-row td {
          font-weight: 700;
          font-size: 11.5px;
        }
        .slip-footer-earn {
          background: #e8f5e9 !important;
          text-align: right;
          padding-right: 12px !important;
          color: #2e7d32;
        }
        .slip-footer-ded {
          background: #ffebee !important;
          text-align: right;
          padding-right: 12px !important;
          color: #c62828;
        }

        /* DAYS GRID */
        .slip-days-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
          border: 1px solid #bbb;
          border-radius: 4px;
          overflow: hidden;
        }
        .slip-days-cell {
          flex: 1 1 0;
          min-width: 90px;
          text-align: center;
          padding: 7px 4px;
          border-right: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
          background: #fafafa;
        }
        .slip-days-cell:nth-child(10n) {
          border-right: none;
        }
        .slip-days-label {
          display: block;
          font-size: 9.5px;
          color: #666;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .slip-days-val {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #1a237e;
        }
        .slip-days-total {
          background: #e8eaf6;
          border-top: 2px solid #1a237e;
        }
        .slip-days-total .slip-days-label {
          color: #1a237e;
          font-weight: 700;
        }
        .slip-days-total .slip-days-val {
          color: #1a237e;
        }

        /* LEAVE SECTION */
        .slip-section {
          margin-bottom: 14px;
        }
        .slip-section-title {
          font-size: 13px;
          font-weight: 700;
          color: #1a237e;
          border-bottom: 2px solid #1a237e;
          padding-bottom: 5px;
          margin-bottom: 8px;
        }
        .slip-leave-table {
          width: 100%;
          max-width: 400px;
          border-collapse: collapse;
          border: 1px solid #bbb;
        }
        .slip-leave-table th {
          background: #1a237e;
          color: #fff;
          padding: 5px 10px;
          font-size: 11px;
          text-align: left;
          border: 1px solid #ccc;
        }
        .slip-leave-table td {
          padding: 5px 10px;
          border: 1px solid #ccc;
          font-size: 11px;
        }
        .slip-leave-table tbody tr:nth-child(even) td {
          background: #f8f9fa;
        }
        .slip-no-leave {
          border: 1px solid #ccc;
          padding: 10px;
          text-align: center;
          color: #666;
          font-size: 11px;
        }

        /* NET SALARY IN WORDS */
        .slip-words-section {
          margin-top: 14px;
          padding: 10px 14px;
          background: #e8eaf6;
          border: 1px solid #bbb;
          border-radius: 3px;
          font-size: 12px;
        }
        .slip-words-label {
          font-weight: 700;
          color: #1a237e;
        }

        /* ============ PRINT STYLES ============ */
        @media print {
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .header,
          .sidebar,
          .horizontal-sidebar,
          .two-column-sidebar,
          .stacked-sidebar,
          .theme-settings,
          .btn,
          button {
            display: none !important;
          }
          .main-wrapper {
            display: block !important;
          }
          .slip-wrapper {
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 10px 20px !important;
            max-width: 100% !important;
            box-shadow: none !important;
          }
          @page {
            margin: 12mm;
            size: A4 portrait;
          }
          .slip-main-table,
          .slip-info-table,
          .slip-leave-table {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default PayrollSlipPage;
