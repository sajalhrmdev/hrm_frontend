"use client";

import ApplyLeaveModal from "@/components/hrm/attendance/leaves/applyLeave";
import LeaveBalanceCards from "@/components/hrm/attendance/leaves/LeaveBalanceCards";
import MyLeavesTable from "@/components/hrm/attendance/leaves/MyLeaves";
import React, { useState } from "react";

const MyLeavePage: React.FC = () => {
  // ============================================
  // MODAL
  // ============================================

  const [openApplyModal, setOpenApplyModal] = useState(false);

  // ============================================
  // REFRESH
  // ============================================

  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* ============================================
            HEADER
        ============================================ */}

        <div className="leave-page-header">
          <div>
            <h1>📝 My Leaves</h1>

            <p>Manage your leave applications and balances</p>
          </div>

          {/* APPLY BUTTON */}

          <button className="apply-btn" onClick={() => setOpenApplyModal(true)}>
            ➕ Apply Leave
          </button>
        </div>

        {/* ============================================
            LEAVE BALANCES
        ============================================ */}

        <div className="section-space">
          <LeaveBalanceCards key={`balance-${refreshKey}`} />
        </div>

        {/* ============================================
            LEAVE TABLE
        ============================================ */}

        <div className="section-space">
          <MyLeavesTable key={`table-${refreshKey}`} />
        </div>

        {/* ============================================
            APPLY MODAL
        ============================================ */}

        <ApplyLeaveModal
          open={openApplyModal}
          onClose={() => setOpenApplyModal(false)}
          onSuccess={handleRefresh}
        />

        {/* ============================================
            STYLES
        ============================================ */}

        <style>{`
          .leave-page-header {
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:28px;
            gap:20px;
            flex-wrap:wrap;
          }

          .leave-page-header h1 {
            margin:0;
            font-size:32px;
            font-weight:700;
          }

          .leave-page-header p {
            margin-top:6px;
            color:#666;
            font-size:14px;
          }

          .apply-btn {
            border:none;
            background:#2563eb;
            color:#fff;
            padding:14px 22px;
            border-radius:16px;
            font-weight:600;
            cursor:pointer;
            transition:.2s;
            box-shadow:
              0 10px 24px rgba(37,99,235,.22);
          }

          .apply-btn:hover {
            transform:translateY(-2px);
            box-shadow:
              0 14px 30px rgba(37,99,235,.28);
          }

          .section-space {
            margin-bottom:28px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default MyLeavePage;
