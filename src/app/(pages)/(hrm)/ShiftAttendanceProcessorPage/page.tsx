// "use client";

// import React, { useEffect, useState } from "react";

// import axiosInstance from "@/utils/axiosInstance";

// // ======================================================

// const ShiftAttendanceProcessorPage = () => {
//   // ======================================================

//   const [loading, setLoading] = useState(false);

//   const [processingId, setProcessingId] = useState<number | null>(null);

//   const [shifts, setShifts] = useState<any[]>([]);

//   const [selectedDate, setSelectedDate] = useState(
//     new Date().toISOString().split("T")[0],
//   );

//   const [result, setResult] = useState<any>(null);

//   // ======================================================
//   // FETCH SHIFTS
//   // ======================================================

//   const fetchShifts = async () => {
//     try {
//       setLoading(true);

//       const res = await axiosInstance.get("/shift");

//       setShifts(res?.data?.data?.shifts || []);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ======================================================

//   useEffect(() => {
//     fetchShifts();
//   }, []);

//   // ======================================================
//   // PROCESS
//   // ======================================================

//   const handleProcess = async (shift: any) => {
//     try {
//       setProcessingId(shift.id);

//       setResult(null);

//       const res = await axiosInstance.post(
//         "/attendance/process-shift",

//         {
//           shiftId: shift.id,

//           date: selectedDate,
//         },
//       );

//       setResult(res?.data?.data);

//       alert("Attendance processed successfully");
//     } catch (err: any) {
//       console.log(err);

//       alert(err?.response?.data?.message || "Processing failed");
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   // ======================================================
//   // FORMAT TIME
//   // ======================================================

//   const formatTime = (time: string) => {
//     if (!time) return "--";

//     const [h, m] = time.split(":");

//     const hour = Number(h);

//     const suffix = hour >= 12 ? "PM" : "AM";

//     const formatted = hour % 12 || 12;

//     return `${formatted}:${m} ${suffix}`;
//   };

//   // ======================================================

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="processor-page">
//           {/* ====================================================== */}
//           {/* HEADER */}
//           {/* ====================================================== */}

//           <div className="top-header">
//             <div>
//               <h1>Attendance Finalization</h1>

//               <p>
//                 Process absent, leave, weekly off and holiday attendance after
//                 shift end
//               </p>
//             </div>
//           </div>

//           {/* ====================================================== */}
//           {/* FILTER */}
//           {/* ====================================================== */}

//           <div className="filter-card">
//             <div className="filter-item">
//               <label>Attendance Date</label>

//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* ====================================================== */}
//           {/* RESULT */}
//           {/* ====================================================== */}

//           {result && (
//             <div className="result-card">
//               <div className="result-header">
//                 <h2>Process Result</h2>
//               </div>

//               <div className="result-grid">
//                 <div className="result-box">
//                   <span>Shift</span>

//                   <h3>{result.shiftName}</h3>
//                 </div>

//                 <div className="result-box">
//                   <span>Total</span>

//                   <h3>{result.totalProcessed}</h3>
//                 </div>

//                 <div className="result-box">
//                   <span>Absent</span>

//                   <h3>{result.absent}</h3>
//                 </div>

//                 <div className="result-box">
//                   <span>Weekly Off</span>

//                   <h3>{result.weeklyOff}</h3>
//                 </div>

//                 <div className="result-box">
//                   <span>Holiday</span>

//                   <h3>{result.holiday}</h3>
//                 </div>

//                 <div className="result-box">
//                   <span>Paid Leave</span>

//                   <h3>{result.paidLeave}</h3>
//                 </div>

//                 <div className="result-box">
//                   <span>Unpaid Leave</span>

//                   <h3>{result.unpaidLeave}</h3>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ====================================================== */}
//           {/* SHIFT LIST */}
//           {/* ====================================================== */}

//           <div className="shift-grid">
//             {loading ? (
//               <div className="empty-card">Loading...</div>
//             ) : shifts.length ? (
//               shifts.map((shift: any) => (
//                 <div className="shift-card" key={shift.id}>
//                   {/* ====================================================== */}

//                   <div className="shift-top">
//                     <div>
//                       <h2>{shift.title}</h2>

//                       <p>{shift.code}</p>
//                     </div>

//                     <div className="status-badge">{shift.status}</div>
//                   </div>

//                   {/* ====================================================== */}

//                   <div className="time-box">
//                     <div>
//                       <span>Start</span>

//                       <strong>{formatTime(shift.startTime)}</strong>
//                     </div>

//                     <div>
//                       <span>End</span>

//                       <strong>{formatTime(shift.endTime)}</strong>
//                     </div>
//                   </div>

//                   {/* ====================================================== */}

//                   <div className="shift-info">
//                     <div>
//                       <span>Grace</span>

//                       <strong>{shift.graceMinutes} min</strong>
//                     </div>

//                     <div>
//                       <span>Late After</span>

//                       <strong>{shift.lateAfterMinutes} min</strong>
//                     </div>
//                   </div>

//                   {/* ====================================================== */}

//                   <button
//                     className="process-btn"
//                     disabled={processingId === shift.id}
//                     onClick={() => handleProcess(shift)}
//                   >
//                     {processingId === shift.id
//                       ? "Processing..."
//                       : "Finalize Attendance"}
//                   </button>
//                 </div>
//               ))
//             ) : (
//               <div className="empty-card">No shifts found</div>
//             )}
//           </div>

//           {/* ====================================================== */}
//           {/* STYLE */}
//           {/* ====================================================== */}

//           <style jsx>{`
//             .processor-page {
//               padding: 24px;
//             }

//             .top-header {
//               margin-bottom: 24px;
//             }

//             .top-header h1 {
//               font-size: 32px;

//               font-weight: 800;

//               color: #111827;

//               margin-bottom: 8px;
//             }

//             .top-header p {
//               color: #6b7280;

//               font-size: 15px;
//             }

//             .filter-card {
//               background: white;

//               border-radius: 24px;

//               padding: 24px;

//               margin-bottom: 24px;

//               border: 1px solid #e5e7eb;

//               box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
//             }

//             .filter-item {
//               max-width: 260px;
//             }

//             .filter-item label {
//               display: block;

//               margin-bottom: 10px;

//               font-size: 14px;

//               font-weight: 700;

//               color: #374151;
//             }

//             .filter-item input {
//               width: 100%;

//               height: 50px;

//               border-radius: 14px;

//               border: 1px solid #d1d5db;

//               padding: 0 16px;

//               outline: none;
//             }

//             .result-card {
//               background: white;

//               border-radius: 28px;

//               padding: 24px;

//               margin-bottom: 24px;

//               border: 1px solid #e5e7eb;

//               box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
//             }

//             .result-header {
//               margin-bottom: 20px;
//             }

//             .result-header h2 {
//               font-size: 24px;

//               font-weight: 800;

//               color: #111827;
//             }

//             .result-grid {
//               display: grid;

//               grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));

//               gap: 18px;
//             }

//             .result-box {
//               background: #f9fafb;

//               border-radius: 20px;

//               padding: 20px;
//             }

//             .result-box span {
//               font-size: 13px;

//               color: #6b7280;
//             }

//             .result-box h3 {
//               margin-top: 10px;

//               font-size: 28px;

//               font-weight: 800;

//               color: #111827;
//             }

//             .shift-grid {
//               display: grid;

//               grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));

//               gap: 24px;
//             }

//             .shift-card {
//               background: white;

//               border-radius: 28px;

//               padding: 24px;

//               border: 1px solid #e5e7eb;

//               box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

//               transition: 0.3s ease;
//             }

//             .shift-card:hover {
//               transform: translateY(-3px);
//             }

//             .shift-top {
//               display: flex;

//               justify-content: space-between;

//               align-items: flex-start;

//               margin-bottom: 22px;
//             }

//             .shift-top h2 {
//               font-size: 22px;

//               font-weight: 800;

//               color: #111827;

//               margin-bottom: 6px;
//             }

//             .shift-top p {
//               color: #6b7280;

//               font-size: 14px;
//             }

//             .status-badge {
//               padding: 8px 14px;

//               border-radius: 999px;

//               background: #dcfce7;

//               color: #166534;

//               font-size: 12px;

//               font-weight: 700;
//             }

//             .time-box {
//               display: grid;

//               grid-template-columns: 1fr 1fr;

//               gap: 14px;

//               margin-bottom: 18px;
//             }

//             .time-box div {
//               background: #f9fafb;

//               border-radius: 18px;

//               padding: 18px;
//             }

//             .time-box span {
//               display: block;

//               font-size: 12px;

//               color: #6b7280;

//               margin-bottom: 8px;
//             }

//             .time-box strong {
//               font-size: 18px;

//               color: #111827;
//             }

//             .shift-info {
//               display: grid;

//               grid-template-columns: 1fr 1fr;

//               gap: 14px;

//               margin-bottom: 22px;
//             }

//             .shift-info div {
//               background: #eef2ff;

//               border-radius: 18px;

//               padding: 18px;
//             }

//             .shift-info span {
//               display: block;

//               font-size: 12px;

//               color: #4338ca;

//               margin-bottom: 8px;
//             }

//             .shift-info strong {
//               font-size: 16px;

//               color: #111827;
//             }

//             .process-btn {
//               width: 100%;

//               height: 52px;

//               border: none;

//               border-radius: 16px;

//               background: #111827;

//               color: white;

//               font-size: 15px;

//               font-weight: 700;

//               cursor: pointer;

//               transition: 0.3s ease;
//             }

//             .process-btn:hover {
//               opacity: 0.9;
//             }

//             .process-btn:disabled {
//               opacity: 0.6;

//               cursor: not-allowed;
//             }

//             .empty-card {
//               background: white;

//               border-radius: 24px;

//               padding: 60px;

//               text-align: center;

//               color: #6b7280;

//               border: 1px solid #e5e7eb;
//             }

//             @media (max-width: 768px) {
//               .processor-page {
//                 padding: 16px;
//               }

//               .top-header h1 {
//                 font-size: 24px;
//               }

//               .shift-grid {
//                 grid-template-columns: 1fr;
//               }

//               .result-grid {
//                 grid-template-columns: 1fr;
//               }
//             }
//           `}</style>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ShiftAttendanceProcessorPage;

"use client";

import React, { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

interface ProcessResult {
  totalProcessed: number;
  absent: number;
  weeklyOff: number;
  holiday: number;
  paidLeave: number;
  unpaidLeave: number;
}

const AttendanceProcessorPage = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const [result, setResult] = useState<ProcessResult | null>(null);

  const handleProcess = async () => {
    try {
      setLoading(true);

      setResult(null);

      const res = await axiosInstance.post("/attendance/process", {
        date: selectedDate,
      });

      setResult(res?.data?.data as ProcessResult);

      alert("Attendance processed successfully");
    } catch (err: any) {
      console.error(err);

      alert(err?.response?.data?.message || "Processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="processor-page">
          {/* HEADER */}

          <div className="top-header">
            <div>
              <h1>Attendance Finalization</h1>

              <p>
                Process attendance for all active policies including fixed and
                flexible schedules.
              </p>
            </div>
          </div>

          {/* FILTER */}

          <div className="filter-card">
            <div className="filter-item">
              <label>Attendance Date</label>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <button
              className="process-btn mt-4"
              disabled={loading}
              onClick={handleProcess}
            >
              {loading ? "Processing..." : "Process Attendance"}
            </button>
          </div>

          {/* RESULT */}

          {result && (
            <div className="result-card">
              <div className="result-header">
                <h2>Processing Summary</h2>
              </div>

              <div className="result-grid">
                <div className="result-box total">
                  <span>Total Processed</span>

                  <h3>{result.totalProcessed}</h3>
                </div>

                <div className="result-box absent">
                  <span>Absent</span>

                  <h3>{result.absent}</h3>
                </div>

                <div className="result-box weekly">
                  <span>Weekly Off</span>

                  <h3>{result.weeklyOff}</h3>
                </div>

                <div className="result-box holiday">
                  <span>Holiday</span>

                  <h3>{result.holiday}</h3>
                </div>

                <div className="result-box paid">
                  <span>Paid Leave</span>

                  <h3>{result.paidLeave}</h3>
                </div>

                <div className="result-box unpaid">
                  <span>Unpaid Leave</span>

                  <h3>{result.unpaidLeave}</h3>
                </div>
              </div>
            </div>
          )}

          <style jsx>{`
            .processor-page {
              padding: 24px;
            }

            .top-header {
              margin-bottom: 24px;
            }

            .top-header h1 {
              font-size: 34px;
              font-weight: 800;
              color: #111827;
              margin-bottom: 8px;
            }

            .top-header p {
              color: #6b7280;
              font-size: 15px;
            }

            .filter-card {
              background: #fff;
              border-radius: 24px;
              padding: 30px;
              margin-bottom: 24px;
              border: 1px solid #e5e7eb;
              box-shadow: 0 15px 40px rgba(0, 0, 0, 0.05);
            }

            .filter-item {
              max-width: 280px;
            }

            .filter-item label {
              display: block;
              margin-bottom: 10px;
              font-size: 14px;
              font-weight: 700;
              color: #374151;
            }

            .filter-item input {
              width: 100%;
              height: 52px;
              border-radius: 14px;
              border: 1px solid #d1d5db;
              padding: 0 16px;
              outline: none;
            }

            .process-btn {
              margin-top: 20px;
              min-width: 220px;
              height: 54px;
              border: none;
              border-radius: 16px;
              background: linear-gradient(135deg, #111827, #dc2626);
              color: white;
              font-weight: 700;
              cursor: pointer;
            }

            .process-btn:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }

            .result-card {
              background: white;
              border-radius: 24px;
              padding: 24px;
              border: 1px solid #e5e7eb;
              box-shadow: 0 15px 40px rgba(0, 0, 0, 0.05);
            }

            .result-header {
              margin-bottom: 20px;
            }

            .result-header h2 {
              font-size: 24px;
              font-weight: 800;
            }

            .result-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 18px;
            }

            .result-box {
              border-radius: 20px;
              padding: 24px;
              color: white;
            }

            .result-box span {
              font-size: 13px;
              opacity: 0.9;
            }

            .result-box h3 {
              margin-top: 12px;
              font-size: 30px;
              font-weight: 800;
            }

            .total {
              background: linear-gradient(135deg, #111827, #374151);
            }

            .absent {
              background: linear-gradient(135deg, #dc2626, #991b1b);
            }

            .weekly {
              background: linear-gradient(135deg, #2563eb, #1e40af);
            }

            .holiday {
              background: linear-gradient(135deg, #059669, #065f46);
            }

            .paid {
              background: linear-gradient(135deg, #7c3aed, #5b21b6);
            }

            .unpaid {
              background: linear-gradient(135deg, #f59e0b, #b45309);
            }

            @media (max-width: 768px) {
              .processor-page {
                padding: 15px;
              }

              .top-header h1 {
                font-size: 26px;
              }

              .result-grid {
                grid-template-columns: 1fr;
              }

              .process-btn {
                width: 100%;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default AttendanceProcessorPage;
