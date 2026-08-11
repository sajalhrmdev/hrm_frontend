"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface RejectReasonModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  show,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (show) setReason("");
  }, [show]);

  if (!show) return null;

  const handleConfirm = () => {
    onConfirm(reason.trim());
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Reject Leave</h5>

            <button
              type="button"
              className="btn btn-light rounded-circle p-1 d-flex align-items-center justify-content-center"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            <p className="text-muted mb-3">
              Enter a reason for rejecting this leave. The employee will see it
              in their notification.
            </p>

            <textarea
              rows={3}
              className="form-control"
              placeholder="Rejection reason (optional)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-light" onClick={onClose}>
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirm}
            >
              Reject Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectReasonModal;
