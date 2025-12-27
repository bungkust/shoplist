export interface Profile {
    id: string;
    email: string;
    display_name: string;
    household_id: string;
    avatar_url?: string;
    created_at: string;
}

export interface ListMaster {
    id: string;
    name: string;
    household_id: string;
    created_by: string;
    created_at: string;
}

export interface ShoppingItem {
    id: string;
    list_id: string;
    item_name: string;
    quantity: number;
    unit: string;
    is_purchased: boolean;
    household_id: string;
    created_at: string;
}

export interface TransactionHistory {
    id: string;
    household_id: string;
    item_name: string;
    final_price: number;
    total_size: number;
    base_unit: string;
    category?: string;
    purchased_at: string;
}
