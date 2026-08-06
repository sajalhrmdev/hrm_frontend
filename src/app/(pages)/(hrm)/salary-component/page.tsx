"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

type SalaryComponent = {
  id: number;
  name: string;
  code: string;
  type: "EARNING" | "DEDUCTION" | "EMPLOYER_CONTRIBUTION";
  prorated: boolean;
  calculationType: "FIXED" | "PERCENTAGE";
  baseType: "COMPONENT" | "COMPONENTS" | "GROSS" | null;
  baseComponentId: number | null;
  baseComponentIds: number[] | null;
  percentageValue: number | null;
  capAmount: number | null;
  floorAmount: number | null;
  baseCapAmount: number | null;
  createdAt: string;
};

const emptyForm = {
  name: "",
  code: "",
  type: "EARNING",
  prorated: false,
  calculationType: "FIXED",
  baseType: "",
  baseComponentId: "",
  baseComponentIds: [] as number[],
  percentageValue: "",
  capAmount: "",
  floorAmount: "",
  baseCapAmount: "",
};

const SalaryComponentPage = () => {
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({ ...emptyForm });

  const [editId, setEditId] = useState<number | null>(null);

  // ================= FETCH =================
  const fetchComponents = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/salary-component");

      setComponents(res.data.data || []);
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const baseName = (item: SalaryComponent) => {
    if (item.baseType === "GROSS") return "GROSS";

    if (item.baseType === "COMPONENTS" && item.baseComponentIds?.length) {
      return item.baseComponentIds
        .map((id) => {
          const base = components.find((c) => c.id === id);
          return base ? base.code : `#${id}`;
        })
        .join(" + ");
    }

    if (item.baseComponentId) {
      const base = components.find((c) => c.id === item.baseComponentId);
      return base ? `${base.code}` : `#${item.baseComponentId}`;
    }

    return "-";
  };

  // ================= INPUT =================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.name || !formData.code) {
        return alert("Name and code required");
      }

      if (
        formData.calculationType === "PERCENTAGE" &&
        (!formData.percentageValue || Number(formData.percentageValue) <= 0)
      ) {
        return alert("Percentage value must be greater than 0");
      }

      if (
        formData.capAmount &&
        formData.floorAmount &&
        Number(formData.capAmount) < Number(formData.floorAmount)
      ) {
        return alert("Cap amount cannot be lower than floor amount");
      }

      const payload = {
        ...formData,
        baseComponentId: formData.baseComponentId || null,
        baseComponentIds:
          formData.baseComponentIds?.length ? formData.baseComponentIds : null,
        percentageValue: formData.percentageValue || null,
        capAmount: formData.capAmount || null,
        floorAmount: formData.floorAmount || null,
        baseCapAmount: formData.baseCapAmount || null,
        baseType: formData.baseType || null,
      };

      if (editId) {
        await axiosInstance.patch(`/salary-component/${editId}`, payload);

        alert("Component updated successfully");
      } else {
        await axiosInstance.post("/salary-component", payload);

        alert("Component created successfully");
      }

      setFormData({ ...emptyForm });

      setEditId(null);

      fetchComponents();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message);
    }
  };

  // ================= EDIT =================
  const handleEdit = (item: SalaryComponent) => {
    setEditId(item.id);

    setFormData({
      name: item.name,
      code: item.code,
      type: item.type,
      prorated: item.prorated,
      calculationType: item.calculationType,
      baseType: item.baseType ?? "",
      baseComponentId: item.baseComponentId ? String(item.baseComponentId) : "",
      baseComponentIds: item.baseComponentIds ?? [],
      percentageValue: item.percentageValue != null ? String(item.percentageValue) : "",
      capAmount: item.capAmount != null ? String(item.capAmount) : "",
      floorAmount: item.floorAmount != null ? String(item.floorAmount) : "",
      baseCapAmount: item.baseCapAmount != null ? String(item.baseCapAmount) : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Delete this component?");

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/salary-component/${id}`);

      alert("Component deleted successfully");

      fetchComponents();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message);
    }
  };

  const isPercentage = formData.calculationType === "PERCENTAGE";

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container py-4">
          {/* ================= FORM ================= */}

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h4 className="mb-4">💰 Salary Component</h4>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* NAME */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Component Name</label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Basic Salary"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  {/* CODE */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Component Code</label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="BASIC"
                      name="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>

                  {/* TYPE */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Type</label>

                    <select
                      className="form-select"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="EARNING">EARNING</option>

                      <option value="DEDUCTION">DEDUCTION</option>

                      <option value="EMPLOYER_CONTRIBUTION">
                        EMPLOYER CONTRIBUTION
                      </option>
                    </select>
                  </div>

                  {/* CALCULATION TYPE */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Calculation Type</label>

                    <select
                      className="form-select"
                      name="calculationType"
                      value={formData.calculationType}
                      onChange={handleChange}
                    >
                      <option value="FIXED">FIXED (Amount)</option>

                      <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    </select>
                  </div>

                  {/* PRORATED */}
                  <div className="col-md-4 mb-3">
                    <div
                      className="form-check mt-4"
                      style={{ paddingTop: "8px" }}
                    >
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="prorated"
                        checked={formData.prorated}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            prorated: e.target.checked,
                          })
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="prorated"
                      >
                        Prorate on Payable Days
                      </label>
                    </div>
                  </div>

                  {isPercentage && (
                    <>
                      {/* BASE TYPE */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Base Type</label>

                        <select
                          className="form-select"
                          name="baseType"
                          value={formData.baseType}
                          onChange={handleChange}
                        >
                          <option value="">Select base...</option>

                          <option value="COMPONENT">Component</option>

                          <option value="COMPONENTS">
                            Components (sum)
                          </option>

                          <option value="GROSS">GROSS (of all earnings)</option>
                        </select>
                      </div>

                      {formData.baseType === "COMPONENT" && (
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Base Component</label>

                          <select
                            className="form-select"
                            name="baseComponentId"
                            value={formData.baseComponentId}
                            onChange={handleChange}
                          >
                            <option value="">Select component...</option>

                            {components
                              .filter(
                                (c) =>
                                  c.id !== editId && c.type !== "DEDUCTION",
                              )
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.code} - {c.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}

                      {formData.baseType === "COMPONENTS" && (
                        <div className="col-md-4 mb-3">
                          <label className="form-label">
                            Base Components (multi-select)
                          </label>

                          <div
                            className="border rounded p-2"
                            style={{ maxHeight: "160px", overflowY: "auto" }}
                          >
                            {components
                              .filter((c) => c.id !== editId)
                              .map((c) => (
                                <div
                                  className="form-check"
                                  key={c.id}
                                >
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`base-comp-${c.id}`}
                                    checked={(
                                      formData.baseComponentIds ?? []
                                    ).includes(c.id)}
                                    onChange={(e) => {
                                      const current =
                                        formData.baseComponentIds ?? [];
                                      const next = e.target.checked
                                        ? [...current, c.id]
                                        : current.filter(
                                            (id) => id !== c.id,
                                          );
                                      setFormData({
                                        ...formData,
                                        baseComponentIds: next,
                                      });
                                    }}
                                  />

                                  <label
                                    className="form-check-label"
                                    htmlFor={`base-comp-${c.id}`}
                                  >
                                    {c.code} - {c.name}
                                  </label>
                                </div>
                              ))}

                            {(formData.baseComponentIds ?? []).length === 0 && (
                              <div className="text-muted small">
                                Select at least one component
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* PERCENTAGE VALUE */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Percentage Value (%)</label>

                        <input
                          type="number"
                          step="any"
                          min="0"
                          className="form-control"
                          placeholder="40"
                          name="percentageValue"
                          value={formData.percentageValue}
                          onChange={handleChange}
                        />
                      </div>

                      {/* CAP */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label">
                          Cap Amount (optional)
                        </label>

                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          placeholder="e.g. 2500"
                          name="capAmount"
                          value={formData.capAmount}
                          onChange={handleChange}
                        />
                      </div>

                      {/* FLOOR */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label">
                          Floor Amount (optional)
                        </label>

                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          placeholder="e.g. 500"
                          name="floorAmount"
                          value={formData.floorAmount}
                          onChange={handleChange}
                        />
                      </div>

                      {/* BASE CAP */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label">
                          Base Cap Amount (optional)
                        </label>

                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          placeholder="caps base before % (e.g. 15000)"
                          name="baseCapAmount"
                          value={formData.baseCapAmount}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  className={`btn ${editId ? "btn-warning" : "btn-primary"}`}
                >
                  {editId ? "✏️ Update Component" : "➕ Create Component"}
                </button>
              </form>
            </div>
          </div>

          {/* ================= TABLE ================= */}

          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="mb-3">📋 Salary Components</h5>

              {loading ? (
                <SkeletonTable rows={5} columns={6} />
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead>
                      <tr>
                        <th>#</th>

                        <th>Name</th>

                        <th>Code</th>

                        <th>Type</th>

                        <th>Calculation</th>

                        <th>Prorated</th>

                        <th>Created</th>

                        <th style={{ width: "180px" }}>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {components.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center">
                            No components found
                          </td>
                        </tr>
                      ) : (
                        components.map((item, index) => (
                          <tr key={item.id}>
                            <td>{index + 1}</td>

                            <td>{item.name}</td>

                            <td>{item.code}</td>

                            <td>
                              <span
                                className={`badge ${
                                  item.type === "EARNING"
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                              >
                                {item.type}
                              </span>
                            </td>

                            <td>
                              {item.calculationType === "PERCENTAGE" ? (
                                <span>
                                  <span className="badge bg-primary">
                                    {item.percentageValue}% of {baseName(item)}
                                  </span>
                                  {item.baseCapAmount != null && (
                                    <span className="badge bg-info ms-1">
                                      base cap ₹{item.baseCapAmount}
                                    </span>
                                  )}
                                  {(item.capAmount != null ||
                                    item.floorAmount != null) && (
                                    <span className="badge bg-secondary ms-1">
                                      {item.floorAmount != null
                                        ? `floor ${item.floorAmount}`
                                        : ""}
                                      {item.floorAmount != null &&
                                        item.capAmount != null
                                        ? " / "
                                        : ""}
                                      {item.capAmount != null
                                        ? `cap ${item.capAmount}`
                                        : ""}
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="badge bg-dark">
                                  FIXED amount
                                </span>
                              )}
                            </td>

                            <td>
                              <span
                                className={`badge ${
                                  item.prorated ? "bg-info" : "bg-secondary"
                                }`}
                              >
                                {item.prorated ? "Yes" : "No"}
                              </span>
                            </td>

                            <td>
                              {new Date(item.createdAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </td>

                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() => handleEdit(item)}
                                >
                                  ✏️ Edit
                                </button>

                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  🗑 Delete
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
        </div>
      </div>
    </div>
  );
};

export default SalaryComponentPage;
