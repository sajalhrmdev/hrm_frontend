// "use client";

// import React, { useState } from "react";

// import axiosInstance from "@/utils/axiosInstance";

// // ======================================================

// const frequencies = [
//   {
//     label: "Daily",
//     value: "DAILY",
//     desc: "Process daily leave increments",
//   },

//   {
//     label: "Weekly",
//     value: "WEEKLY",
//     desc: "Process weekly leave increments",
//   },

//   {
//     label: "Monthly",
//     value: "MONTHLY",
//     desc: "Process monthly leave increments",
//   },

//   {
//     label: "Yearly",
//     value: "YEARLY",
//     desc: "Process yearly leave increments",
//   },
// ];

// // ======================================================

// const LeaveIncrementProcessorPage = () => {
//   // ======================================================

//   const [processing, setProcessing] = useState<string | null>(null);

//   const [result, setResult] = useState<any>(null);

//   // ======================================================
//   // PROCESS
//   // ======================================================

//   const handleProcess = async (frequency: string) => {
//     try {
//       setProcessing(frequency);

//       setResult(null);

//       const res = await axiosInstance.post(
//         "/leave/process-increment",

//         {
//           frequency,
//         },
//       );

//       setResult(res?.data?.data);

//       alert("Leave increment processed successfully");
//     } catch (err: any) {
//       console.log(err);

//       alert(err?.response?.data?.message || "Processing failed");
//     } finally {
//       setProcessing(null);
//     }
//   };

//   // ======================================================

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="leave-increment-page">
//           {/* ====================================================== */}
//           {/* HEADER */}
//           {/* ====================================================== */}

//           <div className="top-header">
//             <div>
//               <h1>Leave Increment Processor</h1>

//               <p>
//                 Process employee leave balance increments by frequency policy
//               </p>
//             </div>
//           </div>

//           {/* ====================================================== */}
//           {/* RESULT */}
//           {/* ====================================================== */}

//           {result && (
//             <div className="result-card">
//               <div className="result-header">
//                 <h2>Processing Result</h2>
//               </div>

//               <div className="result-grid">
//                 <div className="result-box">
//                   <span>Frequency</span>

//                   <h3>{result.frequency}</h3>
//                 </div>

//                 <div className="result-box">
//                   <span>Processed</span>

//                   <h3>{result.processed}</h3>
//                 </div>

//                 <div className="result-box">
//                   <span>Skipped</span>

//                   <h3>{result.skipped}</h3>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ====================================================== */}
//           {/* CARDS */}
//           {/* ====================================================== */}

//           <div className="frequency-grid">
//             {frequencies.map((item) => (
//               <div className="frequency-card" key={item.value}>
//                 {/* ====================================================== */}

//                 <div className="card-top">
//                   <div className="icon-box">{item.label.charAt(0)}</div>

//                   <div>
//                     <h2>{item.label}</h2>

//                     <p>{item.desc}</p>
//                   </div>
//                 </div>

//                 {/* ====================================================== */}

//                 <div className="card-middle">
//                   <div className="info-box">
//                     <span>Frequency</span>

//                     <strong>{item.value}</strong>
//                   </div>
//                 </div>

//                 {/* ====================================================== */}

//                 <button
//                   className="process-btn"
//                   disabled={processing === item.value}
//                   onClick={() => handleProcess(item.value)}
//                 >
//                   {processing === item.value
//                     ? "Processing..."
//                     : "Process Increment"}
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ====================================================== */}
//       {/* STYLE */}
//       {/* ====================================================== */}

//       <style jsx>{`
//         .leave-increment-page {
//           padding: 24px;
//         }

//         .top-header {
//           margin-bottom: 28px;
//         }

//         .top-header h1 {
//           font-size: 34px;

//           font-weight: 800;

//           color: #111827;

//           margin-bottom: 8px;
//         }

//         .top-header p {
//           color: #6b7280;

//           font-size: 15px;
//         }

//         .frequency-grid {
//           display: grid;

//           grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));

//           gap: 24px;
//         }

//         .frequency-card {
//           background: white;

//           border-radius: 28px;

//           padding: 24px;

//           border: 1px solid #e5e7eb;

//           box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

//           transition: 0.3s ease;
//         }

//         .frequency-card:hover {
//           transform: translateY(-4px);
//         }

//         .card-top {
//           display: flex;

//           gap: 16px;

//           align-items: flex-start;

//           margin-bottom: 24px;
//         }

//         .icon-box {
//           width: 60px;

//           height: 60px;

//           border-radius: 20px;

//           background: #111827;

//           color: white;

//           display: flex;

//           align-items: center;

//           justify-content: center;

//           font-size: 24px;

//           font-weight: 800;
//         }

//         .card-top h2 {
//           font-size: 24px;

//           font-weight: 800;

//           color: #111827;

//           margin-bottom: 6px;
//         }

//         .card-top p {
//           color: #6b7280;

//           font-size: 14px;

//           line-height: 1.6;
//         }

//         .card-middle {
//           margin-bottom: 24px;
//         }

//         .info-box {
//           background: #f9fafb;

//           border-radius: 20px;

//           padding: 18px;
//         }

//         .info-box span {
//           display: block;

//           font-size: 12px;

//           color: #6b7280;

//           margin-bottom: 8px;
//         }

//         .info-box strong {
//           font-size: 18px;

//           color: #111827;
//         }

//         .process-btn {
//           width: 100%;

//           height: 54px;

//           border: none;

//           border-radius: 18px;

//           background: #111827;

//           color: white;

//           font-size: 15px;

//           font-weight: 700;

//           cursor: pointer;

//           transition: 0.3s ease;
//         }

//         .process-btn:hover {
//           opacity: 0.9;
//         }

//         .process-btn:disabled {
//           opacity: 0.6;

//           cursor: not-allowed;
//         }

//         .result-card {
//           background: white;

//           border-radius: 28px;

//           padding: 24px;

//           margin-bottom: 28px;

//           border: 1px solid #e5e7eb;

//           box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
//         }

//         .result-header {
//           margin-bottom: 20px;
//         }

//         .result-header h2 {
//           font-size: 24px;

//           font-weight: 800;

//           color: #111827;
//         }

//         .result-grid {
//           display: grid;

//           grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));

//           gap: 18px;
//         }

//         .result-box {
//           background: #f9fafb;

//           border-radius: 20px;

//           padding: 20px;
//         }

//         .result-box span {
//           display: block;

//           font-size: 13px;

//           color: #6b7280;

//           margin-bottom: 10px;
//         }

//         .result-box h3 {
//           font-size: 28px;

//           font-weight: 800;

//           color: #111827;
//         }

//         @media (max-width: 768px) {
//           .leave-increment-page {
//             padding: 16px;
//           }

//           .top-header h1 {
//             font-size: 26px;
//           }

//           .frequency-grid {
//             grid-template-columns: 1fr;
//           }

//           .result-grid {
//             grid-template-columns: 1fr;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default LeaveIncrementProcessorPage;

// "use client";

// import React, {
//   useEffect,
//   useState,
// } from "react";

// import axiosInstance from "@/utils/axiosInstance";

// import {
//   CheckCircle2,
//   Clock3,
//   CalendarDays,
//   CalendarRange,
//   ShieldCheck,
//   Loader2,
//   History,
//   AlertTriangle,
// } from "lucide-react";

// // ======================================================

// const frequencies = [
//   {
//     label: "Daily",
//     value: "DAILY",
//     desc: "Process daily leave increments",
//     color: "#2563eb",
//     icon: <Clock3 size={22} />,
//   },

//   {
//     label: "Weekly",
//     value: "WEEKLY",
//     desc: "Process weekly leave increments",
//     color: "#7c3aed",
//     icon: <CalendarRange size={22} />,
//   },

//   {
//     label: "Monthly",
//     value: "MONTHLY",
//     desc: "Process monthly leave increments",
//     color: "#16a34a",
//     icon: <CalendarDays size={22} />,
//   },

//   {
//     label: "Yearly",
//     value: "YEARLY",
//     desc: "Process yearly leave increments",
//     color: "#ea580c",
//     icon: <ShieldCheck size={22} />,
//   },
// ];

// // ======================================================

// const LeaveIncrementProcessorPage = () => {
//   // ======================================================

//   const [processing, setProcessing] = useState<string | null>(null);

//   const [result, setResult] = useState<any>(null);

//   const [history, setHistory] = useState<any[]>([]);

//   const [stats, setStats] = useState<any>({});

//   const [showConfirm, setShowConfirm] = useState(false);

//   const [selectedFrequency, setSelectedFrequency] =
//     useState<any>(null);

//   // ======================================================
//   // FETCH HISTORY
//   // ======================================================

//   const fetchHistory = async () => {
//     try {
//       const res = await axiosInstance.get(
//         "/leave-increment-log?limit=5",
//       );

//       setHistory(res?.data?.data?.logs || []);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   // ======================================================
//   // FETCH POLICY STATS
//   // ======================================================

//   const fetchPolicyStats = async () => {
//     try {
//       const res = await axiosInstance.get(
//         "/leave-increment",
//       );

//       const policies = res?.data?.data || [];

//       const grouped: any = {};

//       frequencies.forEach((f) => {
//         grouped[f.value] = policies.filter(
//           (p: any) =>
//             p.frequency === f.value && p.isActive,
//         );
//       });

//       setStats(grouped);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   // ======================================================

//   useEffect(() => {
//     fetchHistory();

//     fetchPolicyStats();
//   }, []);

//   // ======================================================
//   // PROCESS
//   // ======================================================

//   const handleProcess = async () => {
//     if (!selectedFrequency) return;

//     try {
//       setProcessing(selectedFrequency.value);

//       setResult(null);

//       const res = await axiosInstance.post(
//         "/leave/process-increment",

//         {
//           frequency: selectedFrequency.value,
//         },
//       );

//       setResult(res?.data?.data);

//       fetchHistory();

//       setShowConfirm(false);
//     } catch (err: any) {
//       console.log(err);

//       alert(
//         err?.response?.data?.message ||
//           "Processing failed",
//       );
//     } finally {
//       setProcessing(null);
//     }
//   };

//   // ======================================================

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="leave-increment-page">
//           {/* ====================================================== */}
//           {/* HEADER */}
//           {/* ====================================================== */}

//           <div className="top-header">
//             <div>
//               <h1>Leave Increment Processor</h1>

//               <p>
//                 Process employee leave balances
//                 using automated increment
//                 policies
//               </p>
//             </div>
//           </div>

//           {/* ====================================================== */}
//           {/* INFO CARD */}
//           {/* ====================================================== */}

//           <div className="info-card">
//             <div className="info-icon">
//               <AlertTriangle size={24} />
//             </div>

//             <div>
//               <h3>
//                 Important Processing Information
//               </h3>

//               <p>
//                 This process will automatically
//                 increment employee leave balances
//                 based on active leave increment
//                 policies. Already processed
//                 increments will be skipped
//                 automatically.
//               </p>
//             </div>
//           </div>

//           {/* ====================================================== */}
//           {/* RESULT */}
//           {/* ====================================================== */}

//           {result && (
//             <div className="result-card">
//               <div className="result-header">
//                 <div>
//                   <h2>Processing Completed</h2>

//                   <p>
//                     Leave increment processed
//                     successfully
//                   </p>
//                 </div>

//                 <div className="success-icon">
//                   <CheckCircle2 size={30} />
//                 </div>
//               </div>

//               <div className="result-grid">
//                 <div className="result-box">
//                   <span>Frequency</span>

//                   <h3>{result.frequency}</h3>
//                 </div>

//                 <div className="result-box">
//                   <span>Processed</span>

//                   <h3>{result.processed}</h3>
//                 </div>

//                 <div className="result-box">
//                   <span>Skipped</span>

//                   <h3>{result.skipped}</h3>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ====================================================== */}
//           {/* GRID */}
//           {/* ====================================================== */}

//           <div className="main-grid">
//             {/* ====================================================== */}
//             {/* LEFT */}
//             {/* ====================================================== */}

//             <div>
//               <div className="frequency-grid">
//                 {frequencies.map((item) => {
//                   const policyCount =
//                     stats[item.value]?.length || 0;

//                   return (
//                     <div
//                       className="frequency-card"
//                       key={item.value}
//                     >
//                       {/* ====================================================== */}

//                       <div className="card-top">
//                         <div
//                           className="icon-box"
//                           style={{
//                             background:
//                               item.color,
//                           }}
//                         >
//                           {item.icon}
//                         </div>

//                         <div>
//                           <h2>{item.label}</h2>

//                           <p>{item.desc}</p>
//                         </div>
//                       </div>

//                       {/* ====================================================== */}

//                       <div className="policy-info">
//                         <div className="policy-count">
//                           <span>
//                             Active Policies
//                           </span>

//                           <strong>
//                             {policyCount}
//                           </strong>
//                         </div>

//                         <div className="policy-list">
//                           {policyCount ? (
//                             stats[item.value]
//                               .slice(0, 2)
//                               .map(
//                                 (
//                                   p: any,
//                                 ) => (
//                                   <div
//                                     className="policy-pill"
//                                     key={
//                                       p.id
//                                     }
//                                   >
//                                     {p.title ||
//                                       p
//                                         ?.leaveType
//                                         ?.name}
//                                   </div>
//                                 ),
//                               )
//                           ) : (
//                             <div className="no-policy">
//                               No active policy
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       {/* ====================================================== */}

//                       <button
//                         className="process-btn"
//                         disabled={
//                           processing ===
//                             item.value ||
//                           policyCount === 0
//                         }
//                         onClick={() => {
//                           setSelectedFrequency(
//                             item,
//                           );

//                           setShowConfirm(
//                             true,
//                           );
//                         }}
//                         style={{
//                           background:
//                             item.color,
//                         }}
//                       >
//                         {processing ===
//                         item.value ? (
//                           <div className="loading-box">
//                             <Loader2
//                               size={18}
//                               className="spin"
//                             />

//                             Processing...
//                           </div>
//                         ) : (
//                           "Process Increment"
//                         )}
//                       </button>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* ====================================================== */}
//             {/* RIGHT */}
//             {/* ====================================================== */}

//             <div>
//               <div className="history-card">
//                 <div className="history-header">
//                   <div className="history-title">
//                     <History size={20} />

//                     <h2>
//                       Recent Processing Logs
//                     </h2>
//                   </div>
//                 </div>

//                 <div className="history-list">
//                   {history.length ? (
//                     history.map(
//                       (item: any) => (
//                         <div
//                           className="history-item"
//                           key={item.id}
//                         >
//                           <div>
//                             <h4>
//                               {
//                                 item.frequency
//                               }
//                             </h4>

//                             <p>
//                               {
//                                 item
//                                   ?.employee
//                                   ?.name
//                               }
//                             </p>
//                           </div>

//                           <div className="history-right">
//                             <span>
//                               +
//                               {
//                                 item.amount
//                               }
//                             </span>

//                             <small>
//                               {new Date(
//                                 item.incrementDate,
//                               ).toLocaleDateString()}
//                             </small>
//                           </div>
//                         </div>
//                       ),
//                     )
//                   ) : (
//                     <div className="empty-history">
//                       No logs found
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ====================================================== */}
//           {/* CONFIRM MODAL */}
//           {/* ====================================================== */}

//           {showConfirm && selectedFrequency && (
//             <div className="modal-overlay">
//               <div className="confirm-modal">
//                 <div className="confirm-icon">
//                   <AlertTriangle size={28} />
//                 </div>

//                 <h2>
//                   Confirm Leave Increment
//                 </h2>

//                 <p>
//                   Are you sure you want to
//                   process{" "}
//                   <strong>
//                     {
//                       selectedFrequency.label
//                     }
//                   </strong>{" "}
//                   leave increments?
//                 </p>

//                 <div className="confirm-actions">
//                   <button
//                     className="cancel-btn"
//                     onClick={() =>
//                       setShowConfirm(
//                         false,
//                       )
//                     }
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     className="confirm-btn"
//                     onClick={
//                       handleProcess
//                     }
//                   >
//                     Confirm Process
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ====================================================== */}
//       {/* STYLE */}
//       {/* ====================================================== */}

//       <style jsx>{`
//         .leave-increment-page {
//           padding: 24px;
//         }

//         .top-header {
//           margin-bottom: 24px;
//         }

//         .top-header h1 {
//           font-size: 34px;
//           font-weight: 800;
//           color: #111827;
//           margin-bottom: 8px;
//         }

//         .top-header p {
//           color: #6b7280;
//           font-size: 15px;
//         }

//         .info-card {
//           background: #fff7ed;
//           border: 1px solid #fdba74;
//           border-radius: 24px;
//           padding: 22px;
//           display: flex;
//           gap: 18px;
//           margin-bottom: 28px;
//         }

//         .info-icon {
//           color: #ea580c;
//         }

//         .info-card h3 {
//           font-size: 18px;
//           font-weight: 800;
//           margin-bottom: 8px;
//           color: #9a3412;
//         }

//         .info-card p {
//           color: #7c2d12;
//           line-height: 1.7;
//         }

//         .main-grid {
//           display: grid;
//           grid-template-columns: 1fr 380px;
//           gap: 24px;
//         }

//         .frequency-grid {
//           display: grid;
//           grid-template-columns: repeat(
//             auto-fill,
//             minmax(320px, 1fr)
//           );
//           gap: 24px;
//         }

//         .frequency-card {
//           background: white;
//           border-radius: 28px;
//           padding: 24px;
//           border: 1px solid #e5e7eb;
//           box-shadow: 0 10px 30px
//             rgba(0, 0, 0, 0.05);
//         }

//         .card-top {
//           display: flex;
//           gap: 16px;
//           margin-bottom: 24px;
//         }

//         .icon-box {
//           width: 62px;
//           height: 62px;
//           border-radius: 20px;
//           color: white;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .card-top h2 {
//           font-size: 24px;
//           font-weight: 800;
//           margin-bottom: 6px;
//           color: #111827;
//         }

//         .card-top p {
//           color: #6b7280;
//           line-height: 1.6;
//         }

//         .policy-info {
//           margin-bottom: 22px;
//         }

//         .policy-count {
//           display: flex;
//           justify-content: space-between;
//           margin-bottom: 14px;
//         }

//         .policy-count span {
//           color: #6b7280;
//           font-size: 14px;
//         }

//         .policy-count strong {
//           font-size: 20px;
//           font-weight: 800;
//         }

//         .policy-list {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 10px;
//         }

//         .policy-pill {
//           background: #f3f4f6;
//           padding: 8px 12px;
//           border-radius: 999px;
//           font-size: 12px;
//           font-weight: 700;
//         }

//         .no-policy {
//           color: #dc2626;
//           font-size: 13px;
//           font-weight: 700;
//         }

//         .process-btn {
//           width: 100%;
//           height: 54px;
//           border: none;
//           border-radius: 18px;
//           color: white;
//           font-size: 15px;
//           font-weight: 700;
//           cursor: pointer;
//         }

//         .process-btn:disabled {
//           opacity: 0.6;
//           cursor: not-allowed;
//         }

//         .loading-box {
//           display: flex;
//           gap: 10px;
//           align-items: center;
//           justify-content: center;
//         }

//         .spin {
//           animation: spin 1s linear infinite;
//         }

//         @keyframes spin {
//           from {
//             transform: rotate(0deg);
//           }

//           to {
//             transform: rotate(360deg);
//           }
//         }

//         .history-card {
//           background: white;
//           border-radius: 28px;
//           padding: 24px;
//           border: 1px solid #e5e7eb;
//           position: sticky;
//           top: 20px;
//         }

//         .history-header {
//           margin-bottom: 20px;
//         }

//         .history-title {
//           display: flex;
//           gap: 10px;
//           align-items: center;
//         }

//         .history-title h2 {
//           font-size: 20px;
//           font-weight: 800;
//         }

//         .history-list {
//           display: flex;
//           flex-direction: column;
//           gap: 14px;
//         }

//         .history-item {
//           background: #f9fafb;
//           border-radius: 18px;
//           padding: 16px;
//           display: flex;
//           justify-content: space-between;
//         }

//         .history-item h4 {
//           font-size: 14px;
//           font-weight: 800;
//           margin-bottom: 6px;
//         }

//         .history-item p {
//           font-size: 13px;
//           color: #6b7280;
//         }

//         .history-right {
//           text-align: right;
//         }

//         .history-right span {
//           display: block;
//           font-size: 18px;
//           font-weight: 800;
//           color: #16a34a;
//           margin-bottom: 6px;
//         }

//         .history-right small {
//           color: #6b7280;
//         }

//         .empty-history {
//           text-align: center;
//           padding: 40px 10px;
//           color: #6b7280;
//         }

//         .result-card {
//           background: white;
//           border-radius: 28px;
//           padding: 24px;
//           margin-bottom: 28px;
//           border: 1px solid #dcfce7;
//           box-shadow: 0 10px 30px
//             rgba(0, 0, 0, 0.05);
//         }

//         .result-header {
//           display: flex;
//           justify-content: space-between;
//           margin-bottom: 22px;
//         }

//         .result-header h2 {
//           font-size: 24px;
//           font-weight: 800;
//           margin-bottom: 6px;
//         }

//         .result-header p {
//           color: #6b7280;
//         }

//         .success-icon {
//           color: #16a34a;
//         }

//         .result-grid {
//           display: grid;
//           grid-template-columns: repeat(
//             auto-fit,
//             minmax(180px, 1fr)
//           );
//           gap: 18px;
//         }

//         .result-box {
//           background: #f9fafb;
//           border-radius: 20px;
//           padding: 20px;
//         }

//         .result-box span {
//           display: block;
//           margin-bottom: 10px;
//           color: #6b7280;
//           font-size: 13px;
//         }

//         .result-box h3 {
//           font-size: 28px;
//           font-weight: 800;
//           color: #111827;
//         }

//         .modal-overlay {
//           position: fixed;
//           inset: 0;
//           background: rgba(0, 0, 0, 0.55);
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           z-index: 999;
//         }

//         .confirm-modal {
//           width: 100%;
//           max-width: 440px;
//           background: white;
//           border-radius: 28px;
//           padding: 32px;
//           text-align: center;
//         }

//         .confirm-icon {
//           width: 70px;
//           height: 70px;
//           background: #fff7ed;
//           color: #ea580c;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           margin: 0 auto 20px;
//         }

//         .confirm-modal h2 {
//           font-size: 28px;
//           font-weight: 800;
//           margin-bottom: 14px;
//         }

//         .confirm-modal p {
//           color: #6b7280;
//           line-height: 1.7;
//         }

//         .confirm-actions {
//           display: flex;
//           gap: 14px;
//           margin-top: 28px;
//         }

//         .cancel-btn,
//         .confirm-btn {
//           flex: 1;
//           height: 52px;
//           border: none;
//           border-radius: 16px;
//           font-size: 15px;
//           font-weight: 700;
//           cursor: pointer;
//         }

//         .cancel-btn {
//           background: #f3f4f6;
//         }

//         .confirm-btn {
//           background: #111827;
//           color: white;
//         }

//         @media (max-width: 1200px) {
//           .main-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         @media (max-width: 768px) {
//           .leave-increment-page {
//             padding: 16px;
//           }

//           .top-header h1 {
//             font-size: 26px;
//           }

//           .frequency-grid {
//             grid-template-columns: 1fr;
//           }

//           .confirm-actions {
//             flex-direction: column;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default LeaveIncrementProcessorPage;

"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

import {
  CheckCircle2,
  Clock3,
  CalendarDays,
  CalendarRange,
  ShieldCheck,
  Loader2,
  History,
  AlertTriangle,
} from "lucide-react";

// ======================================================

const frequencies = [
  {
    label: "Daily",
    value: "DAILY",
    desc: "Process daily leave increments",
    color: "#2563eb",
    icon: <Clock3 size={22} />,
  },

  {
    label: "Weekly",
    value: "WEEKLY",
    desc: "Process weekly leave increments",
    color: "#7c3aed",
    icon: <CalendarRange size={22} />,
  },

  {
    label: "Monthly",
    value: "MONTHLY",
    desc: "Process monthly leave increments",
    color: "#16a34a",
    icon: <CalendarDays size={22} />,
  },

  {
    label: "Yearly",
    value: "YEARLY",
    desc: "Process yearly leave increments",
    color: "#ea580c",
    icon: <ShieldCheck size={22} />,
  },
];

// ======================================================

const LeaveIncrementProcessorPage = () => {
  // ======================================================

  const [processing, setProcessing] = useState<string | null>(null);

  const [result, setResult] = useState<any>(null);

  const [history, setHistory] = useState<any[]>([]);

  const [stats, setStats] = useState<any>({});

  const [lastRun, setLastRun] = useState<any>({});

  const [showConfirm, setShowConfirm] = useState(false);

  const [selectedFrequency, setSelectedFrequency] = useState<any>(null);

  // ======================================================
  // FETCH HISTORY
  // ======================================================

  const fetchHistory = async () => {
    try {
      const res = await axiosInstance.get("/leave-increment-log?limit=5");

      setHistory(res?.data?.data?.logs || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // FETCH POLICY STATS
  // ======================================================

  const fetchPolicyStats = async () => {
    try {
      const res = await axiosInstance.get("/leave-increment");

      const policies = res?.data?.data || [];

      const grouped: any = {};

      frequencies.forEach((f) => {
        grouped[f.value] = policies.filter(
          (p: any) => p.frequency === f.value && p.isActive,
        );
      });

      setStats(grouped);
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // FETCH LAST RUN
  // ======================================================

  const fetchLastRun = async () => {
    try {
      const res = await axiosInstance.get("/leave-increment-log/last-run");

      setLastRun(res?.data?.data || {});
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // FORMAT LAST RUN
  // ======================================================

  const formatLastRun = (date: string) => {
    if (!date) return "Never";

    return new Date(date).toLocaleString();
  };

  // ======================================================

  useEffect(() => {
    fetchHistory();

    fetchPolicyStats();

    fetchLastRun();
  }, []);

  // ======================================================
  // PROCESS
  // ======================================================

  const handleProcess = async () => {
    if (!selectedFrequency) return;

    try {
      setProcessing(selectedFrequency.value);

      setResult(null);

      const res = await axiosInstance.post(
        "/leave/process-increment",

        {
          frequency: selectedFrequency.value,
        },
      );

      setResult(res?.data?.data);

      fetchHistory();

      fetchLastRun();

      setShowConfirm(false);
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Processing failed");
    } finally {
      setProcessing(null);
    }
  };

  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="leave-increment-page">
          {/* ====================================================== */}
          {/* HEADER */}
          {/* ====================================================== */}

          <div className="top-header">
            <div>
              <h1>Leave Increment Processor</h1>

              <p>
                Process employee leave balances using automated increment
                policies
              </p>
            </div>
          </div>

          {/* ====================================================== */}
          {/* INFO CARD */}
          {/* ====================================================== */}

          <div className="info-card">
            <div className="info-icon">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3>Important Processing Information</h3>

              <p>
                This process will automatically increment employee leave
                balances based on active leave increment policies. Already
                processed increments will be skipped automatically.
              </p>
            </div>
          </div>

          {/* ====================================================== */}
          {/* RESULT */}
          {/* ====================================================== */}

          {result && (
            <div className="result-card">
              <div className="result-header">
                <div>
                  <h2>Processing Completed</h2>

                  <p>Leave increment processed successfully</p>
                </div>

                <div className="success-icon">
                  <CheckCircle2 size={30} />
                </div>
              </div>

              <div className="result-grid">
                <div className="result-box">
                  <span>Frequency</span>

                  <h3>{result.frequency}</h3>
                </div>

                <div className="result-box">
                  <span>Processed</span>

                  <h3>{result.processed}</h3>
                </div>

                <div className="result-box">
                  <span>Skipped</span>

                  <h3>{result.skipped}</h3>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/* MAIN GRID */}
          {/* ====================================================== */}

          <div className="main-grid">
            {/* ====================================================== */}
            {/* LEFT */}
            {/* ====================================================== */}

            <div>
              <div className="frequency-grid">
                {frequencies.map((item) => {
                  const policyCount = stats[item.value]?.length || 0;

                  return (
                    <div className="frequency-card" key={item.value}>
                      {/* ====================================================== */}

                      <div className="card-top">
                        <div
                          className="icon-box"
                          style={{
                            background: item.color,
                          }}
                        >
                          {item.icon}
                        </div>

                        <div>
                          <h2>{item.label}</h2>

                          <p>{item.desc}</p>
                        </div>
                      </div>

                      {/* ====================================================== */}

                      <div className="policy-info">
                        <div className="policy-count">
                          <span>Active Policies</span>

                          <strong>{policyCount}</strong>
                        </div>

                        <div className="policy-list">
                          {policyCount ? (
                            stats[item.value].slice(0, 2).map((p: any) => (
                              <div className="policy-pill" key={p.id}>
                                {p.title || p?.leaveType?.name}
                              </div>
                            ))
                          ) : (
                            <div className="no-policy">No active policy</div>
                          )}
                        </div>

                        {/* ====================================================== */}
                        {/* LAST RUN */}
                        {/* ====================================================== */}

                        <div className="last-run-box">
                          <span>Last Processed</span>

                          <strong>
                            {formatLastRun(
                              lastRun?.[item.value]?.incrementDate,
                            )}
                          </strong>
                        </div>
                      </div>

                      {/* ====================================================== */}

                      <button
                        className="process-btn"
                        disabled={
                          processing === item.value || policyCount === 0
                        }
                        onClick={() => {
                          setSelectedFrequency(item);

                          setShowConfirm(true);
                        }}
                        style={{
                          background: item.color,
                        }}
                      >
                        {processing === item.value ? (
                          <div className="loading-box">
                            <Loader2 size={18} className="spin" />
                            Processing...
                          </div>
                        ) : (
                          "Process Increment"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ====================================================== */}
            {/* RIGHT */}
            {/* ====================================================== */}

            <div>
              <div className="history-card">
                <div className="history-header">
                  <div className="history-title">
                    <History size={20} />

                    <h2>Recent Processing Logs</h2>
                  </div>
                </div>

                <div className="history-list">
                  {history.length ? (
                    history.map((item: any) => (
                      <div className="history-item" key={item.id}>
                        <div>
                          <h4>{item.frequency}</h4>

                          <p>{item?.employee?.name}</p>
                        </div>

                        <div className="history-right">
                          <span>+{item.amount}</span>

                          <small>
                            {new Date(item.incrementDate).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-history">No logs found</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================== */}
          {/* CONFIRM MODAL */}
          {/* ====================================================== */}

          {showConfirm && selectedFrequency && (
            <div className="modal-overlay">
              <div className="confirm-modal">
                <div className="confirm-icon">
                  <AlertTriangle size={28} />
                </div>

                <h2>Confirm Leave Increment</h2>

                <p>
                  Are you sure you want to process
                  <strong> {selectedFrequency.label} </strong>
                  leave increments?
                </p>

                <div className="confirm-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>

                  <button className="confirm-btn" onClick={handleProcess}>
                    Confirm Process
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================== */}
      {/* STYLE */}
      {/* ====================================================== */}

      <style jsx>{`
        .leave-increment-page {
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

        .info-card {
          background: #fff7ed;
          border: 1px solid #fdba74;
          border-radius: 24px;
          padding: 22px;
          display: flex;
          gap: 18px;
          margin-bottom: 28px;
        }

        .info-icon {
          color: #ea580c;
        }

        .info-card h3 {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 8px;
          color: #9a3412;
        }

        .info-card p {
          color: #7c2d12;
          line-height: 1.7;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
        }

        .frequency-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .frequency-card {
          background: white;
          border-radius: 28px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .card-top {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .icon-box {
          width: 62px;
          height: 62px;
          border-radius: 20px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-top h2 {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 6px;
          color: #111827;
        }

        .card-top p {
          color: #6b7280;
          line-height: 1.6;
        }

        .policy-info {
          margin-bottom: 22px;
        }

        .policy-count {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .policy-count span {
          color: #6b7280;
          font-size: 14px;
        }

        .policy-count strong {
          font-size: 20px;
          font-weight: 800;
        }

        .policy-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .policy-pill {
          background: #f3f4f6;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .no-policy {
          color: #dc2626;
          font-size: 13px;
          font-weight: 700;
        }

        .last-run-box {
          background: #f9fafb;
          border-radius: 16px;
          padding: 14px;
          margin-top: 14px;
        }

        .last-run-box span {
          display: block;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 6px;
        }

        .last-run-box strong {
          font-size: 14px;
          color: #111827;
          font-weight: 700;
          line-height: 1.5;
        }

        .process-btn {
          width: 100%;
          height: 54px;
          border: none;
          border-radius: 18px;
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .process-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-box {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: center;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .history-card {
          background: white;
          border-radius: 28px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          position: sticky;
          top: 20px;
        }

        .history-header {
          margin-bottom: 20px;
        }

        .history-title {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .history-title h2 {
          font-size: 20px;
          font-weight: 800;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .history-item {
          background: #f9fafb;
          border-radius: 18px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
        }

        .history-item h4 {
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .history-item p {
          font-size: 13px;
          color: #6b7280;
        }

        .history-right {
          text-align: right;
        }

        .history-right span {
          display: block;
          font-size: 18px;
          font-weight: 800;
          color: #16a34a;
          margin-bottom: 6px;
        }

        .history-right small {
          color: #6b7280;
        }

        .empty-history {
          text-align: center;
          padding: 40px 10px;
          color: #6b7280;
        }

        .result-card {
          background: white;
          border-radius: 28px;
          padding: 24px;
          margin-bottom: 28px;
          border: 1px solid #dcfce7;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .result-header h2 {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .result-header p {
          color: #6b7280;
        }

        .success-icon {
          color: #16a34a;
        }

        .result-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 18px;
        }

        .result-box {
          background: #f9fafb;
          border-radius: 20px;
          padding: 20px;
        }

        .result-box span {
          display: block;
          margin-bottom: 10px;
          color: #6b7280;
          font-size: 13px;
        }

        .result-box h3 {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }

        .confirm-modal {
          width: 100%;
          max-width: 440px;
          background: white;
          border-radius: 28px;
          padding: 32px;
          text-align: center;
        }

        .confirm-icon {
          width: 70px;
          height: 70px;
          background: #fff7ed;
          color: #ea580c;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .confirm-modal h2 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .confirm-modal p {
          color: #6b7280;
          line-height: 1.7;
        }

        .confirm-actions {
          display: flex;
          gap: 14px;
          margin-top: 28px;
        }

        .cancel-btn,
        .confirm-btn {
          flex: 1;
          height: 52px;
          border: none;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .cancel-btn {
          background: #f3f4f6;
        }

        .confirm-btn {
          background: #111827;
          color: white;
        }

        @media (max-width: 1200px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .leave-increment-page {
            padding: 16px;
          }

          .top-header h1 {
            font-size: 26px;
          }

          .frequency-grid {
            grid-template-columns: 1fr;
          }

          .confirm-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default LeaveIncrementProcessorPage;
