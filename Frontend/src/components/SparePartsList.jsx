import React, { useState } from "react";
import UpdateSparePartForm from "./UpdateSparePartForm";
import DeleteSparePartButton from "./DeleteSparePartButton";

const SparePartsList = ({ spareParts, onUpdate }) => {
  const [selectedSparePart, setSelectedSparePart] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "Name",
    direction: "asc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const handleUpdate = (sparePart) => {
    setSelectedSparePart(sparePart);
    setIsUpdating(true);
  };

  const handleUpdateComplete = () => {
    setIsUpdating(false);
    setSelectedSparePart(null);
    onUpdate();
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedParts = [...spareParts].sort((a, b) => {
    if (sortConfig.key === "UnitPrice" || sortConfig.key === "TotalPrice") {
      const aValue = parseFloat(a[sortConfig.key]) || 0;
      const bValue = parseFloat(b[sortConfig.key]) || 0;
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (sortConfig.key === "Quantity") {
      return sortConfig.direction === "asc"
        ? a.Quantity - b.Quantity
        : b.Quantity - a.Quantity;
    }

    const aValue = a[sortConfig.key]?.toLowerCase() || "";
    const bValue = b[sortConfig.key]?.toLowerCase() || "";
    return sortConfig.direction === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const filteredParts = sortedParts.filter(
    (part) =>
      part.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.Category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Inventory List</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {isUpdating && selectedSparePart && (
        <div className="mb-6">
          <UpdateSparePartForm
            sparePart={selectedSparePart}
            onUpdate={handleUpdateComplete}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("Name")}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  <span className="text-gray-400">{getSortIcon("Name")}</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("Category")}
              >
                <div className="flex items-center space-x-1">
                  <span>Category</span>
                  <span className="text-gray-400">
                    {getSortIcon("Category")}
                  </span>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("Quantity")}
              >
                <div className="flex items-center space-x-1">
                  <span>Quantity</span>
                  <span className="text-gray-400">
                    {getSortIcon("Quantity")}
                  </span>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("UnitPrice")}
              >
                <div className="flex items-center space-x-1">
                  <span>Unit Price</span>
                  <span className="text-gray-400">
                    {getSortIcon("UnitPrice")}
                  </span>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("TotalPrice")}
              >
                <div className="flex items-center space-x-1">
                  <span>Total Value</span>
                  <span className="text-gray-400">
                    {getSortIcon("TotalPrice")}
                  </span>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredParts.map((part) => (
              <tr key={part.Name} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {part.Name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {part.Category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      part.Quantity < 10
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {part.Quantity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Rwf {formatPrice(part.UnitPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Rwf {formatPrice(part.TotalPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleUpdate(part)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <DeleteSparePartButton
                      sparePartName={part.Name}
                      onDelete={onUpdate}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredParts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No spare parts found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default SparePartsList;
