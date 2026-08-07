"use client";

import React, {
  useEffect,
  useState,
} from "react";

import { useParams } from "next/navigation";

import axiosInstance from "@/utils/axiosInstance";

// ======================================================
// EXCEL EXPORT HELPERS
// ======================================================

const xmlEscape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const borders =
  `<Borders>` +
  `<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>` +
  `<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>` +
  `<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>` +
  `<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>` +
  `</Borders>`;

const stylesXml = `<Styles>
  <Style ss:ID="Title">
    <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#1A237E" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Header">
    <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#37474F" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="HeaderEarning">
    <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#2E7D32" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="HeaderDeduction">
    <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#C62828" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="HeaderEmployer">
    <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#4527A0" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="HeaderNet">
    <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#1A237E" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="HeaderPf">
    <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#1565C0" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="HeaderTax">
    <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#EF6C00" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="SubEarning">
    <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#43A047" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="SubDeduction">
    <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#D32F2F" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="SubEmployer">
    <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#5E35B1" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="SubPf">
    <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#1E88E5" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="SubTax">
    <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#FB8C00" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="CellNum">
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="CellText">
    <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="NetVal">
    <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#1A237E"/>
    <Interior ss:Color="#E8EAF6" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="CtcVal">
    <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#4527A0"/>
    <Interior ss:Color="#EDE7F6" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="TaxVal">
    <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#EF6C00"/>
    <Interior ss:Color="#FFF3E0" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="Footer">
    <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#37474F" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
    ${borders}
  </Style>
  <Style ss:ID="FooterVal">
    <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#1A237E" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    ${borders}
  </Style>
</Styles>`;

const cell = (
  value: any,
  type: "String" | "Number" = "String",
  styleId?: string,
) => {
  if (value === null || value === undefined) value = "";
  const style = styleId ? ` ss:StyleID="${styleId}"` : "";
  return `<Cell${style}><Data ss:Type="${type}">${xmlEscape(
    String(value),
  )}</Data></Cell>`;
};

const numCell = (value: any, styleId?: string) =>
  cell(value, "Number", styleId);

const mergedCell = (value: string, across: number, styleId?: string) => {
  const style = styleId ? ` ss:StyleID="${styleId}"` : "";
  return `<Cell${style} ss:MergeAcross="${across}"><Data ss:Type="String">${xmlEscape(
    value,
  )}</Data></Cell>`;
};

const downloadExcelBlob = (xml: string, filename: string) => {
  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// ======================================================

const SalarySheetPage = () => {
  const params = useParams();

  const id = params?.id;

  const [payrolls, setPayrolls] = useState<any[]>([]);

  const [payrollRun, setPayrollRun] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`/payroll/run/${id}`);

      setPayrolls(res?.data?.data?.payrolls || []);

      setPayrollRun(res?.data?.data?.payrollRun || null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  // ======================================================
  // PRINT
  // ======================================================

  const handlePrint = () => {
    window.print();
  };

  // ======================================================
  // EXCEL DOWNLOAD
  // ======================================================

  const handleExcelDownload = () => {
    const cols: string[] = [
      "SL",
      "Employee Code",
      "Employee Name",
      "Present Days",
      "Total Days",
      ...earningComponents,
      ...deductionComponents,
      ...employerComponents,
      "Net Payable",
      "CTC",
    ];

    const totalCols = cols.length;

    const rows: string[] = [];

    // Title row
    rows.push(
      `<Row ss:Height="30">${mergedCell(
        `Salary Sheet - ${payrollRun?.company?.name || ""} - ${monthLabel}`,
        totalCols - 1,
        "Title",
      )}</Row>`,
    );

    // Header rows
    const header1Cells: string[] = [
      cell("SL", "String", "Header"),
      cell("Employee Code", "String", "Header"),
      cell("Employee Name", "String", "Header"),
      cell("Present Days", "String", "Header"),
      cell("Total Days", "String", "Header"),
    ];

    if (earningComponents.length) {
      header1Cells.push(
        mergedCell("Earnings", earningComponents.length - 1, "HeaderEarning"),
      );
    }

    if (deductionComponents.length) {
      header1Cells.push(
        mergedCell("Deductions", deductionComponents.length - 1, "HeaderDeduction"),
      );
    }

    if (employerComponents.length) {
      header1Cells.push(
        mergedCell(
          "Employer Contribution",
          employerComponents.length - 1,
          "HeaderEmployer",
        ),
      );
    }

    header1Cells.push(cell("Net Payable", "String", "HeaderNet"));
    header1Cells.push(cell("CTC", "String", "HeaderNet"));

    rows.push(`<Row ss:Height="24">${header1Cells.join("")}</Row>`);

    const header2Cells: string[] = [
      cell("", "String", "Header"),
      cell("", "String", "Header"),
      cell("", "String", "Header"),
      cell("", "String", "Header"),
      cell("", "String", "Header"),
    ];

    earningComponents.forEach((c: any) =>
      header2Cells.push(cell(c, "String", "SubEarning")),
    );

    deductionComponents.forEach((c: any) =>
      header2Cells.push(cell(c, "String", "SubDeduction")),
    );

    employerComponents.forEach((c: any) =>
      header2Cells.push(cell(c, "String", "SubEmployer")),
    );

    rows.push(`<Row ss:Height="22">${header2Cells.join("")}</Row>`);

    // Data rows
    payrolls.forEach((payroll, index) => {
      const findAmount = (comp: string) => {
        const found = payroll.payrollSnapComponents?.find(
          (c: any) => c.componentName === comp,
        );
        return found?.amount ?? 0;
      };

      const cells: string[] = [
        numCell(index + 1, "CellNum"),
        cell(payroll.employee?.employeeCode, "String", "CellText"),
        cell(payroll.employee?.name, "String", "CellText"),
        numCell(payroll.present_days, "CellNum"),
        numCell(payroll.total_days, "CellNum"),
      ];

      earningComponents.forEach((c: any) =>
        cells.push(numCell(findAmount(c), "CellNum")),
      );

      deductionComponents.forEach((c: any) =>
        cells.push(numCell(findAmount(c), "CellNum")),
      );

      employerComponents.forEach((c: any) =>
        cells.push(numCell(findAmount(c), "CellNum")),
      );

      cells.push(numCell(payroll.net_salary, "NetVal"));

      cells.push(
        numCell(
          (payroll.gross_salary ?? 0) + (payroll.employer_contribution ?? 0),
          "CtcVal",
        ),
      );

      rows.push(`<Row>${cells.join("")}</Row>`);
    });

    // Footer rows
    const footer1: string[] = [cell("Total Net Salary", "String", "Footer")];

    for (let i = 1; i < totalCols - 2; i++) {
      footer1.push(cell("", "String", "Footer"));
    }

    footer1.push(numCell(totalNetSalary, "FooterVal"));
    footer1.push(cell("", "String", "Footer"));
    rows.push(`<Row ss:Height="22">${footer1.join("")}</Row>`);

    const footer2: string[] = [
      cell("Total Employer Contribution", "String", "Footer"),
    ];

    const empCol = 5 + earningComponents.length + deductionComponents.length;

    for (let i = 1; i < totalCols - 1; i++) {
      footer2.push(
        employerComponents.length > 0 && i === empCol
          ? numCell(totalEmployerContribution, "FooterVal")
          : cell("", "String", "Footer"),
      );
    }

    footer2.push(numCell(totalCtc, "FooterVal"));
    rows.push(`<Row ss:Height="22">${footer2.join("")}</Row>`);

    const colWidths = [
      40,
      110,
      220,
      90,
      90,
      ...earningComponents.map(() => 100),
      ...deductionComponents.map(() => 100),
      ...employerComponents.map(() => 100),
      110,
      110,
    ];

    const columnsXml = colWidths
      .map(
        (w, i) =>
          `<Column ss:Index="${i + 1}" ss:AutoFitWidth="0" ss:Width="${w}"/>`,
      )
      .join("");

    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
${stylesXml}
<Worksheet ss:Name="Salary Sheet">
<Table ss:DefaultRowHeight="20">${columnsXml}${rows.join("")}</Table>
</Worksheet>
</Workbook>`;

    downloadExcelBlob(
      xml,
      `Salary-Sheet-${monthLabel.replace(/[^\w]+/g, "-")}.xls`,
    );
  };

  // ======================================================
  // PF SHEET EXCEL DOWNLOAD
  // ======================================================

  const handlePfExcelDownload = () => {
    const pfColumns: { label: string; codes: string[]; names: string[] }[] = [
      {
        label: "Basic",
        codes: ["BASIC"],
        names: ["Basic", "BASIC SALARY", "Basic Salary"],
      },
      {
        label: "Employer PF",
        codes: ["EMPR_PF"],
        names: ["Employer PF"],
      },
      {
        label: "Employer ESIC",
        codes: ["EMPR_ESIC"],
        names: ["Employer ESIC"],
      },
      {
        label: "Emp PF",
        codes: ["EMP_PF"],
        names: ["EMP PF"],
      },
      {
        label: "Emp ESIC",
        codes: ["EMP_ESIC"],
        names: ["EMP ESIC"],
      },
      {
        label: "Professional Tax",
        codes: ["P._TAX", "PROF_TAX"],
        names: ["P. TAX", "Professional Tax"],
      },
    ];

    const pfGroupCols = pfColumns.slice(0, 5);

    const baseCols = 5;

    const totalCols = baseCols + pfColumns.length;

    const rows: string[] = [];

    // Title row
    rows.push(
      `<Row ss:Height="30">${mergedCell(
        `PF Sheet - ${payrollRun?.company?.name || ""} - ${monthLabel}`,
        totalCols - 1,
        "Title",
      )}</Row>`,
    );

    // Header row 1
    const header1Cells: string[] = [
      cell("SL", "String", "Header"),
      cell("Employee Name", "String", "Header"),
      cell("Employee Code", "String", "Header"),
      cell("Present Days", "String", "Header"),
      cell("Total Days", "String", "Header"),
      mergedCell("PF & ESIC Details", 4, "HeaderPf"),
      cell("Professional Tax", "String", "HeaderTax"),
    ];

    rows.push(`<Row ss:Height="24">${header1Cells.join("")}</Row>`);

    // Header row 2
    const header2Cells: string[] = [
      cell("", "String", "Header"),
      cell("", "String", "Header"),
      cell("", "String", "Header"),
      cell("", "String", "Header"),
      cell("", "String", "Header"),
    ];

    pfGroupCols.forEach((c) =>
      header2Cells.push(cell(c.label, "String", "SubPf")),
    );

    rows.push(`<Row ss:Height="22">${header2Cells.join("")}</Row>`);

    // Data rows
    payrolls.forEach((payroll, index) => {
      const findAmount = (codes: string[], names: string[]) => {
        const found = payroll.payrollSnapComponents?.find(
          (c: any) =>
            codes.includes(c.componentCode) || names.includes(c.componentName),
        );
        return found?.amount ?? 0;
      };

      const cells: string[] = [
        numCell(index + 1, "CellNum"),
        cell(payroll.employee?.name, "String", "CellText"),
        cell(payroll.employee?.employeeCode, "String", "CellText"),
        numCell(payroll.present_days, "CellNum"),
        numCell(payroll.total_days, "CellNum"),
      ];

      pfColumns.forEach((c, i) =>
        cells.push(
          numCell(
            findAmount(c.codes, c.names),
            i === pfColumns.length - 1 ? "TaxVal" : "CellNum",
          ),
        ),
      );

      rows.push(`<Row>${cells.join("")}</Row>`);
    });

    // Footer totals row
    const totalCells: string[] = [mergedCell("Total", baseCols - 1, "Footer")];

    pfColumns.forEach((c, i) => {
      const total = payrolls.reduce((acc, p) => {
        const found = p.payrollSnapComponents?.find(
          (s: any) =>
            c.codes.includes(s.componentCode) || c.names.includes(s.componentName),
        );
        return acc + (found?.amount ?? 0);
      }, 0);

      totalCells.push(
        numCell(total, i === pfColumns.length - 1 ? "TaxVal" : "FooterVal"),
      );
    });

    rows.push(`<Row ss:Height="22">${totalCells.join("")}</Row>`);

    const colWidths = [40, 200, 120, 90, 90, ...pfColumns.map(() => 110)];

    const columnsXml = colWidths
      .map(
        (w, i) =>
          `<Column ss:Index="${i + 1}" ss:AutoFitWidth="0" ss:Width="${w}"/>`,
      )
      .join("");

    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
${stylesXml}
<Worksheet ss:Name="PF Sheet">
<Table ss:DefaultRowHeight="20">${columnsXml}${rows.join("")}</Table>
</Worksheet>
</Workbook>`;

    downloadExcelBlob(
      xml,
      `PF-Sheet-${monthLabel.replace(/[^\w]+/g, "-")}.xls`,
    );
  };

  // ======================================================
  // DYNAMIC COMPONENTS
  // ======================================================

  const earningComponents = Array.from(
    new Set(
      payrolls.flatMap((payroll) =>
        payroll.payrollSnapComponents
          ?.filter((c: any) => c.type === "EARNING")
          ?.map((c: any) => c.componentName),
      ),
    ),
  );

  const deductionComponents = Array.from(
    new Set(
      payrolls.flatMap((payroll) =>
        payroll.payrollSnapComponents
          ?.filter((c: any) => c.type === "DEDUCTION")
          ?.map((c: any) => c.componentName),
      ),
    ),
  );

  const employerComponents = Array.from(
    new Set(
      payrolls.flatMap((payroll) =>
        payroll.payrollSnapComponents
          ?.filter((c: any) => c.type === "EMPLOYER_CONTRIBUTION")
          ?.map((c: any) => c.componentName),
      ),
    ),
  );

  // ======================================================
  // TOTAL
  // ======================================================

  const totalNetSalary = payrolls.reduce(
    (acc, item) => acc + item.net_salary,
    0,
  );

  const totalEmployerContribution = payrolls.reduce(
    (acc, item) => acc + (item.employer_contribution ?? 0),
    0,
  );

  const totalCtc = payrolls.reduce(
    (acc, item) =>
      acc +
      (item.gross_salary ?? 0) +
      (item.employer_contribution ?? 0),
    0,
  );

  const monthLabel = payrollRun?.periodStart
    ? new Date(payrollRun.periodStart).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "";

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container-fluid py-3">
          {/* ====================================== */}
          {/* ACTION BUTTONS */}
          {/* ====================================== */}

          <div className="d-flex justify-content-between align-items-center mb-3 no-print">
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handlePrint}>
                🖨 Print Salary Sheet
              </button>

              <button
                className="btn btn-success"
                onClick={handleExcelDownload}
              >
                ⬇ Download Excel
              </button>

              <button
                className="btn btn-info"
                onClick={handlePfExcelDownload}
              >
                ⬇ Download PF Sheet
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => window.history.back()}
              >
                ✖ Close
              </button>
            </div>

            <div className="fw-bold fs-5">Month: {monthLabel}</div>
          </div>

          {/* ====================================== */}
          {/* COMPANY HEADER */}
          {/* ====================================== */}

          <div className="salary-header">
            <h2>{payrollRun?.company?.name}</h2>

            <h5>Salary Sheet - {monthLabel}</h5>
          </div>

          {/* ====================================== */}
          {/* TABLE */}
          {/* ====================================== */}

          <div className="salary-sheet-wrapper">
            <table className="salary-sheet-table">
              <thead>
                {/* ====================================== */}
                {/* MAIN HEADER */}
                {/* ====================================== */}

                <tr>
                  <th rowSpan={2}>SL</th>

                  <th rowSpan={2}>Employee Code</th>

                  <th rowSpan={2}>Employee Name</th>

                  <th rowSpan={2}>Present Days</th>

                  <th rowSpan={2}>Total Days</th>

                  {/* ====================================== */}
                  {/* EARNINGS */}
                  {/* ====================================== */}

                  <th
                    colSpan={earningComponents.length}
                    className="earning-header"
                  >
                    Earnings
                  </th>

                  {/* ====================================== */}
                  {/* DEDUCTIONS */}
                  {/* ====================================== */}

                  <th
                    colSpan={deductionComponents.length}
                    className="deduction-header"
                  >
                    Deductions
                  </th>

                  {/* ====================================== */}
                  {/* EMPLOYER CONTRIBUTION */}
                  {/* ====================================== */}

                  {employerComponents.length > 0 && (
                    <th
                      colSpan={employerComponents.length}
                      className="employer-header"
                    >
                      Employer Contribution
                    </th>
                  )}

                  <th rowSpan={2}>Net Payable</th>

                  <th rowSpan={2}>CTC</th>
                </tr>

                {/* ====================================== */}
                {/* COMPONENT HEADER */}
                {/* ====================================== */}

                <tr>
                  {earningComponents.map((item: any) => (
                    <th key={item}>{item}</th>
                  ))}

                  {deductionComponents.map((item: any) => (
                    <th key={item}>{item}</th>
                  ))}

                  {employerComponents.map((item: any) => (
                    <th key={item}>{item}</th>
                  ))}
                </tr>
              </thead>

              {/* ====================================== */}
              {/* BODY */}
              {/* ====================================== */}

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={20} className="text-center py-5">
                      Loading...
                    </td>
                  </tr>
                ) : payrolls.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="text-center py-5">
                      No payroll found
                    </td>
                  </tr>
                ) : (
                  payrolls.map((payroll, index) => {
                    return (
                      <tr key={payroll.id}>
                        <td>{index + 1}</td>

                        <td>{payroll.employee?.employeeCode}</td>

                        <td className="employee-name">
                          {payroll.employee?.name}
                        </td>

                        <td>{payroll.present_days}</td>

                        <td>{payroll.total_days}</td>

                        {/* ====================================== */}
                        {/* EARNINGS */}
                        {/* ====================================== */}

                        {earningComponents.map((comp: any) => {
                          const found =
                            payroll.payrollSnapComponents?.find(
                              (c: any) => c.componentName === comp,
                            );

                          return (
                            <td key={comp}>
                              ₹
                              {found?.amount?.toLocaleString("en-IN") || 0}
                            </td>
                          );
                        })}

                        {/* ====================================== */}
                        {/* DEDUCTIONS */}
                        {/* ====================================== */}

                        {deductionComponents.map((comp: any) => {
                          const found =
                            payroll.payrollSnapComponents?.find(
                              (c: any) => c.componentName === comp,
                            );

                          return (
                            <td key={comp}>
                              ₹
                              {found?.amount?.toLocaleString("en-IN") || 0}
                            </td>
                          );
                        })}

                        {/* ====================================== */}
                        {/* EMPLOYER CONTRIBUTION */}
                        {/* ====================================== */}

                        {employerComponents.map((comp: any) => {
                          const found =
                            payroll.payrollSnapComponents?.find(
                              (c: any) => c.componentName === comp,
                            );

                          return (
                            <td key={comp}>
                              ₹
                              {found?.amount?.toLocaleString("en-IN") || 0}
                            </td>
                          );
                        })}

                        {/* ====================================== */}
                        {/* NET */}
                        {/* ====================================== */}

                        <td className="net-salary">
                          ₹
                          {payroll.net_salary?.toLocaleString("en-IN")}
                        </td>

                        {/* ====================================== */}
                        {/* CTC */}
                        {/* ====================================== */}

                        <td className="ctc-cell">
                          ₹
                          {(
                            (payroll.gross_salary ?? 0) +
                            (payroll.employer_contribution ?? 0)
                          ).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* ====================================== */}
              {/* FOOTER */}
              {/* ====================================== */}

              <tfoot>
                <tr>
                  <th
                    colSpan={
                      5 +
                      earningComponents.length +
                      deductionComponents.length +
                      employerComponents.length
                    }
                    className="text-end"
                  >
                    Total Net Salary
                  </th>

                  <th className="footer-total">
                    ₹{totalNetSalary.toLocaleString("en-IN")}
                  </th>

                  <th></th>
                </tr>

                {employerComponents.length > 0 && (
                  <tr>
                    <th
                      colSpan={
                        5 +
                        earningComponents.length +
                        deductionComponents.length
                      }
                      className="text-end"
                    >
                      Total Employer Contribution
                    </th>

                    <th
                      colSpan={employerComponents.length}
                      className="footer-total"
                    >
                      ₹{totalEmployerContribution.toLocaleString("en-IN")}
                    </th>

                    <th></th>

                    <th className="footer-total">
                      ₹{totalCtc.toLocaleString("en-IN")}
                    </th>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ====================================== */}
      {/* STYLE */}
      {/* ====================================== */}

      <style jsx>{`
        .salary-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .salary-header h2 {
          font-size: 34px;
          font-weight: 800;
          margin-bottom: 6px;
          color: #111827;
          letter-spacing: 1px;
        }

        .salary-header h5 {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
        }

        .salary-sheet-wrapper {
          width: 100%;
          overflow-x: auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
          padding: 10px;
        }

        .salary-sheet-table {
          width: max-content;
          min-width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          color: #111;
          background: white;
        }

        .salary-sheet-table th {
          background: #f3f4f6;
          color: #111827;
          font-weight: 700;
          border: 1px solid #d1d5db;
          padding: 10px 12px;
          text-align: center;
          vertical-align: middle;
          white-space: nowrap;
        }

        .salary-sheet-table td {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          text-align: center;
          vertical-align: middle;
          white-space: nowrap;
          color: #111827;
          font-weight: 500;
        }

        .salary-sheet-table tbody tr:nth-child(even) {
          background: #fafafa;
        }

        .salary-sheet-table tbody tr:hover {
          background: #f9fafb;
        }

        .earning-header {
          background: #e8f5e9 !important;
          color: #111827 !important;
          font-size: 15px;
        }

        .deduction-header {
          background: #ffebee !important;
          color: #111827 !important;
          font-size: 15px;
        }

        .employer-header {
          background: #ede7f6 !important;
          color: #111827 !important;
          font-size: 15px;
        }

        .employee-name {
          text-align: left !important;
          font-weight: 700;
        }

        .net-salary {
          font-weight: 800 !important;
          color: #065f46 !important;
          background: #ecfdf5;
        }

        .ctc-cell {
          font-weight: 700;
        }

        .footer-total {
          font-size: 16px;
          font-weight: 800;
          color: #111827;
          background: #f3f4f6;
        }

        /* ====================================== */
        /* PRINT */
        /* ====================================== */

        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .page-wrapper,
          .content {
            margin: 0 !important;
            padding: 0 !important;
          }

          .salary-sheet-wrapper {
            overflow: visible !important;
            box-shadow: none !important;
            padding: 0 !important;
          }

          .salary-sheet-table {
            width: max-content !important;
            min-width: 100% !important;
            font-size: 9px !important;
          }

          .salary-sheet-table th,
          .salary-sheet-table td {
            padding: 4px 6px !important;
          }

          .salary-header h2 {
            font-size: 22px !important;
          }

          .salary-header h5 {
            font-size: 14px !important;
          }

          @page {
            size: landscape;
            margin: 8mm;
          }
        }
      `}</style>

      {/* ====================================== */}
      {/* HIDE APP CHROME IN PRINT (NAVBAR) */}
      {/* ====================================== */}

      <style jsx global>{`
        @media print {
          .header,
          .sidebar,
          .sidebar-horizontal,
          .sidebar-stacked,
          .sidebar-twocol,
          .sidebar-themesettings,
          .btn,
          button {
            display: none !important;
          }

          .main-wrapper {
            display: block !important;
          }

          @page {
            size: landscape;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
};

export default SalarySheetPage;