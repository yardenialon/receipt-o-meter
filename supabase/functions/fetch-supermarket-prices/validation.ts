interface PriceData {
  ItemCode?: string;
  ItemName?: string;
  ItemPrice?: number;
  store_chain?: string;
  store_id?: string;
  PriceUpdateDate?: string;
  [key: string]: any;
}

export function validatePriceData(data: PriceData): boolean {
  // Check required fields
  if (!data.ItemCode || typeof data.ItemCode !== 'string') {
    throw new Error('Missing or invalid ItemCode');
  }

  if (!data.ItemName || typeof data.ItemName !== 'string') {
    throw new Error('Missing or invalid ItemName');
  }

  if (!data.store_chain || typeof data.store_chain !== 'string') {
    throw new Error('Missing or invalid store_chain');
  }

  // Validate price
  if (data.ItemPrice !== undefined) {
    if (typeof data.ItemPrice !== 'number' || data.ItemPrice < 0) {
      throw new Error('Invalid ItemPrice');
    }
  }

  // Validate date format if present
  if (data.PriceUpdateDate) {
    const date = new Date(data.PriceUpdateDate);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid PriceUpdateDate format');
    }
  }

  // Additional business rules
  if (data.ItemPrice && data.ItemPrice > 10000) {
    throw new Error('Price exceeds maximum allowed value');
  }

  if (data.ItemName.length > 200) {
    throw new Error('ItemName exceeds maximum length');
  }

  return true;
}