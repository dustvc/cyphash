"use client";

import { useState, useEffect, useRef } from "react";
import { fetchCryptoPrice } from "../lib/indodax";
import { convertToRupiah } from "../utils/convertToRupiah";
import AlarmModal from "./AlarmModal";
import ConfirmModal from "./ConfirmModal"; // Import the new ConfirmModal component

export default function CryptoCard({
  crypto,
  onRemove,
  onUpdateTarget,
  onRemoveTarget,
}) {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [profit, setProfit] = useState(null);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Add state for the confirm modal
  const aboveAudioRef = useRef(null);
  const belowAudioRef = useRef(null);
  const exactlyAudioRef = useRef(null);

  useEffect(() => {
    const fetchPrice = async () => {
      const price = await fetchCryptoPrice(crypto.code);
      setCurrentPrice(price);
      const calculatedProfit = price * crypto.numCoins - crypto.investment;
      setProfit(calculatedProfit);

      if (crypto.targetPrice) {
        const { above, below, exactly } = crypto.conditions || {};
        if (above && price > crypto.targetPrice) {
          setIsAlarmActive(true);
          aboveAudioRef.current.play();
        } else if (below && price < crypto.targetPrice) {
          setIsAlarmActive(true);
          belowAudioRef.current.play();
        } else if (exactly && price === crypto.targetPrice) {
          setIsAlarmActive(true);
          exactlyAudioRef.current.play();
        }
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);

    return () => clearInterval(interval);
  }, [crypto, onRemoveTarget]);

  const handleStopAlarm = () => {
    setIsAlarmActive(false);
    aboveAudioRef.current.pause();
    aboveAudioRef.current.currentTime = 0;
    belowAudioRef.current.pause();
    belowAudioRef.current.currentTime = 0;
    exactlyAudioRef.current.pause();
    exactlyAudioRef.current.currentTime = 0;
    onRemoveTarget(crypto.id);
  };

  const handleSetAlarm = (targetPrice, conditions) => {
    onUpdateTarget(crypto.id, targetPrice, conditions);
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
            <span>
              Alarm Target: {convertToRupiah(crypto.targetPrice)} (
              {crypto.conditions?.above && "Diatas "}
              {crypto.conditions?.below && "Dibawah "}
              {crypto.conditions?.exactly && "Presisi"} Target)
            </span>
            <button
              onClick={() => onRemoveTarget(crypto.id)}
              className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
            >
              Hapus
            </button>
          </div>
        )}
        <button
          onClick={() => setIsConfirmModalOpen(true)} // Open confirm modal
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Hapus
        </button>
      </div>
      {isAlarmActive && (
        <div className="mt-4">
          <button
            onClick={handleStopAlarm}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Stop Alarm
          </button>
        </div>
      )}
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
      <audio ref={aboveAudioRef} src="/audio/above.mp3" loop />
      <audio ref={belowAudioRef} src="/audio/below.mp3" loop />
      <audio ref={exactlyAudioRef} src="/audio/exactly.mp3" loop />
    </div>
  );
}
