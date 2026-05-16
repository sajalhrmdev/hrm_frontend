// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// import axiosInstance from "@/utils/axiosInstance";

// type PayrollRun = {
//   id: number;

//   month: number;

//   year: number;

//   status: "DRAFT" | "FINAL";

//   createdAt: string;

//   _count: {
//     payrolls: number;
//   };
// };

// const PayrollRunPage = () => {
//   const router = useRouter();

//   const [runs, setRuns] = useState<PayrollRun[]>([]);

//   const [loading, setLoading] = useState(false);

//   const [generateLoadingId, setGenerateLoadingId] = useState<number | null>(
//     null,
//   );

//   const [showModal, setShowModal] = useState(false);

//   const [formData, setFormData] = useState({
//     month: "",
//     year: "",
//   });

//   // ============================================
//   // FETCH RUNS
//   // ============================================

//   const fetchRuns = async () => {
//     try {
//       setLoading(true);

//       const res = await axiosInstance.get("/payroll/run");

//       setRuns(res.data.data || []);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRuns();
//   }, []);

//   // ============================================
//   // CREATE PAYROLL RUN
//   // ============================================

//   const handleCreate = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const res = await axiosInstance.post("/payroll/run", {
//         month: Number(formData.month),

//         year: Number(formData.year),
//       });

//       alert(res?.data?.message || "Payroll generated successfully");

//       setShowModal(false);

//       setFormData({
//         month: "",
//         year: "",
//       });

//       fetchRuns();
//     } catch (err: any) {
//       console.log(err);

//       alert(err?.response?.data?.message);
//     }
//   };

//   // ============================================
//   // GENERATE PAYROLL
//   // ============================================

//   const handleGenerate = async (id: number) => {
//     const confirmGenerate = window.confirm("Generate payroll?");

//     if (!confirmGenerate) return;

//     try {
//       setGenerateLoadingId(id);

//       const res = await axiosInstance.post(`/payroll/run/${id}/generate`);

//       alert(res?.data?.message || "Payroll generated successfully");

//       // 👇 no await
//       fetchRuns();
//     } catch (err: any) {
//       console.log(err);

//       alert(err?.response?.data?.message || "Failed to generate payroll");
//     } finally {
//       setGenerateLoadingId(null);
//     }
//   };

//   // ============================================
//   // MONTH NAME
//   // ============================================

//   const getMonthName = (month: number) => {
//     return new Date(2026, month - 1).toLocaleString("en-IN", {
//       month: "long",
//     });
//   };

//   return (
//     <div className="container py-4">
//       {/* HEADER */}

//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <div>
//           <h3 className="fw-bold mb-1">💰 Payroll Runs</h3>

//           <p className="text-muted mb-0">Manage payroll batches</p>
//         </div>

//         <button className="btn btn-primary" onClick={() => setShowModal(true)}>
//           ➕ Create Payroll Run
//         </button>
//       </div>

//       {/* TABLE */}

//       <div className="card border-0 shadow-sm">
//         <div className="card-body">
//           {loading ? (
//             <div className="text-center py-4">
//               <p className="mb-0">Loading...</p>
//             </div>
//           ) : (
//             <div className="table-responsive">
//               <table className="table table-bordered align-middle">
//                 <thead className="table-light">
//                   <tr>
//                     <th>#</th>

//                     <th>Month</th>

//                     <th>Year</th>

//                     <th>Status</th>

//                     <th>Employees</th>

//                     <th>Created</th>

//                     <th style={{ width: "220px" }}>Action</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {runs.length === 0 ? (
//                     <tr>
//                       <td colSpan={7} className="text-center py-4">
//                         No payroll run found
//                       </td>
//                     </tr>
//                   ) : (
//                     runs.map((item, index) => (
//                       <tr key={item.id}>
//                         <td>{index + 1}</td>

//                         <td>{getMonthName(item.month)}</td>

//                         <td>{item.year}</td>

//                         <td>
//                           <span
//                             className={`badge ${
//                               item.status === "FINAL"
//                                 ? "bg-success"
//                                 : "bg-warning text-dark"
//                             }`}
//                           >
//                             {item.status}
//                           </span>
//                         </td>

//                         <td>{item._count.payrolls}</td>

//                         <td>
//                           {new Date(item.createdAt).toLocaleDateString("en-IN")}
//                         </td>

//                         <td>
//                           <div className="d-flex gap-2">
//                             {/* GENERATE */}

//                             <button
//                               className="btn btn-success btn-sm"
//                               disabled={generateLoadingId === item.id}
//                               onClick={() => handleGenerate(item.id)}
//                             >
//                               {generateLoadingId === item.id
//                                 ? "Generating..."
//                                 : "⚡ Generate"}
//                             </button>

//                             {/* VIEW */}

//                             <button
//                               className="btn btn-dark btn-sm"
//                               onClick={() =>
//                                 router.push(`/payroll/run/${item.id}`)
//                               }
//                             >
//                               👁 View
//                             </button>

//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* MODAL */}

//       {showModal && (
//         <div
//           className="modal d-block"
//           tabIndex={-1}
//           style={{
//             background: "rgba(0,0,0,0.5)",
//           }}
//         >
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <form onSubmit={handleCreate}>
//                 {/* HEADER */}

//                 <div className="modal-header">
//                   <h5 className="modal-title">➕ Create Payroll Run</h5>

//                   <button
//                     type="button"
//                     className="btn-close"
//                     onClick={() => setShowModal(false)}
//                   />
//                 </div>

//                 {/* BODY */}

//                 <div className="modal-body">
//                   {/* MONTH */}

//                   <div className="mb-3">
//                     <label className="form-label">Month</label>

//                     <select
//                       className="form-select"
//                       value={formData.month}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,

//                           month: e.target.value,
//                         })
//                       }
//                     >
//                       <option value="">Select Month</option>

//                       {Array.from({
//                         length: 12,
//                       }).map((_, index) => (
//                         <option key={index} value={index + 1}>
//                           {new Date(2026, index).toLocaleString("en-IN", {
//                             month: "long",
//                           })}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* YEAR */}

//                   <div className="mb-3">
//                     <label className="form-label">Year</label>

//                     <input
//                       type="number"
//                       className="form-control"
//                       placeholder="2026"
//                       value={formData.year}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,

//                           year: e.target.value,
//                         })
//                       }
//                     />
//                   </div>
//                 </div>

//                 {/* FOOTER */}

//                 <div className="modal-footer">
//                   <button
//                     type="button"
//                     className="btn btn-secondary"
//                     onClick={() => setShowModal(false)}
//                   >
//                     Close
//                   </button>

//                   <button type="submit" className="btn btn-primary">
//                     Save
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PayrollRunPage;

"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import axiosInstance from "@/utils/axiosInstance";

// ============================================
// TYPES
// ============================================

type PayrollRun = {
  id: number;

  title?: string;

  periodStart: string;

  periodEnd: string;

  status: "DRAFT" | "FINALIZED";

  createdAt: string;

  _count: {
    payrolls: number;
  };
};

const PayrollRunPage = () => {
  const router = useRouter();

  const [runs, setRuns] = useState<PayrollRun[]>([]);

  const [loading, setLoading] = useState(false);

  const [generateLoadingId, setGenerateLoadingId] = useState<number | null>(
    null,
  );

  const [showModal, setShowModal] = useState(false);

  // ============================================
  // FORM DATA
  // ============================================

  const [formData, setFormData] = useState({
    title: "",

    periodStart: "",

    periodEnd: "",
  });

  // ============================================
  // FETCH RUNS
  // ============================================

  const fetchRuns = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/payroll/run");

      setRuns(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  // ============================================
  // CREATE PAYROLL RUN
  // ============================================

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("/payroll/run", {
        title: formData.title,

        periodStart: formData.periodStart,

        periodEnd: formData.periodEnd,
      });

      alert(res?.data?.message || "Payroll run created successfully");

      // ======================================
      // RESET
      // ======================================

      setFormData({
        title: "",

        periodStart: "",

        periodEnd: "",
      });

      setShowModal(false);

      fetchRuns();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to create payroll run");
    }
  };

  // ============================================
  // GENERATE PAYROLL
  // ============================================

  const handleGenerate = async (id: number) => {
    const confirmGenerate = window.confirm("Generate payroll?");

    if (!confirmGenerate) return;

    try {
      setGenerateLoadingId(id);

      const res = await axiosInstance.post(`/payroll/run/${id}/generate`);

      alert(res?.data?.message || "Payroll generated successfully");

      fetchRuns();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to generate payroll");
    } finally {
      setGenerateLoadingId(null);
    }
  };

  // ============================================
  // FORMAT DATE
  // ============================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",

      month: "short",

      year: "numeric",
    });
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container py-4">
          {/* ====================================== */}
          {/* HEADER */}
          {/* ====================================== */}

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-1">💰 Payroll Runs</h3>

              <p className="text-muted mb-0">Manage payroll batches</p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              ➕ Create Payroll Run
            </button>
          </div>

          {/* ====================================== */}
          {/* TABLE */}
          {/* ====================================== */}

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">Loading...</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>

                        <th>Payroll Period</th>

                        <th>Status</th>

                        <th>Employees</th>

                        <th>Created</th>

                        <th
                          style={{
                            width: "240px",
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {runs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-5">
                            No payroll run found
                          </td>
                        </tr>
                      ) : (
                        runs.map((item, index) => (
                          <tr key={item.id}>
                            <td>{index + 1}</td>

                            {/* PERIOD */}

                            <td>
                              <div className="fw-semibold">
                                {formatDate(item.periodStart)} →{" "}
                                {formatDate(item.periodEnd)}
                              </div>

                              <small className="text-muted">
                                {item.title || "-"}
                              </small>
                            </td>

                            {/* STATUS */}

                            <td>
                              <span
                                className={`badge ${
                                  item.status === "FINALIZED"
                                    ? "bg-success"
                                    : "bg-warning text-dark"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>

                            {/* PAYROLL COUNT */}

                            <td>{item._count.payrolls}</td>

                            {/* CREATED */}

                            <td>{formatDate(item.createdAt)}</td>

                            {/* ACTION */}

                            <td>
                              <div className="d-flex gap-2">
                                {/* GENERATE */}

                                <button
                                  className="btn btn-success btn-sm"
                                  disabled={generateLoadingId === item.id}
                                  onClick={() => handleGenerate(item.id)}
                                >
                                  {generateLoadingId === item.id
                                    ? "Generating..."
                                    : "⚡ Generate"}
                                </button>

                                {/* VIEW */}

                                <button
                                  className="btn btn-dark btn-sm"
                                  onClick={() =>
                                    router.push(`/payroll/run/${item.id}`)
                                  }
                                >
                                  👁 View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ====================================== */}
          {/* MODAL */}
          {/* ====================================== */}

          {showModal && (
            <div
              className="modal d-block"
              tabIndex={-1}
              style={{
                background: "rgba(0,0,0,0.5)",
              }}
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <form onSubmit={handleCreate}>
                    {/* HEADER */}

                    <div className="modal-header">
                      <h5 className="modal-title">➕ Create Payroll Run</h5>

                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowModal(false)}
                      />
                    </div>

                    {/* BODY */}

                    <div className="modal-body">
                      {/* TITLE */}

                      <div className="mb-3">
                        <label className="form-label">Title</label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="16 Apr - 15 May Payroll"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({
                              ...formData,

                              title: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* PERIOD START */}

                      <div className="mb-3">
                        <label className="form-label">Period Start</label>

                        <input
                          type="date"
                          className="form-control"
                          value={formData.periodStart}
                          onChange={(e) =>
                            setFormData({
                              ...formData,

                              periodStart: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* PERIOD END */}

                      <div className="mb-3">
                        <label className="form-label">Period End</label>

                        <input
                          type="date"
                          className="form-control"
                          value={formData.periodEnd}
                          onChange={(e) =>
                            setFormData({
                              ...formData,

                              periodEnd: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* FOOTER */}

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowModal(false)}
                      >
                        Close
                      </button>

                      <button type="submit" className="btn btn-primary">
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollRunPage;
