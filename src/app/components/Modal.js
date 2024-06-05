export default function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
