"use client";

import { useEffect, useState } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db, auth } from "./lib/firebase";
import { fetchCryptoPrice } from "./lib/indodax";
import { useRouter } from "next/navigation";

function convertToRupiah(number) {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  });
  return formatter.format(number);
}

export default function Home() {
  const [cryptoData, setCryptoData] = useState([]);
  const [code, setCode] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [investment, setInvestment] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, "cryptos"));
    const data = querySnapshot.docs.map((doc) => doc.data());
    setCryptoData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCrypto = async (e) => {
    e.preventDefault();
    const numCoins = investment / buyPrice;
    await addDoc(collection(db, "cryptos"), {
      code,
      buyPrice,
      investment,
      numCoins,
    });
    fetchData();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Crypto Profit Tracker</h1>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => signOut(auth)}
      >
        Logout
      </button>
      <form onSubmit={handleAddCrypto} className="mb-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code"
          required
          className="border p-2 mr-2 text-black uppercase"
        />
        <input
          type="number"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
          placeholder="Buy Price"
          required
          className="border p-2 mr-2 text-black"
        />
        <input
          type="number"
          value={investment}
          onChange={(e) => setInvestment(e.target.value)}
          placeholder="Total Investment"
          required
          className="border p-2 mr-2 text-black"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Crypto
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cryptoData.map((crypto, index) => (
          <CryptoCard key={index} crypto={crypto} />
        ))}
      </div>
    </div>
  );
}

function CryptoCard({ crypto }) {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [profit, setProfit] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      const price = await fetchCryptoPrice(crypto.code);
      setCurrentPrice(price);
      const calculatedProfit = price * crypto.numCoins - crypto.investment;
      setProfit(calculatedProfit);
    };
    fetchPrice();
  }, [crypto]);

  return (
    crypto && (
      <div className="border p-4 rounded shadow">
        <div className="text-xl font-bold">{crypto.code.toUpperCase()}</div>
        <div className="text-gray-600">Jumlah Koin: {crypto.numCoins}</div>
        <div className="text-gray-600">
          Harga Koin: {convertToRupiah(crypto.buyPrice)}
        </div>
        {currentPrice && (
          <div className="text-gray-600">
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
      </div>
    )
  );
}
