export function mapXmlItemToProduct(item: Element) {
  const getElementText = (tagName: string): string => {
    const element = item.querySelector(tagName);
    return element?.textContent?.trim() || '';
  };

  // Map XML fields to database columns
  return {
    store_chain: 'קינג סטור',
    store_id: getElementText('StoreId'),
    ItemCode: getElementText('ItemCode'),
    ItemType: getElementText('ItemType'),
    ItemName: getElementText('ItemName'),
    ManufacturerName: getElementText('ManufacturerName'),
    ManufactureCountry: getElementText('ManufactureCountry'),
    ManufacturerItemDescription: getElementText('ManufacturerItemDescription'),
    UnitQty: getElementText('UnitQty'),
    Quantity: parseFloat(getElementText('Quantity')) || null,
    bIsWeighted: getElementText('bIsWeighted') === 'true',
    UnitOfMeasure: getElementText('UnitOfMeasure'),
    QtyInPackage: parseFloat(getElementText('QtyInPackage')) || null,
    ItemPrice: parseFloat(getElementText('ItemPrice')) || null,
    UnitOfMeasurePrice: parseFloat(getElementText('UnitOfMeasurePrice')) || null,
    AllowDiscount: getElementText('AllowDiscount') === 'true',
    ItemStatus: getElementText('ItemStatus'),
    PriceUpdateDate: new Date().toISOString()
  };
}