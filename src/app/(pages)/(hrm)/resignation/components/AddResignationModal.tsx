"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

type Employee = {
  id: number;
  name: string;
  department?: { title: string } | null;
};

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

const AddResignationModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    resignationDate: "",
    noticePeriodDays: "30",
    reason: "",
    handoverTo: "",
  });

  const [lastWorkingDay, setLastWorkingDay] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get("/employee");
        setEmployees(res.data.data?.employees || res.data.data || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (form.resignationDate && form.noticePeriodDays) {
      const d = new Date(form.resignationDate);
      d.setDate(d.getDate() + Number(form.noticePeriodDays));
      setLastWorkingDay(d.toISOString().split("T")[0]);
    }
  }, [form.resignationDate, form.noticePeriodDays]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post("/resignation", {
        employeeId: Number(form.employeeId),
        resignationDate: form.resignationDate,
        noticePeriodDays: Number(form.noticePeriodDays),
        reason: form.reason,
        handoverTo: form.handoverTo,
      });
      onSuccess();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", transition: "border 0.2s", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, backdropFilter: "blur(6px)" }}>
      <div style={{
        width: "95%",
        maxWidth: "520px",
        background: "#fff",
        borderRadius: "24px",
        padding: "0",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        overflow: "hidden",
        animation: "slideUp 0.3s ease",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ padding: "28px 28px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #f59e0b, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }}>📋</div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#1e293b" }}>Add Resignation</h2>
                <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "13px" }}>Submit a resignation for an employee</p>
              </div>
            </div>
            <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", fontSize: "16px", color: "#64748b", transition: "0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}>✕</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px 28px 28px" }}>
          {/* Employee */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontWeight: 600, fontSize: "13px", color: "#374151", display: "block", marginBottom: "6px" }}>Employee *</label>
            <select name="employeeId" value={form.employeeId} onChange={handleChange} required style={{ ...inputStyle, cursor: "pointer" }} onFocus={(e) => (e.target.style.borderColor = "#4f46e5")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}>
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} {emp.department ? `(${emp.department.title})` : ""}</option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontWeight: 600, fontSize: "13px", color: "#374151", display: "block", marginBottom: "6px" }}>Resignation Date *</label>
              <input type="date" name="resignationDate" value={form.resignationDate} onChange={handleChange} required style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#4f46e5")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
            </div>
            <div>
              <label style={{ fontWeight: 600, fontSize: "13px", color: "#374151", display: "block", marginBottom: "6px" }}>Notice Period (days)</label>
              <select name="noticePeriodDays" value={form.noticePeriodDays} onChange={handleChange} style={{ ...inputStyle, cursor: "pointer" }} onFocus={(e) => (e.target.style.borderColor = "#4f46e5")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}>
                <option value="15">15 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>

          {/* Last Working Day Preview */}
          {lastWorkingDay && (
            <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>📅</span>
              <span style={{ fontSize: "13px", color: "#065f46" }}>Last Working Day: <strong>{new Date(lastWorkingDay).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong></span>
            </div>
          )}

          {/* Reason */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontWeight: 600, fontSize: "13px", color: "#374151", display: "block", marginBottom: "6px" }}>Reason</label>
            <textarea name="reason" value={form.reason} onChange={handleChange} rows={3} placeholder="Reason for resignation..." style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} onFocus={(e) => (e.target.style.borderColor = "#4f46e5")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
          </div>

          {/* Handover To */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontWeight: 600, fontSize: "13px", color: "#374151", display: "block", marginBottom: "6px" }}>Handover To</label>
            <input type="text" name="handoverTo" value={form.handoverTo} onChange={handleChange} placeholder="Employee name for handover..." style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#4f46e5")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, border: "none", padding: "13px 18px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", background: "#f1f5f9", color: "#475569", fontSize: "14px", transition: "0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, border: "none", padding: "13px 18px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", fontSize: "14px", boxShadow: "0 4px 12px rgba(99,102,241,0.3)", transition: "all 0.2s" }} onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResignationModal;
