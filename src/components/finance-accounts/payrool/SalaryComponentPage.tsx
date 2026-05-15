import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

type SalaryComponent = {
  id: number;
  name: string;
  code: string;
  type: "EARNING" | "DEDUCTION";
  createdAt: string;
};

const SalaryComponentPage = () => {
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "EARNING",
  });

  const [editId, setEditId] = useState<number | null>(null);

  // ================= FETCH =================
  const fetchComponents = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        "/salary-component"
      );

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

  // ================= INPUT =================
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      if (
        !formData.name ||
        !formData.code
      ) {
        return alert(
          "Name and code required"
        );
      }

      if (editId) {
        await axiosInstance.patch(
          `/salary-component/${editId}`,
          formData
        );

        alert(
          "Component updated successfully"
        );
      } else {
        await axiosInstance.post(
          "/salary-component",
          formData
        );

        alert(
          "Component created successfully"
        );
      }

      setFormData({
        name: "",
        code: "",
        type: "EARNING",
      });

      setEditId(null);

      fetchComponents();
    } catch (err: any) {
      console.log(err);

      alert(
        err?.response?.data?.message
      );
    }
  };

  // ================= EDIT =================
  const handleEdit = (
    item: SalaryComponent
  ) => {
    setEditId(item.id);

    setFormData({
      name: item.name,
      code: item.code,
      type: item.type,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= DELETE =================
  const handleDelete = async (
    id: number
  ) => {
    const confirmDelete =
      window.confirm(
        "Delete this component?"
      );

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(
        `/salary-component/${id}`
      );

      alert(
        "Component deleted successfully"
      );

      fetchComponents();
    } catch (err: any) {
      console.log(err);

      alert(
        err?.response?.data?.message
      );
    }
  };

  return (
    <div className="container py-4">
      {/* ================= FORM ================= */}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h4 className="mb-4">
            💰 Salary Component
          </h4>

          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* NAME */}
              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Component Name
                </label>

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
                <label className="form-label">
                  Component Code
                </label>

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
                <label className="form-label">
                  Type
                </label>

                <select
                  className="form-select"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="EARNING">
                    EARNING
                  </option>

                  <option value="DEDUCTION">
                    DEDUCTION
                  </option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className={`btn ${
                editId
                  ? "btn-warning"
                  : "btn-primary"
              }`}
            >
              {editId
                ? "✏️ Update Component"
                : "➕ Create Component"}
            </button>
          </form>
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="mb-3">
            📋 Salary Components
          </h5>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead>
                  <tr>
                    <th>#</th>

                    <th>Name</th>

                    <th>Code</th>

                    <th>Type</th>

                    <th>Created</th>

                    <th style={{ width: "180px" }}>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {components.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center"
                      >
                        No components found
                      </td>
                    </tr>
                  ) : (
                    components.map(
                      (item, index) => (
                        <tr key={item.id}>
                          <td>
                            {index + 1}
                          </td>

                          <td>
                            {item.name}
                          </td>

                          <td>
                            {item.code}
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                item.type ===
                                "EARNING"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>

                          <td>
                            {new Date(
                              item.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </td>

                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() =>
                                  handleEdit(
                                    item
                                  )
                                }
                              >
                                ✏️ Edit
                              </button>

                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() =>
                                  handleDelete(
                                    item.id
                                  )
                                }
                              >
                                🗑 Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryComponentPage;