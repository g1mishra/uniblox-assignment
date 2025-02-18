"use client";

import { useState, useEffect } from "react";
import { Product, CartItem } from "../types/cart";
import UserIdModal from "./components/UserIdModal";
import OrderConfirmation from "./components/OrderConfirmation";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState("");
  const [userId, setUserId] = useState("");
  const [lastOrderResult, setLastOrderResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [showUserIdModal, setShowUserIdModal] = useState(true);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      setShowUserIdModal(false);
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleUserIdSubmit = (newUserId: string) => {
    sessionStorage.setItem("userId", newUserId);
    setUserId(newUserId);
    setShowUserIdModal(false);
  };

  const handleCheckout = async () => {
    try {
      setError("");
      setShowOrderConfirmation(false);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          discountCode,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Checkout failed");
        return;
      }

      setLastOrderResult(data);
      setCartItems([]);
      setDiscountCode("");
      setShowOrderConfirmation(true);
    } catch (err) {
      setError("An error occurred during checkout");
      console.error(err);
    }
  };

  return (
    <>
      {showUserIdModal && <UserIdModal onSubmit={handleUserIdSubmit} />}
      {showOrderConfirmation && (
        <OrderConfirmation
          orderResult={lastOrderResult}
          onClose={() => setShowOrderConfirmation(false)}
        />
      )}
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-4">
          <div className="mb-6 bg-white shadow-sm rounded-lg p-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, <span className="text-blue-600">User {userId}</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Products Section */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Available Products</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {products?.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                        <p className="text-2xl text-blue-600 font-bold mb-4">${product.price}</p>
                        <button
                          onClick={() => addToCart(product)}
                          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transform transition-transform duration-200 hover:scale-[1.02]"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Shopping Cart</h2>
              {cartItems.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-3 border-b"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-blue-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
                      <span>Total:</span>
                      <span className="text-blue-600">${getCartTotal().toFixed(2)}</span>
                    </div>

                    {lastOrderResult?.availableDiscountCode && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="font-semibold text-green-700">Available Discount:</p>
                        <p className="text-green-600 mt-1">
                          Use code{" "}
                          <span className="font-mono font-bold bg-green-100 px-2 py-1 rounded">
                            {lastOrderResult.availableDiscountCode}
                          </span>{" "}
                          to save {lastOrderResult.discountPercent}%
                        </p>
                      </div>
                    )}

                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Enter Discount Code"
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transform transition-all duration-200 hover:scale-[1.02]"
                    >
                      Checkout
                    </button>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
