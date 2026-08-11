// ======================================================
// SHARED SALARY SHEET EXCEL EXPORT
// Builds the same styled .xls used by the payroll salary
// sheet page so reports can reuse the exact formatting.
// ======================================================

export const xmlEscape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const borders =
  `<Borders>` +
  `<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>` +
  `<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>` +
  `<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>` +
  `<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B0BEC5"/>` +
  `</Borders>`;

export const stylesXml = `<Styles>
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

export const cell = (
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

export const numCell = (value: any, styleId?: string) =>
  cell(value, "Number", styleId);

export const mergedCell = (value: string, across: number, styleId?: string) => {
  const style = styleId ? ` ss:StyleID="${styleId}"` : "";
  return `<Cell${style} ss:MergeAcross="${across}"><Data ss:Type="String">${xmlEscape(
    value,
  )}</Data></Cell>`;
};

export const downloadExcelBlob = (xml: string, filename: string) => {
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

const uniqueComponents = (
  payrolls: any[],
  type: string,
): string[] =>
  Array.from(
    new Set(
      payrolls.flatMap((payroll) =>
        payroll.payrollSnapComponents
          ?.filter((c: any) => c.type === type)
          ?.map((c: any) => c.componentName),
      ),
    ),
  );

// ======================================================
// BUILD SALARY SHEET XML
// ======================================================

export const buildSalarySheetXml = (
  payrolls: any[],
  companyName: string,
  monthLabel: string,
): string => {
  const earningComponents = uniqueComponents(payrolls, "EARNING");
  const deductionComponents = uniqueComponents(payrolls, "DEDUCTION");
  const employerComponents = uniqueComponents(
    payrolls,
    "EMPLOYER_CONTRIBUTION",
  );

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
      acc + (item.gross_salary ?? 0) + (item.employer_contribution ?? 0),
    0,
  );

  const rows: string[] = [];

  // Title row
  rows.push(
    `<Row ss:Height="30">${mergedCell(
      `Salary Sheet - ${companyName || ""} - ${monthLabel}`,
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

  return xml;
};

// ======================================================
// DOWNLOAD SALARY SHEET
// ======================================================

export const downloadSalarySheet = (
  payrolls: any[],
  companyName: string,
  monthLabel: string,
) => {
  const xml = buildSalarySheetXml(payrolls, companyName, monthLabel);
  downloadExcelBlob(
    xml,
    `Salary-Sheet-${monthLabel.replace(/[^\w]+/g, "-")}.xls`,
  );
};
