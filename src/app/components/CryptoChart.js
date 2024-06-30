import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { fetchCryptoHistoricalData } from "../lib/indodax";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";

// Register the necessary components
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

export default function CryptoChart({ code }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchCryptoHistoricalData(code);
      setChartData(data);
    };

    fetchData();
  }, [code]);

  if (!chartData) return <div>Loading...</div>;

  const options = {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
        },
      },
    },
  };

  const data = {
    labels: chartData.map((point) => point.date),
    datasets: [
      {
        label: "Price",
        data: chartData.map((point) => point.price),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  return <Line data={data} options={options} />;
}
