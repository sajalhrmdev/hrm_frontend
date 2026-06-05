// "use client";

// import React, { useEffect, useMemo, useState } from "react";

// import axiosInstance from "@/utils/axiosInstance";

// // ======================================================

// const days = [
//   {
//     label: "Sunday",
//     value: 0,
//   },
//   {
//     label: "Monday",
//     value: 1,
//   },
//   {
//     label: "Tuesday",
//     value: 2,
//   },
//   {
//     label: "Wednesday",
//     value: 3,
//   },
//   {
//     label: "Thursday",
//     value: 4,
//   },
//   {
//     label: "Friday",
//     value: 5,
//   },
//   {
//     label: "Saturday",
//     value: 6,
//   },
// ];

// const weekOptions = [
//   {
//     label: "Every Week",
//     value: null,
//   },
//   {
//     label: "1st Week",
//     value: 1,
//   },
//   {
//     label: "2nd Week",
//     value: 2,
//   },
//   {
//     label: "3rd Week",
//     value: 3,
//   },
//   {
//     label: "4th Week",
//     value: 4,
//   },
//   {
//     label: "5th Week",
//     value: 5,
//   },
// ];

// // ======================================================

// const WorkSchedulePolicyPage = () => {
//   // ======================================================

//   const [loading, setLoading] = useState(false);

//   const [policies, setPolicies] = useState<any[]>([]);

//   const [shifts, setShifts] = useState<any[]>([]);

//   const [search, setSearch] = useState("");

//   const [showModal, setShowModal] = useState(false);

//   const [editingPolicy, setEditingPolicy] = useState<any>(null);

//   // ======================================================

//   const [formData, setFormData] = useState({
//     title: "",

//     description: "",

//     shiftId: "",

//     isActive: true,

//     weeklyOffPattern: [],
//   });

//   // ======================================================
//   // FETCH
//   // ======================================================

//   const fetchPolicies = async () => {
//     try {
//       setLoading(true);

//       const res = await axiosInstance.get("/work-schedule-policy");

//       setPolicies(res?.data?.data || []);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ======================================================

//   const fetchShifts = async () => {
//     try {
//       const res = await axiosInstance.get("/shift");

//       setShifts(res?.data?.data?.shifts || []);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   // ======================================================

//   useEffect(() => {
//     fetchPolicies();

//     fetchShifts();
//   }, []);

//   // ======================================================
//   // FILTER
//   // ======================================================

//   const filteredPolicies = useMemo(() => {
//     return policies.filter((item: any) =>
//       item?.title?.toLowerCase().includes(search.toLowerCase()),
//     );
//   }, [policies, search]);

//   // ======================================================
//   // OPEN CREATE
//   // ======================================================

//   const handleOpenCreate = () => {
//     setEditingPolicy(null);

//     setFormData({
//       title: "",

//       description: "",

//       shiftId: "",

//       isActive: true,

//       weeklyOffPattern: [],
//     });

//     setShowModal(true);
//   };

//   // ======================================================
//   // OPEN EDIT
//   // ======================================================

//   const handleOpenEdit = (policy: any) => {
//     setEditingPolicy(policy);

//     setFormData({
//       title: policy?.title || "",

//       description: policy?.description || "",

//       shiftId: policy?.shiftId || "",

//       isActive: policy?.isActive,

//       weeklyOffPattern: policy?.weeklyOffPattern || [],
//     });

//     setShowModal(true);
//   };

//   // ======================================================
//   // ADD WEEKLY OFF
//   // ======================================================

//   const addWeeklyOff = () => {
//     setFormData((prev: any) => ({
//       ...prev,

//       weeklyOffPattern: [
//         ...prev.weeklyOffPattern,

//         {
//           day: 0,

//           weekNumber: null,
//         },
//       ],
//     }));
//   };

//   // ======================================================
//   // REMOVE
//   // ======================================================

//   const removeWeeklyOff = (index: number) => {
//     const updated = [...formData.weeklyOffPattern];

//     updated.splice(index, 1);

//     setFormData({
//       ...formData,

//       weeklyOffPattern: updated,
//     });
//   };

//   // ======================================================
//   // CHANGE
//   // ======================================================

//   const updateWeeklyOff = (
//     index: number,

//     key: string,

//     value: any,
//   ) => {
//     const updated = [...formData.weeklyOffPattern];

//     updated[index][key] = value;

//     setFormData({
//       ...formData,

//       weeklyOffPattern: updated,
//     });
//   };

//   // ======================================================
//   // SAVE
//   // ======================================================

//   const handleSubmit = async () => {
//     try {
//       if (!formData.title) {
//         return alert("Title required");
//       }

//       const payload = {
//         ...formData,

//         shiftId: formData.shiftId || null,
//       };

//       if (editingPolicy) {
//         await axiosInstance.patch(
//           `/work-schedule-policy/${editingPolicy.id}`,

//           payload,
//         );
//       } else {
//         await axiosInstance.post(
//           "/work-schedule-policy",

//           payload,
//         );
//       }

//       setShowModal(false);

//       fetchPolicies();
//     } catch (err: any) {
//       console.log(err);

//       alert(err?.response?.data?.message || "Something went wrong");
//     }
//   };

//   // ======================================================
//   // DELETE
//   // ======================================================

//   const handleDelete = async (id: number) => {
//     const confirmDelete = confirm("Delete this policy?");

//     if (!confirmDelete) return;

//     try {
//       await axiosInstance.delete(`/work-schedule-policy/${id}`);

//       fetchPolicies();
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   // ======================================================
//   // FORMAT
//   // ======================================================

//   const formatWeeklyOff = (rules: any[]) => {
//     if (!rules?.length) return "--";

//     return rules
//       .map((r: any) => {
//         const day = days.find((d) => d.value === r.day)?.label;

//         if (r.weekNumber) {
//           return `${r.weekNumber} ${day}`;
//         }

//         return `Every ${day}`;
//       })
//       .join(", ");
//   };

//   // ======================================================

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="policy-page">
//           {/* ====================================================== */}
//           {/* HEADER */}
//           {/* ====================================================== */}

//           <div className="top-header">
//             <div>
//               <h1>Work Schedule Policy</h1>

//               <p>Manage shift + weekly off schedule policies</p>
//             </div>

//             <button className="create-btn" onClick={handleOpenCreate}>
//               + Create Policy
//             </button>
//           </div>

//           {/* ====================================================== */}
//           {/* FILTER */}
//           {/* ====================================================== */}

//           <div className="filter-card">
//             <input
//               type="text"
//               placeholder="Search policy..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>

//           {/* ====================================================== */}
//           {/* TABLE */}
//           {/* ====================================================== */}

//           <div className="table-card">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Policy</th>

//                   <th>Shift</th>

//                   <th>Weekly Off</th>

//                   <th>Status</th>

//                   <th>Actions</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan={5}>Loading...</td>
//                   </tr>
//                 ) : filteredPolicies.length ? (
//                   filteredPolicies.map((item: any) => (
//                     <tr key={item.id}>
//                       <td>
//                         <div className="policy-info">
//                           <h4>{item.title}</h4>

//                           <p>{item.description || "--"}</p>
//                         </div>
//                       </td>

//                       <td>{item?.shift?.title || "--"}</td>

//                       <td>{formatWeeklyOff(item.weeklyOffPattern)}</td>

//                       <td>
//                         <span
//                           className={`status-badge ${item.isActive ? "active" : "inactive"}`}
//                         >
//                           {item.isActive ? "ACTIVE" : "INACTIVE"}
//                         </span>
//                       </td>

//                       <td>
//                         <div className="action-group">
//                           <button
//                             className="edit-btn"
//                             onClick={() => handleOpenEdit(item)}
//                           >
//                             Edit
//                           </button>

//                           <button
//                             className="delete-btn"
//                             onClick={() => handleDelete(item.id)}
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={5}>No policy found</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* ====================================================== */}
//           {/* MODAL */}
//           {/* ====================================================== */}

//           {showModal && (
//             <div className="modal-overlay">
//               <div className="modal-box">
//                 <div className="modal-header">
//                   <div>
//                     <h2>{editingPolicy ? "Edit Policy" : "Create Policy"}</h2>

//                     <p>Configure weekly off & shift rules</p>
//                   </div>

//                   <button onClick={() => setShowModal(false)}>✖</button>
//                 </div>

//                 {/* ====================================================== */}

//                 <div className="form-grid">
//                   <div className="form-group full">
//                     <label>Policy Title</label>

//                     <input
//                       type="text"
//                       value={formData.title}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,

//                           title: e.target.value,
//                         })
//                       }
//                     />
//                   </div>

//                   <div className="form-group full">
//                     <label>Description</label>

//                     <textarea
//                       rows={3}
//                       value={formData.description}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,

//                           description: e.target.value,
//                         })
//                       }
//                     />
//                   </div>

//                   <div className="form-group full">
//                     <label>Shift</label>

//                     <select
//                       value={formData.shiftId}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,

//                           shiftId: e.target.value,
//                         })
//                       }
//                     >
//                       <option value="">Select Shift</option>

//                       {shifts?.map((shift: any) => (
//                         <option key={shift.id} value={shift.id}>
//                           {shift.title}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 {/* ====================================================== */}
//                 {/* WEEKLY OFF */}
//                 {/* ====================================================== */}

//                 <div className="weekly-header">
//                   <h3>Weekly Off Rules</h3>

//                   <button onClick={addWeeklyOff}>+ Add</button>
//                 </div>

//                 <div className="weekly-wrapper">
//                   {formData.weeklyOffPattern.map(
//                     (
//                       item: any,

//                       index: number,
//                     ) => (
//                       <div className="weekly-card" key={index}>
//                         <select
//                           value={item.day}
//                           onChange={(e) =>
//                             updateWeeklyOff(
//                               index,

//                               "day",

//                               Number(e.target.value),
//                             )
//                           }
//                         >
//                           {days.map((d) => (
//                             <option key={d.value} value={d.value}>
//                               {d.label}
//                             </option>
//                           ))}
//                         </select>

//                         <select
//                           value={item.weekNumber ?? ""}
//                           onChange={(e) =>
//                             updateWeeklyOff(
//                               index,

//                               "weekNumber",

//                               e.target.value === ""
//                                 ? null
//                                 : Number(e.target.value),
//                             )
//                           }
//                         >
//                           {weekOptions.map((w) => (
//                             <option key={String(w.value)} value={w.value ?? ""}>
//                               {w.label}
//                             </option>
//                           ))}
//                         </select>

//                         <button
//                           className="remove-btn"
//                           onClick={() => removeWeeklyOff(index)}
//                         >
//                           ✖
//                         </button>
//                       </div>
//                     ),
//                   )}
//                 </div>

//                 {/* ====================================================== */}

//                 <div className="toggle-box">
//                   <input
//                     type="checkbox"
//                     checked={formData.isActive}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,

//                         isActive: e.target.checked,
//                       })
//                     }
//                   />

//                   <label>Active Policy</label>
//                 </div>

//                 {/* ====================================================== */}

//                 <div className="modal-footer">
//                   <button
//                     className="cancel-btn"
//                     onClick={() => setShowModal(false)}
//                   >
//                     Cancel
//                   </button>

//                   <button className="save-btn" onClick={handleSubmit}>
//                     {editingPolicy ? "Update Policy" : "Create Policy"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ====================================================== */}
//           {/* STYLE */}
//           {/* ====================================================== */}

//           <style jsx>{`
//             .policy-page {
//               padding: 24px;
//             }

//             .top-header {
//               display: flex;

//               justify-content: space-between;

//               align-items: center;

//               gap: 20px;

//               margin-bottom: 24px;
//             }

//             .top-header h1 {
//               font-size: 32px;

//               font-weight: 800;

//               color: #111827;

//               margin-bottom: 6px;
//             }

//             .top-header p {
//               color: #6b7280;
//             }

//             .create-btn {
//               height: 52px;

//               border: none;

//               background: #111827;

//               color: white;

//               padding: 0 22px;

//               border-radius: 14px;

//               font-weight: 700;

//               cursor: pointer;
//             }

//             .filter-card {
//               margin-bottom: 24px;
//             }

//             .filter-card input {
//               width: 100%;

//               height: 52px;

//               border-radius: 14px;

//               border: 1px solid #d1d5db;

//               padding: 0 16px;

//               outline: none;
//             }

//             .table-card {
//               background: white;

//               border-radius: 24px;

//               overflow: auto;

//               border: 1px solid #e5e7eb;
//             }

//             table {
//               width: 100%;

//               border-collapse: collapse;
//             }

//             th {
//               background: #f9fafb;

//               padding: 18px;

//               text-align: left;

//               font-size: 13px;

//               font-weight: 800;
//             }

//             td {
//               padding: 18px;

//               border-top: 1px solid #f3f4f6;
//             }

//             .policy-info h4 {
//               margin: 0;

//               font-size: 15px;
//             }

//             .policy-info p {
//               margin: 4px 0 0;

//               color: #6b7280;

//               font-size: 13px;
//             }

//             .status-badge {
//               padding: 8px 14px;

//               border-radius: 999px;

//               font-size: 12px;

//               font-weight: 700;
//             }

//             .status-badge.active {
//               background: #dcfce7;

//               color: #166534;
//             }

//             .status-badge.inactive {
//               background: #fee2e2;

//               color: #991b1b;
//             }

//             .action-group {
//               display: flex;

//               gap: 10px;
//             }

//             .edit-btn,
//             .delete-btn {
//               border: none;

//               height: 40px;

//               padding: 0 14px;

//               border-radius: 10px;

//               font-weight: 700;

//               cursor: pointer;
//             }

//             .edit-btn {
//               background: #111827;

//               color: white;
//             }

//             .delete-btn {
//               background: #fee2e2;

//               color: #991b1b;
//             }

//             .modal-overlay {
//               position: fixed;

//               inset: 0;

//               background: rgba(0, 0, 0, 0.5);

//               display: flex;

//               justify-content: center;

//               align-items: center;

//               z-index: 9999;

//               padding: 20px;
//             }

//             .modal-box {
//               width: 100%;

//               max-width: 900px;

//               background: white;

//               border-radius: 28px;

//               padding: 28px;

//               max-height: 90vh;

//               overflow-y: auto;
//             }

//             .modal-header {
//               display: flex;

//               justify-content: space-between;

//               align-items: center;

//               margin-bottom: 24px;
//             }

//             .modal-header h2 {
//               font-size: 26px;

//               font-weight: 800;

//               margin-bottom: 6px;
//             }

//             .modal-header p {
//               color: #6b7280;
//             }

//             .modal-header button {
//               border: none;

//               background: transparent;

//               font-size: 22px;

//               cursor: pointer;
//             }

//             .form-grid {
//               display: grid;

//               grid-template-columns: 1fr;

//               gap: 18px;
//             }

//             .form-group {
//               display: flex;

//               flex-direction: column;

//               gap: 10px;
//             }

//             .form-group label {
//               font-size: 13px;

//               font-weight: 700;

//               color: #374151;
//             }

//             .form-group input,
//             .form-group textarea,
//             .form-group select {
//               border: 1px solid #d1d5db;

//               border-radius: 14px;

//               padding: 14px;

//               outline: none;
//             }

//             .weekly-header {
//               display: flex;

//               justify-content: space-between;

//               align-items: center;

//               margin-top: 30px;

//               margin-bottom: 18px;
//             }

//             .weekly-header h3 {
//               font-size: 18px;

//               font-weight: 800;
//             }

//             .weekly-header button {
//               border: none;

//               background: #111827;

//               color: white;

//               padding: 10px 16px;

//               border-radius: 12px;

//               font-weight: 700;

//               cursor: pointer;
//             }

//             .weekly-wrapper {
//               display: flex;

//               flex-direction: column;

//               gap: 14px;
//             }

//             .weekly-card {
//               display: grid;

//               grid-template-columns: 1fr 1fr auto;

//               gap: 14px;

//               background: #f9fafb;

//               padding: 16px;

//               border-radius: 18px;

//               border: 1px solid #e5e7eb;
//             }

//             .weekly-card select {
//               border: 1px solid #d1d5db;

//               border-radius: 12px;

//               padding: 12px;
//             }

//             .remove-btn {
//               width: 44px;

//               border: none;

//               background: #fee2e2;

//               color: #991b1b;

//               border-radius: 12px;

//               cursor: pointer;

//               font-weight: 700;
//             }

//             .toggle-box {
//               display: flex;

//               align-items: center;

//               gap: 12px;

//               margin-top: 24px;
//             }

//             .modal-footer {
//               display: flex;

//               justify-content: flex-end;

//               gap: 14px;

//               margin-top: 30px;
//             }

//             .cancel-btn,
//             .save-btn {
//               height: 50px;

//               padding: 0 18px;

//               border-radius: 14px;

//               font-weight: 700;

//               cursor: pointer;
//             }

//             .cancel-btn {
//               border: 1px solid #d1d5db;

//               background: white;
//             }

//             .save-btn {
//               border: none;

//               background: #111827;

//               color: white;
//             }

//             @media (max-width: 768px) {
//               .policy-page {
//                 padding: 16px;
//               }

//               .top-header {
//                 flex-direction: column;

//                 align-items: flex-start;
//               }

//               .weekly-card {
//                 grid-template-columns: 1fr;
//               }

//               .action-group {
//                 flex-direction: column;
//               }

//               .top-header h1 {
//                 font-size: 24px;
//               }

//               .modal-box {
//                 padding: 20px;
//               }
//             }
//           `}</style>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WorkSchedulePolicyPage;

"use client";

import React, { useEffect, useMemo, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

// ======================================================

const days = [
  {
    label: "Sunday",
    value: 0,
  },
  {
    label: "Monday",
    value: 1,
  },
  {
    label: "Tuesday",
    value: 2,
  },
  {
    label: "Wednesday",
    value: 3,
  },
  {
    label: "Thursday",
    value: 4,
  },
  {
    label: "Friday",
    value: 5,
  },
  {
    label: "Saturday",
    value: 6,
  },
];

const weekOptions = [
  {
    label: "Every Week",
    value: null,
  },
  {
    label: "1st Week",
    value: 1,
  },
  {
    label: "2nd Week",
    value: 2,
  },
  {
    label: "3rd Week",
    value: 3,
  },
  {
    label: "4th Week",
    value: 4,
  },
  {
    label: "5th Week",
    value: 5,
  },
];

// ======================================================

const WorkSchedulePolicyPage = () => {
  // ======================================================

  const [loading, setLoading] = useState(false);

  const [policies, setPolicies] = useState<any[]>([]);

  const [shifts, setShifts] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingPolicy, setEditingPolicy] = useState<any>(null);

  // ======================================================

  const [formData, setFormData] = useState({
    title: "",
    description: "",

    attendanceType: "FIXED",

    requiredWorkMinutes: "",

    enableOvertime: false,

    overtimeAfterMinutes: "",

    shiftId: "",

    isActive: true,

    weeklyOffPattern: [],
  });

  // ======================================================
  // FETCH
  // ======================================================

  const fetchPolicies = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/work-schedule-policy");

      setPolicies(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================

  const fetchShifts = async () => {
    try {
      const res = await axiosInstance.get("/shift");

      setShifts(res?.data?.data?.shifts || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================

  useEffect(() => {
    fetchPolicies();

    fetchShifts();
  }, []);

  // ======================================================
  // FILTER
  // ======================================================

  const filteredPolicies = useMemo(() => {
    return policies.filter((item: any) =>
      item?.title?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [policies, search]);

  // ======================================================
  // OPEN CREATE
  // ======================================================

  const handleOpenCreate = () => {
    setEditingPolicy(null);

    setFormData({
      title: "",
      description: "",

      attendanceType: "FIXED",

      requiredWorkMinutes: "",

      enableOvertime: false,

      overtimeAfterMinutes: "",

      shiftId: "",

      isActive: true,

      weeklyOffPattern: [],
    });

    setShowModal(true);
  };

  // ======================================================
  // OPEN EDIT
  // ======================================================

  const handleOpenEdit = (policy: any) => {
    setEditingPolicy(policy);

    setFormData({
      title: policy?.title || "",

      description: policy?.description || "",

      attendanceType: policy?.attendanceType || "FIXED",

      requiredWorkMinutes: policy?.requiredWorkMinutes || "",

      enableOvertime: policy?.enableOvertime || false,

      overtimeAfterMinutes: policy?.overtimeAfterMinutes || "",

      shiftId: policy?.shiftId || "",

      isActive: policy?.isActive,

      weeklyOffPattern: policy?.weeklyOffPattern || [],
    });

    setShowModal(true);
  };

  // ======================================================
  // ADD WEEKLY OFF
  // ======================================================

  const addWeeklyOff = () => {
    setFormData((prev: any) => ({
      ...prev,

      weeklyOffPattern: [
        ...prev.weeklyOffPattern,

        {
          day: 0,

          weekNumber: null,
        },
      ],
    }));
  };

  // ======================================================
  // REMOVE
  // ======================================================

  const removeWeeklyOff = (index: number) => {
    const updated = [...formData.weeklyOffPattern];

    updated.splice(index, 1);

    setFormData({
      ...formData,

      weeklyOffPattern: updated,
    });
  };

  // ======================================================
  // CHANGE
  // ======================================================

  const updateWeeklyOff = (
    index: number,

    key: string,

    value: any,
  ) => {
    const updated = [...formData.weeklyOffPattern];

    updated[index][key] = value;

    setFormData({
      ...formData,

      weeklyOffPattern: updated,
    });
  };

  // ======================================================
  // SAVE
  // ======================================================

  const handleSubmit = async () => {
    try {
      if (!formData.title) {
        return alert("Title required");
      }

      const payload = {
        ...formData,

        shiftId:
          formData.attendanceType === "FIXED" ? formData.shiftId || null : null,

        requiredWorkMinutes:
          formData.attendanceType === "FLEXIBLE"
            ? Number(formData.requiredWorkMinutes)
            : null,

        overtimeAfterMinutes:
          formData.attendanceType === "FLEXIBLE"
            ? Number(formData.overtimeAfterMinutes)
            : null,
      };

      if (editingPolicy) {
        await axiosInstance.patch(
          `/work-schedule-policy/${editingPolicy.id}`,

          payload,
        );
      } else {
        await axiosInstance.post(
          "/work-schedule-policy",

          payload,
        );
      }

      setShowModal(false);

      fetchPolicies();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Something went wrong");
    }
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Delete this policy?");

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/work-schedule-policy/${id}`);

      fetchPolicies();
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // FORMAT
  // ======================================================

  const formatWeeklyOff = (rules: any[]) => {
    if (!rules?.length) return "--";

    return rules
      .map((r: any) => {
        const day = days.find((d) => d.value === r.day)?.label;

        if (r.weekNumber) {
          return `${r.weekNumber} ${day}`;
        }

        return `Every ${day}`;
      })
      .join(", ");
  };

  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="policy-page">
          {/* ====================================================== */}
          {/* HEADER */}
          {/* ====================================================== */}

          <div className="top-header">
            <div>
              <h1>Work Schedule Policy</h1>

              <p>Manage shift + weekly off schedule policies</p>
            </div>

            <button className="create-btn" onClick={handleOpenCreate}>
              + Create Policy
            </button>
          </div>

          {/* ====================================================== */}
          {/* FILTER */}
          {/* ====================================================== */}

          <div className="filter-card">
            <input
              type="text"
              placeholder="Search policy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* ====================================================== */}
          {/* TABLE */}
          {/* ====================================================== */}

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Policy</th>

                  <th>Type</th>

                  <th>Shift / Work Time</th>

                  <th>Weekly Off</th>

                  <th>Status</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>Loading...</td>
                  </tr>
                ) : filteredPolicies.length ? (
                  filteredPolicies.map((item: any) => (
                    <tr key={item.id}>
                      <td>
                        <div className="policy-info">
                          <h4>{item.title}</h4>

                          <p>{item.description || "--"}</p>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            item.attendanceType === "FLEXIBLE"
                              ? "badge-warning"
                              : "badge-primary"
                          }`}
                        >
                          {item.attendanceType}
                        </span>
                      </td>

                      <td>
                        {item.attendanceType === "FLEXIBLE"
                          ? `${item.requiredWorkMinutes} mins`
                          : item?.shift?.title || "--"}
                      </td>

                      <td>{formatWeeklyOff(item.weeklyOffPattern)}</td>

                      <td>
                        <span
                          className={`status-badge ${item.isActive ? "active" : "inactive"}`}
                        >
                          {item.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>

                      <td>
                        <div className="action-group">
                          <button
                            className="edit-btn"
                            onClick={() => handleOpenEdit(item)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>No policy found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ====================================================== */}
          {/* MODAL */}
          {/* ====================================================== */}

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <div className="modal-header">
                  <div>
                    <h2>{editingPolicy ? "Edit Policy" : "Create Policy"}</h2>

                    <p>Configure weekly off & shift rules</p>
                  </div>

                  <button onClick={() => setShowModal(false)}>✖</button>
                </div>

                {/* ====================================================== */}

                <div className="form-grid">
                  <div className="form-group full">
                    <label>Policy Title</label>

                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group full">
                    <label>Description</label>

                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group full">
                    <label>Attendance Type</label>

                    <select
                      value={formData.attendanceType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          attendanceType: e.target.value,
                        })
                      }
                    >
                      <option value="FIXED">Fixed Shift</option>

                      <option value="FLEXIBLE">Flexible Shift</option>
                    </select>
                  </div>
                  {formData.attendanceType === "FIXED" && (
                    <div className="form-group full">
                      <label>Shift</label>

                      <select
                        value={formData.shiftId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shiftId: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Shift</option>

                        {shifts?.map((shift: any) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {formData.attendanceType === "FLEXIBLE" && (
                    <>
                      <div className="form-group full">
                        <label>Required Work Minutes</label>

                        <input
                          type="number"
                          value={formData.requiredWorkMinutes}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              requiredWorkMinutes: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="toggle-box">
                        <input
                          type="checkbox"
                          checked={formData.enableOvertime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              enableOvertime: e.target.checked,
                            })
                          }
                        />

                        <label>Enable Overtime</label>
                      </div>

                      {formData.enableOvertime && (
                        <div className="form-group full">
                          <label>Overtime After Minutes</label>

                          <input
                            type="number"
                            value={formData.overtimeAfterMinutes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                overtimeAfterMinutes: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* ====================================================== */}
                {/* WEEKLY OFF */}
                {/* ====================================================== */}

                <div className="weekly-header">
                  <h3>Weekly Off Rules</h3>

                  <button onClick={addWeeklyOff}>+ Add</button>
                </div>

                <div className="weekly-wrapper">
                  {formData.weeklyOffPattern.map(
                    (
                      item: any,

                      index: number,
                    ) => (
                      <div className="weekly-card" key={index}>
                        <select
                          value={item.day}
                          onChange={(e) =>
                            updateWeeklyOff(
                              index,

                              "day",

                              Number(e.target.value),
                            )
                          }
                        >
                          {days.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={item.weekNumber ?? ""}
                          onChange={(e) =>
                            updateWeeklyOff(
                              index,

                              "weekNumber",

                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                            )
                          }
                        >
                          {weekOptions.map((w) => (
                            <option key={String(w.value)} value={w.value ?? ""}>
                              {w.label}
                            </option>
                          ))}
                        </select>

                        <button
                          className="remove-btn"
                          onClick={() => removeWeeklyOff(index)}
                        >
                          ✖
                        </button>
                      </div>
                    ),
                  )}
                </div>

                {/* ====================================================== */}

                <div className="toggle-box">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({
                        ...formData,

                        isActive: e.target.checked,
                      })
                    }
                  />

                  <label>Active Policy</label>
                </div>

                {/* ====================================================== */}

                <div className="modal-footer">
                  <button
                    className="cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button className="save-btn" onClick={handleSubmit}>
                    {editingPolicy ? "Update Policy" : "Create Policy"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/* STYLE */}
          {/* ====================================================== */}

          <style jsx>{`
            .policy-page {
              padding: 24px;
            }

            .top-header {
              display: flex;

              justify-content: space-between;

              align-items: center;

              gap: 20px;

              margin-bottom: 24px;
            }

            .top-header h1 {
              font-size: 32px;

              font-weight: 800;

              color: #111827;

              margin-bottom: 6px;
            }

            .top-header p {
              color: #6b7280;
            }

            .create-btn {
              height: 52px;

              border: none;

              background: #111827;

              color: white;

              padding: 0 22px;

              border-radius: 14px;

              font-weight: 700;

              cursor: pointer;
            }

            .filter-card {
              margin-bottom: 24px;
            }

            .filter-card input {
              width: 100%;

              height: 52px;

              border-radius: 14px;

              border: 1px solid #d1d5db;

              padding: 0 16px;

              outline: none;
            }

            .table-card {
              background: white;

              border-radius: 24px;

              overflow: auto;

              border: 1px solid #e5e7eb;
            }

            table {
              width: 100%;

              border-collapse: collapse;
            }

            th {
              background: #f9fafb;

              padding: 18px;

              text-align: left;

              font-size: 13px;

              font-weight: 800;
            }

            td {
              padding: 18px;

              border-top: 1px solid #f3f4f6;
            }

            .policy-info h4 {
              margin: 0;

              font-size: 15px;
            }

            .policy-info p {
              margin: 4px 0 0;

              color: #6b7280;

              font-size: 13px;
            }

            .status-badge {
              padding: 8px 14px;

              border-radius: 999px;

              font-size: 12px;

              font-weight: 700;
            }

            .status-badge.active {
              background: #dcfce7;

              color: #166534;
            }

            .status-badge.inactive {
              background: #fee2e2;

              color: #991b1b;
            }

            .action-group {
              display: flex;

              gap: 10px;
            }

            .edit-btn,
            .delete-btn {
              border: none;

              height: 40px;

              padding: 0 14px;

              border-radius: 10px;

              font-weight: 700;

              cursor: pointer;
            }

            .edit-btn {
              background: #111827;

              color: white;
            }

            .delete-btn {
              background: #fee2e2;

              color: #991b1b;
            }

            .modal-overlay {
              position: fixed;

              inset: 0;

              background: rgba(0, 0, 0, 0.5);

              display: flex;

              justify-content: center;

              align-items: center;

              z-index: 9999;

              padding: 20px;
            }

            .modal-box {
              width: 100%;

              max-width: 900px;

              background: white;

              border-radius: 28px;

              padding: 28px;

              max-height: 90vh;

              overflow-y: auto;
            }

            .modal-header {
              display: flex;

              justify-content: space-between;

              align-items: center;

              margin-bottom: 24px;
            }

            .modal-header h2 {
              font-size: 26px;

              font-weight: 800;

              margin-bottom: 6px;
            }

            .modal-header p {
              color: #6b7280;
            }

            .modal-header button {
              border: none;

              background: transparent;

              font-size: 22px;

              cursor: pointer;
            }

            .form-grid {
              display: grid;

              grid-template-columns: 1fr;

              gap: 18px;
            }

            .form-group {
              display: flex;

              flex-direction: column;

              gap: 10px;
            }

            .form-group label {
              font-size: 13px;

              font-weight: 700;

              color: #374151;
            }

            .form-group input,
            .form-group textarea,
            .form-group select {
              border: 1px solid #d1d5db;

              border-radius: 14px;

              padding: 14px;

              outline: none;
            }

            .weekly-header {
              display: flex;

              justify-content: space-between;

              align-items: center;

              margin-top: 30px;

              margin-bottom: 18px;
            }

            .weekly-header h3 {
              font-size: 18px;

              font-weight: 800;
            }

            .weekly-header button {
              border: none;

              background: #111827;

              color: white;

              padding: 10px 16px;

              border-radius: 12px;

              font-weight: 700;

              cursor: pointer;
            }

            .weekly-wrapper {
              display: flex;

              flex-direction: column;

              gap: 14px;
            }

            .weekly-card {
              display: grid;

              grid-template-columns: 1fr 1fr auto;

              gap: 14px;

              background: #f9fafb;

              padding: 16px;

              border-radius: 18px;

              border: 1px solid #e5e7eb;
            }

            .weekly-card select {
              border: 1px solid #d1d5db;

              border-radius: 12px;

              padding: 12px;
            }

            .remove-btn {
              width: 44px;

              border: none;

              background: #fee2e2;

              color: #991b1b;

              border-radius: 12px;

              cursor: pointer;

              font-weight: 700;
            }

            .toggle-box {
              display: flex;

              align-items: center;

              gap: 12px;

              margin-top: 24px;
            }

            .modal-footer {
              display: flex;

              justify-content: flex-end;

              gap: 14px;

              margin-top: 30px;
            }

            .cancel-btn,
            .save-btn {
              height: 50px;

              padding: 0 18px;

              border-radius: 14px;

              font-weight: 700;

              cursor: pointer;
            }

            .cancel-btn {
              border: 1px solid #d1d5db;

              background: white;
            }

            .save-btn {
              border: none;

              background: #111827;

              color: white;
            }

            @media (max-width: 768px) {
              .policy-page {
                padding: 16px;
              }

              .top-header {
                flex-direction: column;

                align-items: flex-start;
              }

              .weekly-card {
                grid-template-columns: 1fr;
              }

              .action-group {
                flex-direction: column;
              }

              .top-header h1 {
                font-size: 24px;
              }

              .modal-box {
                padding: 20px;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default WorkSchedulePolicyPage;
