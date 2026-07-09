"use client";

import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "@/utils/axiosInstance";

type BrandingData = {
  logo: string;
  favicon: string;
  website: string;
};

export default function BrandingSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<BrandingData>({ logo: "", favicon: "", website: "" });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [faviconPreview, setFaviconPreview] = useState<string>("");

  const fetchCompany = async () => {
    try {
      const res = await axiosInstance.get("/company/myCompany");
      const c = res.data.data;
      setData({ logo: c.logo || "", favicon: c.favicon || "", website: c.website || "" });
      setLogoPreview(c.logo || "");
      setFaviconPreview(c.favicon || "");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompany(); }, []);

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
      alert("Branding updated successfully");
      setLogoFile(null);
      setFaviconFile(null);
      fetchCompany();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update branding");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-wrapper"><div className="content"><div className="text-center py-5">Loading...</div></div></div>;
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Branding Settings</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item active" aria-current="page">Branding</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Company Logo</label>
                  <div className="border rounded p-3 text-center">
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="img-fluid mb-2"
                        style={{ maxHeight: 120, objectFit: "contain" }}
                      />
                    )}
                    <input type="file" accept="image/*" className="form-control" onChange={handleLogoChange} />
                    <small className="text-muted d-block mt-1">Recommended: 200x200px, PNG/JPEG</small>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Favicon</label>
                  <div className="border rounded p-3 text-center">
                    {faviconPreview && (
                      <img
                        src={faviconPreview}
                        alt="Favicon"
                        className="img-fluid mb-2"
                        style={{ maxHeight: 60, objectFit: "contain" }}
                      />
                    )}
                    <input type="file" accept="image/*" className="form-control" onChange={handleFaviconChange} />
                    <small className="text-muted d-block mt-1">Recommended: 32x32px, ICO/PNG</small>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold">Website URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={data.website}
                    onChange={(e) => setData({ ...data, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-end mt-4 gap-2">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Branding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
