"use client";

import React, { useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

// ======================================================

const AttendanceProcessCard = () => {
  // ======================================================

  const [processing, setProcessing] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // ======================================================

  const handleProcess = async () => {
    try {
      setProcessing(true);

      const res = await axiosInstance.post(
        "/attendance/process-day",

        {
          date: selectedDate,
        },
      );

      alert(res?.data?.message || "Attendance processed successfully");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to process attendance");
    } finally {
      setProcessing(false);
    }
  };

  // ======================================================

  return (
    <div className="attendance-process-wrapper">
      {/* ================================= */}
      {/* LEFT */}
      {/* ================================= */}

      <div className="process-left">
        <div className="icon-box">⚡</div>

        <div>
          <h3 className="process-title">Attendance Processor</h3>

          <p className="process-subtitle">
            Generate automatic attendance statuses like Holiday, Weekly Off,
            Paid Leave, Unpaid Leave & Absent.
          </p>
        </div>
      </div>

      {/* ================================= */}
      {/* RIGHT */}
      {/* ================================= */}

      <div className="process-right">
        <div className="date-box">
          <label>Process Date</label>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <button
          className="process-btn"
          disabled={processing}
          onClick={handleProcess}
        >
          {processing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Processing...
            </>
          ) : (
            <>🚀 Process Attendance</>
          )}
        </button>
      </div>

      {/* ================================= */}
      {/* STYLE */}
      {/* ================================= */}

      <style jsx>{`
        .attendance-process-wrapper {
          width: 100%;

          background: linear-gradient(135deg, #ffffff, #f8fafc);

          border-radius: 24px;

          padding: 28px;

          border: 1px solid #e5e7eb;

          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 30px;

          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.06);

          margin-bottom: 24px;
        }

        .process-left {
          display: flex;

          align-items: center;

          gap: 20px;

          flex: 1;
        }

        .icon-box {
          min-width: 72px;

          width: 72px;

          height: 72px;

          border-radius: 20px;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 34px;

          background: linear-gradient(135deg, #7c3aed, #6d28d9);

          color: white;

          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
        }

        .process-title {
          margin: 0;

          font-size: 28px;

          font-weight: 800;

          color: #111827;
        }

        .process-subtitle {
          margin-top: 8px;

          margin-bottom: 0;

          font-size: 14px;

          line-height: 1.7;

          color: #6b7280;

          max-width: 650px;
        }

        .process-right {
          display: flex;

          align-items: end;

          gap: 18px;
        }

        .date-box {
          display: flex;

          flex-direction: column;

          gap: 10px;
        }

        .date-box label {
          font-size: 13px;

          font-weight: 700;

          color: #374151;
        }

        .date-box input {
          width: 220px;

          height: 52px;

          border-radius: 14px;

          border: 1px solid #d1d5db;

          padding: 0 16px;

          background: #f9fafb;

          font-size: 14px;

          color: #111827;

          outline: none;

          writing-mode: horizontal-tb;

          text-orientation: mixed;
        }

        .date-box input:focus {
          border-color: #7c3aed;

          background: white;

          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
        }

        .process-btn {
          height: 52px;

          border: none;

          border-radius: 14px;

          padding: 0 24px;

          font-size: 14px;

          font-weight: 700;

          color: white;

          background: linear-gradient(135deg, #7c3aed, #6d28d9);

          transition: 0.25s ease;
        }

        .process-btn:hover {
          transform: translateY(-2px);

          box-shadow: 0 10px 24px rgba(124, 58, 237, 0.3);
        }

        .process-btn:disabled {
          opacity: 0.7;

          cursor: not-allowed;

          transform: none;
        }

        @media (max-width: 992px) {
          .attendance-process-wrapper {
            flex-direction: column;

            align-items: stretch;
          }

          .process-right {
            width: 100%;

            flex-direction: column;

            align-items: stretch;
          }

          .date-box input {
            width: 100%;
          }

          .process-btn {
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .attendance-process-wrapper {
            padding: 20px;
          }

          .process-left {
            flex-direction: column;

            align-items: flex-start;
          }

          .process-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default AttendanceProcessCard;
