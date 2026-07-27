"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonCard } from "@/core/common/Skeleton";

type PayrollDetailsModalProps = {
  payrollId: number | null;

  show: boolean;

  onClose: () => void;
};

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

  status: string;

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
    HALF_DAY_LEAVE: number;
    WEEKLY_OFF: number;
    HOLIDAY: number;
    PAID_LEAVE: number;
    UNPAID_LEAVE: number;
    WORK_FROM_HOME: number;
    ON_DUTY: number;
  };
};

const PayrollDetailsModal = ({
  payrollId,
  show,
  onClose,
}: PayrollDetailsModalProps) => {
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<PayrollData | null>(null);

  // ============================================
  // FETCH PAYROLL
  // ============================================

  const fetchPayroll = async () => {
    if (!payrollId) return;

    try {
      setLoading(true);

      const res = await axiosInstance.get(`/payroll/${payrollId}`);

      setData(res?.data?.data);
    } catch (err: any) {
      console.log(err);

      if (err.response) {
        alert(err.response.data?.message || "Server error");
      } else if (err.request) {
        alert("Server not responding");
      } else {
        alert(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // USE EFFECT
  // ============================================

  useEffect(() => {
    if (show && payrollId) {
      fetchPayroll();
    }
  }, [show, payrollId]);

  // ============================================
  // CLOSE
  // ============================================

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      style={{
        background: "rgba(0,0,0,0.5)",
      }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0 shadow-lg">
          {/* HEADER */}

          <div className="modal-header">
            <div>
              <h5 className="modal-title fw-bold">💰 Payroll Details</h5>

              {data && (
                <small className="text-muted">
                  {data.employee.name}

                  {" • "}

                  {data.employee.employeeCode}
                </small>
              )}
            </div>

            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          {/* BODY */}

          <div className="modal-body">
            {loading ? (
              <div className="text-center py-5">
                <SkeletonCard />
              </div>
            ) : data ? (
              <>
                {/* COMPANY */}

                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h4 className="fw-bold mb-1 text-uppercase">
                          {data.payrollRun.company.slug}
                        </h4>

                        <div className="text-muted small">
                          {data.payrollRun.company.address}
                        </div>

                        <div className="text-muted small">
                          {data.payrollRun.company.email}

                          {" | "}

                          {data.payrollRun.company.phone}
                        </div>
                      </div>

                      <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <span
                          className={`badge fs-6 ${
                            data.status === "PAID"
                              ? "bg-success"
                              : data.status === "FINALIZED"
                                ? "bg-primary"
                                : "bg-warning text-dark"
                          }`}
                        >
                          {data.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUMMARY */}

                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <small className="text-muted">Gross Salary</small>

                        <h5 className="fw-bold mb-0">
                          ₹{data.gross_salary.toLocaleString()}
                        </h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <small className="text-muted">Deduction</small>

                        <h5 className="fw-bold text-danger mb-0">
                          ₹{data.total_deduction.toLocaleString()}
                        </h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <small className="text-muted">Net Salary</small>

                        <h5 className="fw-bold text-success mb-0">
                          ₹{data.net_salary.toLocaleString()}
                        </h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <small className="text-muted">Payable Days</small>

                        <h5 className="fw-bold mb-0">{data.payable_days}</h5>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EMPLOYEE */}

                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">👨‍💼 Employee Information</h6>

                    <div className="row">
                      <div className="col-md-4">
                        <p className="mb-2">
                          <strong>Employee:</strong> {data.employee.name}
                        </p>
                      </div>

                      <div className="col-md-4">
                        <p className="mb-2">
                          <strong>Employee Code:</strong>{" "}
                          {data.employee.employeeCode}
                        </p>
                      </div>

                      <div className="col-md-4">
                        <p className="mb-2">
                          <strong>Email:</strong> {data.employee.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ATTENDANCE */}

                {/* <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">📅 Attendance Summary</h6>

                    <div className="row">
                      <div className="col-md-2">
                        <p className="mb-2">
                          <strong>Total Days:</strong>

                          <br />

                          {data.total_days}
                        </p>
                      </div>

                      <div className="col-md-2">
                        <p className="mb-2 text-success">
                          <strong>Present:</strong>

                          <br />

                          {data.present_days}
                        </p>
                      </div>

                      <div className="col-md-2">
                        <p className="mb-2 text-primary">
                          <strong>Paid Leave:</strong>

                          <br />

                          {data.paid_leave_days}
                        </p>
                      </div>

                      <div className="col-md-2">
                        <p className="mb-2 text-danger">
                          <strong>LOP:</strong>

                          <br />

                          {data.lop_days}
                        </p>
                      </div>

                      <div className="col-md-2">
                        <p className="mb-2">
                          <strong>Payable:</strong>

                          <br />

                          {data.payable_days}
                        </p>
                      </div>

                      <div className="col-md-2">
                        <p className="mb-2">
                          <strong>Overtime:</strong>
                          <br />₹{data.overtime_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div> */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">📅 Attendance Summary</h6>

                    <div className="row g-3">
                      <div className="col-md-2">
                        <div className="border rounded p-3 text-center">
                          <small>Total Days</small>
                          <h5>{data.total_days}</h5>
                        </div>
                      </div>

                      <div className="col-md-2">
                        <div className="border rounded p-3 text-center">
                          <small>Present</small>
                          <h5 className="text-success">
                            {data.attendanceSummary?.PRESENT || 0}
                          </h5>
                        </div>
                      </div>

                      <div className="col-md-2">
                        <div className="border rounded p-3 text-center">
                          <small>Weekly Off</small>
                          <h5 className="text-info">
                            {data.attendanceSummary?.WEEKLY_OFF || 0}
                          </h5>
                        </div>
                      </div>

                      <div className="col-md-2">
                        <div className="border rounded p-3 text-center">
                          <small>Holiday</small>
                          <h5 className="text-primary">
                            {data.attendanceSummary?.HOLIDAY || 0}
                          </h5>
                        </div>
                      </div>

                      <div className="col-md-2">
                        <div className="border rounded p-3 text-center">
                          <small>Half Day</small>
                          <h5 className="text-warning">
                            {data.attendanceSummary?.HALF_DAY || 0}
                          </h5>
                        </div>
                      </div>

                      <div className="col-md-2">
                        <div className="border rounded p-3 text-center">
                          <small>Half Day Leave</small>
                          <h5 className="text-info">
                            {data.attendanceSummary?.HALF_DAY_LEAVE || 0}
                          </h5>
                        </div>
                      </div>

                      <div className="col-md-2">
                        <div className="border rounded p-3 text-center">
                          <small>Absent</small>
                          <h5 className="text-danger">
                            {data.attendanceSummary?.ABSENT || 0}
                          </h5>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="border rounded p-3 text-center">
                          <small>Paid Leave</small>
                          <h5>{data.attendanceSummary?.PAID_LEAVE || 0}</h5>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="border rounded p-3 text-center">
                          <small>Unpaid Leave</small>
                          <h5>{data.attendanceSummary?.UNPAID_LEAVE || 0}</h5>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="border rounded p-3 text-center">
                          <small>WFH</small>
                          <h5>{data.attendanceSummary?.WORK_FROM_HOME || 0}</h5>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="border rounded p-3 text-center">
                          <small>On Duty</small>
                          <h5>{data.attendanceSummary?.ON_DUTY || 0}</h5>
                        </div>
                      </div>
                    </div>

                    <hr />

                    <div className="row">
                      <div className="col-md-4">
                        <strong>Payable Days</strong>
                        <div>{data.payable_days}</div>
                      </div>

                      <div className="col-md-4">
                        <strong>LOP Days</strong>
                        <div>{data.lop_days}</div>
                      </div>

                      <div className="col-md-4">
                        <strong>Overtime Amount</strong>
                        <div>₹{data.overtime_amount.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COMPONENT TABLE */}

                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">🧾 Salary Components</h6>

                    <div className="table-responsive">
                      <table className="table table-bordered align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>

                            <th>Component</th>

                            <th>Code</th>

                            <th>Type</th>

                            <th>Standard Amount</th>

                            <th>Payable Amount</th>
                          </tr>
                        </thead>

                        <tbody>
                          {data.payrollSnapComponents.map((item, index) => (
                            <tr key={item.id}>
                              <td>{index + 1}</td>

                              <td>{item.componentName}</td>

                              <td>{item.componentCode}</td>

                              <td>
                                <span
                                  className={`badge ${
                                    item.type === "EARNING"
                                      ? "bg-success"
                                      : "bg-danger"
                                  }`}
                                >
                                  {item.type}
                                </span>
                              </td>

                              {/* STANDARD */}

                              <td className="fw-semibold">
                                ₹{item.standardAmount.toLocaleString()}
                              </td>

                              {/* PAYABLE */}

                              <td className="fw-semibold">
                                ₹{item.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-5">No payroll data found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailsModal;
