"use client";

import React, {
  useEffect,
  useState,
} from "react";

import axiosInstance from "@/utils/axiosInstance";

type Department = {

  id: number;

  title: string;
};

type Designation = {

  id: number;

  title: string;

  code?: string;

  level?: number;

  status:
    | "ACTIVE"
    | "INACTIVE";

  createdAt: string;

  department?: {
    id: number;

    title: string;
  };

  _count?: {

    employees: number;
  };
};

const DesignationPage = () => {

  const [loading, setLoading] =
    useState(false);

  const [
    designations,
    setDesignations,
  ] = useState<
    Designation[]
  >([]);

  const [
    departments,
    setDepartments,
  ] = useState<
    Department[]
  >([]);

  const [showModal, setShowModal] =
    useState(false);

  const [
    editingDesignation,
    setEditingDesignation,
  ] =
    useState<Designation | null>(
      null
    );

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({

      total: 0,

      totalPages: 1,

      limit: 10,
    });

  // ============================================
  // FORM
  // ============================================

  const [formData, setFormData] =
    useState({

      title: "",

      code: "",

      level: "",

      departmentId: "",

      status:
        "ACTIVE",
    });

  // ============================================
  // FETCH DESIGNATIONS
  // ============================================

  const fetchDesignations =
    async () => {

      try {

        setLoading(true);

        const res =
          await axiosInstance.get(
            `/designation?page=${page}&limit=10&search=${search}`
          );

        setDesignations(
          res?.data?.data
            ?.designations || []
        );

        setPagination(
          res?.data?.data
            ?.pagination
        );

      } catch (err: any) {

        console.log(err);

        alert(
          err?.response?.data
            ?.message ||
          "Failed to fetch designations"
        );

      } finally {

        setLoading(false);
      }
    };

  // ============================================
  // FETCH DEPARTMENTS
  // ============================================

  const fetchDepartments =
    async () => {

      try {

        const res =
          await axiosInstance.get(
            "/department?limit=1000"
          );

        setDepartments(
          res?.data?.data
            ?.departments || []
        );

      } catch (err) {

        console.log(err);
      }
    };

  useEffect(() => {

    fetchDesignations();

  }, [page]);

  useEffect(() => {

    fetchDepartments();

  }, []);

  // ============================================
  // SEARCH
  // ============================================

  const handleSearch =
    (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      setPage(1);

      fetchDesignations();
    };

  // ============================================
  // CHANGE
  // ============================================

  const handleChange =
    (
      e: React.ChangeEvent<
        HTMLInputElement |
        HTMLSelectElement
      >
    ) => {

      const {
        name,
        value,
      } = e.target;

      setFormData(
        (prev) => ({

          ...prev,

          [name]: value,
        })
      );
    };

  // ============================================
  // RESET
  // ============================================

  const resetForm = () => {

    setFormData({

      title: "",

      code: "",

      level: "",

      departmentId: "",

      status:
        "ACTIVE",
    });

    setEditingDesignation(
      null
    );
  };

  // ============================================
  // OPEN CREATE
  // ============================================

  const handleOpenCreate =
    () => {

      resetForm();

      setShowModal(true);
    };

  // ============================================
  // OPEN EDIT
  // ============================================

  const handleEdit =
    (
      designation: Designation
    ) => {

      setEditingDesignation(
        designation
      );

      setFormData({

        title:
          designation.title,

        code:
          designation.code ||
          "",

        level:
          designation.level
            ?.toString() ||
          "",

        departmentId:
          designation
            .department?.id
            ?.toString() ||
          "",

        status:
          designation.status,
      });

      setShowModal(true);
    };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      try {

        const payload = {

          ...formData,

          level:
            formData.level
              ? Number(
                  formData.level
                )
              : null,

          departmentId:
            formData.departmentId
              ? Number(
                  formData.departmentId
                )
              : null,
        };

        if (
          editingDesignation
        ) {

          await axiosInstance.put(
            `/designation/${editingDesignation.id}`,
            payload
          );

          alert(
            "Designation updated successfully"
          );

        } else {

          await axiosInstance.post(
            "/designation",
            payload
          );

          alert(
            "Designation created successfully"
          );
        }

        setShowModal(false);

        resetForm();

        fetchDesignations();

      } catch (err: any) {

        console.log(err);

        alert(
          err?.response?.data
            ?.message ||
          "Failed"
        );
      }
    };

  // ============================================
  // DELETE
  // ============================================

  const handleDelete =
    async (
      id: number
    ) => {

      try {

        const confirmDelete =
          window.confirm(
            "Delete designation?"
          );

        if (
          !confirmDelete
        ) {
          return;
        }

        await axiosInstance.delete(
          `/designation/${id}`
        );

        alert(
          "Designation deleted"
        );

        fetchDesignations();

      } catch (err: any) {

        console.log(err);

        alert(
          err?.response?.data
            ?.message ||
          "Delete failed"
        );
      }
    };

  return (

    <div className="page-wrapper">

      <div className="content">

        {/* HEADER */}

        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

          <div>

            <h3 className="fw-bold mb-1">
              💼 Designation Management
            </h3>

            <p className="text-muted mb-0">
              Manage all designations
            </p>

          </div>

          <button
            className="btn btn-primary"

            onClick={
              handleOpenCreate
            }
          >
            ➕ Add Designation
          </button>

        </div>

        {/* SEARCH */}

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body">

            <form
              onSubmit={
                handleSearch
              }
            >

              <div className="row g-3">

                <div className="col-md-10">

                  <input
                    type="text"

                    className="form-control"

                    placeholder="Search designation..."

                    value={
                      search
                    }

                    onChange={(
                      e
                    ) =>
                      setSearch(
                        e.target
                          .value
                      )
                    }
                  />

                </div>

                <div className="col-md-2">

                  <button
                    type="submit"

                    className="btn btn-dark w-100"
                  >
                    🔍 Search
                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

        {/* TABLE */}

        <div className="card border-0 shadow-sm">

          <div className="card-body">

            {loading ? (

              <div className="text-center py-5">
                Loading...
              </div>

            ) : (

              <div className="table-responsive">

                <table className="table table-bordered align-middle">

                  <thead className="table-light">

                    <tr>

                      <th>#</th>

                      <th>Designation</th>

                      <th>Code</th>

                      <th>Department</th>

                      <th>Level</th>

                      <th>Employees</th>

                      <th>Status</th>

                      <th>Action</th>

                    </tr>

                  </thead>

                  <tbody>

                    {designations.length ===
                    0 ? (

                      <tr>

                        <td
                          colSpan={8}
                          className="text-center py-4"
                        >
                          No designations found
                        </td>

                      </tr>

                    ) : (

                      designations.map(
                        (
                          item,
                          index
                        ) => (

                          <tr
                            key={item.id}
                          >

                            <td>

                              {(page -
                                1) *
                                10 +
                                index +
                                1}

                            </td>

                            <td>

                              <div className="fw-semibold">

                                {
                                  item.title
                                }

                              </div>

                            </td>

                            <td>

                              {
                                item.code
                              }

                            </td>

                            <td>

                              {
                                item
                                  .department
                                  ?.title
                              }

                            </td>

                            <td>

                              {
                                item.level
                              }

                            </td>

                            <td>

                              {
                                item
                                  ._count
                                  ?.employees
                              }

                            </td>

                            <td>

                              {item.status ===
                              "ACTIVE" ? (

                                <span className="badge bg-success">
                                  ACTIVE
                                </span>

                              ) : (

                                <span className="badge bg-danger">
                                  INACTIVE
                                </span>
                              )}

                            </td>

                            <td>

                              <div className="d-flex gap-2">

                                <button
                                  className="btn btn-sm btn-dark"

                                  onClick={() =>
                                    handleEdit(
                                      item
                                    )
                                  }
                                >
                                  ✏ Edit
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

        {/* PAGINATION */}

        <div className="d-flex justify-content-between align-items-center mt-4">

          <div className="text-muted">

            Total:
            {" "}
            {
              pagination.total
            }

          </div>

          <div className="d-flex gap-2">

            <button
              className="btn btn-outline-dark"

              disabled={
                page === 1
              }

              onClick={() =>
                setPage(
                  (
                    prev
                  ) =>
                    prev - 1
                )
              }
            >
              Previous
            </button>

            <button
              className="btn btn-dark"
            >
              {page}
            </button>

            <button
              className="btn btn-outline-dark"

              disabled={
                page ===
                pagination.totalPages
              }

              onClick={() =>
                setPage(
                  (
                    prev
                  ) =>
                    prev + 1
                )
              }
            >
              Next
            </button>

          </div>

        </div>

      </div>

      {/* MODAL */}

      {showModal && (

        <div
          className="modal d-block"
          style={{
            background:
              "rgba(0,0,0,0.5)",
          }}
        >

          <div className="modal-dialog modal-lg">

            <div className="modal-content border-0 shadow-lg">

              {/* HEADER */}

              <div className="modal-header">

                <h5 className="modal-title fw-bold">

                  {editingDesignation
                    ? "✏ Edit Designation"
                    : "➕ Add Designation"}

                </h5>

                <button
                  className="btn-close"

                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                />

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleSubmit
                }
              >

                <div className="modal-body">

                  <div className="row g-3">

                    {/* TITLE */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Designation Name
                      </label>

                      <input
                        type="text"

                        className="form-control"

                        name="title"

                        value={
                          formData.title
                        }

                        onChange={
                          handleChange
                        }

                        required
                      />

                    </div>

                    {/* CODE */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Code
                      </label>

                      <input
                        type="text"

                        className="form-control"

                        name="code"

                        value={
                          formData.code
                        }

                        onChange={
                          handleChange
                        }
                      />

                    </div>

                    {/* DEPARTMENT */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Department
                      </label>

                      <select
                        className="form-select"

                        name="departmentId"

                        value={
                          formData.departmentId
                        }

                        onChange={
                          handleChange
                        }
                      >

                        <option value="">
                          Select Department
                        </option>

                        {departments.map(
                          (
                            item
                          ) => (

                            <option
                              key={
                                item.id
                              }
                              value={
                                item.id
                              }
                            >

                              {
                                item.title
                              }

                            </option>
                          )
                        )}

                      </select>

                    </div>

                    {/* LEVEL */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Level
                      </label>

                      <input
                        type="number"

                        className="form-control"

                        name="level"

                        value={
                          formData.level
                        }

                        onChange={
                          handleChange
                        }
                      />

                    </div>

                    {/* STATUS */}

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Status
                      </label>

                      <select
                        className="form-select"

                        name="status"

                        value={
                          formData.status
                        }

                        onChange={
                          handleChange
                        }
                      >

                        <option value="ACTIVE">
                          ACTIVE
                        </option>

                        <option value="INACTIVE">
                          INACTIVE
                        </option>

                      </select>

                    </div>

                  </div>

                </div>

                {/* FOOTER */}

                <div className="modal-footer">

                  <button
                    type="button"

                    className="btn btn-secondary"

                    onClick={() =>
                      setShowModal(
                        false
                      )
                    }
                  >
                    Close
                  </button>

                  <button
                    type="submit"

                    className="btn btn-primary"
                  >

                    {editingDesignation
                      ? "Update Designation"
                      : "Create Designation"}

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

export default DesignationPage;