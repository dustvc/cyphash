// components/PredictionCard.js

import React from "react";

const PredictionCard = ({ crypto, prediction }) => {
  return (
    <div className="border p-4 rounded-lg shadow-lg bg-gray-800 text-white mb-4">
      <div className="text-lg font-bold">
        {crypto.title} ({crypto.code.toUpperCase()})
      </div>
      <div className="text-gray-400 mt-2">Prediksi: {prediction}</div>
    </div>
  );
};

export default PredictionCard;
