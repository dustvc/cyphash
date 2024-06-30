import { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AlarmModal({ onClose, onSave }) {
  const [targetValue, setTargetValue] = useState("");
  const [condition, setCondition] = useState("above");
  const [alarmSound, setAlarmSound] = useState("alarm1.wav");
  const [alarmType, setAlarmType] = useState("price");
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

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
    onSave(targetValue, conditions, alarmSound, alarmType);
    toast.success("Alarm berhasil disimpan!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleAlarmSoundChange = (e) => {
    const newSound = e.target.value;
    setAlarmSound(newSound);
    if (audioRef.current) {
      audioRef.current.src = `/audio/${newSound}`;
      audioRef.current.oncanplaythrough = () => {
        audioRef.current
          .play()
          .then(() => setPlaying(true))
          .catch((error) => console.error("Error playing audio:", error));
      };
    }
  };

  const handlePreview = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch((error) => console.error("Error playing audio:", error));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full sm:w-2/3 lg:w-1/3 relative">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-white mb-4">Atur Alarm</h2>
        <div className="mb-4">
          <label className="block text-white mb-2">Jenis Alarm:</label>
          <select
            value={alarmType}
            onChange={(e) => setAlarmType(e.target.value)}
            className="w-full p-2 rounded-md text-black"
          >
            <option value="price">Harga</option>
            <option value="buyVolume">Volume Beli</option>
            <option value="sellVolume">Volume Jual</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">Atur Target:</label>
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            className="w-full p-2 rounded-md text-black"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">
            Beritahu Ketika Target:
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full p-2 rounded-md text-black"
          >
            <option value="above">Di atas Target</option>
            <option value="below">Di bawah Target</option>
            <option value="exactly">Tepat di Target</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2">Pilih Suara Alarm:</label>
          <div className="flex items-center">
            <select
              value={alarmSound}
              onChange={handleAlarmSoundChange}
              className="w-full p-2 rounded-md text-black"
            >
              <option value="alarm1.wav">Alarm 1</option>
              <option value="alarm2.wav">Alarm 2</option>
              <option value="alarm3.wav">Alarm 3</option>
            </select>
            <button
              onClick={handlePreview}
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Pratinjau
            </button>
            {playing && <span className="ml-2 text-green-500">Memutar...</span>}
          </div>
          <audio ref={audioRef} onEnded={() => setPlaying(false)} />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded"
        >
          Simpan
        </button>
        <ToastContainer />
      </div>
    </div>
  );
}
