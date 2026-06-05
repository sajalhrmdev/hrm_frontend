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
  };

  payrollRun: {
    id: number;

    month: number;

    year: number;

    status: string;

    company: {
      id: number;

      slug: string;

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

const PayrollSlipPage = () => {
  const params = useParams();

  const id = params?.id;

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<PayrollData | null>(null);

  // ============================================
  // FETCH PAYROLL
  // ============================================

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

  // ============================================
  // USE EFFECT
  // ============================================

  useEffect(() => {
    if (id) {
      fetchPayroll();
    }
  }, [id]);

  // ============================================
  // AUTO PRINT
  // ============================================

  useEffect(() => {
    if (data) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [data]);

  // ============================================
  // FORMAT MONTH
  // ============================================

  const getMonthName = (month: number) => {
    return new Date(2025, month - 1).toLocaleString("default", {
      month: "long",
    });
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />

        <p className="mt-3">Loading payslip...</p>
      </div>
    );
  }

  // ============================================
  // NO DATA
  // ============================================

  if (!data) {
    return (
      <div className="container py-5 text-center">No payroll data found</div>
    );
  }

  // ============================================
  // COMPONENTS
  // ============================================

  const earnings = data.payrollSnapComponents.filter(
    (item) => item.type === "EARNING",
  );

  const deductions = data.payrollSnapComponents.filter(
    (item) => item.type === "DEDUCTION",
  );

  const maxRows = Math.max(earnings.length, deductions.length);

  return (
    <div
      className="page-wrapper bg-white mx-auto"
      id="print-area"
      style={{
        width: "100%",
        maxWidth: "900px",
        fontSize: "13px",
        color: "#000",
        padding: "60px 20px 20px 20px",
      }}
    >
      {/* HEADER */}

      <div className="text-center mb-3">
        <h2
          className="fw-bold text-uppercase mb-1"
          style={{
            fontSize: "28px",
            wordBreak: "break-word",
          }}
        >
          {data.payrollRun.company.slug}
        </h2>

        <div className="small text-muted mb-1">
          {data.payrollRun.company.address}
        </div>

        <div className="small text-muted mb-2">
          {data.payrollRun.company.email}

          {" | "}

          {data.payrollRun.company.phone}
        </div>

        <div className="fw-semibold">
          Salary Slip for the month of {getMonthName(data.payrollRun.month)}-
          {String(data.payrollRun.year).slice(-2)}
        </div>
      </div>

      {/* EMPLOYEE INFO */}

      <table className="table table-bordered mb-3">
        <tbody>
          <tr>
            <td>
              <strong>Employee Code:</strong>
            </td>

            <td>{data.employee.employeeCode}</td>

            <td>
              <strong>Employee Name:</strong>
            </td>

            <td>{data.employee.name}</td>
          </tr>

          <tr>
            <td>
              <strong>Department:</strong>
            </td>

            <td>People</td>

            <td>
              <strong>Email:</strong>
            </td>

            <td>{data.employee.email}</td>
          </tr>

          <tr>
            <td>
              <strong>Total Days:</strong>
            </td>

            <td>{data.total_days}</td>

            <td>
              <strong>Payable Days:</strong>
            </td>

            <td>{data.payable_days}</td>
          </tr>
        </tbody>
      </table>

      {/* MAIN TABLE */}

      <table className="table table-bordered align-middle mb-3">
        <thead>
          <tr>
            <th colSpan={3} className="text-center">
              Earnings
            </th>

            <th colSpan={3} className="text-center">
              Deductions
            </th>

            <th
              rowSpan={2}
              className="text-center align-middle"
              style={{
                width: "180px",
              }}
            >
              Net Payable (Rs)
            </th>
          </tr>

          <tr>
            <th>Particulars</th>

            <th>Std Amt</th>

            <th>Paid Amt</th>

            <th>Particulars</th>

            <th>Std Amt</th>

            <th>Paid Amt</th>
          </tr>
        </thead>

        <tbody>
          {Array.from({
            length: maxRows,
          }).map((_, index) => {
            const earning = earnings[index];

            const deduction = deductions[index];

            return (
              <tr key={index}>
                {/* EARNING */}

                <td>{earning?.componentCode || ""}</td>

                <td>
                  {earning ? `₹${earning.standardAmount.toLocaleString()}` : ""}
                </td>

                <td>{earning ? `₹${earning.amount.toLocaleString()}` : ""}</td>

                {/* DEDUCTION */}

                <td>{deduction?.componentCode || ""}</td>

                <td>
                  {deduction
                    ? `₹${deduction.standardAmount.toLocaleString()}`
                    : ""}
                </td>

                <td>
                  {deduction ? `₹${deduction.amount.toLocaleString()}` : ""}
                </td>

                {/* NET */}

                {index === 0 && (
                  <td
                    rowSpan={maxRows}
                    className="text-center align-middle fw-bold fs-5"
                  >
                    ₹{data.net_salary.toLocaleString()}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="fw-bold">
            <td>Earnings</td>

            <td colSpan={2}>₹{data.gross_salary.toLocaleString()}</td>

            <td>Deductions</td>

            <td colSpan={2}>₹{data.total_deduction.toLocaleString()}</td>

            <td>₹{data.net_salary.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      {/* ATTENDANCE */}

      {/* ATTENDANCE */}

      {/* ATTENDANCE SUMMARY */}

      <div className="mb-4">
        <h6
          className="fw-bold mb-2"
          style={{
            borderBottom: "2px solid #000",
            paddingBottom: "5px",
          }}
        >
          Attendance Summary
        </h6>

        <table
          className="table table-bordered text-center mb-0"
          style={{
            borderColor: "#000",
            fontSize: "13px",
          }}
        >
          <thead
            style={{
              background: "#000",
              color: "#fff",
            }}
          >
            <tr>
              <th>Present</th>
              <th>Weekly Off</th>
              <th>Holiday</th>
              <th>Half Day</th>
              <th>Paid Leave</th>
              <th>Unpaid Leave</th>
              <th>WFH</th>
              <th>On Duty</th>
              <th>Payable</th>
              <th>LOP</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>{data.attendanceSummary?.PRESENT || 0}</td>

              <td>{data.attendanceSummary?.WEEKLY_OFF || 0}</td>

              <td>{data.attendanceSummary?.HOLIDAY || 0}</td>

              <td>{data.attendanceSummary?.HALF_DAY || 0}</td>

              <td>{data.attendanceSummary?.PAID_LEAVE || 0}</td>

              <td>{data.attendanceSummary?.UNPAID_LEAVE || 0}</td>

              <td>{data.attendanceSummary?.WORK_FROM_HOME || 0}</td>

              <td>{data.attendanceSummary?.ON_DUTY || 0}</td>

              <td>
                <strong>{data.payable_days}</strong>
              </td>

              <td>
                <strong>{data.lop_days}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr />

      {/* <div className="row">
        <div className="col-md-4">
          <strong>Payable Days</strong>
          <br />
          {data.payable_days}
        </div>

        <div className="col-md-4">
          <strong>LOP Days</strong>
          <br />
          {data.lop_days}
        </div>

        <div className="col-md-4">
          <strong>Overtime Amount</strong>
          <br />₹{data.overtime_amount.toLocaleString()}
        </div>
      </div> */}

      {/* FOOTER */}

      <div className="mt-5 text-center small text-muted">
        This is a computer generated payslip.
      </div>

      {/* PRINT CSS */}

      <style jsx global>{`
        body {
          background: #f4f4f4;
        }

        table {
          width: 100% !important;

          table-layout: fixed !important;
        }

        td,
        th {
          word-break: break-word;
        }

        @media print {
          body {
            background: #fff !important;
          }

          #print-area {
            width: 100% !important;

            max-width: 900px !important;

            margin: 0 auto !important;

            padding: 60px 20px 20px 20px !important;

            box-sizing: border-box !important;

            overflow: hidden !important;
          }

          table {
            width: 100% !important;

            table-layout: fixed !important;
          }

          .table {
            border-collapse: collapse !important;
          }
          .table > :not(caption) > * > * {
            border: 1px solid #000 !important;

            padding: 6px !important;

            font-size: 12px !important;

            color: #000 !important;

            font-weight: 600 !important;
            background: #fff !important;
          }

          .page-wrapper {
            margin: 0 auto !important;

            padding: 0 !important;
          }

          .btn,
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PayrollSlipPage;


