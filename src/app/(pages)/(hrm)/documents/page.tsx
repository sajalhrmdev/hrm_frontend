"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import axiosInstance from "@/utils/axiosInstance";
import CollapseHeader from "@/core/common/collapse-header/collapse-header";
import Handlebars from "handlebars";
import TiptapEditor from "../email/components/TiptapEditor";
import { TemplateVariable } from "../email/components/TiptapEditor";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Appointment", value: "APPOINTMENT" },
  { label: "Offer", value: "OFFER" },
  { label: "Internship", value: "INTERNSHIP" },
  { label: "Experience", value: "EXPERIENCE" },
  { label: "Relieving", value: "RELIEVING" },
  { label: "Salary Slip", value: "SALARY_SLIP" },
  { label: "Custom", value: "CUSTOM" },
];

const DOC_VARIABLES: TemplateVariable[] = [
  { label: "Employee Name", value: "{{employeeName}}" },
  { label: "Employee Code", value: "{{employeeCode}}" },
  { label: "Employee Email", value: "{{employeeEmail}}" },
  { label: "Employee Phone", value: "{{employeePhone}}" },
  { label: "Joining Date", value: "{{joiningDate}}" },
  { label: "Department", value: "{{department}}" },
  { label: "Designation", value: "{{designation}}" },
  { label: "Father Name", value: "{{fatherName}}" },
  { label: "Date of Birth", value: "{{dob}}" },
  { label: "Gender", value: "{{gender}}" },
  { label: "Nationality", value: "{{nationality}}" },
  { label: "Address", value: "{{address}}" },
  { label: "City", value: "{{city}}" },
  { label: "State", value: "{{state}}" },
  { label: "Country", value: "{{country}}" },
  { label: "Company Name", value: "{{companyName}}" },
  { label: "Company Address", value: "{{companyAddress}}" },
  { label: "Company Phone", value: "{{companyPhone}}" },
  { label: "Company Email", value: "{{companyEmail}}" },
  { label: "Company Website", value: "{{companyWebsite}}" },
  { label: "Today Date", value: "{{todayDate}}" },
];

type DocumentTemplate = {
  id: number;
  name: string;
  slug: string;
  category: string;
  subject: string;
  htmlContent: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
};

type Employee = {
  id: number;
  name: string;
  employeeCode?: string;
  email: string;
};

type GeneratedDoc = {
  id: number;
  employeeId: number | null;
  employee?: { id: number; name: string } | null;
  documentTemplate: { id: number; name: string; category: string };
  recipientEmail: string;
  subject: string;
  sentViaEmail: boolean;
  sentAt?: string;
  createdAt: string;
};

const DocumentsPage = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    slug: "",
    category: "CUSTOM",
    subject: "",
    htmlContent: "",
    description: "",
    isActive: true,
  });

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customName, setCustomName] = useState("");
  const [customJoiningDate, setCustomJoiningDate] = useState("");
  const [customDesignation, setCustomDesignation] = useState("");
  const [customDepartment, setCustomDepartment] = useState("");
  const [customSalary, setCustomSalary] = useState("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  const [activeTab, setActiveTab] = useState<"templates" | "history">("templates");
  const [history, setHistory] = useState<GeneratedDoc[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  const previewRef = useRef<HTMLDivElement>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (activeCategory) params.set("category", activeCategory);
      const res = await axiosInstance.get(`/document-template?${params.toString()}`);
      setTemplates(res.data.data.templates || []);
      setTotalPages(res.data.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeCategory]);

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/employee?limit=500");
      setEmployees(res.data.data?.employees || res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axiosInstance.get(`/document/history?page=${historyPage}&limit=20`);
      setHistory(res.data.data.documents || []);
      setHistoryTotalPages(res.data.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  useEffect(() => { if (activeTab === "history") fetchHistory(); }, [activeTab, historyPage]);

  const resetTemplateForm = () => {
    setTemplateForm({ name: "", slug: "", category: "CUSTOM", subject: "", htmlContent: "", description: "", isActive: true });
    setEditingTemplate(null);
  };

  const handleOpenCreateTemplate = () => {
    resetTemplateForm();
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (tpl: DocumentTemplate) => {
    setEditingTemplate(tpl);
    setTemplateForm({
      name: tpl.name,
      slug: tpl.slug,
      category: tpl.category,
      subject: tpl.subject,
      htmlContent: tpl.htmlContent,
      description: tpl.description || "",
      isActive: tpl.isActive,
    });
    setShowTemplateModal(true);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setTemplateForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleTiptapChange = (html: string) => {
    setTemplateForm((prev) => ({ ...prev, htmlContent: html }));
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await axiosInstance.put(`/document-template/${editingTemplate.id}`, templateForm);
        alert("Template updated");
      } else {
        await axiosInstance.post("/document-template", templateForm);
        alert("Template created");
      }
      setShowTemplateModal(false);
      resetTemplateForm();
      fetchTemplates();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await axiosInstance.delete(`/document-template/${id}`);
      alert("Template deleted");
      fetchTemplates();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const openGenerateModal = async (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setCustomSubject(template.subject);
    setRenderedHtml("");
    setSelectedEmployeeId("");
    setRecipientEmail("");
    setCustomName("");
    setCustomJoiningDate("");
    setCustomDesignation("");
    setCustomDepartment("");
    setCustomSalary("");
    setShowGenerateModal(true);
    await fetchEmployees();
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setGenerating(true);
    try {
      const tplRes = await axiosInstance.get(`/document-template/${selectedTemplate.id}`);
      const htmlContent = tplRes.data.data.htmlContent;

      let variables: Record<string, any> = { todayDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) };

      const companyRes = await axiosInstance.get("/document/company-data");
      variables = { ...variables, ...companyRes.data.data };

      if (selectedEmployeeId) {
        const empRes = await axiosInstance.get(`/document/employee/${selectedEmployeeId}`);
        variables = { ...variables, ...empRes.data.data };
      }
      if (customName.trim()) {
        variables.employeeName = customName.trim();
      }
      if (customJoiningDate) {
        variables.joiningDate = new Date(customJoiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
      }
      if (customDesignation.trim()) {
        variables.designation = customDesignation.trim();
      }
      if (customDepartment.trim()) {
        variables.department = customDepartment.trim();
      }
      if (customSalary.trim()) {
        variables.salary = customSalary.trim();
      }

      const compiled = Handlebars.compile(htmlContent);
      setRenderedHtml(compiled(variables));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!renderedHtml) return;
    const html2pdf = (await import("html2pdf.js")).default;
    const filename = `${selectedTemplate?.slug || "document"}-${Date.now()}.pdf`;
    const tmp = document.createElement("div");
    tmp.style.cssText = "width:794px;";
    tmp.innerHTML = renderedHtml;
    document.body.appendChild(tmp);
    await new Promise((r) => setTimeout(r, 200));
    await html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, width: 794, windowWidth: 794 },
        jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
      })
      .from(tmp)
      .save();
    document.body.removeChild(tmp);
  };

  const handleSendEmail = async () => {
    if (!selectedTemplate || !recipientEmail) return;
    setSending(true);
    try {
      await axiosInstance.post("/document/send-email", {
        templateId: selectedTemplate.id,
        employeeId: selectedEmployeeId || undefined,
        recipientEmail,
        subject: customSubject || undefined,
      });
      alert("Document sent successfully!");
      setShowGenerateModal(false);
      fetchHistory();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      APPOINTMENT: "bg-success",
      OFFER: "bg-primary",
      INTERNSHIP: "bg-info",
      EXPERIENCE: "bg-warning",
      RELIEVING: "bg-danger",
      SALARY_SLIP: "bg-secondary",
      CUSTOM: "bg-light text-dark",
    };
    return <span className={`badge ${colors[cat] || "bg-secondary"}`}>{cat.replace("_", " ")}</span>;
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Document Generation</h4>
              <h6>Manage document templates and generate employee certificates</h6>
            </div>
          </div>
          <CollapseHeader />
        </div>

        <div className="mb-3">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "templates" ? "active" : ""}`} onClick={() => setActiveTab("templates")}>
                <i className="ti ti-file-text me-1" /> Templates
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>
                <i className="ti ti-history me-1" /> History
              </button>
            </li>
          </ul>
        </div>

        {activeTab === "templates" && (
          <div className="card">
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        className={`btn btn-sm ${activeCategory === cat.value ? "btn-primary" : "btn-outline-light"}`}
                        onClick={() => { setActiveCategory(cat.value); setPage(1); }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search templates..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
                <div className="col-md-2 text-end">
                  <button className="btn btn-primary btn-sm" onClick={handleOpenCreateTemplate}>
                    <i className="ti ti-plus me-1" /> Add Template
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center p-4"><div className="spinner-border" /></div>
              ) : templates.length === 0 ? (
                <div className="text-center p-4 text-muted">No templates found</div>
              ) : (
                <div className="row">
                  {templates.map((t) => (
                    <div key={t.id} className="col-xl-4 col-lg-6 col-md-6 mb-3">
                      <div className="card h-100 border">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">{t.name}</h6>
                            {getCategoryBadge(t.category)}
                          </div>
                          <p className="text-muted small mb-1">
                            <i className="ti ti-mail me-1" /> {t.subject}
                          </p>
                          {t.description && <p className="text-muted small mb-2">{t.description}</p>}
                          <div className="d-flex align-items-center gap-2 mt-2">
                            <button className="btn btn-sm btn-primary" onClick={() => openGenerateModal(t)}>
                              <i className="ti ti-player-play me-1" /> Generate
                            </button>
                            <button className="btn btn-sm btn-icon" onClick={() => handleEditTemplate(t)} title="Edit">
                              <i className="ti ti-edit" />
                            </button>
                            <button className="btn btn-sm btn-icon text-danger" onClick={() => handleDeleteTemplate(t.id)} title="Delete">
                              <i className="ti ti-trash" />
                            </button>
                            <span className={`badge ${t.isActive ? "bg-success" : "bg-secondary"}`}>
                              {t.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <button className="btn btn-sm btn-outline-primary me-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                  <span className="align-self-center text-muted small">Page {page} of {totalPages}</span>
                  <button className="btn btn-sm btn-outline-primary ms-2" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="card">
            <div className="card-body">
              {historyLoading ? (
                <div className="text-center p-4"><div className="spinner-border" /></div>
              ) : history.length === 0 ? (
                <div className="text-center p-4 text-muted">No documents generated yet</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Template</th>
                        <th>Employee</th>
                        <th>Recipient</th>
                        <th>Subject</th>
                        <th>Email Sent</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((doc, idx) => (
                        <tr key={doc.id}>
                          <td>{(historyPage - 1) * 20 + idx + 1}</td>
                          <td>{doc.documentTemplate.name}</td>
                          <td>{doc.employee?.name || "-"}</td>
                          <td>{doc.recipientEmail}</td>
                          <td>{doc.subject}</td>
                          <td><span className={`badge ${doc.sentViaEmail ? "bg-success" : "bg-secondary"}`}>{doc.sentViaEmail ? "Yes" : "No"}</span></td>
                          <td>{new Date(doc.createdAt).toLocaleDateString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {historyTotalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <button className="btn btn-sm btn-outline-primary me-2" disabled={historyPage <= 1} onClick={() => setHistoryPage((p) => p - 1)}>Previous</button>
                  <span className="align-self-center text-muted small">Page {historyPage} of {historyTotalPages}</span>
                  <button className="btn btn-sm btn-outline-primary ms-2" disabled={historyPage >= historyTotalPages} onClick={() => setHistoryPage((p) => p + 1)}>Next</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showTemplateModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingTemplate ? "Edit Template" : "Create Template"}</h5>
                <button type="button" className="btn-close" onClick={() => { setShowTemplateModal(false); resetTemplateForm(); }} />
              </div>
              <form onSubmit={handleTemplateSubmit}>
                <div className="modal-body">
                  <div className="row g-2 align-items-end">
                    <div className="col-md-3">
                      <label className="form-label mb-1">Name <span className="text-danger">*</span></label>
                      <input type="text" className="form-control form-control-sm" name="name" value={templateForm.name} onChange={handleTemplateChange} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label mb-1">Slug <span className="text-danger">*</span></label>
                      <input type="text" className="form-control form-control-sm" name="slug" value={templateForm.slug} onChange={handleTemplateChange} required />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label mb-1">Category</label>
                      <select className="form-select form-select-sm" name="category" value={templateForm.category} onChange={handleTemplateChange}>
                        {CATEGORIES.filter((c) => c.value).map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label mb-1">Subject <span className="text-danger">*</span></label>
                      <input type="text" className="form-control form-control-sm" name="subject" value={templateForm.subject} onChange={handleTemplateChange} required />
                    </div>
                  </div>
                  <div className="row g-2 mt-1">
                    <div className="col-md-10">
                      <label className="form-label mb-1">Description</label>
                      <input type="text" className="form-control form-control-sm" name="description" value={templateForm.description} onChange={handleTemplateChange} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label mb-1">Status</label>
                      <select className="form-select form-select-sm" name="isActive" value={templateForm.isActive ? "true" : "false"} onChange={(e) => setTemplateForm((prev) => ({ ...prev, isActive: e.target.value === "true" }))}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="form-label mb-1">HTML Content <span className="text-danger">*</span></label>
                    <TiptapEditor
                      content={templateForm.htmlContent}
                      onChange={handleTiptapChange}
                      variables={DOC_VARIABLES}
                      placeholder="Write your document template HTML here..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => { setShowTemplateModal(false); resetTemplateForm(); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingTemplate ? "Update" : "Create"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && selectedTemplate && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-scrollable" style={{ maxWidth: "95vw" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="ti ti-file-text me-2" /> Generate: {selectedTemplate.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowGenerateModal(false)} />
              </div>
              <div className="modal-body">
                <div className="card mb-3">
                  <div className="card-body">
                    <div className="row g-2">
                      <div className="col-md-5">
                        <label className="form-label fw-bold">Name on Certificate <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="e.g. Rahim Uddin, Karim Ahmed..."
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Select Employee (optional)</label>
                        <select
                          className="form-select form-select-sm"
                          value={selectedEmployeeId}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : "";
                            setSelectedEmployeeId(val);
                            const emp = employees.find((x) => x.id === val);
                            if (emp) {
                              setRecipientEmail(emp.email);
                              setCustomName(emp.name);
                              setCustomDesignation(emp.designation?.title || "");
                              setCustomDepartment(emp.department?.title || "");
                            }
                          }}
                        >
                          <option value="">-- None --</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} {emp.employeeCode ? `(${emp.employeeCode})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Recipient Email</label>
                        <input type="email" className="form-control form-control-sm" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="email@example.com" />
                      </div>
                    </div>
                    <div className="row g-2 mt-0">
                      <div className="col-md-3">
                        <label className="form-label">Designation</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={customDesignation}
                          onChange={(e) => setCustomDesignation(e.target.value)}
                          placeholder="e.g. Intern, Developer..."
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Department</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={customDepartment}
                          onChange={(e) => setCustomDepartment(e.target.value)}
                          placeholder="e.g. IT, HR..."
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Joining Date</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={customJoiningDate}
                          onChange={(e) => setCustomJoiningDate(e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Salary</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={customSalary}
                          onChange={(e) => setCustomSalary(e.target.value)}
                          placeholder="e.g. INR 40,000/month"
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Subject</label>
                        <input type="text" className="form-control form-control-sm" value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating}>
                        {generating ? <><span className="spinner-border spinner-border-sm me-1" /> Generating...</> : <><i className="ti ti-player-play me-1" /> Generate Preview</>}
                      </button>
                    </div>
                  </div>
                </div>

                {renderedHtml && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Preview</h6>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={handleDownloadPdf}>
                          <i className="ti ti-download me-1" /> Download PDF
                        </button>
                        <button className="btn btn-sm btn-success" onClick={handleSendEmail} disabled={sending || !recipientEmail}>
                          {sending ? <><span className="spinner-border spinner-border-sm me-1" /> Sending...</> : <><i className="ti ti-mail me-1" /> Send via Email</>}
                        </button>
                      </div>
                    </div>
                    <div ref={previewRef} className="border rounded p-3" style={{ background: "#fff", overflowX: "auto" }} dangerouslySetInnerHTML={{ __html: renderedHtml }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
