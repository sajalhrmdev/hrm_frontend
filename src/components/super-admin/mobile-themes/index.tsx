"use client";

import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/utils/axiosInstance";

interface MobileTheme {
  id: number;
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  isDefault: boolean;
}

type ToastType = "success" | "error";

const emptyForm = {
  name: "",
  slug: "",
  primaryColor: "#4A3ADE",
  secondaryColor: "#6C63FF",
  backgroundColor: "#FFFFFF",
  surfaceColor: "#F5F5F5",
  textColor: "#1A1A2E",
  isDefault: false,
};

const colorFields: { key: keyof typeof emptyForm; label: string }[] = [
  { key: "primaryColor", label: "Primary" },
  { key: "secondaryColor", label: "Secondary" },
  { key: "backgroundColor", label: "Background" },
  { key: "surfaceColor", label: "Surface" },
  { key: "textColor", label: "Text" },
];

const MobileThemesComponent = () => {
  const [themes, setThemes] = useState<MobileTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MobileTheme | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MobileTheme | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchThemes = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/super-admin/mobile-themes");
      setThemes(res.data.data);
    } catch {
      showToast("Failed to load themes", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchThemes(); }, [fetchThemes]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (theme: MobileTheme) => {
    setEditing(theme);
    setForm({
      name: theme.name,
      slug: theme.slug,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      backgroundColor: theme.backgroundColor,
      surfaceColor: theme.surfaceColor,
      textColor: theme.textColor,
      isDefault: theme.isDefault,
    });
    setShowModal(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setForm((prev) => ({
      ...prev,
      name,
      slug: editing ? prev.slug : slug,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing) {
        await axiosInstance.put(`/super-admin/mobile-themes/${editing.id}`, form);
        showToast("Theme updated successfully");
      } else {
        await axiosInstance.post("/super-admin/mobile-themes", form);
        showToast("Theme created successfully");
      }
      setShowModal(false);
      fetchThemes();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to save theme", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axiosInstance.delete(`/super-admin/mobile-themes/${deleteTarget.id}`);
      showToast("Theme deleted successfully");
      setDeleteTarget(null);
      fetchThemes();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to delete theme", "error");
    }
  };

  // Phone mockup component for live preview
  const PhonePreview = ({ colors }: { colors: typeof emptyForm }) => (
    <div
      style={{
        width: 180,
        height: 320,
        borderRadius: 24,
        border: `3px solid ${colors.textColor}22`,
        overflow: "hidden",
        backgroundColor: colors.backgroundColor,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Status bar */}
      <div
        style={{
          height: 28,
          backgroundColor: colors.primaryColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 50, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.5)" }} />
      </div>
      {/* Header */}
      <div
        style={{
          height: 40,
          backgroundColor: colors.primaryColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>Header</span>
      </div>
      {/* Content */}
      <div style={{ padding: "8px 10px" }}>
        <div
          style={{
            height: 12,
            width: "70%",
            backgroundColor: colors.surfaceColor,
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <div
          style={{
            height: 12,
            width: "50%",
            backgroundColor: colors.surfaceColor,
            borderRadius: 4,
            marginBottom: 10,
          }}
        />
        {/* Card mockup */}
        <div
          style={{
            backgroundColor: colors.surfaceColor,
            borderRadius: 8,
            padding: 8,
            border: `1px solid ${colors.textColor}11`,
          }}
        >
          <div
            style={{
              height: 8,
              width: "60%",
              backgroundColor: colors.primaryColor,
              borderRadius: 4,
              marginBottom: 6,
              opacity: 0.7,
            }}
          />
          <div
            style={{
              height: 8,
              width: "90%",
              backgroundColor: colors.textColor,
              borderRadius: 4,
              marginBottom: 4,
              opacity: 0.15,
            }}
          />
          <div
            style={{
              height: 8,
              width: "75%",
              backgroundColor: colors.textColor,
              borderRadius: 4,
              opacity: 0.15,
            }}
          />
        </div>
        {/* Button mockup */}
        <div
          style={{
            marginTop: 10,
            height: 28,
            backgroundColor: colors.secondaryColor,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#fff", fontSize: 9, fontWeight: 600 }}>Action</span>
        </div>
      </div>
    </div>
  );

  // Theme card (used in grid)
  const ThemeCard = ({ theme }: { theme: MobileTheme }) => {
    const colors = {
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      backgroundColor: theme.backgroundColor,
      surfaceColor: theme.surfaceColor,
      textColor: theme.textColor,
    };
    return (
      <div
        className="card h-100 border-0"
        style={{
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "default",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
        }}
      >
        {/* Mini phone preview */}
        <div
          style={{
            backgroundColor: theme.backgroundColor,
            padding: "20px 16px 16px",
            display: "flex",
            justifyContent: "center",
            borderBottom: `1px solid ${theme.textColor}11`,
          }}
        >
          <PhonePreview colors={colors} />
        </div>
        {/* Info */}
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="mb-0 fw-semibold">{theme.name}</h6>
            {theme.isDefault && (
              <span className="badge bg-primary-subtle text-primary" style={{ fontSize: 10 }}>
                Default
              </span>
            )}
          </div>
          <p className="text-muted mb-2" style={{ fontSize: 12 }}>
            <code>{theme.slug}</code>
          </p>
          <div className="d-flex gap-1 mb-2 flex-wrap">
            {colorFields.map((f) => (
              <span
                key={f.key}
                className="d-inline-block rounded-circle"
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: theme[f.key as keyof MobileTheme] as string,
                  border: "2px solid #e9ecef",
                }}
                title={`${f.label}: ${theme[f.key as keyof MobileTheme]}`}
              />
            ))}
          </div>
          <div className="d-flex gap-2 mt-2">
            <button
              className="btn btn-sm btn-outline-primary flex-fill"
              onClick={() => openEdit(theme)}
              style={{ borderRadius: 8, fontSize: 12 }}
            >
              <i className="ti ti-edit me-1"></i>Edit
            </button>
            <button
              className="btn btn-sm btn-outline-danger flex-fill"
              onClick={() => setDeleteTarget(theme)}
              style={{ borderRadius: 8, fontSize: 12 }}
            >
              <i className="ti ti-trash me-1"></i>Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div>
              <h2 className="mb-1">Mobile Themes</h2>
            </div>
          </div>
          <div className="row g-3">
            {[1, 2, 3].map((i) => (
              <div className="col-xl-4 col-lg-6 col-md-6" key={i}>
                <div className="card border-0" style={{ borderRadius: 16 }}>
                  <div className="card-body p-0">
                    <div className="bg-light" style={{ height: 240, borderRadius: "16px 16px 0 0" }} />
                    <div className="p-3">
                      <div className="bg-light rounded" style={{ height: 18, width: "60%", marginBottom: 8 }} />
                      <div className="bg-light rounded" style={{ height: 12, width: "40%", marginBottom: 12 }} />
                      <div className="bg-light rounded" style={{ height: 14, width: "100%" }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-4">
          <div>
            <h2 className="mb-1" style={{ fontSize: 22, fontWeight: 700 }}>Mobile Themes</h2>
            <p className="text-muted mb-0" style={{ fontSize: 14 }}>
              Manage visual themes for the mobile app ({themes.length} theme{themes.length !== 1 ? "s" : ""})
            </p>
          </div>
          <div className="mt-2 mt-md-0">
            <button className="btn btn-primary" onClick={openCreate} style={{ borderRadius: 10, padding: "8px 20px" }}>
              <i className="ti ti-plus me-1"></i> Create Theme
            </button>
          </div>
        </div>

        {/* Themes Grid */}
        {themes.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3" style={{ fontSize: 48, opacity: 0.3 }}>🎨</div>
            <h5 className="text-muted">No themes yet</h5>
            <p className="text-muted mb-3">Create your first mobile app theme</p>
            <button className="btn btn-primary" onClick={openCreate} style={{ borderRadius: 10 }}>
              <i className="ti ti-plus me-1"></i> Create Theme
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {themes.map((theme) => (
              <div className="col-xl-4 col-lg-6 col-md-6" key={theme.id}>
                <ThemeCard theme={theme} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16, border: "none" }}>
              <div className="modal-header" style={{ borderBottom: "1px solid #f0f0f0", padding: "16px 24px" }}>
                <h5 className="modal-title fw-bold">{editing ? "Edit Theme" : "Create Theme"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body" style={{ padding: "24px" }}>
                  <div className="row g-4">
                    {/* Left: Form */}
                    <div className="col-md-7">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label fw-semibold">Theme Name</label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            value={form.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="e.g. Ocean Blue"
                            required
                            style={{ borderRadius: 10 }}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold">Slug</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            placeholder="e.g. ocean-blue"
                            required
                            disabled={!editing}
                            style={{ borderRadius: 10, backgroundColor: editing ? "#fff" : "#f8f9fa" }}
                          />
                          {!editing && (
                            <small className="text-muted">Auto-generated from name</small>
                          )}
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold mb-2">Colors</label>
                          <div className="row g-2">
                            {colorFields.map((f) => (
                              <div className="col-6" key={f.key}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "6px 10px",
                                    borderRadius: 10,
                                    border: "1px solid #e9ecef",
                                  }}
                                >
                                  <input
                                    type="color"
                                    className="form-control form-control-color"
                                    value={form[f.key] as string}
                                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ width: 36, height: 36, padding: 2, cursor: "pointer" }}
                                  />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 10, color: "#6c757d", lineHeight: 1.2 }}>{f.label}</div>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={form[f.key] as string}
                                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                      style={{
                                        border: "none",
                                        padding: 0,
                                        height: "auto",
                                        fontSize: 11,
                                        fontWeight: 600,
                                        fontFamily: "monospace",
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="isDefault"
                              checked={form.isDefault}
                              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                              style={{ cursor: "pointer" }}
                            />
                            <label className="form-check-label" htmlFor="isDefault" style={{ cursor: "pointer" }}>
                              Set as default theme
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Right: Live Preview */}
                    <div className="col-md-5 d-flex flex-column align-items-center justify-content-center">
                      <label className="form-label fw-semibold mb-2 text-muted" style={{ fontSize: 12 }}>
                        LIVE PREVIEW
                      </label>
                      <PhonePreview colors={form} />
                      <div className="d-flex gap-2 mt-2 flex-wrap justify-content-center">
                        {colorFields.map((f) => (
                          <span
                            key={f.key}
                            className="d-inline-block rounded-circle"
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: form[f.key] as string,
                              border: "1px solid #dee2e6",
                            }}
                            title={`${f.label}: ${form[f.key]}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: "1px solid #f0f0f0", padding: "12px 24px" }}>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowModal(false)}
                    style={{ borderRadius: 10 }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ borderRadius: 10, minWidth: 100 }}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" />
                        Saving...
                      </>
                    ) : (
                      editing ? "Update Theme" : "Create Theme"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1060 }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16, border: "none", textAlign: "center" }}>
              <div className="modal-body" style={{ padding: "32px 24px" }}>
                <div className="mb-3" style={{ fontSize: 40 }}>🗑️</div>
                <h5 className="fw-bold mb-1">Delete Theme?</h5>
                <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                  Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
                </p>
                <p className="text-muted" style={{ fontSize: 13 }}>
                  Companies using this theme will be unlinked.
                </p>
                <div className="d-flex gap-2 justify-content-center mt-3">
                  <button
                    className="btn btn-light"
                    onClick={() => setDeleteTarget(null)}
                    style={{ borderRadius: 10, minWidth: 80 }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    style={{ borderRadius: 10, minWidth: 80 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            animation: "slideInRight 0.3s ease",
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              backgroundColor: toast.type === "success" ? "#059669" : "#dc2626",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className={`ti ${toast.type === "success" ? "ti-check-circle" : "ti-alert-circle"}`}></i>
            {toast.message}
          </div>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default MobileThemesComponent;
