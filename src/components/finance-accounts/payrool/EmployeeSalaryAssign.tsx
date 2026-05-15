import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

type Employee = {
  id: number;
  name: string;
  employeeCode?: string;
};

type SalaryComponent = {
  id: number;
  name: string;
  code: string;
  type: "EARNING" | "DEDUCTION";
};

type SelectedComponent = {
  salaryComponentId: number;
  amount: number;
};

const EmployeeSalaryAssign = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [components, setComponents] = useState<SalaryComponent[]>([]);

  const [employeeId, setEmployeeId] = useState("");

  const [salaryRows, setSalaryRows] = useState<SelectedComponent[]>([]);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // FETCH EMPLOYEES
  // =====================================================

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/employee?limit=50");

      setEmployees(res.data.data.employees || []);
    } catch (err) {
      console.log(err);
    }
  };

  // =====================================================
  // FETCH COMPONENTS
  // =====================================================

  const fetchComponents = async () => {
    try {
      const res = await axiosInstance.get("/salary-component");

      setComponents(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchComponents();
  }, []);

  // =====================================================
  // ADD ROW
  // =====================================================

  const addRow = () => {
    setSalaryRows([
      ...salaryRows,

      {
        salaryComponentId: 0,
        amount: 0,
      },
    ]);
  };

  // =====================================================
  // REMOVE ROW
  // =====================================================

  const removeRow = (index: number) => {
    const updated = [...salaryRows];

    updated.splice(index, 1);

    setSalaryRows(updated);
  };

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (
    index: number,
    field: keyof SelectedComponent,
    value: any,
  ) => {
    const updated = [...salaryRows];

    updated[index][field] = value;

    setSalaryRows(updated);
  };

  // =====================================================
  // TOTALS
  // =====================================================

  const totalEarning = salaryRows.reduce((acc, item) => {
    const component = components.find((c) => c.id === item.salaryComponentId);

    if (component?.type === "EARNING") {
      return acc + Number(item.amount);
    }

    return acc;
  }, 0);

  const totalDeduction = salaryRows.reduce((acc, item) => {
    const component = components.find((c) => c.id === item.salaryComponentId);

    if (component?.type === "DEDUCTION") {
      return acc + Number(item.amount);
    }

    return acc;
  }, 0);

  const netSalary = totalEarning - totalDeduction;

  //   ================fetch employee salary======
  const fetchEmployeeSalary = async (employeeId: number) => {
    try {
      const res = await axiosInstance.get(`/employee-salary/${employeeId}`);

      const structure = res.data.data.salaryStructure;

      const formatted = structure.map((item: any) => ({
        salaryComponentId: item.salaryComponent.id,

        amount: item.amount,
      }));

      setSalaryRows(formatted);
    } catch (err) {
      console.log(err);

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
        return alert("Please select employee");
      }

      if (salaryRows.length === 0) {
        return alert("Please add salary component");
      }

      setLoading(true);

      await axiosInstance.post("/employee-salary/assign", {
        employeeId: Number(employeeId),

        components: salaryRows,
      });

      alert("Salary assigned successfully");

      setEmployeeId("");
      setSalaryRows([]);
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card border-0 shadow-lg">
        <div className="card-body">
          {/* HEADER */}

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-1">💰 Employee Salary Assignment</h3>

              <p className="text-muted mb-0">
                Assign salary structure to employee
              </p>
            </div>

            <button type="button" className="btn btn-primary" onClick={addRow}>
              ➕ Add Component
            </button>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit}>
            {/* EMPLOYEE */}

            <div className="mb-4">
              <label className="form-label fw-semibold">Select Employee</label>

              <select
                className="form-select"
                value={employeeId}
                onChange={async (e) => {
                  const value = e.target.value;

                  setEmployeeId(value);

                  if (value) {
                    await fetchEmployeeSalary(Number(value));
                  } else {
                    setSalaryRows([]);
                  }
                }}
              >
                <option value="">-- Select Employee --</option>

                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            {/* TABLE */}

            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "60px" }}>#</th>

                    <th>Salary Component</th>

                    <th style={{ width: "180px" }}>Type</th>

                    <th style={{ width: "220px" }}>Amount</th>

                    <th style={{ width: "120px" }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {salaryRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5">
                        No salary component added
                      </td>
                    </tr>
                  ) : (
                    salaryRows.map((row, index) => {
                      const selectedComponent = components.find(
                        (c) => c.id === row.salaryComponentId,
                      );

                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>

                          {/* COMPONENT */}

                          <td>
                            <select
                              className="form-select"
                              value={row.salaryComponentId}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "salaryComponentId",
                                  Number(e.target.value),
                                )
                              }
                            >
                              <option value={0}>Select Component</option>

                              {components.map((comp) => (
                                <option key={comp.id} value={comp.id}>
                                  {comp.name} ({comp.code})
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* TYPE */}

                          <td>
                            {selectedComponent ? (
                              <span
                                className={`badge ${
                                  selectedComponent.type === "EARNING"
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                              >
                                {selectedComponent.type}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>

                          {/* AMOUNT */}

                          <td>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Enter Amount"
                              value={row.amount}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "amount",
                                  Number(e.target.value),
                                )
                              }
                            />
                          </td>

                          {/* ACTION */}

                          <td>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => removeRow(index)}
                            >
                              🗑 Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* SUMMARY */}

            <div className="row mt-4">
              <div className="col-md-4 mb-3">
                <div className="card border-0 bg-success text-white shadow-sm">
                  <div className="card-body">
                    <h6 className="mb-2">Total Earning</h6>

                    <h3 className="mb-0">₹{totalEarning.toFixed(2)}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <div className="card border-0 bg-danger text-white shadow-sm">
                  <div className="card-body">
                    <h6 className="mb-2">Total Deduction</h6>

                    <h3 className="mb-0">₹{totalDeduction.toFixed(2)}</h3>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <div className="card border-0 bg-primary text-white shadow-sm">
                  <div className="card-body">
                    <h6 className="mb-2">Net Salary</h6>

                    <h3 className="mb-0">₹{netSalary.toFixed(2)}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* SUBMIT */}

            <div className="mt-4">
              <button
                type="submit"
                className="btn btn-dark px-4"
                disabled={loading}
              >
                {loading ? "Saving..." : "💾 Save Salary Structure"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalaryAssign;
