"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";

type Slab = {
  id: number;
  minSalary: number;
  maxSalary: number | null;
  taxAmount: number;
};

const ProfessionalTaxSettingsPage = () => {
  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    minSalary: "",
    maxSalary: "",
    taxAmount: "",
  });

  const fetchSlabs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/professional-tax-slab");
      setSlabs(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlabs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        minSalary: Number(formData.minSalary),
        maxSalary: formData.maxSalary ? Number(formData.maxSalary) : null,
        taxAmount: Number(formData.taxAmount),
      };

      if (editId) {
        await axiosInstance.put(`/professional-tax-slab/${editId}`, payload);
        toast.success("Slab updated");
      } else {
        await axiosInstance.post("/professional-tax-slab", payload);
        toast.success("Slab created");
      }

      setFormData({ minSalary: "", maxSalary: "", taxAmount: "" });
      setEditId(null);
      setOpenModal(false);
      fetchSlabs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slab: Slab) => {
    setEditId(slab.id);
    setFormData({
      minSalary: String(slab.minSalary),
      maxSalary: slab.maxSalary !== null ? String(slab.maxSalary) : "",
      taxAmount: String(slab.taxAmount),
    });
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this slab?")) return;
    try {
      await axiosInstance.delete(`/professional-tax-slab/${id}`);
      toast.success("Slab deleted");
      fetchSlabs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Professional Tax Slabs</h3>
            <p className="text-muted mb-0">
              Configure state professional tax slabs per salary range
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditId(null);
              setFormData({ minSalary: "", maxSalary: "", taxAmount: "" });
              setOpenModal(true);
            }}
          >
            + Add Slab
          </button>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Min Salary</th>
                    <th>Max Salary</th>
                    <th>Tax Amount</th>
                    <th style={{ width: "160px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slabs.map((slab, index) => (
                    <tr key={slab.id}>
                      <td>{index + 1}</td>
                      <td>₹{slab.minSalary.toLocaleString()}</td>
                      <td>
                        {slab.maxSalary !== null
                          ? `₹${slab.maxSalary.toLocaleString()}`
                          : "Above (No limit)"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            slab.taxAmount === 0 ? "bg-success" : "bg-warning"
                          }`}
                        >
                          {slab.taxAmount === 0
                            ? "Nil"
                            : `₹${slab.taxAmount}`}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-dark"
                            onClick={() => handleEdit(slab)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(slab.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!slabs.length && !loading && (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        No slabs configured
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {openModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editId ? "Edit Slab" : "Add Slab"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setOpenModal(false)}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Min Salary (₹)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="minSalary"
                        value={formData.minSalary}
                        onChange={handleChange}
                        placeholder="e.g. 10001"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Max Salary (₹)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="maxSalary"
                        value={formData.maxSalary}
                        onChange={handleChange}
                        placeholder="Leave empty for no upper limit"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Tax Amount (₹)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="taxAmount"
                        value={formData.taxAmount}
                        onChange={handleChange}
                        placeholder="e.g. 110"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setOpenModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editId
                        ? "Update"
                        : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalTaxSettingsPage;
