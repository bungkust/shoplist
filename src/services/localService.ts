import type { ListService, ItemService } from './types';
import type { ListMaster, ShoppingItem, TransactionHistory } from '../types/supabase';

export const STORAGE_KEYS = {
    LISTS: 'guest_lists',
    ITEMS: 'guest_items',
    HISTORY: 'guest_history'
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

    async createList(householdId: string, name: string): Promise<ListMaster | null> {
        const raw = localStorage.getItem(STORAGE_KEYS.LISTS);
        const lists: ListMaster[] = raw ? JSON.parse(raw) : [];

        const newList: ListMaster = {
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            name: name,
            household_id: householdId,
            created_by: 'guest'
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

        const newItem: ShoppingItem = {
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            is_purchased: false,
            ...itemData
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

    async moveToHistory(item: ShoppingItem, finalPrice: number, totalSize: number, baseUnit: string, itemName: string, category?: string): Promise<void> {
        // 1. Add to History
        const rawHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const history = rawHistory ? JSON.parse(rawHistory) : [];

        history.push({
            id: Math.random().toString(36).substr(2, 9),
            household_id: item.household_id,
            item_name: itemName,
            final_price: finalPrice,
            total_size: totalSize,
            base_unit: baseUnit,
            category: category,
            purchased_at: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

        // 2. Delete from Items
        await this.deleteItem(item.id);
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
