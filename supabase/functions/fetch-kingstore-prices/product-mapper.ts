export function mapXmlItemToProduct(item: Element) {
  return {
    ItemCode: item.querySelector('ItemCode')?.textContent || null,
    ItemType: item.querySelector('ItemType')?.textContent || null,
    ItemName: item.querySelector('ItemName')?.textContent || null,
    ManufacturerName: item.querySelector('ManufacturerName')?.textContent || null,
    ManufactureCountry: item.querySelector('ManufactureCountry')?.textContent || null,
    ManufacturerItemDescription: item.querySelector('ManufacturerItemDescription')?.textContent || null,
    UnitQty: item.querySelector('UnitQty')?.textContent || null,
    Quantity: parseFloat(item.querySelector('Quantity')?.textContent || '0') || null,
    bIsWeighted: item.querySelector('bIsWeighted')?.textContent === 'true',
    UnitOfMeasure: item.querySelector('UnitOfMeasure')?.textContent || null,
    QtyInPackage: parseFloat(item.querySelector('QtyInPackage')?.textContent || '0') || null,
    ItemPrice: parseFloat(item.querySelector('ItemPrice')?.textContent || '0') || null,
    UnitOfMeasurePrice: parseFloat(item.querySelector('UnitOfMeasurePrice')?.textContent || '0') || null,
    AllowDiscount: item.querySelector('AllowDiscount')?.textContent === 'true',
    ItemStatus: item.querySelector('ItemStatus')?.textContent || null,
    store_chain: 'קינג סטור',
    store_id: '001', // Default store ID for King Store
    PriceUpdateDate: new Date().toISOString()
  };
}