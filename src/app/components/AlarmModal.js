import { useState } from "react";

export default function AlarmModal({ onClose, onSave }) {
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState("above");

  const handleSave = () => {
    onSave(targetPrice, condition);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-700 p-4 rounded shadow-lg w-full sm:w-2/3 lg:w-1/3 relative">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={onClose}
        >
          Close
        </button>
        <div className="mb-4">
          <label className="block text-white mb-2">Setting Harga Target:</label>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="border-black rounded-md p-2 mr-2 text-white w-full bg-gray-800"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">
            Alarm Berbunyi Jika Harga:
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="border-black rounded-md p-2 mr-2 text-white w-full bg-gray-800"
          >
            <option value="above">Diatas Target</option>
            <option value="below">Dibawah Target</option>
            <option value="exactly">Presisi (Menyentuh Angka Target)</option>
          </select>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}
