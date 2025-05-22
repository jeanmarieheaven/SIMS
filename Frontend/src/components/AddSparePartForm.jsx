import React, { useState } from "react";
import api from "../services/api";

const AddSparePartForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    Name: "",
    Category: "",
    Quantity: "",
    UnitPrice: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const categories = [
    "Engine Parts",
    "Electrical",
    "Brake System",
    "Suspension",
    "Transmission",
    "Body Parts",
    "Accessories",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate form
    if (!formData.Name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }
    if (!formData.Category) {
      setError("Category is required");
      setLoading(false);
      return;
    }
    if (formData.Quantity < 0) {
      setError("Quantity cannot be negative");
      setLoading(false);
      return;
    }
    if (formData.UnitPrice <= 0) {
      setError("Unit price must be greater than 0");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/spare-parts", formData, {
        withCredentials: true,
      });
      if (res.data.message) {
        setFormData({ Name: "", Category: "", Quantity: 0, UnitPrice: 0 });
        setSuccess(true);
        onAdd();
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.data.error || "Failed to add spare part");
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to add spare part");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Add New Spare Part
        </h2>
        <div className="flex items-center space-x-2">
          {success && (
            <div className="text-green-600 text-sm flex items-center">
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Spare part added successfully
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter spare part name"
              value={formData.Name}
              onChange={(e) =>
                setFormData({ ...formData, Name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={formData.Category}
              onChange={(e) =>
                setFormData({ ...formData, Category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Initial Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="0"
              placeholder="Enter initial quantity"
              value={formData.Quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  Quantity: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="unitPrice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Unit Price (Rwf)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Rwf</span>
              </div>
              <input
                id="unitPrice"
                type="number"
                min="0.01"
                step="0.01"
                //placeholder="0.00"
                value={formData.UnitPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    UnitPrice: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Adding...
              </>
            ) : (
              "Add Spare Part"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSparePartForm;
