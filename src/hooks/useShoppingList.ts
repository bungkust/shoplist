import { useState, useEffect } from 'react';
import type { ShoppingItem } from '../services/types';
import { localItemService } from '../services/localService';

export const useShoppingList = (householdId: string | null, listId: string | null) => {
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 20;

    useEffect(() => {
        if (!householdId || !listId) {
            setItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        if (page === 0) {
            fetchItems(true);
        } else {
            fetchItems(false);
        }
    }, [householdId, listId, page]);

    const fetchItems = async (reset = false) => {
        if (!householdId || !listId) return;

        const currentPage = reset ? 0 : page;
        setLoading(true);

        try {
            const data = await localItemService.getItems(listId, currentPage, PAGE_SIZE);
            if (reset) {
                setItems(data);
            } else {
                setItems(prev => [...prev, ...data]);
            }
            setHasMore(data.length === PAGE_SIZE);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreItems = () => {
        setPage(prev => prev + 1);
    };

    const addItem = async (item: { item_name: string; quantity: number; unit: string }) => {
        if (!householdId || !listId) {
            console.error('Cannot add item: Missing householdId or listId');
            return;
        }

        // Optimistic Update
        const tempId = Math.random().toString();
        const newItem: ShoppingItem = {
            id: tempId,
            ...item,
            list_id: listId,
            is_purchased: false,
            household_id: householdId,
            created_at: new Date().toISOString()
        };

        setItems(prev => [newItem, ...prev]);

        try {
            const addedItem = await localItemService.addItem({
                ...item,
                household_id: householdId,
                list_id: listId
            });
            // Replace optimistic item with real one (with real ID)
            if (addedItem) {
                setItems(prev => prev.map(i => i.id === tempId ? addedItem : i));
            }
        } catch (error) {
            console.error('Error adding item:', error);
            // Revert optimistic update
            setItems(prev => prev.filter(i => i.id !== tempId));
        }
    };

    const toggleItem = async (id: string, isPurchased: boolean) => {
        // Optimistic Update
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, is_purchased: isPurchased } : item
        ));

        try {
            await localItemService.toggleItem(id, isPurchased);
        } catch (error) {
            console.error('Error toggling item:', error);
            // Revert
            setItems(prev => prev.map(item =>
                item.id === id ? { ...item, is_purchased: !isPurchased } : item
            ));
        }
    };

    const deleteItem = async (id: string) => {
        // Optimistic Update
        const oldItems = [...items];
        setItems(prev => prev.filter(item => item.id !== id));

        try {
            await localItemService.deleteItem(id);
        } catch (error) {
            console.error('Error deleting item:', error);
            setItems(oldItems);
        }
    };

    const moveToHistory = async (id: string, finalPrice: number, totalSize: number, baseUnit: string, itemName: string, category?: string, listName?: string, storeName?: string, notes?: string) => {
        const item = items.find(i => i.id === id);
        if (!item || !householdId) return;

        // Optimistic Update: Mark as purchased AND update details
        const oldItems = [...items];
        setItems(prev => prev.map(i => {
            if (i.id === id) {
                const updated = {
                    ...i,
                    is_purchased: true,
                    item_name: itemName,
                    quantity: totalSize,
                    unit: baseUnit,
                    notes: notes,
                    price: finalPrice,
                    category: category,
                    store_name: storeName
                };
                console.log('Optimistic update:', updated);
                return updated;
            }
            return i;
        }));

        try {
            await localItemService.moveToHistory(item, finalPrice, totalSize, baseUnit, itemName, category, listName, storeName, notes);

        } catch (error) {
            console.error('Error moving to history:', error);
            setItems(oldItems); // Revert
        }
    };

    return {
        items,
        loading,
        addItem,
        toggleItem,
        deleteItem,
        moveToHistory,
        refreshItems: () => {
            setPage(0);
            fetchItems(true);
        },
        hasMore,
        loadMoreItems
    };
};
