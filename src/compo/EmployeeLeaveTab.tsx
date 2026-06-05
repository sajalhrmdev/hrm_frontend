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

const EmployeeLeaveTab = ({
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
    allocateLoading,
    setAllocateLoading,
  ] = useState(false);

  const [
    balances,
    setBalances,
  ] = useState<any[]>([]);

  const [
    leaves,
    setLeaves,
  ] = useState<any[]>([]);

  const [
    leaveTypes,
    setLeaveTypes,
  ] = useState<any[]>([]);

  const [
    allocateForm,
    setAllocateForm,
  ] = useState({

    leaveTypeId: "",

    total_allocated: "",

    year:
      new Date().getFullYear(),
  });

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData =
    async () => {

      try {

        setLoading(true);

        const currentYear =
          new Date().getFullYear();

        const [
          balanceRes,

          leaveRes,

          typeRes,
        ] = await Promise.all([

          axiosInstance.get(

            `/leave/balance?year=${currentYear}`
          ),

          axiosInstance.get(

            `/leave/employee/${employeeId}?year=${currentYear}`
          ),

          axiosInstance.get(
            "/leave/types"
          ),
        ]);

        setBalances(

          balanceRes?.data?.data || []
        );

        setLeaves(

          leaveRes?.data?.data || []
        );

        setLeaveTypes(

          typeRes?.data?.data || []
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    if (employeeId) {

      fetchData();
    }

  }, [employeeId]);

  // ======================================================
  // HANDLE ALLOCATE CHANGE
  // ======================================================

  const handleAllocateChange =
    (
      e:any
    ) => {

      setAllocateForm({

        ...allocateForm,

        [e.target.name]:
          e.target.value,
      });
    };

  // ======================================================
  // ALLOCATE LEAVE
  // ======================================================

  const handleAllocateLeave =
    async (
      e:any
    ) => {

      e.preventDefault();

      try {

        setAllocateLoading(true);

        await axiosInstance.post(

          "/leave/allocate",

          {

            employeeId,

            leaveTypeId:
              Number(
                allocateForm.leaveTypeId
              ),

            year:
              Number(
                allocateForm.year
              ),

            total_allocated:
              Number(
                allocateForm.total_allocated
              ),
          }
        );

        alert(
          "Leave allocated successfully"
        );

        setAllocateForm({

          leaveTypeId: "",

          total_allocated: "",

          year:
            new Date().getFullYear(),
        });

        fetchData();

      } catch (err:any) {

        alert(

          err?.response?.data?.message
        );

      } finally {

        setAllocateLoading(false);
      }
    };

  // ======================================================
  // STATUS CLASS
  // ======================================================

  const getStatusClass =
    (
      status:string
    ) => {

      if (
        status === "APPROVED"
      ) {
        return "approved";
      }

      if (
        status === "REJECTED"
      ) {
        return "rejected";
      }

      return "pending";
    };

  // ======================================================
  // SUMMARY
  // ======================================================

  const totalAllocated =
    balances.reduce(
      (
        acc,
        item
      )=> acc + item.total_allocated,
      0
    );

  const totalUsed =
    balances.reduce(
      (
        acc,
        item
      )=> acc + item.used,
      0
    );

  const totalRemaining =
    balances.reduce(
      (
        acc,
        item
      )=> acc + item.remaining,
      0
    );

  // ======================================================
  // UI
  // ======================================================

  if (loading) {

    return (

      <div className="leave-loading">

        <div className="spinner-border text-info" />

        <p className="mt-3">
          Loading leave details...
        </p>

      </div>
    );
  }

  return (

    <div className="leave-page">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="leave-top-card">

        <div>

          <h3 className="leave-title">
            🌴 Employee Leave
          </h3>

          <p className="leave-subtitle">
            View leave balance, allocation & leave history
          </p>

        </div>

        <div className="leave-badge">
          Leave Analytics
        </div>

      </div>

      {/* ====================================== */}
      {/* SUMMARY */}
      {/* ====================================== */}

      <div className="row g-4 mb-4">

        <div className="col-md-4">

          <div className="summary-card allocated">

            <h6>Total Allocated</h6>

            <h3>
              {totalAllocated}
            </h3>

          </div>

        </div>

        <div className="col-md-4">

          <div className="summary-card used">

            <h6>Total Used</h6>

            <h3>
              {totalUsed}
            </h3>

          </div>

        </div>

        <div className="col-md-4">

          <div className="summary-card remaining">

            <h6>Total Remaining</h6>

            <h3>
              {totalRemaining}
            </h3>

          </div>

        </div>

      </div>

      {/* ====================================== */}
      {/* ALLOCATE LEAVE */}
      {/* ====================================== */}

      <div className="leave-card">

        <div className="card-header-custom">

          <div>

            <h5 className="card-title-custom">
              Allocate Leave Balance
            </h5>

            <p className="card-subtitle-custom">
              Allocate leave days for employee
            </p>

          </div>

        </div>

        <form
          onSubmit={
            handleAllocateLeave
          }
        >

          <div className="row g-4">

            {/* LEAVE TYPE */}

            <div className="col-md-4">

              <label className="leave-label">
                Leave Type
              </label>

              <select
                className="leave-input"

                name="leaveTypeId"

                value={
                  allocateForm.leaveTypeId
                }

                onChange={
                  handleAllocateChange
                }

                required
              >

                <option value="">
                  Select Leave Type
                </option>

                {leaveTypes.map(
                  (item:any)=>(
                    <option
                      key={item.id}

                      value={item.id}
                    >

                      {item.name}

                    </option>
                  )
                )}

              </select>

            </div>

            {/* ALLOCATED */}

            <div className="col-md-4">

              <label className="leave-label">
                Total Allocated
              </label>

              <input
                type="number"

                className="leave-input"

                name="total_allocated"

                value={
                  allocateForm.total_allocated
                }

                onChange={
                  handleAllocateChange
                }

                placeholder="Enter total days"

                required
              />

            </div>

            {/* YEAR */}

            <div className="col-md-4">

              <label className="leave-label">
                Year
              </label>

              <input
                type="number"

                className="leave-input"

                name="year"

                value={
                  allocateForm.year
                }

                onChange={
                  handleAllocateChange
                }

                required
              />

            </div>

          </div>

          {/* BUTTON */}

          <div className="mt-4">

            <button
              type="submit"

              className="allocate-btn"

              disabled={
                allocateLoading
              }
            >

              {allocateLoading ? (

                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                  />
                  Allocating...
                </>

              ) : (

                <>
                  🌴 Allocate Leave
                </>

              )}

            </button>

          </div>

        </form>

      </div>

      {/* ====================================== */}
      {/* LEAVE BALANCE */}
      {/* ====================================== */}

      <div className="leave-card">

        <div className="card-header-custom">

          <div>

            <h5 className="card-title-custom">
              Leave Balance
            </h5>

            <p className="card-subtitle-custom">
              Current leave allocation overview
            </p>

          </div>

        </div>

        <div className="table-responsive">

          <table className="table leave-table align-middle">

            <thead>

              <tr>

                <th>Leave Type</th>

                <th>Allocated</th>

                <th>Used</th>

                <th>Remaining</th>

                <th>Category</th>

              </tr>

            </thead>

            <tbody>

              {balances.length === 0 ? (

                <tr>

                  <td
                    colSpan={5}

                    className="text-center py-5"
                  >
                    No leave balance found
                  </td>

                </tr>

              ) : (

                balances.map(
                  (item:any)=>{

                    return (

                      <tr
                        key={item.id}
                      >

                        <td>

                          <div className="fw-bold ">

                            {
                              item.leaveType?.name
                            }

                          </div>

                          <small className="text-muted">

                            {
                              item.leaveType?.code
                            }

                          </small>

                        </td>

                        <td>

                          <span className="count-box blue">

                            {
                              item.total_allocated
                            }

                          </span>

                        </td>

                        <td>

                          <span className="count-box red">

                            {
                              item.used
                            }

                          </span>

                        </td>

                        <td>

                          <span className="count-box green">

                            {
                              item.remaining
                            }

                          </span>

                        </td>

                        <td>

                          {item.leaveType?.is_paid ? (

                            <span className="paid-badge">
                              Paid Leave
                            </span>

                          ) : (

                            <span className="unpaid-badge">
                              Unpaid Leave
                            </span>

                          )}

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ====================================== */}
      {/* LEAVE HISTORY */}
      {/* ====================================== */}

      <div className="leave-card">

        <div className="card-header-custom">

          <div>

            <h5 className="card-title-custom">
              Leave History
            </h5>

            <p className="card-subtitle-custom">
              Employee leave application records
            </p>

          </div>

        </div>

        <div className="table-responsive">

          <table className="table leave-table align-middle">

            <thead>

              <tr>

                <th>Leave Type</th>

                <th>From Date</th>

                <th>To Date</th>

                <th>Total Days</th>

                <th>Paid Days</th>

                <th>Unpaid Days</th>

                <th>Status</th>

                <th>Mode</th>

              </tr>

            </thead>

            <tbody>

              {leaves.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}

                    className="text-center py-5"
                  >
                    No leave history found
                  </td>

                </tr>

              ) : (

                leaves.map(
                  (item:any)=>{

                    return (

                      <tr
                        key={item.id}
                      >

                        <td>

                          <div className="fw-bold">

                            {
                              item.leaveType?.name
                            }

                          </div>

                          <small className="text-muted">

                            {
                              item.leaveType?.code
                            }

                          </small>

                        </td>

                        <td>

                          {
                            new Date(
                              item.fromDate
                            ).toLocaleDateString()
                          }

                        </td>

                        <td>

                          {
                            new Date(
                              item.toDate
                            ).toLocaleDateString()
                          }

                        </td>

                        <td>

                          <span className="count-box blue">

                            {
                              item.totalDays
                            }

                          </span>

                        </td>

                        <td>

                          <span className="count-box green">

                            {
                              item.paidDays
                            }

                          </span>

                        </td>

                        <td>

                          <span className="count-box red">

                            {
                              item.unpaidDays
                            }

                          </span>

                        </td>

                        <td>

                          <span
                            className={`status-badge ${getStatusClass(
                              item.status
                            )}`}
                          >

                            {
                              item.status
                            }

                          </span>

                        </td>

                        <td>

                          <span className="mode-badge">

                            {
                              item.leaveMode
                            }

                          </span>

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ====================================== */}
      {/* STYLE */}
      {/* ====================================== */}

      <style jsx>{`

        .leave-page {

          width: 100%;
        }

        .leave-top-card {

          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-bottom: 24px;

          padding: 28px;

          border-radius: 22px;

          background: linear-gradient(
            135deg,
            #ffffff,
            #ecfeff
          );

          border: 1px solid #cffafe;

          box-shadow:
            0 8px 30px
            rgba(0,0,0,0.06);
        }

        .leave-title {

          font-size: 30px;

          font-weight: 800;

          margin-bottom: 6px;

          color: #111827;
        }

        .leave-subtitle {

          margin: 0;

          color: #6b7280;

          font-size: 14px;
        }

        .leave-badge {

          padding: 10px 18px;

          border-radius: 999px;

          color: white;

          font-size: 13px;

          font-weight: 700;

          background: linear-gradient(
            135deg,
            #0891b2,
            #0e7490
          );
        }

        .summary-card {

          border-radius: 20px;

          padding: 24px;

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

          font-size: 32px;

          font-weight: 800;
        }

        .allocated {

          background: linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
          );
        }

        .used {

          background: linear-gradient(
            135deg,
            #dc2626,
            #b91c1c
          );
        }

        .remaining {

          background: linear-gradient(
            135deg,
            #16a34a,
            #15803d
          );
        }

        .leave-card {

          background: white;

          border-radius: 22px;

          padding: 28px;

          margin-bottom: 24px;

          border: 1px solid #edf2f7;

          box-shadow:
            0 8px 30px
            rgba(0,0,0,0.06);
        }

        .card-header-custom {

          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-bottom: 24px;
        }

        .card-title-custom {

          margin: 0;

          font-size: 20px;

          font-weight: 800;

          color: #111827;
        }

        .card-subtitle-custom {

          margin: 4px 0 0;

          color: #6b7280;

          font-size: 13px;
        }

        .leave-label {

          display: block;

          margin-bottom: 10px;

          font-size: 14px;

          font-weight: 700;

          color: #111827;
        }

        .leave-input {

          width: 100%;

          height: 52px;

          border-radius: 14px;

          border: 1px solid #d1d5db;

          background: #f9fafb;

          padding: 0 16px;

          font-size: 14px;

          outline: none;

          transition: 0.2s ease;
        }

        .leave-input:focus {

          background: white;

          border-color: #0891b2;

          box-shadow:
            0 0 0 4px
            rgba(8,145,178,0.12);
        }

        .allocate-btn {

          border: none;

          height: 52px;

          padding: 0 28px;

          border-radius: 14px;

          color: white;

          font-size: 15px;

          font-weight: 700;

          background: linear-gradient(
            135deg,
            #0891b2,
            #0e7490
          );

          box-shadow:
            0 10px 24px
            rgba(8,145,178,0.25);
        }

        .leave-table th {

          background: #f9fafb;

          color: #111827;

          font-weight: 700;

          padding: 16px;

          border-bottom:
            1px solid #e5e7eb;
        }

        .leave-table td {

          padding: 16px;

          vertical-align: middle;
        }

        .count-box {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          min-width: 46px;

          height: 36px;

          padding: 0 12px;

          border-radius: 12px;

          font-size: 13px;

          font-weight: 700;
        }

        .blue {

          background: #dbeafe;

          color: #1d4ed8;
        }

        .green {

          background: #dcfce7;

          color: #166534;
        }

        .red {

          background: #fee2e2;

          color: #991b1b;
        }

        .paid-badge {

          background: #dcfce7;

          color: #166534;

          padding: 8px 14px;

          border-radius: 999px;

          font-size: 12px;

          font-weight: 700;
        }

        .unpaid-badge {

          background: #fee2e2;

          color: #991b1b;

          padding: 8px 14px;

          border-radius: 999px;

          font-size: 12px;

          font-weight: 700;
        }

        .status-badge {

          padding: 8px 14px;

          border-radius: 999px;

          font-size: 12px;

          font-weight: 700;
        }

        .approved {

          background: #dcfce7;

          color: #166534;
        }

        .rejected {

          background: #fee2e2;

          color: #991b1b;
        }

        .pending {

          background: #fef3c7;

          color: #92400e;
        }

        .mode-badge {

          background: #f3f4f6;

          color: #374151;

          padding: 8px 14px;

          border-radius: 999px;

          font-size: 12px;

          font-weight: 700;
        }

        .leave-loading {

          height: 350px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;
        }

        @media(max-width:768px){

          .leave-top-card {

            flex-direction: column;

            align-items: flex-start;

            gap: 16px;
          }

          .leave-card {

            padding: 18px;
          }

          .leave-title {

            font-size: 24px;
          }

          .allocate-btn {

            width: 100%;
          }
        }

      `}</style>

    </div>
  );
};

export default EmployeeLeaveTab;