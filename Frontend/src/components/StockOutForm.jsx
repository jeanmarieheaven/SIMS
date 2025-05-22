import React, { useState, useEffect } from "react";
import api from "../services/api";

const StockOutForm = ({ onStockOut }) => {
  const [formData, setFormData] = useState({
    StockOutDate: new Date().toISOString().split("T")[0],
    StockOutQuantity: "",
    SparePartName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [spareParts, setSpareParts] = useState([]);

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const fetchSpareParts = async () => {
    try {
      const res = await api.get("/api/spare-parts");
      setSpareParts(res.data);
    } catch (error) {
      console.error("Error fetching spare parts:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate form
    if (!formData.StockOutDate) {
      setError("Date is required");
      setLoading(false);
      return;
    }
    if (!formData.SparePartName) {
      setError("Spare part name is required");
      setLoading(false);
      return;
    }
    if (!formData.StockOutQuantity || formData.StockOutQuantity <= 0) {
      setError("Quantity must be greater than 0");
      setLoading(false);
      return;
    }

    // Check if enough stock is available
    const selectedPart = spareParts.find(
      (part) => part.Name === formData.SparePartName
    );
    if (selectedPart && formData.StockOutQuantity > selectedPart.Quantity) {
      setError(
        `Not enough stock available. Current stock: ${selectedPart.Quantity}`
      );
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/stock-out", formData, {
        withCredentials: true,
      });

      if (res.data.message) {
        setFormData({
          StockOutDate: new Date().toISOString().split("T")[0],
          StockOutQuantity: "",
          SparePartName: "",
        });
        setSuccess(true);
        // Refresh spare parts list
        fetchSpareParts();
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Failed to remove stock. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Stock Out</h2>
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
              Stock removed successfully
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
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              value={formData.StockOutDate}
              onChange={(e) =>
                setFormData({ ...formData, StockOutDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="sparePart"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Spare Part
            </label>
            <select
              id="sparePart"
              value={formData.SparePartName}
              onChange={(e) =>
                setFormData({ ...formData, SparePartName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a spare part</option>
              {spareParts.map((part) => (
                <option key={part.Name} value={part.Name}>
                  {part.Name} (Current Stock: {part.Quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={formData.StockOutQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  StockOutQuantity: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
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
                Processing...
              </>
            ) : (
              "Remove Stock"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockOutForm;
