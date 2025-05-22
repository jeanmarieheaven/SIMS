import React, { useState } from "react";
import api from "../services/api";

const UpdateSparePartForm = ({ sparePart, onUpdate }) => {
  const [formData, setFormData] = useState({
    Category: sparePart.Category,
    Quantity: sparePart.Quantity,
    UnitPrice: sparePart.UnitPrice,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(
        `/api/spare-parts/${sparePart.Name}`,
        formData,
        { withCredentials: true }
      );
      if (res.data.message) {
        onUpdate();
      } else {
        alert(res.data.error || "Failed to update spare part");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update spare part");
    }
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl mb-2">Update Spare Part: {sparePart.Name}</h2>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          placeholder="Category"
          value={formData.Category}
          onChange={(e) =>
            setFormData({ ...formData, Category: e.target.value })
          }
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={formData.Quantity}
          onChange={(e) =>
            setFormData({ ...formData, Quantity: parseInt(e.target.value) })
          }
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Unit Price"
          value={formData.UnitPrice}
          onChange={(e) =>
            setFormData({ ...formData, UnitPrice: parseFloat(e.target.value) })
          }
          className="border p-2"
        />
        <button type="submit" className="bg-yellow-500 text-white p-2 rounded">
          Update
        </button>
      </form>
    </div>
  );
};

export default UpdateSparePartForm;
