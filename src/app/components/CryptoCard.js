import { useState, useEffect } from "react";
import { fetchCryptoPrice } from "../lib/indodax";
import { convertToRupiah } from "../utils/convertToRupiah";
import AlarmModal from "./AlarmModal";
import AlarmSound from "./AlarmSound";

export default function CryptoCard({
  crypto,
  onRemove,
  onUpdateTarget,
  onRemoveTarget,
}) {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [profit, setProfit] = useState(null);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const { playAlarm } = AlarmSound();

  useEffect(() => {
    const fetchPrice = async () => {
      const price = await fetchCryptoPrice(crypto.code);
      setCurrentPrice(price);
      const calculatedProfit = price * crypto.numCoins - crypto.investment;
      setProfit(calculatedProfit);

      // Check if the current price has reached the target price
      if (crypto.targetPrice && price >= crypto.targetPrice) {
        playAlarm();
        alert(
          `Target price reached for ${crypto.title}: ${convertToRupiah(price)}`
        );
        onRemoveTarget(crypto.id); // Turn off the alarm
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [crypto, onRemoveTarget, playAlarm]);

  const handleSetAlarm = (targetPrice) => {
    onUpdateTarget(crypto.id, targetPrice);
    setIsAlarmModalOpen(false);
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
          {profit >= 0 ? "Profit" : "Loss"}:{" "}
          {convertToRupiah(profit.toFixed(2))} {profit >= 0 ? "🚀" : "📉"}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        {!crypto.targetPrice && (
          <button
            onClick={() => setIsAlarmModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Tambahkan Alarm
          </button>
        )}
        {crypto.targetPrice && (
          <div className="text-white px-4 py-2 rounded bg-yellow-500 flex items-center justify-between">
            <span>Alarm Target: {convertToRupiah(crypto.targetPrice)}</span>
            <button
              onClick={() => onRemoveTarget(crypto.id)}
              className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
            >
              Hapus
            </button>
          </div>
        )}
        <button
          onClick={() => onRemove(crypto.id)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Hapus
        </button>
      </div>
      {isAlarmModalOpen && (
        <AlarmModal
          onClose={() => setIsAlarmModalOpen(false)}
          onSave={handleSetAlarm}
        />
      )}
    </div>
  );
}
