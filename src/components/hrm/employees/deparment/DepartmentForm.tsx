// components/DepartmentForm.tsx

interface Props {
  formData: {
    Department: string;
    StatusId: string;
  };
  setFormData: any;
  onSubmit: () => void;
  isEdit?: boolean;
}

const DepartmentForm = ({ formData, setFormData, onSubmit, isEdit }: Props) => {
  return (
    <div className="p-2">

      {/* Title */}
      <h5 className="mb-3 fw-semibold">
        {isEdit ? "Edit Departmenttt" : "Add Department"}
      </h5>

      {/* Department Input */}
      <div className="mb-3">
        <label className="form-label fw-medium">
          Department Name
        </label>
        <input
          type="text"
          className="form-control shadow-sm"
          placeholder="Enter department name"
          value={formData.Department}
          onChange={(e) =>
            setFormData((prev: any) => ({
              ...prev,
              Department: e.target.value,
            }))
          }
        />
      </div>

      {/* Status Select */}
      <div className="mb-4">
        <label className="form-label fw-medium">
          Status
        </label>
        <select
          className="form-select shadow-sm"
          value={formData.StatusId}
          onChange={(e) =>
            setFormData((prev: any) => ({
              ...prev,
              StatusId: e.target.value,
            }))
          }
        >
          <option value="1">🟢 Active</option>
          <option value="2">🔴 Inactive</option>
          <option value="3">🟡 Pending</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-light px-4"
          data-bs-dismiss="modal"
        >
          Cancel
        </button>

        <button
          type="button"
          className="btn btn-primary px-4 shadow-sm"
          onClick={onSubmit}
          data-bs-dismiss="modal"
        >
          {isEdit ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
};

export default DepartmentForm;