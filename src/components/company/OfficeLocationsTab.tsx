"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { SkeletonCard } from "@/core/common/Skeleton";

interface Props {
  companyId: number;
}

export default function OfficeLocationsTab({ companyId }: Props) {
  const [locations, setLocations] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
    latitude: "",
    longitude: "",
    radius: "100",
  });

  const getLocations = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`/office-location/${companyId}`);

      setLocations(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocations();
  }, [companyId]);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
      latitude: "",
      longitude: "",
      radius: "100",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axiosInstance.put(
          `/office-location/${companyId}/${editingId}`,
          form,
        );
      } else {
        await axiosInstance.post(`/office-location/${companyId}`, form);
      }

      resetForm();

      setShowModal(false);

      getLocations();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);

    setForm({
      name: item.name || "",

      address: item.address || "",

      city: item.city || "",

      state: item.state || "",

      country: item.country || "",

      pinCode: item.pinCode || "",

      latitude: item.latitude || "",

      longitude: item.longitude || "",

      radius: item.radius || "100",
    });

    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Deactivate this location?");

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/office-location/${companyId}/${id}`);

      getLocations();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Office Locations</h5>

        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();

            setShowModal(true);
          }}
        >
          + Add Location
        </button>
      </div>

      {loading ? (
        <SkeletonCard />
      ) : (
        <div className="row g-3">
          {locations.map((item) => (
            <div className="col-md-6" key={item.id}>
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5>{item.name}</h5>

                  <p className="text-muted mb-2">{item.address}</p>

                  <p className="mb-1">Radius: {item.radius}m</p>

                  <div className="mt-3 d-flex gap-2">
                    <button
                      className="btn btn-sm btn-dark"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="modal d-block"
          style={{
            background: "rgba(0,0,0,.5)",
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5>{editingId ? "Edit Location" : "Add Location"}</h5>
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder="Location Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder="City"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <input
                        className="form-control"
                        placeholder="Address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <input
                        className="form-control"
                        placeholder="Latitude"
                        name="latitude"
                        value={form.latitude}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <input
                        className="form-control"
                        placeholder="Longitude"
                        name="longitude"
                        value={form.longitude}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <input
                        className="form-control"
                        placeholder="Radius"
                        name="radius"
                        value={form.radius}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>

                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
