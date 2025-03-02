
// This is now just a barrel file that re-exports all functionality
// to maintain the same import structure across the application

export { normalizeChainName } from './storeNameUtils';
export { groupProductsByStore } from './productGroupingUtils';
export { findMatchingProducts } from './productMatchingUtils';
export { processStoreComparisons } from './storeComparisonUtils';
