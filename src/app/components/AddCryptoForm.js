import { useState } from "react";
import { useForm } from "react-hook-form";
import { fetchCryptoPrice } from "../lib/indodax"; // Pastikan untuk mengimpor fetchCryptoPrice

export default function AddCryptoForm({ onClose, onSave }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const [loadingPrice, setLoadingPrice] = useState(false);
  const watchInvestment = watch("investment", 0);
  const watchBuyPrice = watch("buyPrice", 0);
  const watchCode = watch("code", "");

  const handleFetchCurrentPrice = async () => {
    if (watchCode) {
      setLoadingPrice(true);
      const priceInfo = await fetchCryptoPrice(watchCode);
      setValue("buyPrice", priceInfo.currentPrice);
      setLoadingPrice(false);
    }
  };

  const onSubmit = (data) => {
    const numCoins = data.investment / data.buyPrice;
    onSave({
      ...data,
      numCoins,
    });
    onClose();
  };

  const handleReset = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="relative">
        <label className="block text-white">Judul:</label>
        <input
          type="text"
          {...register("title", { required: true })}
          placeholder="Judul"
          className="mt-1 block w-full rounded-md bg-white text-black border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 px-4 py-2"
        />
        {errors.title && (
          <span className="text-red-500">Judul wajib diisi</span>
        )}
      </div>
      <div className="relative">
        <label className="block text-white">Kode Crypto:</label>
        <input
          type="text"
          {...register("code", { required: true })}
          placeholder="Kode Crypto"
          className="mt-1 block w-full rounded-md bg-white text-black border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 px-4 py-2"
        />
        {errors.code && (
          <span className="text-red-500">Kode Crypto wajib diisi</span>
        )}
      </div>
      <div className="relative">
        <label className="block text-white">Harga Beli:</label>
        <button
          type="button"
          onClick={handleFetchCurrentPrice}
          className={`ml-2 text-blue-500 underline ${
            watchCode ? "" : "cursor-not-allowed text-gray-400"
          }`}
        >
          {loadingPrice ? "Loading..." : "Pakai Harga Sekarang"}
        </button>
        <input
          type="number"
          step="any"
          {...register("buyPrice", { required: true })}
          placeholder="Harga Beli"
          className="mt-1 block w-full rounded-md bg-white text-black border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 px-4 py-2"
        />
        {errors.buyPrice && (
          <span className="text-red-500">Harga Beli wajib diisi</span>
        )}
      </div>
      <div className="relative">
        <label className="block text-white">Total Investasi:</label>
        <input
          type="number"
          step="any"
          {...register("investment", { required: true })}
          placeholder="Total Investasi"
          className="mt-1 block w-full rounded-md bg-white text-black border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 px-4 py-2"
        />
        {errors.investment && (
          <span className="text-red-500">Total Investasi wajib diisi</span>
        )}
      </div>
      <div className="text-white">
        <span>
          Jumlah Koin: {(watchInvestment / watchBuyPrice).toFixed(10)}
        </span>
      </div>
      <div className="flex justify-between space-x-2">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600"
        >
          Reset
        </button>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            Tambahkan Crypto
          </button>
        </div>
      </div>
    </form>
  );
}
