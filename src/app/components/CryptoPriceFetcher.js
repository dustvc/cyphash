import { useEffect, useState } from "react";
import { fetchCryptoPrice } from "../lib/indodax";

const CryptoPriceFetcher = ({ cryptoCode, onPriceUpdate }) => {
  const [currentPrice, setCurrentPrice] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      const price = await fetchCryptoPrice(cryptoCode);
      setCurrentPrice(price);
      onPriceUpdate(price);
    };

    const interval = setInterval(fetchPrice, 5000);
    fetchPrice();

    return () => clearInterval(interval);
  }, [cryptoCode, onPriceUpdate]);

  return (
    <div>
      <p>
        Harga saat ini:{" "}
        {currentPrice
          ? `Rp ${currentPrice.toLocaleString("id-ID")}`
          : "Loading..."}
      </p>
    </div>
  );
};

export default CryptoPriceFetcher;
