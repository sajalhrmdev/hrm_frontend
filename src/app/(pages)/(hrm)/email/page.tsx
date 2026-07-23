"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import CollapseHeader from "@/core/common/collapse-header/collapse-header";
import TiptapEditor from "./components/TiptapEditor";
import { TemplateVariable } from "./components/TiptapEditor";
import { SkeletonCard } from "@/core/common/Skeleton";

type EmailSettingsData = {
  id?: number;
  provider?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  encryption: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  isActive: boolean;
};

type EmailTemplate = {
  id: number;
  name: string;
  slug: string;
  subject: string;
  htmlContent: string;
  description?: string;
  isActive: boolean;
};

const EmailPage = () => {
  const [activeTab, setActiveTab] = useState<"settings" | "templates">("settings");

  const [settings, setSettings] = useState<EmailSettingsData | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsForm, setSettingsForm] = useState<EmailSettingsData>({
    smtpHost: "",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    encryption: "TLS",
    fromName: "",
    fromEmail: "",
    replyTo: "",
    isActive: true,
    provider: "",
  });

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    slug: "",
    subject: "",
    htmlContent: "",
    description: "",
    isActive: true,
  });

  // Available template variables for email templates
  const availableVariables: TemplateVariable[] = [
    { label: "Employee Name", value: "{{employeeName}}" },
    { label: "Employee Code", value: "{{employeeCode}}" },
    { label: "Employee Email", value: "{{employeeEmail}}" },
    { label: "Company Name", value: "{{companyName}}" },
    { label: "Leave Type", value: "{{leaveType}}" },
    { label: "From Date", value: "{{fromDate}}" },
    { label: "To Date", value: "{{toDate}}" },
    { label: "Total Days", value: "{{totalDays}}" },
    { label: "Leave Status", value: "{{leaveStatus}}" },
    { label: "Leave Reason", value: "{{leaveReason}}" },
    { label: "Applied Date", value: "{{appliedDate}}" },
    { label: "Year", value: "{{year}}" },
    { label: "Login URL", value: "{{loginUrl}}" },
  ];

  const handleTiptapChange = (html: string) => {
    setTemplateForm((prev) => ({ ...prev, htmlContent: html }));
  };

  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const res = await axiosInstance.get("/email-settings");
      const data = res?.data?.data;
      if (data) {
        setSettings(data);
        setSettingsForm({
          provider: data.provider || "",
          smtpHost: data.smtpHost || "",
          smtpPort: data.smtpPort || 587,
          smtpUsername: data.smtpUsername || "",
          smtpPassword: data.smtpPassword || "",
          encryption: data.encryption || "TLS",
          fromName: data.fromName || "",
          fromEmail: data.fromEmail || "",
          replyTo: data.replyTo || "",
          isActive: data.isActive ?? true,
        });
      }
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        console.log(err);
      }
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const res = await axiosInstance.get("/email-template");
      setTemplates(res?.data?.data?.templates || []);
    } catch (err: any) {
      console.log(err);
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchTemplates();
  }, []);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setSettingsForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...settingsForm,
        smtpPort: Number(settingsForm.smtpPort),
      };

      if (settings?.id) {
        await axiosInstance.put("/email-settings", payload);
      } else {
        await axiosInstance.post("/email-settings", payload);
      }
      alert("Email settings saved successfully");
      fetchSettings();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save settings");
    }
  };

  const handleDeleteSettings = async () => {
    if (!window.confirm("Delete email settings?")) return;
    try {
      await axiosInstance.delete("/email-settings");
      setSettings(null);
      setSettingsForm({
        provider: "",
        smtpHost: "",
        smtpPort: 587,
        smtpUsername: "",
        smtpPassword: "",
        encryption: "TLS",
        fromName: "",
        fromEmail: "",
        replyTo: "",
        isActive: true,
      });
      alert("Email settings deleted");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setTemplateForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const resetTemplateForm = () => {
    setTemplateForm({ name: "", slug: "", subject: "", htmlContent: "", description: "", isActive: true });
    setEditingTemplate(null);
  };

  const handleOpenCreateTemplate = () => {
    resetTemplateForm();
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (tpl: EmailTemplate) => {
    setEditingTemplate(tpl);
    setTemplateForm({
      name: tpl.name,
      slug: tpl.slug,
      subject: tpl.subject,
      htmlContent: tpl.htmlContent,
      description: tpl.description || "",
      isActive: tpl.isActive,
    });
    setShowTemplateModal(true);
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await axiosInstance.put(`/email-template/${editingTemplate.id}`, templateForm);
        alert("Template updated");
      } else {
        await axiosInstance.post("/email-template", templateForm);
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
      await axiosInstance.delete(`/email-template/${id}`);
      alert("Template deleted");
      fetchTemplates();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Settings</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item active" aria-current="page">Email</li>
              </ol>
            </nav>
          </div>
          <div className="head-icons ms-2">
            <CollapseHeader />
          </div>
        </div>

        <ul className="nav nav-tabs nav-tabs-solid bg-transparent border-bottom mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <i className="ti ti-settings me-2" />
              Email Settings
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "templates" ? "active" : ""}`}
              onClick={() => setActiveTab("templates")}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <i className="ti ti-template me-2" />
              Email Templates
            </button>
          </li>
        </ul>

        {activeTab === "settings" && (
          <div className="card">
            <div className="card-body">
              <div className="border-bottom mb-3 pb-3">
                <h4>SMTP Configuration</h4>
              </div>
              {settingsLoading ? (
                <SkeletonCard />
              ) : (
                <form onSubmit={handleSettingsSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Provider</label>
                      <select
                        className="form-select"
                        name="provider"
                        value={settingsForm.provider || ""}
                        onChange={handleSettingsChange}
                      >
                        <option value="">Custom</option>
                        <option value="Gmail">Gmail</option>
                        <option value="Outlook">Outlook</option>
                        <option value="Zoho">Zoho</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Encryption</label>
                      <select
                        className="form-select"
                        name="encryption"
                        value={settingsForm.encryption}
                        onChange={handleSettingsChange}
                      >
                        <option value="TLS">TLS</option>
                        <option value="SSL">SSL</option>
                        <option value="NONE">NONE</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">SMTP Host <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="smtpHost" value={settingsForm.smtpHost} onChange={handleSettingsChange} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">SMTP Port <span className="text-danger">*</span></label>
                      <input type="number" className="form-control" name="smtpPort" value={settingsForm.smtpPort} onChange={handleSettingsChange} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">&nbsp;</label>
                      <div className="form-check form-switch mt-2">
                        <input className="form-check-input" type="checkbox" name="isActive" checked={settingsForm.isActive} onChange={handleSettingsChange} id="activeSwitch" />
                        <label className="form-check-label" htmlFor="activeSwitch">Active</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">SMTP Username <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="smtpUsername" value={settingsForm.smtpUsername} onChange={handleSettingsChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">SMTP Password <span className="text-danger">*</span></label>
                      <input type="password" className="form-control" name="smtpPassword" value={settingsForm.smtpPassword} onChange={handleSettingsChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">From Name <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="fromName" value={settingsForm.fromName} onChange={handleSettingsChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">From Email <span className="text-danger">*</span></label>
                      <input type="email" className="form-control" name="fromEmail" value={settingsForm.fromEmail} onChange={handleSettingsChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Reply-To</label>
                      <input type="email" className="form-control" name="replyTo" value={settingsForm.replyTo || ""} onChange={handleSettingsChange} />
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-end mt-4 gap-2">
                    {settings?.id && (
                      <button type="button" className="btn btn-outline-danger" onClick={handleDeleteSettings}>Delete</button>
                    )}
                    <button type="submit" className="btn btn-primary">
                      {settings?.id ? "Update Settings" : "Save Settings"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div className="card">
            <div className="card-body">
              <div className="border-bottom d-flex align-items-center justify-content-between pb-3 mb-3">
                <h4>Email Templates</h4>
                <button className="btn btn-primary" onClick={handleOpenCreateTemplate}>
                  <i className="ti ti-circle-plus me-2" />Add Template
                </button>
              </div>
              {templatesLoading ? (
                <SkeletonCard />
              ) : templates.length === 0 ? (
                <div className="text-center py-4 text-muted">No templates found</div>
              ) : (
                <div className="row">
                  {templates.map((tpl) => (
                    <div className="col-md-4 mb-3" key={tpl.id}>
                      <div className="card">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <h6 className="mb-1">{tpl.name}</h6>
                              <small className="text-muted">{tpl.slug}</small>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                              <button className="btn btn-sm btn-icon" onClick={() => handleEditTemplate(tpl)}>
                                <i className="ti ti-edit" />
                              </button>
                              <button className="btn btn-sm btn-icon text-danger" onClick={() => handleDeleteTemplate(tpl.id)}>
                                <i className="ti ti-trash" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className={`badge ${tpl.isActive ? "bg-success" : "bg-secondary"}`}>
                              {tpl.isActive ? "Active" : "Inactive"}
                            </span>
                            <small className="text-muted ms-2">Subject: {tpl.subject}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {showTemplateModal && (
          <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingTemplate ? "Edit Template" : "Add Template"}</h5>
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
                      <div className="col-md-4">
                        <label className="form-label mb-1">Subject <span className="text-danger">*</span></label>
                        <input type="text" className="form-control form-control-sm" name="subject" value={templateForm.subject} onChange={handleTemplateChange} required />
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
                        variables={availableVariables}
                        placeholder="Write your email template here..."
                      />
                    </div>
                    <div className="mt-2">
                      <label className="form-label mb-1">Description</label>
                      <input type="text" className="form-control form-control-sm" name="description" value={templateForm.description} onChange={handleTemplateChange} />
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
      </div>
    </div>
  );
};

export default EmailPage;
