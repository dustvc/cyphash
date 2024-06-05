import { useState, useEffect, useRef } from "react";
import { fetchCryptoPrice } from "../lib/indodax";
import { convertToRupiah } from "../utils/convertToRupiah";
import AlarmModal from "./AlarmModal";
import ConfirmModal from "./ConfirmModal";

export default function CryptoCard({
  crypto,
  onRemove,
  onUpdateAlarms,
  onRemoveAlarm,
}) {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [profit, setProfit] = useState(null);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const audioRefs = useRef([]);

  useEffect(() => {
    const fetchPrice = async () => {
      const price = await fetchCryptoPrice(crypto.code);
      setCurrentPrice(price);
      const calculatedProfit = price * crypto.numCoins - crypto.investment;
      setProfit(calculatedProfit);

      if (crypto.alarms) {
        crypto.alarms.forEach((alarm, index) => {
          const { above, below, exactly } = alarm.conditions || {};
          if (above && price > alarm.targetPrice) {
            audioRefs.current[index].play();
          } else if (below && price < alarm.targetPrice) {
            audioRefs.current[index].play();
          } else if (exactly && price === alarm.targetPrice) {
            audioRefs.current[index].play();
          }
        });
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);

    return () => clearInterval(interval);
  }, [crypto]);

  const handleStopAlarm = (index) => {
    audioRefs.current[index].pause();
    audioRefs.current[index].currentTime = 0;
    onRemoveAlarm(crypto.id, index);
  };

  const handleSetAlarm = (targetPrice, conditions, alarmSound) => {
    const newAlarms = crypto.alarms ? [...crypto.alarms] : [];
    newAlarms.push({
      targetPrice: parseFloat(targetPrice),
      conditions,
      alarmSound,
    });
    onUpdateAlarms(crypto.id, newAlarms);
    setIsAlarmModalOpen(false);
  };

  const handleConfirmRemove = () => {
    onRemove(crypto.id);
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="border p-4 rounded shadow bg-gray-800 text-white mb-4">
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
      {currentPrice && (
        <div className="text-gray-400">
          Harga Sekarang: {convertToRupiah(currentPrice)}
        </div>
      )}
      {profit !== null && (
        <div
          className={`mt-2 text-white px-4 py-2 rounded ${
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
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Tambahkan Alarm
        </button>
        <button
          onClick={() => setIsConfirmModalOpen(true)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Hapus
        </button>
      </div>
      {crypto.alarms &&
        crypto.alarms.map((alarm, index) => (
          <div
            key={index}
            className="text-white px-4 py-2 rounded bg-yellow-500 flex items-center justify-between mt-2"
          >
            <span>
              Alarm Target: {convertToRupiah(alarm.targetPrice)} (
              {alarm.conditions.above && "Di atas "}
              {alarm.conditions.below && "Di bawah "}
              {alarm.conditions.exactly && "Tepat "}Target) - Suara:{" "}
              {alarm.alarmSound}
            </span>
            <button
              onClick={() => handleStopAlarm(index)}
              className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
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
    </div>
  );
}
