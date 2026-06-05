"use client";

import React, {
  useEffect,
  useState,
} from "react";

import axiosInstance
from "@/utils/axiosInstance";

// ======================================================

type Props = {
  employeeId: number;
};

// ======================================================

const EmployeePayrollTab = ({
  employeeId,
}: Props) => {

  // ======================================================
  // STATES
  // ======================================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    payrolls,
    setPayrolls,
  ] = useState<any[]>([]);

  const [
    summary,
    setSummary,
  ] = useState<any>(null);

  const [
    selectedPayroll,
    setSelectedPayroll,
  ] = useState<any>(null);

  const [
    payrollLoading,
    setPayrollLoading,
  ] = useState(false);

  // ======================================================
  // FETCH EMPLOYEE PAYROLLS
  // ======================================================

  const fetchEmployeePayrolls =
    async () => {

      try {

        setLoading(true);

        const res =
          await axiosInstance.get(

            `/payroll/employee/${employeeId}`
          );

        setPayrolls(

          res?.data?.data?.payrolls || []
        );

        setSummary(

          res?.data?.data?.summary || null
        );

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

  const handleViewPayroll =
    async (
      payrollId:number
    ) => {

      try {

        setPayrollLoading(true);

        const res =
          await axiosInstance.get(

            `/payroll/${payrollId}`
          );

        setSelectedPayroll(

          res?.data?.data || null
        );

      } catch (err) {

        console.log(err);

      } finally {

        setPayrollLoading(false);
      }
    };

  // ======================================================
  // STATUS BADGE
  // ======================================================

  const getStatusClass =
    (
      status:string
    ) => {

      if (
        status === "PAID"
      ) {
        return "paid";
      }

      if (
        status === "FINALIZED"
      ) {
        return "finalized";
      }

      return "draft";
    };

  // ======================================================
  // UI
  // ======================================================

  return (

    <div className="payroll-page">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="payroll-top-card">

        <div>

          <h3 className="payroll-title">
            💸 Employee Payroll
          </h3>

          <p className="payroll-subtitle">
            View payroll history, salary breakdown & payment status
          </p>

        </div>

        <div className="payroll-badge">
          Payroll Analytics
        </div>

      </div>

      {/* ====================================== */}
      {/* SUMMARY */}
      {/* ====================================== */}

      <div className="row g-4 mb-4">

        <div className="col-md-4">

          <div className="summary-card earning">

            <h6>Total Payrolls</h6>

            <h3>
              {
                summary?.totalPayrolls || 0
              }
            </h3>

          </div>

        </div>

        <div className="col-md-4">

          <div className="summary-card deduction">

            <h6>Total Deduction</h6>

            <h3>

              ₹
              {
                summary?.totalDeduction
                  ?.toLocaleString(
                    "en-IN"
                  ) || 0
              }

            </h3>

          </div>

        </div>

        <div className="col-md-4">

          <div className="summary-card net">

            <h6>Total Net Salary</h6>

            <h3>

              ₹
              {
                summary?.totalNetSalary
                  ?.toLocaleString(
                    "en-IN"
                  ) || 0
              }

            </h3>

          </div>

        </div>

      </div>

      {/* ====================================== */}
      {/* PAYROLL LIST */}
      {/* ====================================== */}

      <div className="payroll-list-card">

        <div className="section-title">
          Payroll History
        </div>

        {loading ? (

          <div className="text-center py-5">

            <div className="spinner-border text-primary" />

          </div>

        ) : payrolls.length === 0 ? (

          <div className="empty-state">
            No payroll history found
          </div>

        ) : (

          <div className="table-responsive">

            <table className="table payroll-table">

              <thead>

                <tr>

                  <th>Payroll</th>

                  <th>Period</th>

                  <th>Status</th>

                  <th>Net Salary</th>

                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {payrolls.map(
                  (item:any)=>{

                    return (

                      <tr
                        key={item.id}
                      >

                        <td>

                          <div className="fw-bold">

                            {
                              item.payrollRun?.title ||

                              "Payroll Run"
                            }

                          </div>

                        </td>

                        <td>

                          <div>

                            {
                              new Date(
                                item.payrollRun?.periodStart
                              ).toLocaleDateString()
                            }

                            {" - "}

                            {
                              new Date(
                                item.payrollRun?.periodEnd
                              ).toLocaleDateString()
                            }

                          </div>

                        </td>

                        <td>

                          <span
                            className={`status-badge ${getStatusClass(
                              item.status
                            )}`}
                          >

                            {item.status}

                          </span>

                        </td>

                        <td>

                          ₹
                          {
                            item.net_salary?.toLocaleString(
                              "en-IN"
                            )
                          }

                        </td>

                        <td>

                          <button
                            className="view-btn"

                            onClick={()=>

                              handleViewPayroll(
                                item.id
                              )
                            }
                          >

                            View Payroll

                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ====================================== */}
      {/* PAYROLL DETAILS */}
      {/* ====================================== */}

      {payrollLoading && (

        <div className="loading-box">

          <div className="spinner-border text-success" />

        </div>
      )}

      {selectedPayroll && (

        <div className="payroll-details-card">

          {/* HEADER */}

          <div className="detail-header">

            <div>

              <h4 className="mb-1 fw-bold">
                Salary Breakdown
              </h4>

              <p className="text-muted mb-0">

                {
                  selectedPayroll
                    ?.employee?.name
                }

              </p>

            </div>

            <span
              className={`status-badge ${getStatusClass(
                selectedPayroll.status
              )}`}
            >

              {
                selectedPayroll.status
              }

            </span>

          </div>

          {/* SUMMARY */}

          <div className="row g-4 mb-4">

            <div className="col-md-4">

              <div className="summary-card earning">

                <h6>Gross Salary</h6>

                <h3>

                  ₹
                  {
                    selectedPayroll
                      ?.gross_salary
                      ?.toLocaleString(
                        "en-IN"
                      )
                  }

                </h3>

              </div>

            </div>

            <div className="col-md-4">

              <div className="summary-card deduction">

                <h6>Total Deduction</h6>

                <h3>

                  ₹
                  {
                    selectedPayroll
                      ?.total_deduction
                      ?.toLocaleString(
                        "en-IN"
                      )
                  }

                </h3>

              </div>

            </div>

            <div className="col-md-4">

              <div className="summary-card net">

                <h6>Net Salary</h6>

                <h3>

                  ₹
                  {
                    selectedPayroll
                      ?.net_salary
                      ?.toLocaleString(
                        "en-IN"
                      )
                  }

                </h3>

              </div>

            </div>

          </div>

          {/* ATTENDANCE */}

          <div className="attendance-grid">

            <div className="attendance-box">

              <span>Total Days</span>

              <h5>
                {
                  selectedPayroll
                    ?.total_days
                }
              </h5>

            </div>

            <div className="attendance-box">

              <span>Present</span>

              <h5>
                {
                  selectedPayroll
                    ?.present_days
                }
              </h5>

            </div>

            <div className="attendance-box">

              <span>Paid Leave</span>

              <h5>
                {
                  selectedPayroll
                    ?.paid_leave_days
                }
              </h5>

            </div>

            <div className="attendance-box">

              <span>LOP</span>

              <h5>
                {
                  selectedPayroll
                    ?.lop_days
                }
              </h5>

            </div>

          </div>

          {/* COMPONENTS */}

          <div className="component-table-wrapper">

            <div className="section-title">
              Salary Components
            </div>

            <div className="table-responsive">

              <table className="table component-table">

                <thead>

                  <tr>

                    <th>Component</th>

                    <th>Code</th>

                    <th>Type</th>

                    <th>Standard</th>

                    <th>Payable</th>

                  </tr>

                </thead>

                <tbody>

                  {selectedPayroll
                    ?.payrollSnapComponents
                    ?.map(
                      (
                        item:any
                      )=>{

                        return (

                          <tr
                            key={item.id}
                          >

                            <td>
                              {
                                item.componentName
                              }
                            </td>

                            <td>
                              {
                                item.componentCode
                              }
                            </td>

                            <td>

                              <span
                                className={`mini-badge ${
                                  item.type ===
                                  "EARNING"

                                    ? "earning"

                                    : "deduction"
                                }`}
                              >

                                {
                                  item.type
                                }

                              </span>

                            </td>

                            <td>

                              ₹
                              {
                                item.standardAmount
                              }

                            </td>

                            <td>

                              ₹
                              {
                                item.amount
                              }

                            </td>

                          </tr>
                        );
                      }
                    )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}

      {/* ====================================== */}
      {/* STYLE */}
      {/* ====================================== */}

      <style jsx>{`

        .payroll-page {

          width: 100%;
        }

        .payroll-top-card {

          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-bottom: 24px;

          padding: 24px 28px;

          border-radius: 20px;

          background: linear-gradient(
            135deg,
            #ffffff,
            #eff6ff
          );

          border: 1px solid #dbeafe;

          box-shadow:
            0 6px 24px
            rgba(0,0,0,0.06);
        }

        .payroll-title {

          font-size: 28px;

          font-weight: 800;

          margin-bottom: 6px;

          color: #111827;
        }

        .payroll-subtitle {

          margin: 0;

          color: #6b7280;

          font-size: 14px;
        }

        .payroll-badge {

          padding: 10px 18px;

          border-radius: 999px;

          color: white;

          font-size: 13px;

          font-weight: 700;

          background: linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
          );
        }

        .payroll-list-card,
        .payroll-details-card {

          background: white;

          border-radius: 20px;

          padding: 28px;

          margin-bottom: 24px;

          border: 1px solid #edf2f7;

          box-shadow:
            0 6px 30px
            rgba(0,0,0,0.08);
        }

        .section-title {

          font-size: 18px;

          font-weight: 700;

          margin-bottom: 18px;

          color: #111827;
        }

        .payroll-table th,
        .component-table th {

          background: #f9fafb;

          color: #111827;

          font-weight: 700;

          padding: 16px;

          border-bottom:
            1px solid #e5e7eb;
        }

        .payroll-table td,
        .component-table td {

          padding: 16px;

          vertical-align: middle;
        }

        .status-badge {

          padding: 8px 14px;

          border-radius: 999px;

          font-size: 12px;

          font-weight: 700;
        }

        .paid {

          background: #dcfce7;

          color: #166534;
        }

        .finalized {

          background: #dbeafe;

          color: #1d4ed8;
        }

        .draft {

          background: #fef3c7;

          color: #92400e;
        }

        .view-btn {

          border: none;

          height: 42px;

          padding: 0 18px;

          border-radius: 12px;

          font-size: 13px;

          font-weight: 700;

          color: white;

          background: linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
          );
        }

        .detail-header {

          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-bottom: 24px;
        }

        .summary-card {

          padding: 24px;

          border-radius: 18px;

          color: white;

          box-shadow:
            0 8px 24px
            rgba(0,0,0,0.08);
        }

        .summary-card h6 {

          margin-bottom: 12px;

          opacity: 0.9;
        }

        .summary-card h3 {

          margin: 0;

          font-size: 28px;

          font-weight: 800;
        }

        .earning {

          background: linear-gradient(
            135deg,
            #16a34a,
            #15803d
          );
        }

        .deduction {

          background: linear-gradient(
            135deg,
            #dc2626,
            #b91c1c
          );
        }

        .net {

          background: linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
          );
        }

        .attendance-grid {

          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(180px,1fr)
            );

          gap: 18px;

          margin-bottom: 28px;
        }

        .attendance-box {

          background: #f9fafb;

          border-radius: 16px;

          padding: 22px;

          border: 1px solid #e5e7eb;
        }

        .attendance-box span {

          display: block;

          margin-bottom: 8px;

          color: #6b7280;

          font-size: 13px;
        }

        .attendance-box h5 {

          margin: 0;

          font-size: 26px;

          font-weight: 800;

          color: #111827;
        }

        .mini-badge {

          padding: 6px 12px;

          border-radius: 999px;

          font-size: 11px;

          font-weight: 700;
        }

        .loading-box {

          display: flex;

          justify-content: center;

          padding: 30px;
        }

        .empty-state {

          text-align: center;

          padding: 60px 20px;

          color: #6b7280;
        }

        @media(max-width:768px){

          .payroll-top-card {

            flex-direction: column;

            align-items: flex-start;

            gap: 16px;
          }

          .detail-header {

            flex-direction: column;

            align-items: flex-start;

            gap: 14px;
          }

          .payroll-list-card,
          .payroll-details-card {

            padding: 18px;
          }

          .payroll-title {

            font-size: 22px;
          }
        }

      `}</style>

    </div>
  );
};
export default EmployeePayrollTab;