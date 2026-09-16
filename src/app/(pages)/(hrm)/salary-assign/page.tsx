"use client";

import React, { useEffect, useRef, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

import { Empty, Select, Skeleton } from "antd";

import { toast } from "react-toastify";

import { Wallet, Search, Users, Layers } from "lucide-react";

import SalaryStructureEditor from "@/compo/SalaryStructureEditor";

import { premiumSalaryStyles } from "@/utils/premiumSalaryStyles";

type Employee = {
  id: number;
  name: string;
  employeeCode?: string;
};

const EmployeeSalaryAssign = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [employeesTotal, setEmployeesTotal] = useState<number | null>(null);

  const [componentsCount, setComponentsCount] = useState(0);

  const [employeeId, setEmployeeId] = useState("");

  const [employeesLoading, setEmployeesLoading] = useState(false);

  const [empSearch, setEmpSearch] = useState("");

  const [empSearchLoading, setEmpSearchLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const [componentsLoading, setComponentsLoading] = useState(false);

  // =====================================================
  // FETCH EMPLOYEES
  // =====================================================

  const fetchEmployees = async (search = "") => {
    abortRef.current?.abort();

    const controller = new AbortController();

    abortRef.current = controller;

    const isSearch = search.trim().length > 0;

    if (isSearch) setEmpSearchLoading(true);
    else setEmployeesLoading(true);

    try {
      const res = await axiosInstance.get("/employee", {
        params: isSearch ? { search: search.trim(), limit: 50 } : { limit: 50 },
        signal: controller.signal,
      });

      const list: Employee[] = res.data.data.employees || [];

      if (isSearch) {
        // server results REPLACE the list so the dropdown narrows to matches
        setEmployees((prev) => {
          const selected = prev.find((e) => String(e.id) === employeeId);
          if (!selected) return list;
          if (list.some((e) => e.id === selected.id)) return list;
          return [selected, ...list];
        });
      } else {
        setEmployees((prev) => {
          // keep the currently-selected employee visible after reset
          const selected = prev.find((e) => String(e.id) === employeeId);
          if (!selected) return list;
          if (list.some((e) => e.id === selected.id)) return list;
          return [selected, ...list];
        });

        const total = res.data.data.pagination?.total;
        if (typeof total === "number") setEmployeesTotal(total);
      }
    } catch (err: any) {
      if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
        console.log(err);

        if (!isSearch) toast.error("Failed to load employees");
      }
    } finally {
      if (!controller.signal.aborted) {
        if (isSearch) setEmpSearchLoading(false);
        else setEmployeesLoading(false);
      }
    }
  };

  // =====================================================
  // FETCH COMPONENTS (for header stat)
  // =====================================================

  const fetchComponents = async () => {
    setComponentsLoading(true);

    try {
      const res = await axiosInstance.get("/salary-component");

      setComponentsCount(res.data.data?.length || 0);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load components");
    } finally {
      setComponentsLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(empSearch), 500);

    return () => clearTimeout(timer);
  }, [empSearch]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const selectedEmployee = employees.find(
    (emp) => String(emp.id) === employeeId,
  );

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container py-4">
          <div className="premium-shell">
            {/* HEADER */}
            <div className="page-head">
              <div className="head-copy">
                <div className="crumbs">
                  HRM <span className="crumb-sep">/</span> Salary{" "}
                  <span className="crumb-sep">/</span> Assign Salary
                </div>

                <h1>
                  <span className="head-icon">
                    <Wallet size={20} />
                  </span>
                  Assign Salary Structure
                </h1>

                <p>
                  Build and assign a monthly salary structure for any employee —
                  with live preview and totals.
                </p>
              </div>

              <div className="head-stats">
                <div className="mini-stat">
                  <div className="mini-stat-icon">
                    <Users size={16} />
                  </div>
                  <div className="mini-stat-meta">
                    <div className="mini-stat-label">Employees</div>
                    <div className="mini-stat-value">
                      {employeesTotal ?? employees.length}
                    </div>
                  </div>
                </div>

                <div className="mini-stat">
                  <div className="mini-stat-icon">
                    <Layers size={16} />
                  </div>
                  <div className="mini-stat-meta">
                    <div className="mini-stat-label">Components</div>
                    <div className="mini-stat-value">
                      {componentsLoading ? "…" : componentsCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* EMPLOYEE */}
            <div className="premium-card emp-card">
              <div className="card-head">
                <div className="card-head-copy">
                  <h3>Select Employee</h3>
                  <p>Search by name or employee code</p>
                </div>

                {selectedEmployee && (
                  <span className="card-head-tag">1 selected</span>
                )}
              </div>

              {employeesLoading ? (
                <Skeleton.Input active block style={{ height: 46 }} />
              ) : (
                <Select
                  className="emp-select"
                  showSearch
                  size="large"
                  value={employeeId || undefined}
                  onChange={(v: string) => setEmployeeId(v)}
                  onSearch={(v) => setEmpSearch(v)}
                  loading={empSearchLoading}
                  placeholder="Search employee by name or code"
                  filterOption={false}
                  notFoundContent={
                    empSearchLoading ? "Searching..." : "No employee found"
                  }
                  options={employees.map((emp) => ({
                    value: String(emp.id),
                    label: `${emp.name}${
                      emp.employeeCode ? ` (${emp.employeeCode})` : ""
                    }`,
                  }))}
                  suffixIcon={<Search size={16} />}
                />
              )}

            </div>

            {/* EDITOR */}
            {employeeId ? (
              <SalaryStructureEditor
                employeeId={Number(employeeId)}
                onComponentsLoaded={setComponentsCount}
              />
            ) : (
              <div className="premium-card editor-card">
                <div className="card-head">
                  <div className="card-head-copy">
                    <h3>Salary Components</h3>
                    <p>Add or adjust components for this employee</p>
                  </div>
                </div>

                <div className="editor-empty">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Select an employee to build their salary structure"
                  />
                </div>
              </div>
            )}

            <style jsx global>{premiumSalaryStyles}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalaryAssign;
