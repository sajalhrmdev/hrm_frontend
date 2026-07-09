"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import axiosInstance from "@/utils/axiosInstance";

interface Props {
  employeeId: number;
  isViewOnly?: boolean;
}

export default function EmployeeFaceRegister({ employeeId, isViewOnly }: Props) {
  const webcamRef = useRef<Webcam>(null);

  const [existingFace, setExistingFace] = useState<string | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // const backendUrl = "https://2gvbh86w-5000.inc1.devtunnels.ms";
    const backendUrl = "http://localhost:5000";

  // ===================================
  // GET FACE
  // ===================================

  const getFace = async () => {
    try {
      const res = await axiosInstance.get(`/employee-face/${employeeId}`);

      if (res.data.data?.imageUrl) {
        // setExistingFace(`${backendUrl}/${res.data.data.imageUrl}`);
        setExistingFace(res.data.data.imageUrl);
      }
    } catch {
      console.log("No face registered");
    }
  };

  useEffect(() => {
    getFace();
  }, []);

  // ===================================
  // CAPTURE IMAGE
  // ===================================

  const captureFace = () => {
    const imageSrc = webcamRef.current?.getScreenshot();

    if (!imageSrc) {
      alert("Failed to capture image");
      return;
    }

    setCapturedImage(imageSrc);
  };

  // ===================================
  // DATA URL → BLOB
  // ===================================

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(",");

    const mime = arr[0].match(/:(.*?);/)?.[1] || "";

    const bstr = atob(arr[1]);

    let n = bstr.length;

    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], {
      type: mime,
    });
  };

  // ===================================
  // SAVE FACE
  // ===================================

  const saveFace = async () => {
    try {
      if (!capturedImage) {
        throw new Error("No image captured");
      }

      setLoading(true);

      const blob = dataURLtoBlob(capturedImage);

      const formData = new FormData();

      formData.append("image", blob, "face.jpg");

      const res = await axiosInstance.post(
        `/employee-face/${employeeId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Upload Success", res.data);

      alert("Face Registered Successfully");

      setCapturedImage(null);

      getFace();
    } catch (error: any) {
      console.error(error);

      alert(error?.response?.data?.message || error.message || "Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">Face Registration</h5>
      </div>

      <div className="card-body">
        {existingFace && (
          <div className="mb-4">
            <h6>Current Face</h6>

            <img
              src={existingFace}
              alt="face"
              style={{
                width: 220,
                height: 220,
                objectFit: "cover",
                borderRadius: 12,
                border: "1px solid #ddd",
              }}
            />
          </div>
        )}

        {isViewOnly ? (
          !existingFace && <p className="text-muted">No face registered</p>
        ) : (
          <>
            {!capturedImage ? (
              <div>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  width={640}
                  height={480}
                  videoConstraints={{
                    facingMode: "user",
                    width: 640,
                    height: 480,
                  }}
                  onUserMedia={() => {
                    console.log("CAMERA READY");
                  }}
                  onUserMediaError={(err) => {
                    console.error("CAMERA ERROR", err);
                  }}
                />

                <button className="btn btn-primary mt-3" onClick={captureFace}>
                  Capture Face
                </button>
              </div>
            ) : (
              <div>
                <h6>Preview</h6>

                <img
                  src={capturedImage}
                  alt="preview"
                  style={{
                    width: "100%",
                    maxWidth: 400,
                    borderRadius: 12,
                  }}
                />

                <div className="mt-3 d-flex gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCapturedImage(null)}
                  >
                    Retake
                  </button>

                  <button
                    className="btn btn-success"
                    disabled={loading}
                    onClick={saveFace}
                  >
                    {loading ? "Saving..." : "Save Face"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
