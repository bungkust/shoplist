import type { ListMaster, ShoppingItem, TransactionHistory } from '../types/supabase';

export interface ListService {
    getLists(householdId: string, page?: number, pageSize?: number): Promise<ListMaster[]>;
    createList(householdId: string, name: string): Promise<ListMaster | null>;
    updateList(id: string, name: string): Promise<boolean>;
    deleteList(id: string): Promise<boolean>;
}

export interface ItemService {
    getItems(listId: string, page?: number, pageSize?: number): Promise<ShoppingItem[]>;
    addItem(item: Omit<ShoppingItem, 'id' | 'created_at' | 'is_purchased'>): Promise<ShoppingItem | null>;
    toggleItem(id: string, isPurchased: boolean): Promise<void>;
    deleteItem(id: string): Promise<void>;
    moveToHistory(item: ShoppingItem, finalPrice: number, totalSize: number, baseUnit: string, itemName: string, category?: string, listName?: string, storeName?: string): Promise<void>;
    getHistory(householdId: string, page?: number, pageSize?: number): Promise<TransactionHistory[]>;
}
