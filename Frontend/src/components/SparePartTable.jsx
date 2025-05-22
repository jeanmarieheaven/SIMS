import React from 'react';

const SparePartTable = ({ spareParts }) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl mb-2">Spare Parts</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Unit Price</th>
            <th className="border p-2">Total Price</th>
          </tr>
        </thead>
        <tbody>
          {spareParts.map(part => (
            <tr key={part.Name}>
              <td className="border p-2">{part.Name}</td>
              <td className="border p-2">{part.Category}</td>
              <td className="border p-2">{part.Quantity}</td>
              <td className="border p-2">{part.UnitPrice}</td>
              <td className="border p-2">{part.TotalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SparePartTable;