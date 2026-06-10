"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

export default function OfficeLocationsPage() {
  const [loading, setLoading] = useState(false);

  const [locations, setLocations] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
    latitude: "",
    longitude: "",
    radius: "",
  });

  const getLocations = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/office-location/myLocations");

      setLocations(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocations();
  }, []);

  const handleEdit = (location: any) => {
    setSelectedLocation(location);

    setFormData({
      name: location.name || "",

      address: location.address || "",

      city: location.city || "",

      state: location.state || "",

      country: location.country || "",

      pinCode: location.pinCode || "",

      latitude: location.latitude?.toString() || "",

      longitude: location.longitude?.toString() || "",

      radius: location.radius?.toString() || "",
    });

    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axiosInstance.put(
        `/office-location/myLocations/${selectedLocation.id}`,
        formData,
      );

      setShowModal(false);

      getLocations();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container-fluid py-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Office Locations</h4>
            </div>

            <div className="card-body">
              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>

                        <th>City</th>

                        <th>Address</th>

                        <th>Radius</th>

                        <th>Status</th>

                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {locations.length > 0 ? (
                        locations.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>

                            <td>{item.city}</td>

                            <td>{item.address}</td>

                            <td>{item.radius}m</td>

                            <td>
                              <span className="badge bg-success">
                                {item.status}
                              </span>
                            </td>

                            <td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEdit(item)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center">
                            No Office Locations Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Edit Modal */}

          {showModal && (
            <div
              className="modal d-block"
              style={{
                background: "rgba(0,0,0,.5)",
              }}
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <form onSubmit={handleUpdate}>
                    <div className="modal-header">
                      <h5>Edit Office Location</h5>

                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowModal(false)}
                      />
                    </div>

                    <div className="modal-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label>Location Name</label>

                          <input
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="col-md-6">
                          <label>City</label>

                          <input
                            className="form-control"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="col-12">
                          <label>Address</label>

                          <input
                            className="form-control"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="col-md-4">
                          <label>Latitude</label>

                          <input
                            className="form-control"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="col-md-4">
                          <label>Longitude</label>

                          <input
                            className="form-control"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="col-md-4">
                          <label>Radius</label>

                          <input
                            className="form-control"
                            name="radius"
                            value={formData.radius}
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
                        Cancel
                      </button>

                      <button type="submit" className="btn btn-primary">
                        Update
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
