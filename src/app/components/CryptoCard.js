import { useState, useEffect, useRef } from "react";
import { fetchCryptoPrice } from "../lib/indodax";
import { convertToRupiah } from "../utils/convertToRupiah";
import AlarmModal from "./AlarmModal";
import ConfirmModal from "./ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CryptoChart from "./CryptoChart";
import NotificationSettings from "./NotificationSettings";

export default function CryptoCard({
  crypto,
  onRemove,
  onUpdateAlarms,
  onRemoveAlarm,
}) {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [coinVolume, setCoinVolume] = useState(null);
  const [idrVolume, setIdrVolume] = useState(null);
  const [profit, setProfit] = useState(null);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [activeAlarms, setActiveAlarms] = useState([]);
  const audioRefs = useRef([]);

  useEffect(() => {
    const fetchPrice = async () => {
      const { currentPrice, coinVolume, idrVolume } = await fetchCryptoPrice(
        crypto.code
      );
      setCurrentPrice(currentPrice);
      setCoinVolume(coinVolume);
      setIdrVolume(idrVolume);
      const calculatedProfit =
        currentPrice * crypto.numCoins - crypto.investment;
      setProfit(calculatedProfit);

      if (crypto.alarms) {
        const activeAlarmsList = [];
        crypto.alarms.forEach((alarm, index) => {
          const { above, below, exactly } = alarm.conditions || {};
          let alarmTriggered = false;
          if (alarm.type === "price") {
            alarmTriggered =
              (above && currentPrice > alarm.targetValue) ||
              (below && currentPrice < alarm.targetValue) ||
              (exactly && currentPrice === alarm.targetValue);
          } else if (alarm.type === "coinVolume") {
            alarmTriggered =
              (above && coinVolume > alarm.targetValue) ||
              (below && coinVolume < alarm.targetValue) ||
              (exactly && coinVolume === alarm.targetValue);
          } else if (alarm.type === "idrVolume") {
            alarmTriggered =
              (above && idrVolume > alarm.targetValue) ||
              (below && idrVolume < alarm.targetValue) ||
              (exactly && idrVolume === alarm.targetValue);
          }

          if (alarmTriggered) {
            audioRefs.current[index].play();
            toast.info(`Alarm ${crypto.code} (${alarm.type}) tercapai!`);
            activeAlarmsList.push(index);
          }
        });
        setActiveAlarms(activeAlarmsList);
      }
      setLoadingPrice(false);
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);

    return () => clearInterval(interval);
  }, [crypto]);

  const handleStopAlarm = (index) => {
    audioRefs.current[index].pause();
    audioRefs.current[index].currentTime = 0;
    onRemoveAlarm(crypto.id, index);
    setActiveAlarms((prev) =>
      prev.filter((alarmIndex) => alarmIndex !== index)
    );
  };

  const handleSetAlarm = (targetValue, conditions, alarmSound, alarmType) => {
    const newAlarms = crypto.alarms ? [...crypto.alarms] : [];
    newAlarms.push({
      targetValue: parseFloat(targetValue),
      conditions,
      alarmSound,
      type: alarmType,
    });
    onUpdateAlarms(crypto.id, newAlarms);
    setIsAlarmModalOpen(false);
  };

  const handleConfirmRemove = () => {
    onRemove(crypto.id);
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="border p-4 rounded-lg shadow-lg bg-gray-800 text-white mb-4">
      <div className="flex justify-between">
        <div className="text-lg font-bold">{crypto.title}</div>
        <div className="text-lg font-regular">
          ({crypto.code.toUpperCase()})
        </div>
      </div>

      <div className="text-gray-400">Jumlah Koin: {crypto.numCoins}</div>
      <div className="text-gray-400">
        Harga Beli: {convertToRupiah(crypto.buyPrice)}
      </div>
      {loadingPrice ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        currentPrice && (
          <div className="text-gray-400">
            Harga Sekarang: {convertToRupiah(currentPrice)}
          </div>
        )
      )}
      {coinVolume && (
        <div className="text-gray-400">
          Volume Koin: {convertToRupiah(coinVolume)}
        </div>
      )}
      {idrVolume && (
        <div className="text-gray-400">
          Volume Rupiah: {convertToRupiah(idrVolume)}
        </div>
      )}
      {profit !== null && (
        <div
          className={`mt-2 px-4 py-2 rounded ${
            profit >= 0 ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {profit >= 0 ? "Profit" : "Rugi"}:{" "}
          {convertToRupiah(profit.toFixed(2))} {profit >= 0 ? "🚀" : "📉"}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <button
          onClick={() => setIsAlarmModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tambahkan Alarm
        </button>
        <button
          onClick={() => setIsConfirmModalOpen(true)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Hapus
        </button>
      </div>
      {crypto.alarms &&
        crypto.alarms.map((alarm, index) => (
          <div
            key={index}
            className={`text-white px-4 py-2 rounded ${
              activeAlarms.includes(index)
                ? "bg-yellow-700 animate-pulse"
                : "bg-yellow-500"
            } flex items-center justify-between mt-2`}
          >
            <span>
              Alarm{" "}
              {alarm.type === "price"
                ? "Harga"
                : alarm.type === "coinVolume"
                ? "Volume Koin"
                : "Volume Rupiah"}
              : {convertToRupiah(alarm.targetValue)} (
              {alarm.conditions.above && "Di atas "}
              {alarm.conditions.below && "Di bawah "}
              {alarm.conditions.exactly && "Tepat "}Target) - Suara:{" "}
              {alarm.alarmSound}
            </span>
            <button
              onClick={() => handleStopAlarm(index)}
              className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Hentikan Alarm
            </button>
          </div>
        ))}
      {isAlarmModalOpen && (
        <AlarmModal
          onClose={() => setIsAlarmModalOpen(false)}
          onSave={handleSetAlarm}
        />
      )}
      {isConfirmModalOpen && (
        <ConfirmModal
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmRemove}
        />
      )}
      {crypto.alarms &&
        crypto.alarms.map((alarm, index) => (
          <audio
            key={index}
            ref={(el) => (audioRefs.current[index] = el)}
            src={`/audio/${alarm.alarmSound}`}
            loop
          />
        ))}
      <ToastContainer />
    </div>
  );
}
