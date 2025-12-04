import type { ListMaster, ShoppingItem, TransactionHistory } from '../types/supabase';

export interface ListService {
    getLists(householdId: string): Promise<ListMaster[]>;
    createList(householdId: string, name: string): Promise<ListMaster | null>;
    updateList(id: string, name: string): Promise<boolean>;
    deleteList(id: string): Promise<boolean>;
}

export interface ItemService {
    getItems(listId: string): Promise<ShoppingItem[]>;
    addItem(item: Omit<ShoppingItem, 'id' | 'created_at' | 'is_purchased'>): Promise<ShoppingItem | null>;
    toggleItem(id: string, isPurchased: boolean): Promise<void>;
    deleteItem(id: string): Promise<void>;
    moveToHistory(item: ShoppingItem, finalPrice: number, totalSize: number, baseUnit: string): Promise<void>;
    getHistory(householdId: string): Promise<TransactionHistory[]>;
}
