"use client";

import { useEffect } from "react";

export default function VersionModal({ onClose }) {
  useEffect(() => {
    localStorage.setItem("versionModalSeen", "true");
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-white mb-4">Pembaruan Versi</h2>
        <p className="text-white">
          Pembaruan CYPHASH 🐒 v1.1:
          <ul className="list-disc pl-4">
            <li>Fitur Alarm</li>
            <li>Update UI/UX</li>
            <li>Perbaikan Bug</li>
          </ul>
        </p>
      </div>
    </div>
  );
}
