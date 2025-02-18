"use client";

import { useEffect, useState } from "react";
import { CartStats } from "../../types/cart";

interface DiscountConfig {
  nthOrder: number;
  percentage: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<CartStats | null>(null);
  const [config, setConfig] = useState<DiscountConfig>({
    nthOrder: 3,
    percentage: 10,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const response = await fetch("/api/admin/stats");
    const data = await response.json();
    setStats(data);
  };

  const updateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    fetchStats();
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: name === "nthOrder" || name === "percentage" ? Number(value) : value,
    }));
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 transform transition-transform hover:scale-[1.02]">
            <div className="text-sm font-medium text-gray-500 mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-blue-600">${stats?.totalAmount.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 transform transition-transform hover:scale-[1.02]">
            <div className="text-sm font-medium text-gray-500 mb-2">Total Items Sold</div>
            <div className="text-3xl font-bold text-blue-600">{stats?.totalItems}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 transform transition-transform hover:scale-[1.02]">
            <div className="text-sm font-medium text-gray-500 mb-2">Total Discounts</div>
            <div className="text-3xl font-bold text-blue-600">
              ${stats?.totalDiscount.toFixed(2)}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 transform transition-transform hover:scale-[1.02]">
            <div className="text-sm font-medium text-gray-500 mb-2">Total Orders</div>
            <div className="text-3xl font-bold text-blue-600">{stats?.orderCount}</div>
          </div>
        </div>

        {/* Recent Orders Table */}
        {stats?.recentOrders && (
          <div className="bg-white rounded-xl shadow-md mb-8 overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="px-6 py-4">{order.orderNumber}</td>
                      <td className="px-6 py-4">{order.userId}</td>
                      <td className="px-6 py-4 text-right">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td className="px-6 py-4 text-right">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">${order.discount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Configuration Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Discount Configuration</h2>
          <form onSubmit={updateConfig} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Every nth Order
                <input
                  type="number"
                  name="nthOrder"
                  value={config.nthOrder}
                  onChange={handleConfigChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="1"
                  required
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Discount Percentage
                <input
                  type="number"
                  name="percentage"
                  value={config.percentage}
                  onChange={handleConfigChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  max="100"
                  required
                />
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02]"
            >
              Update Configuration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
