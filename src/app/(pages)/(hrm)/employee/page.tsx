"use client";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import { SkeletonTable } from "@/core/common/Skeleton";

// ============================================
// TYPES
// ============================================

type Employee = {
  id: number;

  name: string;

  email: string;

  phone: string;

  employeeCode: string;

  status: "ACTIVE" | "INACTIVE";

  joiningDate: string;

  role?: {
    id: number;
    name: string;
  };

  department?: {
    id: number;
    title: string;
  };

  designation?: {
    id: number;
    title: string;
  };

  shift?: {
    id: number;
    title: string;
  };
};

type Option = {
  id: number;
  title: string;
};

type RoleOption = {
  id: number;
  name: string;
};

const EmployeePage = () => {
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [roles, setRoles] = useState<RoleOption[]>([]);

  const [departments, setDepartments] = useState<Option[]>([]);

  const [designations, setDesignations] = useState<Option[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,

    totalPages: 1,

    limit: 10,
  });

  // ============================================
  // FORM
  // ============================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",

    roleId: "",

    departmentId: "",
    designationId: "",

    employeeCode: "",
    joiningDate: "",

    status: "ACTIVE",

    createUser: false,
    password: "",
  });

  // ============================================
  // FETCH EMPLOYEES
  // ============================================

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/employee?page=${page}&limit=10&search=${search}`,
      );

      setEmployees(res?.data?.data?.employees || []);

      setPagination(res?.data?.data?.pagination);
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FETCH DROPDOWNS
  // ============================================

  const fetchDropdowns = async () => {
    try {
      const [roleRes, deptRes] = await Promise.all([
        axiosInstance.get("/roles"),

        axiosInstance.get("/department"),
      ]);

      setRoles(roleRes?.data?.data || []);

      setDepartments(deptRes?.data?.data?.departments || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ============================================
  // FETCH DESIGNATIONS
  // ============================================

  const fetchDesignationsByDepartment = async (departmentId: string) => {
    if (!departmentId) {
      setDesignations([]);

      return;
    }

    try {
      const res = await axiosInstance.get(
        `/designation/by-department/${departmentId}`,
      );

      setDesignations(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    fetchEmployees();
  }, [page]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  // ============================================
  // SEARCH
  // ============================================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    setPage(1);

    fetchEmployees();
  };

  // ============================================
  // CHANGE
  // ============================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // ========================================
    // DEPARTMENT CHANGE
    // ========================================

    if (name === "departmentId") {
      fetchDesignationsByDepartment(value);

      setFormData((prev) => ({
        ...prev,

        departmentId: value,

        designationId: "",
      }));

      return;
    }

    // ========================================
    // NORMAL CHANGE
    // ========================================

    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  // ============================================
  // RESET
  // ============================================

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",

      roleId: "",

      departmentId: "",
      designationId: "",

      employeeCode: "",
      joiningDate: "",

      status: "ACTIVE",

      createUser: false,
      password: "",
    });

    setDesignations([]);
    setEditingEmployee(null);
  };

  // ============================================
  // OPEN CREATE
  // ============================================

  const handleOpenCreate = () => {
    resetForm();

    setShowModal(true);
  };

  // ============================================
  // OPEN EDIT
  // ============================================

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);

    // ========================================
    // FETCH DESIGNATIONS
    // ========================================

    if (employee.department?.id) {
      fetchDesignationsByDepartment(employee.department.id.toString());
    }

    setFormData({
      name: employee.name,

      email: employee.email,

      phone: employee.phone,

      roleId: employee.role?.id?.toString() || "",

      departmentId: employee.department?.id?.toString() || "",

      designationId: employee.designation?.id?.toString() || "",

      employeeCode: employee.employeeCode,

      joiningDate: employee.joiningDate
        ? new Date(employee.joiningDate).toISOString().split("T")[0]
        : "",

      status: employee.status,

      createUser: false,

      password: "",
    });

    setShowModal(true);
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,

        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,

        departmentId: formData.departmentId
          ? Number(formData.departmentId)
          : null,

        designationId: formData.designationId
          ? Number(formData.designationId)
          : null,

        employeeCode: formData.employeeCode,

        joiningDate: formData.joiningDate,

        createUser: formData.createUser,

        password: formData.password,

        roleId: formData.roleId ? Number(formData.roleId) : null,
      };
      if (formData.createUser) {
        if (!formData.email) {
          toast.error("Email required");
          return;
        }

        if (!formData.password) {
          toast.error("Password required");
          return;
        }

        if (!formData.roleId) {
          toast.error("Role required");
          return;
        }
      }
      if (editingEmployee) {
        await axiosInstance.put(`/employee/${editingEmployee.id}`, payload);

        alert("Employee updated successfully");
      } else {
        await axiosInstance.post("/employee", payload);

        alert("Employee created successfully");
      }

      setShowModal(false);

      resetForm();

      fetchEmployees();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed");
    }
  };

  // ============================================
  // DELETE
  // ============================================

  const handleDelete = async (id: number) => {
    try {
      const confirmDelete = window.confirm("Deactivate employee?");

      if (!confirmDelete) {
        return;
      }

      await axiosInstance.delete(`/employee/${id}`);

      alert("Employee deactivated");

      fetchEmployees();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* HEADER */}

        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">👨‍💼 Employee Management</h3>

            <p className="text-muted mb-0">Manage employees</p>
          </div>

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            ➕ Add Employee
          </button>
        </div>

        {/* SEARCH */}

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch}>
              <div className="row g-3">
                <div className="col-md-10">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search employee..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <button type="submit" className="btn btn-dark w-100">
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
              <SkeletonTable rows={5} columns={5} />
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>

                      <th>Employee</th>

                      <th>Code</th>

                      <th>Department</th>

                      <th>Designation</th>

                      <th>Role</th>

                      <th>Status</th>

                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-4">
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      employees.map((item, index) => (
                        <tr key={item.id}>
                          <td>{(page - 1) * 10 + index + 1}</td>

                          <td>
                            <div className="fw-semibold">{item.name}</div>

                            <small className="text-muted">{item.email}</small>
                          </td>

                          <td>{item.employeeCode}</td>

                          <td>{item.department?.title || "-"}</td>

                          <td>{item.designation?.title || "-"}</td>

                          <td>{item.role?.name || "-"}</td>

                          <td>
                            {item.status === "ACTIVE" ? (
                              <span className="badge bg-success">ACTIVE</span>
                            ) : (
                              <span className="badge bg-danger">INACTIVE</span>
                            )}
                          </td>

                          <td>
                            <div className="d-flex gap-2">
                              <Link
                                href={`/profile/${item.id}`}
                                className="btn btn-sm btn-primary"
                              >
                                👁 View
                              </Link>

                              <button
                                className="btn btn-sm btn-dark"
                                onClick={() => handleEdit(item)}
                              >
                                ✏ Edit
                              </button>

                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(item.id)}
                              >
                                🗑 Deactivate
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

      {/* MODAL */}

      {showModal && (
        <div
          className="modal d-block"
          style={{
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              {/* HEADER */}

              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingEmployee ? "✏ Edit Employee" : "➕ Add Employee"}
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              {/* FORM */}

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* NAME */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Name *</label>

                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* EMAIL */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email *</label>

                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* PHONE */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone</label>

                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    {/* EMPLOYEE CODE */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Employee Code
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="employeeCode"
                        value={formData.employeeCode}
                        onChange={handleChange}
                      />
                    </div>

                    {/* ROLE */}

                    {/* <div className="col-md-3">
                      <label className="form-label fw-semibold">Role</label>

                      <select
                        className="form-select"
                        name="roleId"
                        value={formData.roleId}
                        onChange={handleChange}
                      >
                        <option value="">Select Role</option>

                        {roles.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div> */}

                    {/* DEPARTMENT */}

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">
                        Department
                      </label>

                      <select
                        className="form-select"
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={handleChange}
                      >
                        <option value="">Select Department</option>

                        {departments.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* DESIGNATION */}

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">
                        Designation
                      </label>

                      <select
                        className="form-select"
                        name="designationId"
                        value={formData.designationId}
                        onChange={handleChange}
                      >
                        <option value="">Select Designation</option>

                        {designations.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* JOINING DATE */}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Joining Date
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>

                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="ACTIVE">ACTIVE</option>

                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>

                    {/* STATUS */}

                    {editingEmployee && (
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Status</label>

                        <select
                          className="form-select"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          <option value="ACTIVE">ACTIVE</option>

                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </div>
                    )}
                    <div className="col-md-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="createUser"
                          checked={formData.createUser}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              createUser: e.target.checked,
                            }))
                          }
                        />

                        <label
                          className="form-check-label fw-semibold"
                          htmlFor="createUser"
                        >
                          Create Login User
                        </label>
                      </div>

                      <small className="text-muted">
                        Employee email will be used as login email
                      </small>
                    </div>
                    {formData.createUser && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label">Login Password</label>

                          <input
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                password: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Company Role</label>

                          <select
                            className="form-select"
                            value={formData.roleId}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                roleId: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select Role</option>

                            {roles.map((role: any) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* FOOTER */}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>

                  <button type="submit" className="btn btn-primary">
                    {editingEmployee ? "Update Employee" : "Create Employee"}
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

export default EmployeePage;
