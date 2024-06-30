import { useForm } from "react-hook-form";
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function NotificationSettings({
  cryptoId,
  currentNotifications,
}) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: currentNotifications,
  });

  const onSubmit = async (data) => {
    const cryptoRef = doc(db, "cryptos", cryptoId);
    await updateDoc(cryptoRef, { notifications: data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-white">Email:</label>
        <input
          type="email"
          {...register("email", { required: true })}
          className="mt-1 block w-full rounded-md bg-white text-black border border-gray-300 px-4 py-2"
        />
      </div>
      <div>
        <label className="block text-white">Alert Price:</label>
        <input
          type="number"
          {...register("price")}
          className="mt-1 block w-full rounded-md bg-white text-black border border-gray-300 px-4 py-2"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
      >
        Save Notifications
      </button>
    </form>
  );
}
