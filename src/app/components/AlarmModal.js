import { useState } from "react";

export default function AlarmModal({ onClose, onSave }) {
  const [targetPrice, setTargetPrice] = useState("");
  const [conditions, setConditions] = useState({
    above: false,
    below: false,
    exactly: false,
  });

  const handleConditionChange = (e) => {
    const { name, checked } = e.target;
    setConditions((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    onSave(targetPrice, conditions);
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
          <label className="block text-white mb-2">Set Target Price:</label>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="border-black rounded-md p-2 mr-2 text-white w-full bg-gray-800"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">Alert When Price Is:</label>
          <div>
            <label className="text-white mr-2">
              <input
                type="checkbox"
                name="above"
                checked={conditions.above}
                onChange={handleConditionChange}
                className="mr-1"
              />
              Above Target
            </label>
            <label className="text-white mr-2">
              <input
                type="checkbox"
                name="below"
                checked={conditions.below}
                onChange={handleConditionChange}
                className="mr-1"
              />
              Below Target
            </label>
            <label className="text-white">
              <input
                type="checkbox"
                name="exactly"
                checked={conditions.exactly}
                onChange={handleConditionChange}
                className="mr-1"
              />
              Exactly at Target
            </label>
          </div>
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
