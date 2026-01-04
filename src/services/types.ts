export interface ListMaster {
    id: string;
    created_at: string;
    name: string;
    household_id: string;
    created_by: string;
}

export interface ShoppingItem {
    id: string;
    created_at: string;
    is_purchased: boolean;
    household_id: string;
    list_id: string;
    item_name: string;
    quantity: number;
    unit: string;
    notes?: string;
    price?: number;
    category?: string;
    store_name?: string;
}

export interface TransactionHistory {
    id: string;
    household_id: string;
    item_name: string;
    final_price: number;
    total_size: number;
    base_unit: string;
    category?: string;
    list_name?: string;
    store_name?: string;
    purchased_at: string;
    notes?: string;
}

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
    moveToHistory(item: ShoppingItem, finalPrice: number, totalSize: number, baseUnit: string, itemName: string, category?: string, listName?: string, storeName?: string, notes?: string): Promise<void>;
    getHistory(householdId: string, page?: number, pageSize?: number, searchTerm?: string, categories?: string[]): Promise<TransactionHistory[]>;
    getHistoryCategories(householdId: string): Promise<string[]>;
}
