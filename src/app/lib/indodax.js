import axios from "axios";

export async function fetchCryptoPrice(ticker) {
  const ticker_format = ticker.toLowerCase();

  const response = await fetch(
    `https://indodax.com/api/${ticker_format}_idr/ticker`
  );

  const data = await response.json();
  return {
    currentPrice: data.ticker.last,
    buyVolume: data.ticker.vol_idr,
    sellVolume: data.ticker.vol_btc,
  };
}

export const fetchCryptoHistoricalData = async (code) => {
  try {
    const response = await axios.get(
      `https://indodax.com/api/${code}_idr/trades`
    );
    const data = response.data.map((item) => ({
      date: new Date(item.date * 1000), // Assuming the date is in seconds
      price: item.price,
    }));
    return data;
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return [];
  }
};
