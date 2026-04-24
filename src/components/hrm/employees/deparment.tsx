"use client";

import Table from "../../../core/common/dataTable/index";
import CommonSelect from "../../../core/common/commonSelect";
import { department_details } from "../../../core/data/json/department_details";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import DepartmentForm from "./deparment/DepartmentForm";

interface DepartmentData {
  id: number;
  Department: string;
  Status: string;
  StatusId: string;
}
const DepartmentComponent = () => {
  const [department, setDepartment] = useState<DepartmentData[]>([]);
  const [newDepartment, setNewDepartment] = useState({
    Department: "",
    StatusId: "1",
  });
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentData | null>(null);
  const fetchDepartment = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/department");

      const formatted = res.data.data.map((item: any) => ({
        id: item.id,
        Department: item.title,
        Status:
          item.statusId === 1
            ? "Active"
            : item.statusId === 2
              ? "Inactive"
              : "Pending",
        StatusId: item.statusId.toString(),
      }));

      setDepartment(formatted);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDepartment();
  }, []);

  const data = department;
  const columns = [
    {
      title: "Department",
      dataIndex: "Department",
      render: (text: string, _record: DepartmentData) => (
        <h6 className="fw-medium">{text}</h6>
      ),
      sorter: (a: DepartmentData, b: DepartmentData) => a.id - b.id,
    },
    {
      title: "No of Employees",
      dataIndex: "NoOfEmployees",
      // sorter: (a: DepartmentData, b: DepartmentData) => a.NoOfEmployees.length - b.NoOfEmployees.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string, _record: DepartmentData) => (
        <span
          className={`badge ${text === "Active" ? "badge-success" : "badge-danger"} d-inline-flex align-items-center badge-xs`}
        >
          <i className="ti ti-point-filled me-1" />
          {text}
        </span>
      ),
      sorter: (a: DepartmentData, b: DepartmentData) =>
        a.Status.length - b.Status.length,
    },
    {
      title: "",
      dataIndex: "actions",
      render: (_: any, record: DepartmentData) => (
        <div className="action-icon d-inline-flex">
          <button
            type="button"
            className="me-2"
            data-bs-toggle="modal"
            data-bs-target="#edit_department"
            aria-label="Edit department"
            onClick={() => setSelectedDepartment(record)}
          >
            <i className="ti ti-edit" />
          </button>
          <button
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#delete_modal"
            aria-label="Delete department"
            onClick={() => handleDelete(record.id)}
          >
            <i className="ti ti-trash" />
          </button>
        </div>
      ),
    },
  ];
  const statusChoose = [
    { value: "1", label: "Active" },
    { value: "2", label: "InActive" },
    { value: "3", label: "Pending" },
  ];
  // ======================create Fnc=========================
  const handleCreate = async () => {
    try {
      await axiosInstance.post("/department", {
        title: newDepartment.Department,
        statusId: Number(newDepartment.StatusId),
      });

      // 🔥 refresh table
      fetchDepartment();

      // 🔥 reset form
      setNewDepartment({
        Department: "",
        StatusId: "1",
      });
    } catch (error) {
      console.error("Create failed", error);
    }
  };
  // ==================Update Fnc===========================
  const handleUpdate = async () => {
    try {
      if (!selectedDepartment) return;

      await axiosInstance.put(`/department/${selectedDepartment.id}`, {
        title: selectedDepartment.Department,
        statusId: Number(selectedDepartment.StatusId),
      });

      // 🔥 UI refresh
      fetchDepartment();
    } catch (error) {
      console.error("Update failed", error);
    }
  };
  // =====================Delete Fnc=========================
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure to delete?");

    if (!confirmDelete) return;
    try {
      await axiosInstance.delete(`/department/${id}`);
      fetchDepartment();
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Departments</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Employee</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Departments
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="me-2 mb-2">
                <div className="dropdown">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-file-export me-1" />
                    Export
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        <i className="ti ti-file-type-pdf me-1" />
                        Export as PDF
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        <i className="ti ti-file-type-xls me-1" />
                        Export as Excel{" "}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mb-2">
                <button
                  type="button"
                  data-bs-toggle="modal"
                  data-bs-target="#add_department"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Department
                </button>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          {/* Performance Indicator list */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Department List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown me-3">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Status
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Active
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Inactive
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="dropdown">
                  <button
                    type="button"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Sort By : Last 7 Days
                  </button>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Recently Added
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Ascending
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Desending
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Last Month
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item rounded-1">
                        Last 7 Days
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <Table
                dataSource={data}
                key="id"
                columns={columns}
                Selection={true}
              />
            </div>
          </div>
          {/* /Performance Indicator list */}
        </div>
        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0">2014 - 2026 © SmartHR.</p>
          <p>
            Designed &amp; Developed By{" "}
            <Link href="#" className="text-primary">
              Dreams
            </Link>
          </p>
        </div>
      </div>
      {/* /Page Wrapper */}
      {/* Add Department */}
      <div className="modal fade" id="add_department">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <DepartmentForm
              formData={newDepartment}
              setFormData={setNewDepartment}
              onSubmit={handleCreate}
            />
          </div>
        </div>
      </div>
      {/* /Add Department */}
      {/* Edit Department */}
      <div className="modal fade" id="edit_department">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header"></div>

            {selectedDepartment && (
              <DepartmentForm
                formData={selectedDepartment}
                setFormData={setSelectedDepartment}
                onSubmit={handleUpdate}
                isEdit={true}
              />
            )}
          </div>
        </div>
      </div>
      {/* /Edit Department */}
    </>
  );
};

export default DepartmentComponent;
