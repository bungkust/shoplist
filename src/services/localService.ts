import type { ListService, ItemService, ListMaster, ShoppingItem, TransactionHistory } from './types';

export const STORAGE_KEYS = {
    LISTS: 'guest_lists',
    ITEMS: 'guest_items',
    HISTORY: 'guest_history',
    STORES: 'guest_stores'
};

const getUserProfile = () => {
    const raw = localStorage.getItem('user_profile');
    return raw ? JSON.parse(raw) : { id: 'guest_household', name: 'Guest' };
};

export const localListService: ListService = {
    async getLists(_householdId: string, page: number = 0, pageSize: number = 20): Promise<ListMaster[]> {
        const raw = localStorage.getItem(STORAGE_KEYS.LISTS);
        const lists: ListMaster[] = raw ? JSON.parse(raw) : [];
        // Filter by householdId if we were supporting multiple guest users, but for now just return all
        const sorted = lists.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const start = page * pageSize;
        const end = start + pageSize;
        return sorted.slice(start, end);
    },

    async createList(_householdId: string, name: string): Promise<ListMaster | null> {
        const raw = localStorage.getItem(STORAGE_KEYS.LISTS);
        const lists: ListMaster[] = raw ? JSON.parse(raw) : [];
        const user = getUserProfile();

        const newList: ListMaster = {
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            name: name,
            household_id: user.id, // Use user ID from profile
            created_by: user.name
        };

        lists.unshift(newList);
        localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
        return newList;
    },

    async updateList(id: string, name: string): Promise<boolean> {
        const raw = localStorage.getItem(STORAGE_KEYS.LISTS);
        let lists: ListMaster[] = raw ? JSON.parse(raw) : [];

        const index = lists.findIndex(l => l.id === id);
        if (index === -1) return false;

        lists[index].name = name;
        localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
        return true;
    },

    async deleteList(id: string): Promise<boolean> {
        const raw = localStorage.getItem(STORAGE_KEYS.LISTS);
        let lists: ListMaster[] = raw ? JSON.parse(raw) : [];

        const newLists = lists.filter(l => l.id !== id);
        localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(newLists));
        return true;
    }
};



export const localStoreService = {
    async getStores(_householdId: string): Promise<string[]> {
        // 1. Get Local Stores
        const rawStores = localStorage.getItem(STORAGE_KEYS.STORES);
        let stores: string[] = rawStores ? JSON.parse(rawStores) : [];

        // 2. Get Local History for sorting
        const rawHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const localHistory: TransactionHistory[] = rawHistory ? JSON.parse(rawHistory) : [];

        const lastUsedMap = new Map<string, number>();

        // Process Local History
        localHistory.forEach(h => {
            if (h.store_name) {
                const time = new Date(h.purchased_at).getTime();
                const current = lastUsedMap.get(h.store_name) || 0;
                if (time > current) {
                    lastUsedMap.set(h.store_name, time);
                }
                // Ensure store from history is in the list
                if (!stores.includes(h.store_name)) {
                    stores.push(h.store_name);
                }
            }
        });

        // 3. Sort stores based on last used time (newest first)
        return stores.sort((a, b) => {
            const timeA = lastUsedMap.get(a) || 0;
            const timeB = lastUsedMap.get(b) || 0;
            return timeB - timeA;
        });
    },

    async addStore(_householdId: string, name: string): Promise<string[]> {
        const raw = localStorage.getItem(STORAGE_KEYS.STORES);
        const stores: string[] = raw ? JSON.parse(raw) : [];

        // Case-insensitive check
        const exists = stores.some(s => s.toLowerCase() === name.toLowerCase());

        if (!exists) {
            stores.push(name);
            stores.sort();
            localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
        }
        return stores;
    }
};

export const localItemService: ItemService = {
    async getItems(listId: string, page: number = 0, pageSize: number = 20): Promise<ShoppingItem[]> {
        const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
        const items: ShoppingItem[] = raw ? JSON.parse(raw) : [];
        const sorted = items
            .filter(i => i.list_id === listId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const start = page * pageSize;
        const end = start + pageSize;
        return sorted.slice(start, end);
    },

    async addItem(itemData: Omit<ShoppingItem, 'id' | 'created_at' | 'is_purchased'>): Promise<ShoppingItem | null> {
        const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
        const items: ShoppingItem[] = raw ? JSON.parse(raw) : [];
        const user = getUserProfile();

        const newItem: ShoppingItem = {
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            is_purchased: false,
            ...itemData,
            household_id: user.id // Ensure items belong to the user's household
        };

        items.unshift(newItem);
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
        return newItem;
    },

    async toggleItem(id: string, isPurchased: boolean): Promise<void> {
        const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
        const items: ShoppingItem[] = raw ? JSON.parse(raw) : [];

        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index].is_purchased = isPurchased;
            localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
        }
    },

    async deleteItem(id: string): Promise<void> {
        const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
        const items: ShoppingItem[] = raw ? JSON.parse(raw) : [];

        const newItems = items.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(newItems));
    },

    async moveToHistory(item: ShoppingItem, finalPrice: number, totalSize: number, baseUnit: string, itemName: string, category?: string, listName?: string, storeName?: string): Promise<void> {
        // 1. Add to History
        const rawHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const history = rawHistory ? JSON.parse(rawHistory) : [];
        const user = getUserProfile();

        history.push({
            id: Math.random().toString(36).substr(2, 9),
            household_id: user.id, // Use user ID
            item_name: itemName,
            final_price: finalPrice,
            total_size: totalSize,
            base_unit: baseUnit,
            category: category,
            list_name: listName,
            store_name: storeName,
            purchased_at: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

        // 2. Mark as Purchased (Don't delete)
        await this.toggleItem(item.id, true);
    },

    async getHistory(_householdId: string, page: number = 0, pageSize: number = 20): Promise<TransactionHistory[]> {
        const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const history: TransactionHistory[] = raw ? JSON.parse(raw) : [];
        const sorted = history.sort((a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime());

        const start = page * pageSize;
        const end = start + pageSize;
        return sorted.slice(start, end);
    }
};
