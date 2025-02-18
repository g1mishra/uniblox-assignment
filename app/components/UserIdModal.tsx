"use client";

interface UserIdModalProps {
  onSubmit: (userId: string) => void;
}

export default function UserIdModal({ onSubmit }: UserIdModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = formData.get("userId") as string;
    if (userId.trim().length >= 3) {
      onSubmit(userId.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Welcome to the Shop</h2>
          <p className="text-gray-600 mb-6">Please enter your User ID to continue shopping</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="userId"
              placeholder="Enter your User ID (min 3 characters)"
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              minLength={3}
              required
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02]"
            >
              Continue Shopping
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
