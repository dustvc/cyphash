export default function ConfirmModal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-700 p-4 rounded shadow-lg w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={onClose}
        >
          Close
        </button>
        <div className="text-white">
          <h2 className="text-xl mb-4">
            Apakah Anda yakin untuk menghapus ini?
          </h2>
          <div className="flex justify-end gap-4">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={onConfirm}
            >
              Hapus
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={onClose}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
