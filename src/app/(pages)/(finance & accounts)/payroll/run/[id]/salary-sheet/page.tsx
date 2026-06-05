"use client";

import React, {
  useEffect,
  useState,
} from "react";

import { useParams } from "next/navigation";

import axiosInstance from "@/utils/axiosInstance";

// ======================================================

const SalarySheetPage = () => {
  const params = useParams();

  const id = params?.id;

  const [payrolls, setPayrolls] = useState<any[]>([]);

  const [payrollRun, setPayrollRun] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`/payroll/run/${id}`);

      setPayrolls(res?.data?.data?.payrolls || []);

      setPayrollRun(res?.data?.data?.payrollRun || null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  // ======================================================
  // PRINT
  // ======================================================

  const handlePrint = () => {
    window.print();
  };

  // ======================================================
  // DYNAMIC COMPONENTS
  // ======================================================

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

  // ======================================================
  // TOTAL
  // ======================================================

  const totalNetSalary = payrolls.reduce(
    (acc, item) => acc + item.net_salary,
    0,
  );

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container-fluid py-3">
          {/* ====================================== */}
          {/* ACTION BUTTONS */}
          {/* ====================================== */}

          <div className="d-flex justify-content-between align-items-center mb-3 no-print">
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handlePrint}>
                🖨 Print Salary Sheet
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => window.history.back()}
              >
                ✖ Close
              </button>
            </div>

            <div className="fw-bold fs-5">
              Month:{" "}
              {payrollRun?.periodStart
                ? new Date(payrollRun.periodStart).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </div>
          </div>

          {/* ====================================== */}
          {/* COMPANY HEADER */}
          {/* ====================================== */}

          <div className="salary-header">
            <h2>{payrollRun?.company?.name}</h2>

            <h5>
              Salary Sheet -{" "}
              {payrollRun?.periodStart
                ? new Date(payrollRun.periodStart).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </h5>
          </div>

          {/* ====================================== */}
          {/* TABLE */}
          {/* ====================================== */}

          <div className="salary-sheet-wrapper">
            <table className="salary-sheet-table">
              <thead>
                {/* ====================================== */}
                {/* MAIN HEADER */}
                {/* ====================================== */}

                <tr>
                  <th rowSpan={2}>SL</th>

                  <th rowSpan={2}>Employee Code</th>

                  <th rowSpan={2}>Employee Name</th>

                  <th rowSpan={2}>Present Days</th>

                  <th rowSpan={2}>Total Days</th>

                  {/* ====================================== */}
                  {/* EARNINGS */}
                  {/* ====================================== */}

                  <th
                    colSpan={earningComponents.length}
                    className="earning-header"
                  >
                    Earnings
                  </th>

                  {/* ====================================== */}
                  {/* DEDUCTIONS */}
                  {/* ====================================== */}

                  <th
                    colSpan={deductionComponents.length}
                    className="deduction-header"
                  >
                    Deductions
                  </th>

                  <th rowSpan={2}>Net Payable</th>

                  <th rowSpan={2}>CTC</th>
                </tr>

                {/* ====================================== */}
                {/* COMPONENT HEADER */}
                {/* ====================================== */}

                <tr>
                  {earningComponents.map((item: any) => (
                    <th key={item}>{item}</th>
                  ))}

                  {deductionComponents.map((item: any) => (
                    <th key={item}>{item}</th>
                  ))}
                </tr>
              </thead>

              {/* ====================================== */}
              {/* BODY */}
              {/* ====================================== */}

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={20} className="text-center py-5">
                      Loading...
                    </td>
                  </tr>
                ) : payrolls.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="text-center py-5">
                      No payroll found
                    </td>
                  </tr>
                ) : (
                  payrolls.map((payroll, index) => {
                    return (
                      <tr key={payroll.id}>
                        <td>{index + 1}</td>

                        <td>{payroll.employee?.employeeCode}</td>

                        <td className="employee-name">
                          {payroll.employee?.name}
                        </td>

                        <td>{payroll.present_days}</td>

                        <td>{payroll.total_days}</td>

                        {/* ====================================== */}
                        {/* EARNINGS */}
                        {/* ====================================== */}

                        {earningComponents.map((comp: any) => {
                          const found =
                            payroll.payrollSnapComponents?.find(
                              (c: any) => c.componentName === comp,
                            );

                          return (
                            <td key={comp}>
                              ₹
                              {found?.amount?.toLocaleString("en-IN") || 0}
                            </td>
                          );
                        })}

                        {/* ====================================== */}
                        {/* DEDUCTIONS */}
                        {/* ====================================== */}

                        {deductionComponents.map((comp: any) => {
                          const found =
                            payroll.payrollSnapComponents?.find(
                              (c: any) => c.componentName === comp,
                            );

                          return (
                            <td key={comp}>
                              ₹
                              {found?.amount?.toLocaleString("en-IN") || 0}
                            </td>
                          );
                        })}

                        {/* ====================================== */}
                        {/* NET */}
                        {/* ====================================== */}

                        <td className="net-salary">
                          ₹
                          {payroll.net_salary?.toLocaleString("en-IN")}
                        </td>

                        {/* ====================================== */}
                        {/* CTC */}
                        {/* ====================================== */}

                        <td className="ctc-cell">
                          ₹
                          {payroll.gross_salary?.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* ====================================== */}
              {/* FOOTER */}
              {/* ====================================== */}

              <tfoot>
                <tr>
                  <th
                    colSpan={
                      5 +
                      earningComponents.length +
                      deductionComponents.length
                    }
                    className="text-end"
                  >
                    Total Net Salary
                  </th>

                  <th className="footer-total">
                    ₹{totalNetSalary.toLocaleString("en-IN")}
                  </th>

                  <th></th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ====================================== */}
      {/* STYLE */}
      {/* ====================================== */}

      <style jsx>{`
        .salary-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .salary-header h2 {
          font-size: 34px;
          font-weight: 800;
          margin-bottom: 6px;
          color: #111827;
          letter-spacing: 1px;
        }

        .salary-header h5 {
          font-size: 18px;
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

        /* ====================================== */
        /* PRINT */
        /* ====================================== */

        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .page-wrapper,
          .content {
            margin: 0 !important;
            padding: 0 !important;
          }

          .salary-sheet-wrapper {
            overflow: visible !important;
            box-shadow: none !important;
            padding: 0 !important;
          }

          .salary-sheet-table {
            width: max-content !important;
            min-width: 100% !important;
            font-size: 9px !important;
          }

          .salary-sheet-table th,
          .salary-sheet-table td {
            padding: 4px 6px !important;
          }

          .salary-header h2 {
            font-size: 22px !important;
          }

          .salary-header h5 {
            font-size: 14px !important;
          }

          @page {
            size: landscape;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
};

export default SalarySheetPage;