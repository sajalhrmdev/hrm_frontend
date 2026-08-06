"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


import { useParams } from "next/navigation";

import axiosInstance from "@/utils/axiosInstance";

import PayrollDetailsModal from "@/components/finance-accounts/payrool/PayrollDetailsModal";

type Payroll = {
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

  employee: {
    id: number;

    name: string;

    employeeCode: string;

    email: string;
  };
};

const PayrollDetailsPage = () => {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [loading, setLoading] = useState(false);

  const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(
    null,
  );

  const [showPayrollModal, setShowPayrollModal] = useState(false);

  const [payrolls, setPayrolls] = useState<Payroll[]>([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  // ============================================
  // FETCH PAYROLLS
  // ============================================

  const fetchPayrolls = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`/payroll/run/${id}`);

      setPayrolls(res?.data?.data?.payrolls || []);
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
    if (id) {
      fetchPayrolls();
    }
  }, [id]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  // ============================================
  // PRINT
  // ============================================

  const handlePrint = (payrollId: number) => {
    window.open(`/payroll-slip/${payrollId}`, "_blank");
  };
  // ============================================
  // FINALIZE PAYROLL
  // ============================================

  const handleFinalizePayroll = async () => {
    try {
      const confirmFinalize = window.confirm(
        "Are you sure you want to finalize this payroll?",
      );

      if (!confirmFinalize) {
        return;
      }

      const res = await axiosInstance.patch(`/payroll/run/${id}/finalize`);

      alert(res?.data?.message || "Payroll finalized successfully");

      fetchPayrolls();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to finalize payroll");
    }
  };

  // ============================================
  // MARK PAYROLL PAID
  // ============================================

  const handleMarkPaid = async (payrollId: number) => {
    try {
      const confirmPaid = window.confirm("Mark this payroll as PAID?");

      if (!confirmPaid) {
        return;
      }

      const res = await axiosInstance.patch(`/payroll/${payrollId}/paid`);

      alert(res?.data?.message || "Payroll marked as paid");

      fetchPayrolls();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to mark paid");
    }
  };
  const handleMarkAllPaid = async () => {
    try {
      const confirmPaid = window.confirm("Mark all payrolls as PAID?");

      if (!confirmPaid) {
        return;
      }

      const res = await axiosInstance.patch(`/payroll/run/${id}/paid`);

      alert(res?.data?.message || "Payrolls marked paid");

      fetchPayrolls();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to mark paid");
    }
  };
  // ============================================
  // SEARCH + PAGINATION
  // ============================================

  const query = search.trim().toLowerCase();

  const filteredPayrolls = payrolls.filter((p) => {
    if (!query) return true;

    return (
      p.employee.name.toLowerCase().includes(query) ||
      (p.employee.employeeCode || "").toLowerCase().includes(query) ||
      (p.employee.email || "").toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredPayrolls.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const paginated = filteredPayrolls.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const startIndex = filteredPayrolls.length
    ? (currentPage - 1) * PAGE_SIZE + 1
    : 0;

  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredPayrolls.length);

  const pageNumbers: (number | string)[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      Math.abs(i - currentPage) <= 2
    ) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
      pageNumbers.push("...");
    }
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* HEADER */}

        <div className="mb-4">
          <h3 className="fw-bold mb-1">💰 Payroll Details</h3>

          <p className="text-muted mb-0">Employee payroll list</p>
          <div className="mt-3">
            <button className="btn btn-primary" onClick={handleFinalizePayroll}>
              🔒 Finalize Payroll
            </button>
            <button
              className="btn btn-success ms-2"
              onClick={handleMarkAllPaid}
            >
              💵 Mark All Paid
            </button>
            <button
              className="btn btn-info ms-2"
              onClick={() => router.push(`/payroll/run/${id}/salary-sheet`)}
            >
              📄 View Salary Sheet
            </button>
          </div>
        </div>

        {/* TABLE */}

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            {/* SEARCH */}

            <div className="row mb-3">
              <div className="col-md-6 col-lg-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, code or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>

                <p className="mt-3 mb-0">Loading payrolls...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>

                      <th>Employee</th>

                      <th>Employee Code</th>

                      <th>Total</th>

                      <th>Present</th>

                      <th>Paid Leave</th>

                      <th>LOP</th>

                      <th>Payable</th>

                      <th>Overtime</th>

                      <th>Gross Salary</th>

                      <th>Deduction</th>

                      <th>Net Salary</th>

                      <th>Status</th>

                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPayrolls.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="text-center py-5">
                          {query
                            ? "No payrolls match your search"
                            : "No payroll found"}
                        </td>
                      </tr>
                    ) : (
                      paginated.map((item, index) => (
                        <tr key={item.id}>
                          {/* SERIAL */}

                          <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>

                          {/* EMPLOYEE */}

                          <td>
                            <div className="fw-semibold">
                              {item.employee.name}
                            </div>

                            <small className="text-muted">
                              {item.employee.email}
                            </small>
                          </td>

                          {/* EMPLOYEE CODE */}

                          <td>{item.employee.employeeCode}</td>

                          {/* TOTAL */}

                          <td>{item.total_days}</td>

                          {/* PRESENT */}

                          <td className="text-success fw-semibold">
                            {item.present_days}
                          </td>

                          {/* PAID LEAVE */}

                          <td className="text-primary fw-semibold">
                            {item.paid_leave_days}
                          </td>

                          {/* LOP */}

                          <td className="text-danger fw-semibold">
                            {item.lop_days}
                          </td>

                          {/* PAYABLE */}

                          <td className="fw-semibold">{item.payable_days}</td>

                          {/* OVERTIME */}

                          <td>₹{item.overtime_amount.toLocaleString()}</td>

                          {/* GROSS */}

                          <td className="fw-semibold">
                            ₹{item.gross_salary.toLocaleString()}
                          </td>

                          {/* DEDUCTION */}

                          <td className="text-danger fw-semibold">
                            ₹{item.total_deduction.toLocaleString()}
                          </td>

                          {/* NET */}

                          <td className="text-success fw-bold">
                            ₹{item.net_salary.toLocaleString()}
                          </td>

                          {/* STATUS */}

                          <td>
                            <span
                              className={`badge ${
                                item.status === "PAID"
                                  ? "bg-success"
                                  : item.status === "FINALIZED"
                                    ? "bg-primary"
                                    : "bg-warning text-dark"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          {/* ACTION */}

                          <td>
                            <div className="d-flex gap-2">
                              {/* VIEW */}

                              <button
                                className="btn btn-dark btn-sm"
                                onClick={() => {
                                  setSelectedPayrollId(item.id);

                                  setShowPayrollModal(true);
                                }}
                              >
                                👁 View
                              </button>
                              {item.status === "FINALIZED" && (
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleMarkPaid(item.id)}
                                >
                                  💵 Mark Paid
                                </button>
                              )}

                              {/* PRINT */}

                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handlePrint(item.id)}
                              >
                                🖨 Print
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* PAGINATION */}

                {!query && totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                    <small className="text-muted">
                      Showing {startIndex}–{endIndex} of {filteredPayrolls.length}
                    </small>

                    <ul className="pagination pagination-sm mb-0">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage(currentPage - 1)}
                        >
                          Prev
                        </button>
                      </li>

                      {pageNumbers.map((p, i) =>
                        p === "..." ? (
                          <li key={`gap-${i}`} className="page-item disabled">
                            <span className="page-link">…</span>
                          </li>
                        ) : (
                          <li
                            key={p}
                            className={`page-item ${
                              p === currentPage ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setPage(p as number)}
                            >
                              {p}
                            </button>
                          </li>
                        ),
                      )}

                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage(currentPage + 1)}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}

      <PayrollDetailsModal
        payrollId={selectedPayrollId}
        show={showPayrollModal}
        onClose={() => setShowPayrollModal(false)}
      />
    </div>
  );
};

export default PayrollDetailsPage;
