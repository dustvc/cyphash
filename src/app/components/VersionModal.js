"use client";

import { useEffect } from "react";

export default function VersionModal({ onClose }) {
  useEffect(() => {
    localStorage.setItem("versionModalSeen", "true");
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-700 p-4 rounded shadow-lg w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={onClose}
        >
          Close
        </button>
        <h2 className="text-xl text-white mb-4">Version Update</h2>
        <p className="text-white">
          Update CYPHASH 🐒 v1.1:
          <ul className="list-disc pl-4">
            <li>Fitur Alarm</li>
            <li>Update UI/UX</li>
            <li>Fix Bugs</li>
          </ul>
        </p>
      </div>
    </div>
  );
}
