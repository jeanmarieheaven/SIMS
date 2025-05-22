import React, { useState, useEffect } from "react";
import AddSparePartForm from "../components/AddSparePartForm";
import SparePartsList from "../components/SparePartsList";
import StockInForm from "../components/StockInForm";
import StockOutForm from "../components/StockOutForm";
import api from "../services/api";

const Dashboard = ({ user }) => {
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
  });

  const fetchSpareParts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/spare-parts");
      setSpareParts(res.data);

      // Calculate statistics
      const totalItems = res.data.reduce((sum, part) => sum + part.Quantity, 0);
      const totalValue = res.data.reduce(
        (sum, part) => sum + part.Quantity * parseFloat(part.UnitPrice),
        0
      );
      const lowStock = res.data.filter((part) => part.Quantity < 10).length;

      setStats({ totalItems, totalValue, lowStock });
      setError(null);
    } catch (error) {
      console.error("Error fetching spare parts:", error);
      setError("Failed to fetch spare parts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const handleAdd = () => {
    fetchSpareParts();
  };

  const handleStockIn = () => {
    fetchSpareParts();
  };

  const handleStockOut = () => {
    fetchSpareParts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Spare Parts Inventory Management System
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome {user}</span>
              
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-gray-500 text-sm">Total Items</h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalItems}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-gray-500 text-sm">Total Value</h2>
                <p className="text-2xl font-semibold text-gray-900">
                  Rwf {stats.totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                <svg
                  className="w-6 h-6"
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
              <div className="ml-4">
                <h2 className="text-gray-500 text-sm">Low Stock Items</h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.lowStock}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
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
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Forms Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Spare Part
            </h2>
            <AddSparePartForm onAdd={handleAdd} />
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Stock In
              </h2>
              <StockInForm onStockIn={handleStockIn} />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Stock Out
              </h2>
              <StockOutForm onStockOut={handleStockOut} />
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <SparePartsList
              spareParts={spareParts}
              onUpdate={fetchSpareParts}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
