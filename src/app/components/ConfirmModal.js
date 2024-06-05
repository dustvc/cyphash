import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ConfirmModal({ onClose, onConfirm }) {
  const handleConfirm = () => {
    onConfirm();
    toast.success("Item berhasil dihapus!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="text-white">
          <h2 className="text-xl font-bold mb-4">
            Apakah Anda yakin untuk menghapus ini?
          </h2>
          <div className="flex justify-end gap-4">
            <button
              className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
              onClick={handleConfirm}
            >
              Hapus
            </button>
            <button
              className="px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600"
              onClick={onClose}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
