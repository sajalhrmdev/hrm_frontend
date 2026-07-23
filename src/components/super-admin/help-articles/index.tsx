"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { SkeletonTable } from "@/core/common/Skeleton";

const HELP_API = process.env.NEXT_PUBLIC_HELP_CHATBOT_URL ;

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string | null;
  related_links: string[];
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  "Employee",
  "Leave",
  "Attendance",
  "Payroll",
  "Department",
  "Designation",
  "Work Schedule",
  "Settings",
  "Performance",
  "Reports",
  "Super Admin",
  "General",
];

const emptyForm = {
  title: "",
  category: "Employee",
  content: "",
  keywords: "",
  related_links: "",
};

const HelpArticlesComponent = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (searchTerm) params.set("search", searchTerm);
      const res = await axios.get(`${HELP_API}/kb/articles?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(res.data);
    } catch {
      showToast("Failed to load articles", "error");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, searchTerm, showToast]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (article: Article) => {
    setEditing(article);
    setForm({
      title: article.title,
      category: article.category,
      content: article.content,
      keywords: article.keywords || "",
      related_links: (article.related_links || []).join("\n"),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      showToast("Title and content are required", "error");
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const payload = {
        ...form,
        related_links: form.related_links
          ? form.related_links.split("\n").filter(Boolean)
          : [],
      };

      if (editing) {
        await axios.put(`${HELP_API}/kb/articles/${editing.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Article updated successfully");
      } else {
        await axios.post(`${HELP_API}/kb/articles`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Article created successfully");
      }
      setShowModal(false);
      fetchArticles();
    } catch {
      showToast("Failed to save article", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${HELP_API}/kb/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Article deleted successfully");
      fetchArticles();
    } catch {
      showToast("Failed to delete article", "error");
    }
  };

  const getCategoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      Employee: "blue",
      Leave: "green",
      Attendance: "purple",
      Payroll: "orange",
      Department: "teal",
      Designation: "pink",
      "Work Schedule": "indigo",
      Settings: "gray",
      Performance: "red",
      Reports: "cyan",
      "Super Admin": "dark",
      General: "brown",
    };
    return colors[cat] || "gray";
  };

  return (
    <div>
      {/* toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "12px 24px",
            borderRadius: 8,
            backgroundColor: toast.type === "success" ? "#22C55E" : "#EF4444",
            color: "#fff",
            fontWeight: 500,
            fontSize: 14,
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            Help Articles
          </h2>
          <p style={{ margin: "4px 0 0", color: "#666", fontSize: 13 }}>
            Manage knowledge base articles for the Help Chatbot
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4F46E5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          + Add Article
        </button>
      </div>

      {/* filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ddd",
            fontSize: 13,
          }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search articles..."
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ddd",
            fontSize: 13,
            maxWidth: 300,
          }}
        />
        <span style={{ fontSize: 13, color: "#888" }}>
          {articles.length} articles
        </span>
      </div>

      {/* table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
          <SkeletonTable rows={5} columns={5} />
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#F8F9FA", textAlign: "left" }}>
                <th style={{ padding: "10px 12px", borderBottom: "2px solid #eee" }}>Title</th>
                <th style={{ padding: "10px 12px", borderBottom: "2px solid #eee" }}>Category</th>
                <th style={{ padding: "10px 12px", borderBottom: "2px solid #eee" }}>Keywords</th>
                <th style={{ padding: "10px 12px", borderBottom: "2px solid #eee" }}>Updated</th>
                <th style={{ padding: "10px 12px", borderBottom: "2px solid #eee" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 500 }}>{article.title}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: getCategoryBadge(article.category),
                        color: "#fff",
                        fontSize: 11,
                      }}
                    >
                      {article.category}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", color: "#666", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {article.keywords || "-"}
                  </td>
                  <td style={{ padding: "10px 12px", color: "#666" }}>
                    {new Date(article.updated_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <button
                      onClick={() => openEdit(article)}
                      style={{
                        padding: "4px 10px",
                        marginRight: 6,
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      style={{
                        padding: "4px 10px",
                        border: "1px solid #EF4444",
                        borderRadius: 4,
                        backgroundColor: "#fff",
                        color: "#EF4444",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#888" }}>
                    No articles found. Create your first article!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9998,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 24,
              width: 600,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 20px", fontSize: 18 }}>
              {editing ? "Edit Article" : "Create Article"}
            </h3>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500 }}>
                Title *
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500 }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: 13,
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500 }}>
                Content *
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={10}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: 13,
                  fontFamily: "monospace",
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500 }}>
                Keywords (comma-separated)
              </label>
              <input
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="e.g. apply leave, leave request, vacation"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500 }}>
                Related Links (one per line)
              </label>
              <textarea
                value={form.related_links}
                onChange={(e) => setForm({ ...form, related_links: e.target.value })}
                rows={3}
                placeholder="How to approve leave&#10;How to check leave balance"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "8px 20px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: saving ? "#ccc" : "#4F46E5",
                  color: "#fff",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpArticlesComponent;
