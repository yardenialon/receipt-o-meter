// Types based on OpenAPI schema
export interface ItemAvailability {
    storeId: string;
    storeName: string;
    city: string;
    price: number;
    currency: string;
    lastUpdated: string;
}

export interface Item {
    id: string;
    itemCode: string;
    name: string;
    unit: string;
    category: string;
    brand: string;
    isAvailable: boolean;
    availableStores: ItemAvailability[];
}

// API Implementation
export class IsraeliSupermarketAPI {
    constructor(private baseUrl: string) { }

    private async makeRequest(path: string, options: RequestInit = {}): Promise<Response> {
        const url = new URL(path, this.baseUrl);
        return fetch(url.toString(), {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
    }

    // Chains endpoints
    async getChains(includeStores: boolean) {
        return this.makeRequest(`/chains?includeStores=${includeStores}`);
    }

    async getChainById(id: string, includeStores: boolean) {
        return this.makeRequest(`/chains/${id}?includeStores=${includeStores}`);
    }

    async getChainStores(id: string) {
        return this.makeRequest(`/chains/${id}/stores`);
    }

    // Items endpoints
    async searchItems(query: string) {
        return this.makeRequest(`/items/search?query=${encodeURIComponent(query)}`);
    }

    async getItemByBarcode(barcode: string) {
        return this.makeRequest(`/items/barcode/${barcode}`);
    }

    async getItemPrice(chainId: string, storeId: string, itemId: string) {
        return this.makeRequest(`/items/chain/${chainId}/stores/${storeId}/items/${itemId}/price`);
    }

    // Stores endpoints
    async getStores(city?: string, chainObjectId?: string) {
        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (chainObjectId) params.append('chainObjectId', chainObjectId);
        return this.makeRequest(`/stores?${params.toString()}`);
    }

    async getStoreChains() {
        return this.makeRequest('/stores/chains');
    }

    async getStoreCities() {
        return this.makeRequest('/stores/cities');
    }

    async getStoreById(id: string) {
        return this.makeRequest(`/stores/${id}`);
    }

    async getStoresByChain(chainId: string) {
        return this.makeRequest(`/stores/chain/${chainId}`);
    }

    async getStoresByCity(city: string, chainObjectId?: string) {
        const params = new URLSearchParams();
        if (chainObjectId) params.append('chainObjectId', chainObjectId);
        return this.makeRequest(`/stores/city/${city}?${params.toString()}`);
    }

    // ETL Pipeline endpoint
    async runEtlPipeline() {
        return this.makeRequest('/etl-pipeline/run-etl-pipeline', { method: 'POST' });
    }
} 
