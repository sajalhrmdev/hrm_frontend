"use client";

import React, {
  useEffect,
  useState,
} from "react";

import axiosInstance from "@/utils/axiosInstance";

type Props = {
  employeeId: number;
};

type DocumentItem = {

  id: number;

  title: string;

  documentType: string;

  documentNumber?: string;

  fileUrl: string;

  fileName?: string;

  mimeType?: string;

  fileSize?: number;

  uploadedAt: string;
};

const DocumentTab = ({
  employeeId,
}: Props) => {

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [documents, setDocuments] =
    useState<DocumentItem[]>(
      []
    );

  // ============================================
  // FORM
  // ============================================

  const [formData, setFormData] =
    useState({

      title: "",

      documentType: "",

      documentNumber: "",
    });

  const [selectedFile, setSelectedFile] =
    useState<File | null>(
      null
    );

  // ============================================
  // FETCH DOCUMENTS
  // ============================================

  const fetchDocuments =
    async () => {

      try {

        setLoading(true);

        const res =
          await axiosInstance.get(
            `/employee-document/${employeeId}`
          );

        setDocuments(
          res?.data?.data || []
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    if (employeeId) {

      fetchDocuments();
    }

  }, [employeeId]);

  // ============================================
  // CHANGE
  // ============================================

  const handleChange =
    (
      e: React.ChangeEvent<
        HTMLInputElement |
        HTMLSelectElement
      >
    ) => {

      const {
        name,
        value,
      } = e.target;

      setFormData(
        (prev) => ({

          ...prev,

          [name]: value,
        })
      );
    };

  // ============================================
  // FILE CHANGE
  // ============================================

  const handleFileChange =
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {

      const file =
        e.target.files?.[0];

      if (file) {

        setSelectedFile(
          file
        );
      }
    };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      try {

        if (!selectedFile) {

          alert(
            "Please select a file"
          );

          return;
        }

        setSaving(true);

        const payload =
          new FormData();

        payload.append(
          "title",
          formData.title
        );

        payload.append(
          "documentType",
          formData.documentType
        );

        payload.append(
          "documentNumber",
          formData.documentNumber
        );

        payload.append(
          "file",
          selectedFile
        );

        await axiosInstance.post(

          `/employee-document/${employeeId}`,

          payload,

          {

            headers: {

              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        alert(
          "Document uploaded successfully"
        );

        // RESET

        setFormData({

          title: "",

          documentType: "",

          documentNumber: "",
        });

        setSelectedFile(
          null
        );

        fetchDocuments();

      } catch (err: any) {

        console.log(err);

        alert(
          err?.response?.data
            ?.message ||
          "Upload failed"
        );

      } finally {

        setSaving(false);
      }
    };

  // ============================================
  // DELETE
  // ============================================

  const handleDelete =
    async (
      id: number
    ) => {

      try {

        const confirmDelete =
          window.confirm(
            "Delete document?"
          );

        if (
          !confirmDelete
        ) {
          return;
        }

        await axiosInstance.delete(
          `/employee-document/${id}`
        );

        alert(
          "Document deleted successfully"
        );

        fetchDocuments();

      } catch (err: any) {

        console.log(err);

        alert(
          err?.response?.data
            ?.message ||
          "Delete failed"
        );
      }
    };

  return (

    <div>

      {/* ====================================== */}
      {/* UPLOAD FORM */}
      {/* ====================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-4">
            📄 Upload Document
          </h5>

          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="row g-4">

              {/* TITLE */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Document Title
                  <span className="text-danger ms-1">
                    *
                  </span>
                </label>

                <input
                  type="text"

                  className="form-control"

                  name="title"

                  value={
                    formData.title
                  }

                  onChange={
                    handleChange
                  }

                  required
                />

              </div>

              {/* TYPE */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Document Type
                  <span className="text-danger ms-1">
                    *
                  </span>
                </label>

                <select
                  className="form-select"

                  name="documentType"

                  value={
                    formData.documentType
                  }

                  onChange={
                    handleChange
                  }

                  required
                >

                  <option value="">
                    Select Type
                  </option>

                  <option value="aadhaar">
                    Aadhaar
                  </option>

                  <option value="pan">
                    PAN
                  </option>

                  <option value="passport">
                    Passport
                  </option>

                  <option value="resume">
                    Resume
                  </option>

                  <option value="photo">
                    Photo
                  </option>

                  <option value="signature">
                    Signature
                  </option>

                  <option value="certificate">
                    Certificate
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

              </div>

              {/* DOCUMENT NUMBER */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Document Number
                </label>

                <input
                  type="text"

                  className="form-control"

                  name="documentNumber"

                  value={
                    formData.documentNumber
                  }

                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* FILE */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">
                  Upload File
                  <span className="text-danger ms-1">
                    *
                  </span>
                </label>

                <input
                  type="file"

                  className="form-control"

                  onChange={
                    handleFileChange
                  }

                  required
                />

              </div>

            </div>

            {/* BUTTON */}

            <div className="mt-4">

              <button
                type="submit"

                className="btn btn-primary"

                disabled={
                  saving
                }
              >

                {saving
                  ? "Uploading..."
                  : "Upload Document"}

              </button>

            </div>

          </form>

        </div>

      </div>

      {/* ====================================== */}
      {/* DOCUMENT LIST */}
      {/* ====================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <h5 className="fw-bold mb-4">
            📁 Employee Documents
          </h5>

          {loading ? (

            <div className="text-center py-5">
              Loading...
            </div>

          ) : documents.length ===
            0 ? (

            <div className="text-center py-5 text-muted">

              No documents uploaded

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-bordered align-middle">

                <thead className="table-light">

                  <tr>

                    <th>#</th>

                    <th>Title</th>

                    <th>Type</th>

                    <th>Document No</th>

                    <th>File</th>

                    <th>Uploaded</th>

                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {documents.map(
                    (
                      item,
                      index
                    ) => (

                      <tr
                        key={item.id}
                      >

                        <td>

                          {index + 1}

                        </td>

                        <td>

                          {
                            item.title
                          }

                        </td>

                        <td>

                          <span className="badge bg-primary">

                            {
                              item.documentType
                            }

                          </span>

                        </td>

                        <td>

                          {item.documentNumber ||
                            "-"}

                        </td>

                        <td>

                          <a
                            href={`http://localhost:5000/${item.fileUrl}`}

                            target="_blank"

                            rel="noreferrer"

                            className="btn btn-sm btn-dark"
                          >
                            View File
                          </a>

                        </td>

                        <td>

                          {new Date(
                            item.uploadedAt
                          ).toLocaleDateString()}

                        </td>

                        <td>

                          <button
                            className="btn btn-sm btn-danger"

                            onClick={() =>
                              handleDelete(
                                item.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default DocumentTab;