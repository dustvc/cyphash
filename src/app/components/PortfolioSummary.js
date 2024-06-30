import React from "react";
import { convertToRupiah } from "../utils/convertToRupiah";

export default function PortfolioSummary({ cryptoData }) {
  const totalInvestment = cryptoData.reduce(
    (sum, crypto) => sum + crypto.investment,
    0
  );
  const currentValue = cryptoData.reduce(
    (sum, crypto) => sum + crypto.numCoins * crypto.currentPrice,
    0
  );
  const profitLoss = currentValue - totalInvestment;

  return (
    <div className="border p-4 rounded-lg shadow-lg bg-gray-800 text-white mb-4">
      <h2 className="text-lg font-bold">Portfolio Summary</h2>
      <div>Total Investment: {convertToRupiah(totalInvestment)}</div>
      <div>Current Value: {convertToRupiah(currentValue)}</div>
      <div className={profitLoss >= 0 ? "text-green-500" : "text-red-500"}>
        {profitLoss >= 0 ? "Profit" : "Loss"}: {convertToRupiah(profitLoss)}
      </div>
    </div>
  );
}
