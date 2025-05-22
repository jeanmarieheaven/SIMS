import React from "react";
import api from "../services/api";

const DeleteSparePartButton = ({ sparePartName, onDelete }) => {
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${sparePartName}?`)) {
      try {
        const res = await api.delete(`/api/spare-parts/${sparePartName}`, {
          withCredentials: true,
        });
        if (res.data.message) {
          onDelete();
        } else {
          alert(res.data.error || "Failed to delete spare part");
        }
      } catch (error) {
        alert(error.response?.data?.error || "Failed to delete spare part");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
    >
      Delete
    </button>
  );
};

export default DeleteSparePartButton;
