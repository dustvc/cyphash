"use client";
import { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./lib/firebase";
import { fetchCryptoPrice } from "./lib/indodax";
import { useAuth } from "./hooks/useAuth";
import CryptoCard from "./components/CryptoCard";
import Modal from "./components/Modal";
import { convertToRupiah } from "./utils/convertToRupiah";
import VersionModal from "./components/VersionModal";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AddCryptoForm from "./components/AddCryptoForm";

export default function Home() {
  const { user, loading } = useAuth();
  const [cryptoData, setCryptoData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const versionModalSeen = localStorage.getItem("versionModalSeen");
    if (!versionModalSeen) {
      setIsVersionModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData(user.uid);
    }
  }, [user]);

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

  const handleAddCrypto = async (crypto) => {
    await addDoc(collection(db, "cryptos"), {
      ...crypto,
      uid: user.uid,
    });
    fetchData(user.uid);
  };

  const handleRemoveCrypto = async (id) => {
    await deleteDoc(doc(db, "cryptos", id));
    fetchData(user.uid);
  };

  const handleUpdateTarget = async (id, targetPrice, conditions) => {
    const cryptoRef = doc(db, "cryptos", id);
    await updateDoc(cryptoRef, {
      targetPrice: parseFloat(targetPrice),
      conditions,
    });

    const newCryptoData = cryptoData.map((crypto) =>
      crypto.id === id
        ? {
            ...crypto,
            targetPrice: parseFloat(targetPrice),
            conditions,
          }
        : crypto
    );
    setCryptoData(newCryptoData);
  };

  const handleRemoveTarget = async (id) => {
    const cryptoRef = doc(db, "cryptos", id);
    await updateDoc(cryptoRef, {
      targetPrice: null,
    });

    const newCryptoData = cryptoData.map((crypto) =>
      crypto.id === id ? { ...crypto, targetPrice: null } : crypto
    );
    setCryptoData(newCryptoData);
  };

  const handleUpdateAlarms = async (id, alarms) => {
    const cryptoRef = doc(db, "cryptos", id);
    await updateDoc(cryptoRef, { alarms });

    const newCryptoData = cryptoData.map((crypto) =>
      crypto.id === id ? { ...crypto, alarms } : crypto
    );
    setCryptoData(newCryptoData);
  };

  const handleRemoveAlarm = async (id, index) => {
    const cryptoRef = doc(db, "cryptos", id);
    const crypto = cryptoData.find((crypto) => crypto.id === id);
    const newAlarms = crypto.alarms.filter((_, i) => i !== index);
    await updateDoc(cryptoRef, { alarms: newAlarms });

    const newCryptoData = cryptoData.map((crypto) =>
      crypto.id === id ? { ...crypto, alarms: newAlarms } : crypto
    );
    setCryptoData(newCryptoData);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(cryptoData);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCryptoData(items);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  // Calculate total investment, current value, and loss
  const totalInvestment = cryptoData.reduce(
    (sum, crypto) => sum + (crypto.investment || 0),
    0
  );
  const currentValue = cryptoData.reduce(
    (sum, crypto) => sum + (crypto.currentPrice * crypto.numCoins || 0),
    0
  );
  const loss = totalInvestment - currentValue;

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
          <AddCryptoForm
            onClose={() => setIsModalOpen(false)}
            onSave={handleAddCrypto}
          />
        </Modal>
      )}
      {isVersionModalOpen && (
        <VersionModal onClose={() => setIsVersionModalOpen(false)} />
      )}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="cryptoCards">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {cryptoData.map((crypto, index) => (
                <Draggable
                  key={crypto.id}
                  draggableId={crypto.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <CryptoCard
                        crypto={crypto}
                        onRemove={handleRemoveCrypto}
                        onUpdateTarget={handleUpdateTarget}
                        onRemoveTarget={handleRemoveTarget}
                        onUpdateAlarms={handleUpdateAlarms}
                        onRemoveAlarm={handleRemoveAlarm}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <footer className="text-center mt-4">
        <p>Version 1.1.0</p>
      </footer>
    </div>
  );
}
