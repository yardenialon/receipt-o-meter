interface ReceiptItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  product_code?: string;
}

interface ReceiptItemsListProps {
  items: ReceiptItemProps[];
}

export const ReceiptItemsList = ({ items }: ReceiptItemsListProps) => {
  // Function to reverse the word order in Hebrew text
  const reverseHebrewText = (text: string) => {
    return text.split(' ').reverse().join(' ');
  };

  return (
    <div className="space-y-2 mb-4">
      {items.map((item) => (
        <div key={item.id} className="flex justify-between text-sm p-2 rounded-lg hover:bg-primary-50 transition-colors">
          <div className="flex flex-col ml-2 flex-1">
            <span className="text-gray-700 truncate">
              {reverseHebrewText(item.name)}
            </span>
            {item.product_code && (
              <span className="text-xs text-gray-500">
                מק"ט: {item.product_code}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {item.quantity > 1 && (
              <span className="text-gray-500">x{item.quantity}</span>
            )}
            <span className="text-primary-600 font-medium">₪{item.price.toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};