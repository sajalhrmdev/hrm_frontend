"use client";

import React, {
  useEffect,
  useState,
} from "react";

import axiosInstance from "@/utils/axiosInstance";

type Props = {
  employeeId: number;
};

const AddressTab = ({
  employeeId,
}: Props) => {

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // ============================================
  // FORM
  // ============================================

  const [formData, setFormData] =
    useState({

      presentAddress: "",

      permanentAddress: "",

      city: "",

      state: "",

      country: "",

      pinCode: "",
    });

  // ============================================
  // FETCH ADDRESS
  // ============================================

  const fetchAddress =
    async () => {

      try {

        setLoading(true);

        const res =
          await axiosInstance.get(
            `/employee-address/${employeeId}`
          );

        const data =
          res?.data?.data;

        if (data) {

          setFormData({

            presentAddress:
              data?.presentAddress ||
              "",

            permanentAddress:
              data?.permanentAddress ||
              "",

            city:
              data?.city ||
              "",

            state:
              data?.state ||
              "",

            country:
              data?.country ||
              "",

            pinCode:
              data?.pinCode ||
              "",
          });
        }

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    if (employeeId) {

      fetchAddress();
    }

  }, [employeeId]);

  // ============================================
  // CHANGE
  // ============================================

  const handleChange =
    (
      e: React.ChangeEvent<
        HTMLInputElement |
        HTMLTextAreaElement
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
  // SUBMIT
  // ============================================

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      try {

        setSaving(true);

        await axiosInstance.post(
          `/employee-address/${employeeId}`,
          formData
        );

        alert(
          "Address saved successfully"
        );

      } catch (err: any) {

        console.log(err);

        alert(
          err?.response?.data
            ?.message ||
          "Failed to save address"
        );

      } finally {

        setSaving(false);
      }
    };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {

    return (

      <div className="text-center py-5">
        Loading...
      </div>
    );
  }

  return (

    <div>

      <form
        onSubmit={
          handleSubmit
        }
      >

        <div className="row g-4">

          {/* PRESENT ADDRESS */}

          <div className="col-12">

            <label className="form-label fw-semibold">
              Present Address
            </label>

            <textarea
              rows={3}

              className="form-control"

              name="presentAddress"

              value={
                formData.presentAddress
              }

              onChange={
                handleChange
              }
            />

          </div>

          {/* PERMANENT ADDRESS */}

          <div className="col-12">

            <label className="form-label fw-semibold">
              Permanent Address
            </label>

            <textarea
              rows={3}

              className="form-control"

              name="permanentAddress"

              value={
                formData.permanentAddress
              }

              onChange={
                handleChange
              }
            />

          </div>

          {/* CITY */}

          <div className="col-md-6">

            <label className="form-label fw-semibold">
              City
            </label>

            <input
              type="text"

              className="form-control"

              name="city"

              value={
                formData.city
              }

              onChange={
                handleChange
              }
            />

          </div>

          {/* STATE */}

          <div className="col-md-6">

            <label className="form-label fw-semibold">
              State
            </label>

            <input
              type="text"

              className="form-control"

              name="state"

              value={
                formData.state
              }

              onChange={
                handleChange
              }
            />

          </div>

          {/* COUNTRY */}

          <div className="col-md-6">

            <label className="form-label fw-semibold">
              Country
            </label>

            <input
              type="text"

              className="form-control"

              name="country"

              value={
                formData.country
              }

              onChange={
                handleChange
              }
            />

          </div>

          {/* PIN CODE */}

          <div className="col-md-6">

            <label className="form-label fw-semibold">
              Pin Code
            </label>

            <input
              type="text"

              className="form-control"

              name="pinCode"

              value={
                formData.pinCode
              }

              onChange={
                handleChange
              }
            />

          </div>

        </div>

        {/* SAVE BUTTON */}

        <div className="mt-4">

          <button
            type="submit"

            className="btn btn-primary"

            disabled={
              saving
            }
          >

            {saving
              ? "Saving..."
              : "Save Address"}

          </button>

        </div>

      </form>

    </div>
  );
};

export default AddressTab;