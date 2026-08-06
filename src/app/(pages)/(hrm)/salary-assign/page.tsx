"use client";

import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import {
  clampAmount,
  resolveStructureStandard,
  ResolvedComponent,
} from "@/utils/salaryStructureResolver";
import { Alert, Button, Empty, Select, Skeleton, Tooltip } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { toast } from "react-toastify";
import {
  Wallet,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Building2,
  Search,
  Save,
  Users,
  Layers,
  Coins,
} from "lucide-react";

type Employee = {
  id: number;
  name: string;
  employeeCode?: string;
};

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
};

type SalaryRow = {
  _key: number;
  salaryComponentId: number;
  amount: string;
  percentageValue: string;
  capAmount: string;
  floorAmount: string;
  baseCapAmount: string;
};

type Effective = {
  calcType: "FIXED" | "PERCENTAGE";
  baseType: "COMPONENT" | "COMPONENTS" | "GROSS" | null;
  baseComponentId: number | null;
  baseComponentIds: number[] | null;
  percentageValue: number | null;
  capAmount: number | null;
  floorAmount: number | null;
  baseCapAmount: number | null;
  amount: number | null;
};

let rowKeyCounter = 0;

const emptyRow = (): SalaryRow => ({
  _key: ++rowKeyCounter,
  salaryComponentId: 0,
  amount: "",
  percentageValue: "",
  capAmount: "",
  floorAmount: "",
  baseCapAmount: "",
});

const toneClass = (type?: string) => {
  if (type === "EARNING") return "tone-emerald";
  if (type === "DEDUCTION") return "tone-rose";
  if (type === "EMPLOYER_CONTRIBUTION") return "tone-violet";
  return "tone-slate";
};

const typeShort = (type?: string) => {
  if (type === "EARNING") return "Earning";
  if (type === "DEDUCTION") return "Deduction";
  if (type === "EMPLOYER_CONTRIBUTION") return "Employer";
  return "—";
};

const accentOf = (type?: string) => {
  if (type === "EARNING") return "emerald";
  if (type === "DEDUCTION") return "rose";
  if (type === "EMPLOYER_CONTRIBUTION") return "violet";
  return "slate";
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const NumInput = ({
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
}) => (
  <div className="num-input">
    {prefix && <span className="num-affix num-prefix">{prefix}</span>}
    <input
      className="comp-input"
      type="number"
      step="any"
      min="0"
      value={value}
      placeholder={placeholder}
      onChange={onChange}
    />
    {suffix && <span className="num-affix num-suffix">{suffix}</span>}
  </div>
);

const EmployeeSalaryAssign = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [components, setComponents] = useState<SalaryComponent[]>([]);

  const [employeeId, setEmployeeId] = useState("");

  const [salaryRows, setSalaryRows] = useState<SalaryRow[]>([]);

  const [loading, setLoading] = useState(false);

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

      const list = res.data.data.employees || [];

      if (isSearch) {
        setEmployees((prev) => {
          const map = new Map(prev.map((e) => [e.id, e]));
          list.forEach((e) => map.set(e.id, e));
          return Array.from(map.values());
        });
      } else {
        setEmployees(list);
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
  // FETCH COMPONENTS
  // =====================================================

  const fetchComponents = async () => {
    setComponentsLoading(true);

    try {
      const res = await axiosInstance.get("/salary-component");

      setComponents(res.data.data || []);
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

  // =====================================================
  // HELPERS
  // =====================================================

  const getComponent = (id: number) =>
    components.find((c) => c.id === id);

  const effectiveFor = (row: SalaryRow): Effective | null => {
    const comp = getComponent(row.salaryComponentId);

    if (!comp) return null;

    const calcType = comp.calculationType;
    const baseType = comp.baseType ?? null;
    const baseComponentId = comp.baseComponentId ?? null;
    const baseComponentIds = comp.baseComponentIds ?? null;
    const percentageValue =
      row.percentageValue !== "" && row.percentageValue != null
        ? Number(row.percentageValue)
        : comp.percentageValue ?? null;
    const capAmount =
      row.capAmount !== "" && row.capAmount != null
        ? Number(row.capAmount)
        : comp.capAmount ?? null;
    const floorAmount =
      row.floorAmount !== "" && row.floorAmount != null
        ? Number(row.floorAmount)
        : comp.floorAmount ?? null;
    const baseCapAmount =
      row.baseCapAmount !== "" && row.baseCapAmount != null
        ? Number(row.baseCapAmount)
        : comp.baseCapAmount ?? null;
    const amount =
      row.amount !== "" && row.amount != null ? Number(row.amount) : null;

    return {
      calcType,
      baseType,
      baseComponentId,
      baseComponentIds,
      percentageValue,
      capAmount,
      floorAmount,
      baseCapAmount,
      amount,
    };
  };

  const previewRows = ((): { resolved: ResolvedComponent[]; error?: string } => {
    try {
      const resolverRows = salaryRows
        .filter((r) => r.salaryComponentId)
        .map((r) => {
          const eff = effectiveFor(r);
          const comp = getComponent(r.salaryComponentId)!;

          return {
            amount: eff?.amount ?? null,
            calculationType: eff?.calcType ?? "FIXED",
            baseType: eff?.baseType ?? null,
            baseComponentId: eff?.baseComponentId ?? null,
            baseComponentIds: eff?.baseComponentIds ?? null,
            percentageValue: eff?.percentageValue ?? null,
            capAmount: eff?.capAmount ?? null,
            floorAmount: eff?.floorAmount ?? null,
            baseCapAmount: eff?.baseCapAmount ?? null,
            salaryComponent: {
              id: comp.id,
              type: comp.type,
              prorated: comp.prorated,
              calculationType: comp.calculationType,
              baseType: comp.baseType,
              baseComponentId: comp.baseComponentId,
              baseComponentIds: comp.baseComponentIds,
              percentageValue: comp.percentageValue,
              capAmount: comp.capAmount,
              floorAmount: comp.floorAmount,
              baseCapAmount: comp.baseCapAmount,
            },
          };
        });

      return { resolved: resolveStructureStandard(resolverRows) };
    } catch (err: any) {
      return { resolved: [], error: err.message };
    }
  })();

  const totalEarning = previewRows.resolved
    .filter((r) => r.type === "EARNING")
    .reduce((acc, r) => acc + r.standardAmount, 0);

  const totalDeduction = previewRows.resolved
    .filter((r) => r.type === "DEDUCTION")
    .reduce((acc, r) => acc + r.standardAmount, 0);

  const totalEmployerContribution = previewRows.resolved
    .filter((r) => r.type === "EMPLOYER_CONTRIBUTION")
    .reduce((acc, r) => acc + r.standardAmount, 0);

  const netSalary = totalEarning - totalDeduction;

  const totalCtc = totalEarning + totalEmployerContribution;

  // =====================================================
  // ADD / REMOVE ROW
  // =====================================================

  const addRow = () => {
    setSalaryRows([...salaryRows, emptyRow()]);
  };

  const removeRow = (index: number) => {
    const updated = [...salaryRows];

    updated.splice(index, 1);

    setSalaryRows(updated);
  };

  const handleChange = (
    index: number,
    field: keyof SalaryRow,
    value: any,
  ) => {
    const updated = [...salaryRows];

    (updated[index] as Record<string, any>)[field] = value;

    setSalaryRows(updated);
  };

  const handleComponentChange = (index: number, value: number) => {
    const updated = [...salaryRows];

    updated[index] = emptyRow();
    updated[index].salaryComponentId = value;

    setSalaryRows(updated);
  };

  //   ================fetch employee salary======
  const fetchEmployeeSalary = async (employeeId: number) => {
    try {
      const res = await axiosInstance.get(`/employee-salary/${employeeId}`);

      const structure = res.data.data.salaryStructure;

      const formatted = structure.map((item: any) => ({
        _key: ++rowKeyCounter,
        salaryComponentId: item.salaryComponent.id,

        amount: item.amount != null ? String(item.amount) : "",

        percentageValue:
          item.percentageValue != null ? String(item.percentageValue) : "",

        capAmount: item.capAmount != null ? String(item.capAmount) : "",

        floorAmount: item.floorAmount != null ? String(item.floorAmount) : "",

        baseCapAmount:
          item.baseCapAmount != null ? String(item.baseCapAmount) : "",
      }));

      setSalaryRows(formatted);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load existing salary structure");

      setSalaryRows([]);
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!employeeId) {
        return toast.error("Please select an employee");
      }

      if (
        salaryRows.length === 0 ||
        !salaryRows.some((r) => r.salaryComponentId)
      ) {
        return toast.error("Please add at least one salary component");
      }

      const payload = salaryRows
        .filter((r) => r.salaryComponentId)
        .map((r) => {
          const eff = effectiveFor(r)!;

          return {
            salaryComponentId: r.salaryComponentId,

            amount:
              r.amount !== "" && r.amount != null ? Number(r.amount) : null,

            calculationType: eff.calcType,

            percentageValue:
              r.percentageValue !== "" && r.percentageValue != null
                ? Number(r.percentageValue)
                : null,

            capAmount:
              r.capAmount !== "" && r.capAmount != null
                ? Number(r.capAmount)
                : null,

            floorAmount:
              r.floorAmount !== "" && r.floorAmount != null
                ? Number(r.floorAmount)
                : null,

            baseCapAmount:
              r.baseCapAmount !== "" && r.baseCapAmount != null
                ? Number(r.baseCapAmount)
                : null,
          };
        });

      if (payload.length === 0) {
        return toast.error("Please add at least one salary component");
      }

      setLoading(true);

      await axiosInstance.post("/employee-salary/assign", {
        employeeId: Number(employeeId),

        components: payload,
      });

      toast.success("Salary structure assigned successfully");

      setEmployeeId("");
      setSalaryRows([]);
    } catch (err: any) {
      console.log(err);

      toast.error(err?.response?.data?.message || "Failed to assign salary");
    } finally {
      setLoading(false);
    }
  };

  const baseChips = (eff: Effective | null) => {
    if (!eff || eff.calcType !== "PERCENTAGE") {
      return <span className="muted">—</span>;
    }

    if (eff.baseType === "GROSS") {
      return <span className="chip chip-gross">GROSS</span>;
    }

    if (eff.baseType === "COMPONENTS" && eff.baseComponentIds?.length) {
      return (
        <div className="base-chips">
          {eff.baseComponentIds.map((id) => {
            const base = getComponent(id);

            return (
              <span key={id} className="chip chip-base">
                {base ? base.code : `#${id}`}
              </span>
            );
          })}
        </div>
      );
    }

    if (eff.baseType === "COMPONENT" && eff.baseComponentId) {
      const base = getComponent(eff.baseComponentId);

      return (
        <span className="chip chip-base">
          {base ? base.code : `#${eff.baseComponentId}`}
        </span>
      );
    }

    return <span className="muted">—</span>;
  };

  const rowCells = (row: SalaryRow, index: number) => {
    const comp = getComponent(row.salaryComponentId);
    const eff = effectiveFor(row);

    return (
      <>
        {/* COMPONENT */}
        <td className="cell-comp">
          <Select
            className="comp-picker"
            showSearch
            value={row.salaryComponentId || undefined}
            onChange={(v: number) => handleComponentChange(index, v)}
            placeholder="Select component"
            optionFilterProp="label"
            options={components.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.code})`,
            }))}
          />
        </td>

        {/* TYPE */}
        <td className="cell-type">
          {comp ? (
            <span className={`type-pill type-pill-${accentOf(comp.type)}`}>
              <span className="type-pill-dot" />
              {typeShort(comp.type)}
            </span>
          ) : (
            <span className="muted">—</span>
          )}
        </td>

        {/* BASE */}
        <td className="cell-base">{baseChips(eff)}</td>

        {/* PERCENTAGE */}
        <td className="cell-num">
          {eff?.calcType === "PERCENTAGE" ? (
            <div className="num-cell">
              <NumInput
                value={row.percentageValue}
                onChange={(e) =>
                  handleChange(index, "percentageValue", e.target.value)
                }
                placeholder={
                  comp?.percentageValue != null
                    ? `Override (optional)`
                    : "Enter %"
                }
                suffix="%"
              />

              {comp?.percentageValue != null && (
                <span className="default-hint">
                  Default {comp.percentageValue}%
                </span>
              )}
            </div>
          ) : (
            <span className="muted">—</span>
          )}
        </td>

        {/* AMOUNT */}
        <td className="cell-num">
          <NumInput
            value={row.amount}
            onChange={(e) => handleChange(index, "amount", e.target.value)}
            placeholder={
              eff?.calcType === "PERCENTAGE"
                ? "Override (optional)"
                : "Enter amount"
            }
            prefix="₹"
          />
        </td>

        {/* CAP */}
        <td className="cell-num">
          <NumInput
            value={row.capAmount}
            onChange={(e) => handleChange(index, "capAmount", e.target.value)}
            placeholder={
              comp?.capAmount != null ? `Default ${comp.capAmount}` : "Optional"
            }
            prefix="₹"
          />
        </td>

        {/* FLOOR */}
        <td className="cell-num">
          <NumInput
            value={row.floorAmount}
            onChange={(e) =>
              handleChange(index, "floorAmount", e.target.value)
            }
            placeholder={
              comp?.floorAmount != null
                ? `Default ${comp.floorAmount}`
                : "Optional"
            }
            prefix="₹"
          />
        </td>

        {/* BASE CAP */}
        <td className="cell-num">
          <NumInput
            value={row.baseCapAmount}
            onChange={(e) =>
              handleChange(index, "baseCapAmount", e.target.value)
            }
            placeholder={
              comp?.baseCapAmount != null
                ? `Default ${comp.baseCapAmount}`
                : "Optional"
            }
            prefix="₹"
          />
        </td>

        {/* ACTION */}
        <td className="cell-action">
          <Tooltip title="Remove component">
            <button
              type="button"
              className="icon-btn icon-btn-danger"
              onClick={() => removeRow(index)}
            >
              <Trash2 size={15} />
            </button>
          </Tooltip>
        </td>
      </>
    );
  };

  const selectedEmployee = employees.find(
    (emp) => String(emp.id) === employeeId,
  );

  const byType: Record<string, { row: SalaryRow; index: number }[]> = {};

  const unassigned: { row: SalaryRow; index: number }[] = [];

  salaryRows.forEach((row, index) => {
    const comp = getComponent(row.salaryComponentId);
    const type = comp?.type;

    if (!type) {
      unassigned.push({ row, index });

      return;
    }

    (byType[type] = byType[type] || []).push({ row, index });
  });

  const sections = [
    {
      type: "EARNING",
      label: "Earnings",
      Icon: TrendingUp,
      hint: "Incomes that build up the gross salary",
    },
    {
      type: "DEDUCTION",
      label: "Deductions",
      Icon: TrendingDown,
      hint: "Amounts subtracted from gross salary",
    },
    {
      type: "EMPLOYER_CONTRIBUTION",
      label: "Employer Contribution",
      Icon: Building2,
      hint: "Employer-side costs that add to CTC",
    },
  ];

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
                    <div className="mini-stat-value">{employees.length}</div>
                  </div>
                </div>

                <div className="mini-stat">
                  <div className="mini-stat-icon">
                    <Layers size={16} />
                  </div>
                  <div className="mini-stat-meta">
                    <div className="mini-stat-label">Components</div>
                    <div className="mini-stat-value">{components.length}</div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="assign-form">
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
                    onChange={(v: string) => {
                      setEmployeeId(v);

                      if (v) {
                        fetchEmployeeSalary(Number(v));
                      } else {
                        setSalaryRows([]);
                      }
                    }}
                    onSearch={(v) => setEmpSearch(v)}
                    loading={empSearchLoading}
                    placeholder="Search employee by name or code"
                    optionFilterProp="label"
                    options={employees.map((emp) => ({
                      value: String(emp.id),
                      label: `${emp.name}${
                        emp.employeeCode ? ` (${emp.employeeCode})` : ""
                      }`,
                    }))}
                    suffixIcon={<Search size={16} />}
                  />
                )}

                <AnimatePresence>
                  {selectedEmployee && (
                    <motion.div
                      className="emp-profile"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <span className="emp-avatar">
                        {initials(selectedEmployee.name)}
                      </span>

                      <div className="emp-profile-meta">
                        <div className="emp-profile-name">
                          {selectedEmployee.name}
                        </div>
                        <div className="emp-profile-code">
                          {selectedEmployee.employeeCode || "No employee code"}
                        </div>
                      </div>

                      <span className="loaded-tag">Structure loaded</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* EDITOR */}
              <div className="premium-card editor-card">
                <div className="card-head">
                  <div className="card-head-copy">
                    <h3>Salary Components</h3>
                    <p>Add or adjust components for this employee</p>
                  </div>

                  <Button
                    type="primary"
                    className="add-btn"
                    icon={<Plus size={15} />}
                    onClick={addRow}
                    disabled={!employeeId}
                  >
                    Add Component
                  </Button>
                </div>

                {componentsLoading ? (
                  <Skeleton active paragraph={{ rows: 5 }} />
                ) : salaryRows.length === 0 ? (
                  <div className="editor-empty">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No components added yet"
                    />

                    <Button
                      type="primary"
                      className="add-btn"
                      icon={<Plus size={15} />}
                      onClick={addRow}
                      disabled={!employeeId}
                    >
                      Add your first component
                    </Button>
                  </div>
                ) : (
                  <div className="editor-body">
                    {/* UNASSIGNED */}
                    {unassigned.length > 0 && (
                      <div className="comp-section section-unassigned">
                        <div className="section-head">
                          <span className="section-title">
                            Unassigned
                            <span className="count-chip tone-slate">
                              {unassigned.length}
                            </span>
                          </span>

                          <span className="section-hint">
                            Pick a component to place it in its group
                          </span>
                        </div>

                        <div className="table-scroll">
                          <table className="comp-table">
                            <thead>
                              <tr>
                                <th className="th-comp">Component</th>
                                <th className="th-type">Type</th>
                                <th className="th-base">Base</th>
                                <th className="th-num">% Value</th>
                                <th className="th-num">Amount</th>
                                <th className="th-num">Cap</th>
                                <th className="th-num">Floor</th>
                                <th className="th-num">Base Cap</th>
                                <th className="th-action">Action</th>
                              </tr>
                            </thead>

                            <tbody>
                              <AnimatePresence>
                                {unassigned.map(({ row, index }) => (
                                  <motion.tr
                                    key={row._key}
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {rowCells(row, index)}
                                  </motion.tr>
                                ))}
                              </AnimatePresence>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* TYPED SECTIONS */}
                    {sections.map((section) => {
                      const items = byType[section.type] ?? [];

                      if (!items.length) return null;

                      const Icon = section.Icon;
                      const accent = accentOf(section.type);

                      return (
                        <div
                          key={section.type}
                          className={`comp-section section-accent-${accent}`}
                        >
                          <div className="section-head">
                            <span className="section-title">
                              <span
                                className={`section-icon section-icon-${accent}`}
                              >
                                <Icon size={14} />
                              </span>
                              {section.label}
                              <span
                                className={`count-chip count-chip-${accent}`}
                              >
                                {items.length}
                              </span>
                            </span>

                            <span className="section-hint">
                              {section.hint}
                            </span>
                          </div>

                          <div className="table-scroll">
                            <table
                              className={`comp-table table-${accent}`}
                            >
                              <thead>
                                <tr>
                                  <th className="th-comp">Component</th>
                                  <th className="th-type">Type</th>
                                  <th className="th-base">Base</th>
                                  <th className="th-num">% Value</th>
                                  <th className="th-num">Amount</th>
                                  <th className="th-num">Cap</th>
                                  <th className="th-num">Floor</th>
                                  <th className="th-num">Base Cap</th>
                                  <th className="th-action">Action</th>
                                </tr>
                              </thead>

                              <tbody>
                                <AnimatePresence>
                                  {items.map(({ row, index }) => (
                                    <motion.tr
                                      key={row._key}
                                      layout
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, x: -12 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {rowCells(row, index)}
                                    </motion.tr>
                                  ))}
                                </AnimatePresence>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* LIVE PREVIEW */}
              {salaryRows.some((r) => r.salaryComponentId) && (
                <div className="premium-card preview-card">
                  <div className="card-head">
                    <div className="card-head-copy">
                      <h3>Monthly Preview</h3>
                      <p>Standard amounts computed from the structure above</p>
                    </div>
                  </div>

                  {previewRows.error ? (
                    <Alert
                      type="warning"
                      message={previewRows.error}
                      showIcon
                    />
                  ) : (
                    <div className="table-scroll">
                      <table className="preview-table">
                        <thead>
                          <tr>
                            <th>Component</th>
                            <th>Standard</th>
                            <th>Payable (min / max)</th>
                          </tr>
                        </thead>

                        <tbody>
                          {previewRows.resolved.map((r) => {
                            const comp = getComponent(r.componentId);

                            const payable = clampAmount(
                              r.standardAmount,
                              r.floorAmount,
                              r.capAmount,
                            );

                            return (
                              <motion.tr
                                key={r.componentId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <td>
                                  <span
                                    className={`p-dot ${toneClass(r.type)}`}
                                  />
                                  {comp?.name}
                                  <span className="p-code">
                                    {comp?.code}
                                  </span>
                                </td>

                                <td className="p-amt">
                                  ₹
                                  {r.standardAmount.toLocaleString("en-IN")}
                                </td>

                                <td className="p-payable">
                                  {r.floorAmount != null ||
                                  r.capAmount != null ? (
                                    <>
                                      <span className="p-amt-strong">
                                        ₹
                                        {payable.toLocaleString("en-IN")}
                                      </span>
                                      {r.floorAmount != null && (
                                        <span className="p-note">
                                          floor {r.floorAmount}
                                        </span>
                                      )}
                                      {r.capAmount != null && (
                                        <span className="p-note">
                                          cap {r.capAmount}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="muted">—</span>
                                  )}
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SUMMARY */}
              {salaryRows.some((r) => r.salaryComponentId) && (
                <div className="summary-grid">
                  <div className="stat-card stat-earning">
                    <div className="stat-top">
                      <span className="stat-icon">
                        <TrendingUp size={20} />
                      </span>
                      <span className="stat-label">Total Earning</span>
                    </div>
                    <div className="stat-value">
                      ₹<CountUp end={totalEarning} duration={0.5} separator="," />
                    </div>
                  </div>

                  <div className="stat-card stat-deduction">
                    <div className="stat-top">
                      <span className="stat-icon">
                        <TrendingDown size={20} />
                      </span>
                      <span className="stat-label">Total Deduction</span>
                    </div>
                    <div className="stat-value">
                      ₹<CountUp end={totalDeduction} duration={0.5} separator="," />
                    </div>
                  </div>

                  <div className="stat-card stat-employer">
                    <div className="stat-top">
                      <span className="stat-icon">
                        <Building2 size={20} />
                      </span>
                      <span className="stat-label">Employer Contribution</span>
                    </div>
                    <div className="stat-value">
                      ₹
                      <CountUp
                        end={totalEmployerContribution}
                        duration={0.5}
                        separator=","
                      />
                    </div>
                  </div>

                  <div className="stat-card stat-net">
                    <div className="stat-top">
                      <span className="stat-icon">
                        <Wallet size={20} />
                      </span>
                      <span className="stat-label">Net Salary</span>
                    </div>
                    <div className="stat-value">
                      ₹<CountUp end={netSalary} duration={0.6} separator="," />
                    </div>
                  </div>

                  <div className="stat-card stat-ctc">
                    <div className="stat-top">
                      <span className="stat-icon">
                        <Coins size={20} />
                      </span>
                      <span className="stat-label">Total CTC</span>
                    </div>
                    <div className="stat-value">
                      ₹<CountUp end={totalCtc} duration={0.6} separator="," />
                    </div>
                  </div>
                </div>
              )}

              {/* SAVE */}
              <div className="save-bar">
                <div className="save-note">
                  {selectedEmployee ? (
                    <>
                      Assigning structure to{" "}
                      <span className="save-emp">{selectedEmployee.name}</span>
                    </>
                  ) : (
                    "Select an employee to get started"
                  )}
                </div>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={
                    loading ||
                    !employeeId ||
                    !salaryRows.some((r) => r.salaryComponentId)
                  }
                >
                  <Save size={16} />
                  {loading ? "Saving…" : "Save Salary Structure"}
                </button>
              </div>
            </form>
          </div>

          <style jsx global>{`
.premium-shell{--ink:#0f172a;--muted:#64748b;--line:#eef2f7;--emerald:#10b981;--rose:#f43f5e;--violet:#8b5cf6;--indigo:#6366f1;color:var(--ink)}.premium-shell .muted{color:var(--muted)}.premium-shell .tabular{font-variant-numeric:tabular-nums}.premium-shell .page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:22px;flex-wrap:wrap}.premium-shell .crumbs{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em}.premium-shell .crumb-sep{color:#cbd5e1}.premium-shell .head-copy h1{margin:0;font-size:26px;font-weight:900;letter-spacing:-.02em;display:flex;align-items:center;gap:12px}.premium-shell .head-icon{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:13px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 10px 22px rgba(99,102,241,.28)}.premium-shell .head-copy p{margin:8px 0 0;font-size:14px;color:var(--muted)}.premium-shell .head-stats{display:flex;gap:12px}.premium-shell .mini-stat{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 16px;box-shadow:0 8px 20px rgba(15,23,42,.05)}.premium-shell .mini-stat-icon{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:#eef2ff;color:var(--indigo)}.premium-shell .mini-stat-label{font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.04em}.premium-shell .mini-stat-value{font-size:18px;font-weight:800;font-variant-numeric:tabular-nums}.premium-shell .premium-card{background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 12px 30px rgba(15,23,42,.06);padding:22px 24px;margin-bottom:20px}.premium-shell .card-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.premium-shell .card-head-copy h3{margin:0;font-size:17px;font-weight:800;letter-spacing:-.01em}.premium-shell .card-head-copy p{margin:4px 0 0;font-size:13px;color:var(--muted)}.premium-shell .card-head-tag{font-size:12px;font-weight:700;color:var(--indigo);background:#eef2ff;padding:5px 12px;border-radius:999px}.premium-shell .emp-select{width:100%}.premium-shell .emp-select .ant-select-selector{border-radius:12px!important;border-color:#e2e8f0!important;box-shadow:none!important;padding:6px 12px!important;font-weight:500}.premium-shell .emp-select .ant-select-selector:hover,.premium-shell .emp-select .ant-select-focused{border-color:var(--indigo)!important;box-shadow:0 0 0 3px rgba(99,102,241,.12)!important}.premium-shell .emp-profile{display:flex;align-items:center;gap:14px;margin-top:16px;padding:14px 16px;border-radius:14px;background:#f8fafc;border:1px solid var(--line)}.premium-shell .emp-avatar{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:800;font-size:15px;letter-spacing:.02em}.premium-shell .emp-profile-meta{flex:1;min-width:0}.premium-shell .emp-profile-name{font-weight:800;font-size:15px}.premium-shell .emp-profile-code{font-size:12.5px;color:var(--muted);font-weight:600;letter-spacing:.02em}.premium-shell .loaded-tag{font-size:12px;font-weight:700;color:#059669;background:#ecfdf5;border:1px solid#a7f3d0;padding:5px 12px;border-radius:999px;white-space:nowrap}.premium-shell .add-btn{border-radius:12px!important;font-weight:700;background:linear-gradient(135deg,#6366f1,#8b5cf6)!important;border:none!important;box-shadow:0 10px 20px rgba(99,102,241,.24);height:40px;display:inline-flex;align-items:center;gap:8px}.premium-shell .editor-empty{padding:36px 0;display:flex;flex-direction:column;align-items:center;gap:16px}.premium-shell .editor-body{display:flex;flex-direction:column;gap:26px}.premium-shell .comp-section{display:flex;flex-direction:column;gap:10px}.premium-shell .section-unassigned{padding:14px 16px;border:1px dashed#cbd5e1;border-radius:14px;background:#fbfcfe}.premium-shell .section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.premium-shell .section-title{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:800;letter-spacing:-.01em}.premium-shell .section-icon{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:8px;color:#fff}.premium-shell .section-hint{font-size:12px;color:var(--muted)}.premium-shell .count-chip{font-size:11px;font-weight:800;padding:2px 9px;border-radius:999px;color:#fff;font-variant-numeric:tabular-nums}.premium-shell .tone-emerald{background:var(--emerald)!important}.premium-shell .tone-rose{background:var(--rose)!important}.premium-shell .tone-violet{background:var(--violet)!important}.premium-shell .tone-slate{background:#94a3b8!important}.premium-shell .table-scroll{overflow-x:auto;border-radius:12px;border:1px solid var(--line)}.premium-shell .comp-table{width:100%;border-collapse:separate;border-spacing:0;min-width:860px}.premium-shell .comp-table thead th{background:#f8fafc;font-size:11px;text-transform:uppercase;letter-spacing:.05em;font-weight:700;color:var(--muted);padding:11px 14px;text-align:left;border-bottom:1px solid var(--line);white-space:nowrap;position:sticky;top:0;z-index:2}.premium-shell .comp-table tbody td{padding:12px 14px;border-bottom:1px solid#f1f5f9;vertical-align:middle}.premium-shell .comp-table tbody tr:last-child td{border-bottom:none}.premium-shell .comp-table tbody tr:hover td{background:#f8fafc}.premium-shell .th-num,.premium-shell .cell-num{text-align:right;white-space:nowrap}.premium-shell .th-comp{min-width:220px}.premium-shell .th-action,.premium-shell .cell-action{text-align:center;width:64px}.premium-shell .comp-picker{width:100%}.premium-shell .comp-picker .ant-select-selector{border-radius:10px!important;border-color:#e2e8f0!important;box-shadow:none!important;font-weight:500}.premium-shell .comp-picker .ant-select-selector:hover,.premium-shell .comp-picker .ant-select-focused{border-color:var(--indigo)!important;box-shadow:0 0 0 3px rgba(99,102,241,.1)!important}.premium-shell .type-cell{display:inline-flex;align-items:center;gap:8px}.premium-shell .type-dot{width:8px;height:8px;border-radius:50%;display:inline-block;box-shadow:0 0 0 3px rgba(0,0,0,.04)}.premium-shell .type-text{font-size:12.5px;font-weight:700;color:#334155}.premium-shell .base-chips{display:flex;flex-wrap:wrap;gap:5px}.premium-shell .chip{font-size:11px;font-weight:700;padding:3px 9px;border-radius:7px;white-space:nowrap}.premium-shell .chip-base{background:#eef2ff;color:#4f46e5}.premium-shell .chip-gross{background:#e0f2fe;color:#0369a1}.premium-shell .num-input{position:relative;display:inline-flex;align-items:center;width:100%;min-width:108px}.premium-shell .comp-input{width:100%;height:38px;border:1px solid#e2e8f0;border-radius:10px;padding:0 12px;font-size:13.5px;font-weight:600;font-variant-numeric:tabular-nums;text-align:right;color:var(--ink);background:#fff;outline:none;transition:border-color.15s,box-shadow.15s}.premium-shell .comp-input:focus{border-color:var(--indigo);box-shadow:0 0 0 3px rgba(99,102,241,.12)}.premium-shell .comp-input::placeholder{color:#cbd5e1;font-weight:500}.premium-shell .comp-input:disabled{background:#f8fafc;color:#94a3b8}.premium-shell .num-input:has(.num-prefix) .comp-input{padding-left:26px}.premium-shell .num-input:has(.num-suffix) .comp-input{padding-right:30px}.premium-shell .num-affix{position:absolute;z-index:1;font-size:13px;font-weight:700;color:#94a3b8;pointer-events:none}.premium-shell .num-prefix{left:10px}.premium-shell .num-suffix{right:10px}.premium-shell .icon-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9px;border:none;cursor:pointer;transition:background.15s,transform.1s}.premium-shell .icon-btn:active{transform:scale(.94)}.premium-shell .icon-btn-danger{background:#fef2f2;color:#e11d48}.premium-shell .icon-btn-danger:hover{background:#fee2e2}.premium-shell .preview-table{width:100%;border-collapse:separate;border-spacing:0;min-width:480px}.premium-shell .preview-table thead th{background:#f8fafc;font-size:11px;text-transform:uppercase;letter-spacing:.05em;font-weight:700;color:var(--muted);padding:11px 14px;text-align:left;border-bottom:1px solid var(--line)}.premium-shell .preview-table tbody td{padding:12px 14px;border-bottom:1px solid#f1f5f9}.premium-shell .preview-table tbody tr:last-child td{border-bottom:none}.premium-shell .preview-table tbody tr:hover td{background:#f8fafc}.premium-shell .p-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:9px}.premium-shell .p-code{margin-left:8px;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:.03em}.premium-shell .p-amt,.premium-shell .p-payable{font-variant-numeric:tabular-nums;font-weight:600}.premium-shell .p-amt-strong{font-weight:800;color:var(--ink)}.premium-shell .p-note{margin-left:10px;font-size:11.5px;font-weight:600;color:#94a3b8;background:#f1f5f9;padding:2px 8px;border-radius:999px}.premium-shell .summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:20px}.premium-shell .stat-card{border-radius:18px;padding:20px 22px;color:#fff;box-shadow:0 14px 28px rgba(15,23,42,.14);position:relative;overflow:hidden}.premium-shell .stat-card::after{content:\"\";position:absolute;right:-30px;top:-30px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.12)}.premium-shell .stat-earning{background:linear-gradient(135deg,#10b981,#059669)}.premium-shell .stat-deduction{background:linear-gradient(135deg,#f43f5e,#e11d48)}.premium-shell .stat-employer{background:linear-gradient(135deg,#a855f7,#7c3aed)}.premium-shell .stat-net{background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 16px 34px rgba(99,102,241,.32)}.premium-shell .stat-ctc{background:linear-gradient(135deg,#f59e0b,#d97706);box-shadow:0 16px 34px rgba(245,158,11,.32)}.premium-shell .stat-ctc .stat-icon{background:rgba(255,255,255,.22)}.premium-shell .stat-top{display:flex;align-items:center;gap:10px;margin-bottom:14px}.premium-shell .stat-icon{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:11px;background:rgba(255,255,255,.18)}.premium-shell .stat-label{font-size:12.5px;font-weight:700;letter-spacing:.02em;opacity:.92}.premium-shell .stat-value{font-size:30px;font-weight:900;font-variant-numeric:tabular-nums;letter-spacing:-.02em}.premium-shell .save-bar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px 20px;box-shadow:0 8px 20px rgba(15,23,42,.05)}.premium-shell .save-note{font-size:13.5px;color:var(--muted);font-weight:500}.premium-shell .save-emp{font-weight:800;color:var(--ink)}.premium-shell .save-btn{display:inline-flex;align-items:center;gap:9px;height:44px;padding:0 24px;border:none;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:14.5px;font-weight:800;cursor:pointer;box-shadow:0 12px 24px rgba(99,102,241,.28);transition:transform.12s,box-shadow.12s,opacity.12s}.premium-shell .save-btn:hover:not(:disabled){transform:translatey(-1px);box-shadow:0 16px 30px rgba(99,102,241,.34)}.premium-shell .save-btn:disabled{opacity:.55;cursor:not-allowed}@media(max-width:640px){.premium-shell .page-head{align-items:flex-start}.premium-shell .head-stats{width:100%}.premium-shell .stat-value{font-size:24px}}
.premium-shell .num-cell{display:flex;flex-direction:column;align-items:flex-end;gap:3px}.premium-shell .default-hint{font-size:10.5px;font-weight:700;color:#6366f1;background:#eef2ff;padding:1px 8px;border-radius:999px;white-space:nowrap}
.premium-shell .editor-card{position:relative;overflow:hidden}.premium-shell .editor-card::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)}.premium-shell .comp-section{position:relative;background:linear-gradient(180deg,#fdfdfe,#fff);border:1px solid var(--line);border-radius:16px;padding:16px 16px 6px;box-shadow:0 8px 22px rgba(15,23,42,.045)}.premium-shell .comp-section::before{content:"";position:absolute;top:0;left:18px;right:18px;height:3px;border-radius:0 0 4px 4px}.premium-shell .section-accent-emerald::before{background:linear-gradient(90deg,#34d399,#10b981,#6ee7b7)}.premium-shell .section-accent-rose::before{background:linear-gradient(90deg,#fb7185,#f43f5e,#fda4af)}.premium-shell .section-accent-violet::before{background:linear-gradient(90deg,#a78bfa,#8b5cf6,#c4b5fd)}.premium-shell .section-accent-slate::before{background:linear-gradient(90deg,#94a3b8,#64748b,#cbd5e1)}.premium-shell .section-head{margin-bottom:12px;padding-bottom:12px;border-bottom:1px dashed #e2e8f0}.premium-shell .section-title{font-size:14.5px;font-weight:800;letter-spacing:-.01em;gap:10px}.premium-shell .section-icon{width:30px;height:30px;border-radius:9px}.premium-shell .section-icon-emerald{background:linear-gradient(135deg,#34d399,#059669)!important;box-shadow:0 6px 14px rgba(16,185,129,.3)}.premium-shell .section-icon-rose{background:linear-gradient(135deg,#fb7185,#e11d48)!important;box-shadow:0 6px 14px rgba(244,63,94,.3)}.premium-shell .section-icon-violet{background:linear-gradient(135deg,#a78bfa,#7c3aed)!important;box-shadow:0 6px 14px rgba(139,92,246,.3)}.premium-shell .section-icon-slate{background:linear-gradient(135deg,#94a3b8,#64748b)!important}.premium-shell .count-chip{box-shadow:0 4px 10px rgba(15,23,42,.14)}.premium-shell .count-chip-emerald{background:linear-gradient(135deg,#34d399,#059669)!important;box-shadow:0 4px 10px rgba(16,185,129,.28)}.premium-shell .count-chip-rose{background:linear-gradient(135deg,#fb7185,#e11d48)!important;box-shadow:0 4px 10px rgba(244,63,94,.28)}.premium-shell .count-chip-violet{background:linear-gradient(135deg,#a78bfa,#7c3aed)!important;box-shadow:0 4px 10px rgba(139,92,246,.28)}.premium-shell .count-chip-slate{background:linear-gradient(135deg,#94a3b8,#64748b)!important}.premium-shell .table-scroll{border:1px solid var(--line);box-shadow:0 6px 16px rgba(15,23,42,.05);background:#fff}.premium-shell .comp-table thead th{color:#fff;padding:12px 14px;border-bottom:none}.premium-shell .table-emerald thead th{background:linear-gradient(135deg,#059669,#10b981)!important}.premium-shell .table-rose thead th{background:linear-gradient(135deg,#be123c,#f43f5e)!important}.premium-shell .table-violet thead th{background:linear-gradient(135deg,#6d28d9,#8b5cf6)!important}.premium-shell .table-slate thead th{background:linear-gradient(135deg,#475569,#64748b)!important}.premium-shell .comp-table tbody td{padding:13px 14px}.premium-shell .comp-table tbody tr:nth-child(even) td{background:#fbfcfe}.premium-shell .comp-table tbody tr:hover td{background:#f0f4ff}.premium-shell .cell-comp{min-width:230px}.premium-shell .comp-picker .ant-select-selection-item{font-weight:600}.premium-shell .comp-picker .ant-select-selection-placeholder{font-weight:500}.premium-shell .type-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11.5px;font-weight:700;white-space:nowrap}.premium-shell .type-pill-dot{width:6px;height:6px;border-radius:50%;background:currentColor}.premium-shell .type-pill-emerald{background:#d1fae5;color:#047857}.premium-shell .type-pill-rose{background:#ffe4e6;color:#be123c}.premium-shell .type-pill-violet{background:#ede9fe;color:#6d28d9}.premium-shell .type-pill-slate{background:#e2e8f0;color:#475569}.premium-shell .comp-input{height:40px}.premium-shell .comp-input:hover{border-color:#c7d2fe}.premium-shell .section-unassigned{box-shadow:none}`}</style>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalaryAssign;
