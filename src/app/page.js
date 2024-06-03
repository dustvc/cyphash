"use client";

import { useEffect, useState } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  doc,
} from "firebase/firestore";
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
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [investment, setInvestment] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchData(user.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (uid) => {
    const q = query(collection(db, "cryptos"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCryptoData(data);
  };

  const handleAddCrypto = async (e) => {
    e.preventDefault();
    const numCoins = investment / buyPrice;
    await addDoc(collection(db, "cryptos"), {
      title,
      code,
      buyPrice,
      investment,
      numCoins,
      uid: user.uid,
    });
    fetchData(user.uid);
  };

  const handleRemoveCrypto = async (id) => {
    await deleteDoc(doc(db, "cryptos", id));
    fetchData(user.uid);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">CYPHASH 🐒</h1>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => {
          signOut(auth);
          router.push("/login");
        }}
      >
        Logout
      </button>
      <form onSubmit={handleAddCrypto} className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul"
          required
          className="border p-2 mr-2 text-black"
        />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Kode Crypto"
          required
          className="border p-2 mr-2 text-black uppercase"
        />
        <input
          type="number"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
          placeholder="Harga Beli"
          required
          className="border p-2 mr-2 text-black"
        />
        <input
          type="number"
          value={investment}
          onChange={(e) => setInvestment(e.target.value)}
          placeholder="Total Investasi"
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
        {cryptoData.map((crypto) => (
          <CryptoCard
            key={crypto.id}
            crypto={crypto}
            onRemove={handleRemoveCrypto}
          />
        ))}
      </div>
    </div>
  );
}

function CryptoCard({ crypto, onRemove }) {
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
        <div className="justify-between flex">
          <div className="text-lg font-bold">{crypto.title}</div>
          <div className="text-lg font-regular">
            ({crypto.code.toUpperCase()})
          </div>
        </div>
        <div className="text-gray-400">Jumlah Koin: {crypto.numCoins}</div>
        <div className="text-gray-400">
          Harga Koin: {convertToRupiah(crypto.buyPrice)}
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
        <button
          onClick={() => onRemove(crypto.id)}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
        >
          Hapus
        </button>
      </div>
    )
  );
}
