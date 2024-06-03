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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  useEffect(() => {
    if (cryptoData.length > 0) {
      const interval = setInterval(() => {
        cryptoData.forEach(async (crypto) => {
          const price = await fetchCryptoPrice(crypto.code);
          const newCryptoData = cryptoData.map((item) =>
            item.id === crypto.id ? { ...item, currentPrice: price } : item
          );
          setCryptoData(newCryptoData);
        });
      }, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [cryptoData]);

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
    setIsModalOpen(false); // Close the modal after adding crypto
  };

  const handleRemoveCrypto = async (id) => {
    await deleteDoc(doc(db, "cryptos", id));
    fetchData(user.uid);
  };

  const handleFetchCurrentPrice = async () => {
    if (code) {
      const currentPrice = await fetchCryptoPrice(code);
      setBuyPrice(currentPrice);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">CYPHASH 🐒</h1>
      <div className="inline-flex gap-[1rem]">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded mb-4"
          onClick={() => {
            signOut(auth);
            router.push("/login");
          }}
        >
          Logout
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Tambahkan Crypto
        </button>
      </div>
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleAddCrypto}>
            <label className="block mb-2">
              Judul:
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul"
                required
                className="border-black rounded-md p-2 mr-2 text-white w-full bg-gray-800"
              />
            </label>
            <label className="block mb-2">
              Kode Crypto:
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Kode Crypto"
                required
                className="border-black rounded-md p-2 mr-2 text-white w-full bg-gray-800"
              />
            </label>
            <label className="block mb-2">
              Harga Beli:{" "}
              <button
                type="button"
                onClick={handleFetchCurrentPrice}
                className={`text-white underline font-regular ${
                  code ? "" : "cursor-not-allowed text-gray-400"
                }`}
              >
                Pakai Harga Sekarang
              </button>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="Harga Beli"
                required
                className="border-black rounded-md p-2 mr-2 text-white w-full bg-gray-800"
              />
            </label>
            <label className="block mb-2">
              Total Investasi:
              <input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                placeholder="Total Investasi"
                required
                className="border-black rounded-md p-2 mr-2 text-white w-full bg-gray-800"
              />
            </label>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Tambahkan Crypto
            </button>
          </form>
        </Modal>
      )}
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

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-700 p-4 rounded shadow-lg w-1/3 relative">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={onClose}
        >
          Close
        </button>
        {children}
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

    const interval = setInterval(() => {
      fetchPrice();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [crypto]);

  return (
    crypto && (
      <div className="border p-4 rounded shadow bg-gray-800 text-white">
        <div className="justify-between flex">
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
