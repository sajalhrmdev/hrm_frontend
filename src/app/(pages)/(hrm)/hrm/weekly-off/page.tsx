"use client";

import React, {
  useEffect,
  useState,
} from "react";

import axiosInstance from "@/utils/axiosInstance";

type WeeklyOff = {

  id: number;

  dayOfWeek: number;

  weekNumber: number | null;

  isActive: boolean;
};

const days = [

  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const weeks = [

  {
    label:
      "Every Week",

    value: "",
  },

  {
    label:
      "1st Week",

    value: 1,
  },

  {
    label:
      "2nd Week",

    value: 2,
  },

  {
    label:
      "3rd Week",

    value: 3,
  },

  {
    label:
      "4th Week",

    value: 4,
  },

  {
    label:
      "5th Week",

    value: 5,
  },
];

const WeeklyOffPage = () => {

  const [loading, setLoading] =
    useState(false);

  const [weeklyOffs, setWeeklyOffs] =
    useState<WeeklyOff[]>(
      []
    );

  const [showModal, setShowModal] =
    useState(false);

  const [
    editingData,
    setEditingData,
  ] = useState<WeeklyOff | null>(
    null
  );

  const [formData, setFormData] =
    useState({

      dayOfWeek: 0,

      weekNumber: "",

      isActive: true,
    });

  // ============================================
  // FETCH
  // ============================================

  const fetchWeeklyOffs =
    async () => {

      try {

        setLoading(true);

        const res =
          await axiosInstance.get(
            "/weekly-off"
          );

        setWeeklyOffs(
          res?.data?.data || []
        );

      } catch (err: any) {

        console.log(err);

        alert(
          err?.response?.data
            ?.message ||
          "Failed to fetch"
        );

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    fetchWeeklyOffs();

  }, []);

  // ============================================
  // HANDLE CHANGE
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
        type,
      } = e.target;

      setFormData(
        (prev) => ({

          ...prev,

          [name]:
            type ===
            "checkbox"
              ? (
                  e.target as HTMLInputElement
                ).checked
              : value,
        })
      );
    };

  // ============================================
  // RESET
  // ============================================

  const resetForm = () => {

    setFormData({

      dayOfWeek: 0,

      weekNumber: "",

      isActive: true,
    });

    setEditingData(
      null
    );
  };

  // ============================================
  // OPEN CREATE
  // ============================================

  const handleOpenCreate =
    () => {

      resetForm();

      setShowModal(true);
    };

  // ============================================
  // OPEN EDIT
  // ============================================

  const handleEdit =
    (
      item: WeeklyOff
    ) => {

      setEditingData(
        item
      );

      setFormData({

        dayOfWeek:
          item.dayOfWeek,

        weekNumber:
          item.weekNumber
            ? String(
                item.weekNumber
              )
            : "",

        isActive:
          item.isActive,
      });

      setShowModal(true);
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

        const payload = {

          dayOfWeek:
            Number(
              formData.dayOfWeek
            ),

          weekNumber:
            formData.weekNumber
              ? Number(
                  formData.weekNumber
                )
              : null,

          isActive:
            formData.isActive,
        };

        if (
          editingData
        ) {

          await axiosInstance.patch(
            `/weekly-off/${editingData.id}`,
            payload
          );

          alert(
            "Weekly off updated"
          );

        } else {

          await axiosInstance.post(
            "/weekly-off",
            payload
          );

          alert(
            "Weekly off created"
          );
        }

        setShowModal(false);

        resetForm();

        fetchWeeklyOffs();

      } catch (err: any) {

        console.log(err);

        alert(
          err?.response?.data
            ?.message ||
          "Failed"
        );
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
            "Delete weekly off?"
          );

        if (
          !confirmDelete
        ) {
          return;
        }

        await axiosInstance.delete(
          `/weekly-off/${id}`
        );

        alert(
          "Deleted successfully"
        );

        fetchWeeklyOffs();

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

    <div className="page-wrapper">

      <div className="content">

        {/* HEADER */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h3 className="fw-bold mb-1">
              📅 Weekly Off Config
            </h3>

            <p className="text-muted mb-0">
              Manage company weekly off rules
            </p>

          </div>

          <button
            className="btn btn-primary"

            onClick={
              handleOpenCreate
            }
          >
            ➕ Add Weekly Off
          </button>

        </div>

        {/* TABLE */}

        <div className="card border-0 shadow-sm">

          <div className="card-body">

            {loading ? (

              <div className="text-center py-5">

                Loading...

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table table-bordered align-middle">

                  <thead className="table-light">

                    <tr>

                      <th>#</th>

                      <th>Day</th>

                      <th>Week</th>

                      <th>Status</th>

                      <th>Action</th>

                    </tr>

                  </thead>

                  <tbody>

                    {weeklyOffs.length ===
                    0 ? (

                      <tr>

                        <td
                          colSpan={5}
                          className="text-center py-4"
                        >
                          No weekly off found
                        </td>

                      </tr>

                    ) : (

                      weeklyOffs.map(
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

                            <td className="fw-semibold">

                              {
                                days[
                                  item.dayOfWeek
                                ]
                              }

                            </td>

                            <td>

                              {item.weekNumber
                                ? `${item.weekNumber} Week`
                                : "Every Week"}

                            </td>

                            <td>

                              {item.isActive ? (

                                <span className="badge bg-success">
                                  Active
                                </span>

                              ) : (

                                <span className="badge bg-danger">
                                  Inactive
                                </span>
                              )}

                            </td>

                            <td>

                              <div className="d-flex gap-2">

                                <button
                                  className="btn btn-sm btn-dark"

                                  onClick={() =>
                                    handleEdit(
                                      item
                                    )
                                  }
                                >
                                  ✏ Edit
                                </button>

                                <button
                                  className="btn btn-sm btn-danger"

                                  onClick={() =>
                                    handleDelete(
                                      item.id
                                    )
                                  }
                                >
                                  🗑 Delete
                                </button>

                              </div>

                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* MODAL */}

      {showModal && (

        <div
          className="modal d-block"
          tabIndex={-1}
          style={{
            background:
              "rgba(0,0,0,0.5)",
          }}
        >

          <div className="modal-dialog">

            <div className="modal-content border-0 shadow-lg">

              {/* HEADER */}

              <div className="modal-header">

                <h5 className="modal-title fw-bold">

                  {editingData
                    ? "✏ Edit Weekly Off"
                    : "➕ Add Weekly Off"}

                </h5>

                <button
                  className="btn-close"

                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                />

              </div>

              {/* BODY */}

              <form
                onSubmit={
                  handleSubmit
                }
              >

                <div className="modal-body">

                  {/* DAY */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Day
                    </label>

                    <select
                      className="form-select"

                      name="dayOfWeek"

                      value={
                        formData.dayOfWeek
                      }

                      onChange={
                        handleChange
                      }
                    >

                      {days.map(
                        (
                          day,
                          index
                        ) => (

                          <option
                            key={day}
                            value={
                              index
                            }
                          >
                            {day}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* WEEK */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Week
                    </label>

                    <select
                      className="form-select"

                      name="weekNumber"

                      value={
                        formData.weekNumber
                      }

                      onChange={
                        handleChange
                      }
                    >

                      {weeks.map(
                        (
                          item
                        ) => (

                          <option
                            key={
                              item.label
                            }
                            value={
                              item.value
                            }
                          >

                            {
                              item.label
                            }

                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* ACTIVE */}

                  <div className="form-check">

                    <input
                      type="checkbox"

                      className="form-check-input"

                      name="isActive"

                      checked={
                        formData.isActive
                      }

                      onChange={
                        handleChange
                      }
                    />

                    <label className="form-check-label">

                      Active

                    </label>

                  </div>

                </div>

                {/* FOOTER */}

                <div className="modal-footer">

                  <button
                    type="button"

                    className="btn btn-secondary"

                    onClick={() =>
                      setShowModal(
                        false
                      )
                    }
                  >
                    Close
                  </button>

                  <button
                    type="submit"

                    className="btn btn-primary"
                  >

                    {editingData
                      ? "Update"
                      : "Create"}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default WeeklyOffPage;