import { useState, useRef, useEffect } from "react";

export default function AlarmModal({ onClose, onSave }) {
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState("above");
  const [alarmSound, setAlarmSound] = useState("alarm1.wav");
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = `/audio/${alarmSound}`;
    }
  }, [alarmSound]);

  const handleSave = () => {
    const conditions = {
      above: condition === "above",
      below: condition === "below",
      exactly: condition === "exactly",
    };
    onSave(targetPrice, conditions, alarmSound);
  };

  const handleAlarmSoundChange = (e) => {
    const newSound = e.target.value;
    setAlarmSound(newSound);
    if (audioRef.current) {
      audioRef.current.src = `/audio/${newSound}`;
      audioRef.current.oncanplaythrough = () => {
        audioRef.current
          .play()
          .catch((error) => console.error("Error playing audio:", error));
      };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-700 p-4 rounded shadow-lg w-full sm:w-2/3 lg:w-1/3 relative">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={onClose}
        >
          Tutup
        </button>
        <div className="mb-4">
          <label className="block text-white mb-2">Atur Harga Target:</label>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="border-black rounded-md p-2 mr-2 text-white w-full bg-gray-800"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">
            Beritahu Ketika Harga:
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="border-black rounded-md p-2 mr-2 text-white w-full bg-gray-800"
          >
            <option value="above">Di atas Target</option>
            <option value="below">Di bawah Target</option>
            <option value="exactly">Tepat di Target</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">Pilih Suara Alarm:</label>
          <select
            value={alarmSound}
            onChange={handleAlarmSoundChange}
            className="border-black rounded-md p-2 mr-2 text-white w-full bg-gray-800"
          >
            <option value="alarm1.wav">Alarm 1</option>
            <option value="alarm2.wav">Alarm 2</option>
            <option value="alarm3.wav">Alarm 3</option>
          </select>
          <audio ref={audioRef} />
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Simpan
        </button>
      </div>
    </div>
  );
}
