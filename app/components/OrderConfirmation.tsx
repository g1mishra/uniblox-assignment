interface OrderConfirmationProps {
  orderResult: any;
  onClose: () => void;
}

export default function OrderConfirmation({ orderResult, onClose }: OrderConfirmationProps) {
  const savedAmount = orderResult.discount || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Order Confirmed!</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <p className="text-lg">Order #{orderResult.orderNumber}</p>
            <p className="text-gray-600">Total Amount: ${orderResult.total.toFixed(2)}</p>
            {savedAmount > 0 && (
              <p className="text-green-600">You saved: ${savedAmount.toFixed(2)}</p>
            )}
          </div>

          {orderResult.newDiscountGenerated ? (
            <div className="bg-green-50 p-4 rounded">
              <p className="font-bold text-green-700">Congratulations! 🎉</p>
              <p className="text-green-600">
                You&apos;ve earned a new {orderResult.discountPercent}% discount code:
              </p>
              <p className="text-lg font-mono bg-green-100 p-2 rounded mt-2 text-center">
                {orderResult.availableDiscountCode}
              </p>
            </div>
          ) : orderResult.nextDiscountIn > 0 ? (
            <p className="text-blue-600">
              Place {orderResult.nextDiscountIn} more order(s) to get your next discount code!
            </p>
          ) : null}

          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
