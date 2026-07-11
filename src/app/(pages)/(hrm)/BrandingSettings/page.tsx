"use client";

import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/utils/axiosInstance";

type BrandingData = {
  logo: string;
  favicon: string;
  website: string;
  mobileThemeId: number | null;
};

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

const colorFields: { key: keyof MobileTheme; label: string }[] = [
  { key: "primaryColor", label: "Primary" },
  { key: "secondaryColor", label: "Secondary" },
  { key: "backgroundColor", label: "Background" },
  { key: "surfaceColor", label: "Surface" },
  { key: "textColor", label: "Text" },
];

const PhonePreview = ({ colors }: { colors: Partial<MobileTheme> }) => (
  <div
    style={{
      width: 140,
      height: 250,
      borderRadius: 20,
      border: `2px solid ${colors.textColor}22`,
      overflow: "hidden",
      backgroundColor: colors.backgroundColor || "#fff",
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      flexShrink: 0,
    }}
  >
    <div style={{ height: 24, backgroundColor: colors.primaryColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.4)" }} />
    </div>
    <div style={{ height: 32, backgroundColor: colors.primaryColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#fff", fontSize: 10, fontWeight: 600 }}>Header</span>
    </div>
    <div style={{ padding: "6px 8px" }}>
      <div style={{ height: 8, width: "60%", backgroundColor: colors.surfaceColor, borderRadius: 3, marginBottom: 4 }} />
      <div style={{ height: 8, width: "40%", backgroundColor: colors.surfaceColor, borderRadius: 3, marginBottom: 8 }} />
      <div style={{ backgroundColor: colors.surfaceColor, borderRadius: 6, padding: 6, border: `1px solid ${colors.textColor}11` }}>
        <div style={{ height: 6, width: "50%", backgroundColor: colors.primaryColor, borderRadius: 3, marginBottom: 4, opacity: 0.7 }} />
        <div style={{ height: 6, width: "80%", backgroundColor: colors.textColor, borderRadius: 3, marginBottom: 3, opacity: 0.12 }} />
        <div style={{ height: 6, width: "60%", backgroundColor: colors.textColor, borderRadius: 3, opacity: 0.12 }} />
      </div>
      <div style={{ marginTop: 8, height: 22, backgroundColor: colors.secondaryColor, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontSize: 8, fontWeight: 600 }}>Action</span>
      </div>
    </div>
  </div>
);

export default function BrandingSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<BrandingData>({ logo: "", favicon: "", website: "", mobileThemeId: null });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [faviconPreview, setFaviconPreview] = useState<string>("");

  const [themes, setThemes] = useState<MobileTheme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
  const [themeSaving, setThemeSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchCompany = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/company/myCompany");
      const c = res.data.data;
      setData({ logo: c.logo || "", favicon: c.favicon || "", website: c.website || "", mobileThemeId: c.mobileThemeId || null });
      setLogoPreview(c.logo || "");
      setFaviconPreview(c.favicon || "");
      setSelectedThemeId(c.mobileThemeId || null);
    } catch {
      showToast("Failed to load branding data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchThemes = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/company/mobile-themes");
      setThemes(res.data.data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => { fetchCompany(); fetchThemes(); }, [fetchCompany, fetchThemes]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setFaviconFile(file); setFaviconPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      if (logoFile) formData.append("logo", logoFile);
      if (faviconFile) formData.append("favicon", faviconFile);
      formData.append("website", data.website);

      await axiosInstance.put("/company/branding", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Branding updated successfully");
      setLogoFile(null);
      setFaviconFile(null);
      fetchCompany();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update branding", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleThemeSave = async () => {
    if (!selectedThemeId) return;
    try {
      setThemeSaving(true);
      await axiosInstance.put("/company/mobile-theme", { themeId: selectedThemeId });
      showToast("Mobile theme updated successfully");
      fetchCompany();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update mobile theme", "error");
    } finally {
      setThemeSaving(false);
    }
  };

  const selectedTheme = themes.find((t) => t.id === selectedThemeId);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="bg-light rounded" style={{ height: 32, width: 200, marginBottom: 8 }} />
          <div className="bg-light rounded" style={{ height: 16, width: 300, marginBottom: 24 }} />
          <div className="card"><div className="card-body p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-light rounded mb-3" style={{ height: 48 }} />
            ))}
          </div></div>
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
            <h2 className="mb-1" style={{ fontSize: 22, fontWeight: 700 }}>Branding Settings</h2>
            <p className="text-muted mb-0" style={{ fontSize: 14 }}>
              Customize your company brand identity and mobile app theme
            </p>
          </div>
        </div>

        {/* Branding Card */}
        <div className="card" style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="card-header" style={{ backgroundColor: "#fff", borderBottom: "1px solid #f0f0f0", borderRadius: "16px 16px 0 0", padding: "16px 24px" }}>
            <h5 className="fw-bold mb-0" style={{ fontSize: 16 }}>Brand Identity</h5>
          </div>
          <div className="card-body" style={{ padding: "24px" }}>
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Company Logo</label>
                  <div
                    className="border rounded text-center"
                    style={{
                      borderRadius: 12,
                      border: "2px dashed #dee2e6",
                      padding: "24px 16px",
                      backgroundColor: logoPreview ? "#f8f9fa" : "#fff",
                    }}
                  >
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo" className="img-fluid mb-3" style={{ maxHeight: 100, objectFit: "contain" }} />
                    )}
                    <input type="file" accept="image/*" className="form-control" onChange={handleLogoChange} style={{ borderRadius: 10 }} />
                    <small className="text-muted d-block mt-2">Recommended: 200x200px, PNG/JPEG</small>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Favicon</label>
                  <div
                    className="border rounded text-center"
                    style={{
                      borderRadius: 12,
                      border: "2px dashed #dee2e6",
                      padding: "24px 16px",
                      backgroundColor: faviconPreview ? "#f8f9fa" : "#fff",
                    }}
                  >
                    {faviconPreview && (
                      <img src={faviconPreview} alt="Favicon" className="img-fluid mb-3" style={{ maxHeight: 48, objectFit: "contain" }} />
                    )}
                    <input type="file" accept="image/*" className="form-control" onChange={handleFaviconChange} style={{ borderRadius: 10 }} />
                    <small className="text-muted d-block mt-2">Recommended: 32x32px, ICO/PNG</small>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Website URL</label>
                  <input
                    type="url"
                    className="form-control form-control-lg"
                    value={data.website}
                    onChange={(e) => setData({ ...data, website: e.target.value })}
                    placeholder="https://example.com"
                    style={{ borderRadius: 12 }}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-end mt-4 pt-2 border-top">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ borderRadius: 10, padding: "8px 24px" }}
                >
                  {saving ? (
                    <><span className="spinner-border spinner-border-sm me-1" /> Saving...</>
                  ) : (
                    "Save Branding"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile App Theme Selection */}
        <div className="card mt-4" style={{ borderRadius: 16, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="card-header d-flex align-items-center justify-content-between" style={{ backgroundColor: "#fff", borderBottom: "1px solid #f0f0f0", borderRadius: "16px 16px 0 0", padding: "16px 24px" }}>
            <div>
              <h5 className="fw-bold mb-1" style={{ fontSize: 16 }}>Mobile App Theme</h5>
              <p className="text-muted mb-0" style={{ fontSize: 13 }}>Choose a theme for your company&apos;s mobile application</p>
            </div>
            {selectedTheme && (
              <div className="d-none d-md-flex align-items-center gap-2">
                <span className="text-muted" style={{ fontSize: 13 }}>Current:</span>
                <span className="badge fw-semibold" style={{ backgroundColor: selectedTheme.primaryColor + "22", color: selectedTheme.primaryColor, borderRadius: 8, padding: "4px 12px" }}>
                  <span className="d-inline-block rounded-circle me-1" style={{ width: 8, height: 8, backgroundColor: selectedTheme.primaryColor }} />
                  {selectedTheme.name}
                </span>
              </div>
            )}
          </div>
          <div className="card-body" style={{ padding: "24px" }}>
            {themes.length === 0 ? (
              <div className="text-center py-4">
                <div style={{ fontSize: 40, opacity: 0.3, marginBottom: 8 }}>🎨</div>
                <p className="text-muted mb-0">No themes available. Contact super admin to create themes.</p>
              </div>
            ) : (
              <>
                <div className="row g-3">
                  {themes.map((theme) => {
                    const isSelected = selectedThemeId === theme.id;
                    const colors = {
                      primaryColor: theme.primaryColor,
                      secondaryColor: theme.secondaryColor,
                      backgroundColor: theme.backgroundColor,
                      surfaceColor: theme.surfaceColor,
                      textColor: theme.textColor,
                    };
                    return (
                      <div className="col-xl-3 col-lg-4 col-md-6" key={theme.id}>
                        <div
                          onClick={() => setSelectedThemeId(theme.id)}
                          style={{
                            cursor: "pointer",
                            borderRadius: 16,
                            border: isSelected ? `2px solid ${theme.primaryColor}` : "2px solid #e9ecef",
                            overflow: "hidden",
                            transition: "all 0.2s ease",
                            backgroundColor: "#fff",
                            boxShadow: isSelected ? `0 4px 16px ${theme.primaryColor}22` : "none",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#adb5bd";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#e9ecef";
                            }
                          }}
                        >
                          {/* Theme preview */}
                          <div
                            style={{
                              backgroundColor: theme.backgroundColor,
                              padding: "16px 12px 12px",
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <PhonePreview colors={colors} />
                          </div>
                          {/* Theme info */}
                          <div
                            style={{
                              padding: "10px 14px 12px",
                              borderTop: `1px solid ${isSelected ? theme.primaryColor + "22" : "#f0f0f0"}`,
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <span style={{ fontWeight: 600, fontSize: 14, color: theme.textColor }}>
                                {theme.name}
                              </span>
                              {theme.isDefault && (
                                <span style={{ fontSize: 10, color: "#6c757d" }}>Default</span>
                              )}
                            </div>
                            <div className="d-flex gap-1">
                              {colorFields.map((f) => (
                                <span
                                  key={f.key}
                                  className="d-inline-block rounded-circle"
                                  style={{
                                    width: 12,
                                    height: 12,
                                    backgroundColor: theme[f.key] as string,
                                    border: "1px solid #dee2e6",
                                  }}
                                  title={`${f.label}: ${theme[f.key]}`}
                                />
                              ))}
                            </div>
                            {isSelected && (
                              <div
                                style={{
                                  marginTop: 8,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: theme.primaryColor,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <i className="ti ti-check" style={{ fontSize: 14 }}></i>
                                Selected
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="d-flex align-items-center justify-content-between mt-4 pt-3 border-top">
                  {selectedTheme ? (
                    <div className="d-flex align-items-center gap-2">
                      <i className="ti ti-device-mobile text-muted" style={{ fontSize: 20 }}></i>
                      <span className="text-muted" style={{ fontSize: 14 }}>
                        Mobile app will use <strong style={{ color: selectedTheme.primaryColor }}>{selectedTheme.name}</strong> theme
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted" style={{ fontSize: 14 }}>Select a theme for your mobile app</span>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={handleThemeSave}
                    disabled={themeSaving || !selectedThemeId || selectedThemeId === data.mobileThemeId}
                    style={{ borderRadius: 10, padding: "8px 24px", minWidth: 130 }}
                  >
                    {themeSaving ? (
                      <><span className="spinner-border spinner-border-sm me-1" /> Saving...</>
                    ) : (
                      "Save Theme"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999 }}>
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
              animation: "slideInRight 0.3s ease",
            }}
          >
            <i className={`ti ${toast.type === "success" ? "ti-check-circle" : "ti-alert-circle"}`}></i>
            {toast.message}
          </div>
          <style>{`@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
        </div>
      )}
    </div>
  );
}
