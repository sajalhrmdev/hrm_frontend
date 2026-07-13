"use client";

import React from "react";

interface PreviewRow {
  row: number;
  status: "valid" | "invalid";
  data: Record<string, any>;
  errors: { row: number; field: string; message: string; value?: any }[];
}

interface PreviewTableProps {
  rows: PreviewRow[];
  maxDisplay?: number;
}

const PreviewTable: React.FC<PreviewTableProps> = ({ rows, maxDisplay = 50 }) => {
  const displayRows = rows.slice(0, maxDisplay);
  const validCount = rows.filter((r) => r.status === "valid").length;
  const invalidCount = rows.filter((r) => r.status === "invalid").length;

  const columns = rows.length > 0 ? Object.keys(rows[0].data) : [];

  return (
    <div>
      <div className="d-flex gap-3 mb-3">
        <span className="badge bg-success fs-12">Valid: {validCount}</span>
        <span className="badge bg-danger fs-12">Invalid: {invalidCount}</span>
        <span className="badge bg-info fs-12">Total: {rows.length}</span>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Row</th>
              <th>Status</th>
              {columns.slice(0, 8).map((col) => (
                <th key={col}>{col}</th>
              ))}
              {columns.length > 8 && <th>...</th>}
              <th>Errors</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => (
              <tr
                key={row.row}
                className={row.status === "invalid" ? "table-danger" : "table-success"}
              >
                <td>{row.row}</td>
                <td>
                  {row.status === "valid" ? (
                    <span className="badge bg-success">Valid</span>
                  ) : (
                    <span className="badge bg-danger">Invalid</span>
                  )}
                </td>
                {columns.slice(0, 8).map((col) => (
                  <td key={col}>{String(row.data[col] ?? "")}</td>
                ))}
                {columns.length > 8 && <td>...</td>}
                <td>
                  {row.errors.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {row.errors.map((err, i) => (
                        <li key={i} className="text-danger small">
                          {err.field}: {err.message}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-success">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > maxDisplay && (
        <p className="text-muted text-center">
          Showing {maxDisplay} of {rows.length} rows
        </p>
      )}
    </div>
  );
};

export default PreviewTable;
