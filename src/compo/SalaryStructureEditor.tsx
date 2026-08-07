"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";

import axiosInstance from "@/utils/axiosInstance";

import {
  clampAmount,
  resolveStructureStandard,
  ResolvedComponent,
} from "@/utils/salaryStructureResolver";

import { premiumSalaryStyles } from "@/utils/premiumSalaryStyles";

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
  Save,
  Coins,
} from "lucide-react";

// ======================================================

type Props = {
  employeeId: number;
  readOnly?: boolean;
  onComponentsLoaded?: (count: number) => void;
};

// ======================================================

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

// ======================================================

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

// ======================================================

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
  disabled,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
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
      disabled={disabled}
    />
    {suffix && <span className="num-affix num-suffix">{suffix}</span>}
  </div>
);

// ======================================================

const SalaryStructureEditor = ({
  employeeId,
  readOnly = false,
  onComponentsLoaded,
}: Props) => {
  // ======================================================
  // STATES
  // ======================================================

  const [employee, setEmployee] = useState<any>(null);

  const [components, setComponents] = useState<SalaryComponent[]>([]);

  const [salaryRows, setSalaryRows] = useState<SalaryRow[]>([]);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  // ======================================================
  // FETCH DATA
  // ======================================================

  const mapStructureToRows = (structure: any[]): SalaryRow[] =>
    structure.map((item: any) => ({
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

  const fetchData = async () => {
    try {
      setLoading(true);

      const [salaryRes, componentRes] = await Promise.all([
        axiosInstance.get(`/employee-salary/${employeeId}`),
        axiosInstance.get("/salary-component"),
      ]);

      setEmployee(salaryRes?.data?.data?.employee);

      setSalaryRows(
        mapStructureToRows(salaryRes?.data?.data?.salaryStructure || []),
      );

      setComponents(componentRes?.data?.data || []);

      onComponentsLoaded?.(componentRes?.data?.data?.length || 0);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load salary structure");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  // ======================================================
  // HELPERS
  // ======================================================

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

  const hasAnyComponent = salaryRows.some((r) => r.salaryComponentId);

  // ======================================================
  // ACTIONS
  // ======================================================

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

  const handleSave = async () => {
    try {
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

      setSaving(true);

      await axiosInstance.post("/employee-salary/assign", {
        employeeId: Number(employeeId),

        components: payload,
      });

      toast.success("Salary structure saved successfully");

      fetchData();
    } catch (err: any) {
      console.log(err);

      toast.error(err?.response?.data?.message || "Failed to save salary structure");
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // RENDER HELPERS
  // ======================================================

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
            disabled={readOnly}
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
                disabled={readOnly}
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
            disabled={readOnly}
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
            disabled={readOnly}
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
            disabled={readOnly}
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
            disabled={readOnly}
          />
        </td>

        {/* ACTION */}
        <td className="cell-action">
          {!readOnly && (
            <Tooltip title="Remove component">
              <button
                type="button"
                className="icon-btn icon-btn-danger"
                onClick={() => removeRow(index)}
              >
                <Trash2 size={15} />
              </button>
            </Tooltip>
          )}
        </td>
      </>
    );
  };

  // ======================================================
  // GROUPING
  // ======================================================

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

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="premium-shell">
      {/* ====================================== */}
      {/* EMPLOYEE */}
      {/* ====================================== */}

      {employee && (
        <div className="premium-card emp-card">
          <div className="card-head">
            <div className="card-head-copy">
              <h3>Salary Structure</h3>
              <p>
                Earnings, deductions & employer contributions for this employee
              </p>
            </div>

            <span className="card-head-tag">Structure loaded</span>
          </div>

          <div className="emp-profile">
            <span className="emp-avatar">{initials(employee.name)}</span>

            <div className="emp-profile-meta">
              <div className="emp-profile-name">{employee.name}</div>

              <div className="emp-profile-code">
                {employee.employeeCode || "No employee code"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================== */}
      {/* EDITOR */}
      {/* ====================================== */}

      <div className="premium-card editor-card">
        <div className="card-head">
          <div className="card-head-copy">
            <h3>Salary Components</h3>
            <p>Add or adjust components for this employee</p>
          </div>

          {!readOnly && (
            <Button
              type="primary"
              className="add-btn"
              icon={<Plus size={15} />}
              onClick={addRow}
            >
              Add Component
            </Button>
          )}
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : salaryRows.length === 0 ? (
          <div className="editor-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                readOnly
                  ? "No salary structure assigned yet"
                  : "No components added yet"
              }
            />

            {readOnly ? (
              <Link href="/salary-assign" className="add-btn">
                Assign salary structure
              </Link>
            ) : (
              <Button
                type="primary"
                className="add-btn"
                icon={<Plus size={15} />}
                onClick={addRow}
              >
                Add your first component
              </Button>
            )}
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
                      <span className={`section-icon section-icon-${accent}`}>
                        <Icon size={14} />
                      </span>
                      {section.label}
                      <span className={`count-chip count-chip-${accent}`}>
                        {items.length}
                      </span>
                    </span>

                    <span className="section-hint">{section.hint}</span>
                  </div>

                  <div className="table-scroll">
                    <table className={`comp-table table-${accent}`}>
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

      {/* ====================================== */}
      {/* LIVE PREVIEW */}
      {/* ====================================== */}

      {hasAnyComponent && (
        <div className="premium-card preview-card">
          <div className="card-head">
            <div className="card-head-copy">
              <h3>Monthly Preview</h3>
              <p>Standard amounts computed from the structure above</p>
            </div>
          </div>

          {previewRows.error ? (
            <Alert type="warning" message={previewRows.error} showIcon />
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
                          <span className={`p-dot ${toneClass(r.type)}`} />
                          {comp?.name}
                          <span className="p-code">{comp?.code}</span>
                        </td>

                        <td className="p-amt">
                          ₹{r.standardAmount.toLocaleString("en-IN")}
                        </td>

                        <td className="p-payable">
                          {r.floorAmount != null || r.capAmount != null ? (
                            <>
                              <span className="p-amt-strong">
                                ₹{payable.toLocaleString("en-IN")}
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

      {/* ====================================== */}
      {/* SUMMARY */}
      {/* ====================================== */}

      {hasAnyComponent && !previewRows.error && (
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

      {/* ====================================== */}
      {/* SAVE */}
      {/* ====================================== */}

      {!readOnly && (
        <div className="save-bar">
          <div className="save-note">
            {employee ? (
              <>
                Saving structure for{" "}
                <span className="save-emp">{employee.name}</span>
              </>
            ) : (
              "Loading employee…"
            )}
          </div>

          <button
            type="button"
            className="save-btn"
            onClick={handleSave}
            disabled={saving || loading || !hasAnyComponent}
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save Salary Structure"}
          </button>
        </div>
      )}

      <style jsx global>{premiumSalaryStyles}</style>
    </div>
  );
};

export default SalaryStructureEditor;
