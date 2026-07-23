"use client";

import { useState, useEffect } from "react";
import axiosFieldTrack from "@/utils/axiosFieldTrack";
import { SkeletonTable } from "@/core/common/Skeleton";

interface FieldEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string | null;
  departmentName: string | null;
  designationName: string | null;
  isOnline: boolean;
  lastLocationAt: string | null;
}

const FieldEmployeeList = () => {
  const [employees, setEmployees] = useState<FieldEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await axiosFieldTrack.get("/employees");
      setEmployees(res.data.data?.data || []);
    } catch {
      console.error("Failed to fetch field employees");
    } finally {
      setLoading(false);
    }
  };

  const syncEmployees = async () => {
    setSyncing(true);
    try {
      await axiosFieldTrack.post("/employees/sync");
      await fetchEmployees();
    } catch {
      console.error("Failed to sync employees");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Field Employees</h4>
        <button
          className="btn btn-primary"
          onClick={syncEmployees}
          disabled={syncing}
        >
          {syncing ? "Syncing..." : "Sync from HRM"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <SkeletonTable rows={5} columns={7} />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    No employees found. Click "Sync from HRM" to load data.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.employeeId}</td>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.phone || "-"}</td>
                    <td>{emp.departmentName || "-"}</td>
                    <td>{emp.designationName || "-"}</td>
                    <td>
                      <span
                        className={`badge ${emp.isOnline ? "bg-success" : "bg-secondary"}`}
                      >
                        {emp.isOnline ? "Online" : "Offline"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FieldEmployeeList;
