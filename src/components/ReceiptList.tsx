import { Receipt } from 'lucide-react';

const ReceiptList = () => {
  const mockReceipts = [
    {
      id: 1,
      store: "שופרסל",
      date: "20/03/2024",
      total: 156.78
    },
    {
      id: 2,
      store: "רמי לוי",
      date: "18/03/2024",
      total: 89.99
    }
  ];

  return (
    <div className="mt-12 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">קבלות אחרונות</h2>
      <div className="space-y-4">
        {mockReceipts.map((receipt) => (
          <div
            key={receipt.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-primary-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Receipt className="w-6 h-6 text-primary-500 ml-4" />
                <div>
                  <h3 className="font-medium text-gray-900">{receipt.store}</h3>
                  <p className="text-sm text-gray-500">{receipt.date}</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                ₪{receipt.total.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceiptList;