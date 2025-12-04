import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import type { ShoppingItem } from '../types/supabase';
import { ENABLE_CLOUD_SYNC } from '../config';
import { localItemService } from '../services/localService';

export const useShoppingList = (householdId: string | null, listId: string | null) => {
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!householdId || !listId) {
            setItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        fetchItems();

        // Realtime Subscription (Only in Cloud Mode)
        if (ENABLE_CLOUD_SYNC) {
            const channel = supabase
                .channel(`shopping_items_${listId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'shopping_items',
                        filter: `list_id=eq.${listId}`
                    },
                    (payload) => {
                        console.log('Realtime change:', payload);
                        fetchItems(); // Refresh on any change
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [householdId, listId]);

    const fetchItems = async () => {
        if (!householdId || !listId) return;
        try {
            if (!ENABLE_CLOUD_SYNC) {
                const data = await localItemService.getItems(listId);
                setItems(data);
            } else {
                const { data, error } = await supabase
                    .from('shopping_items')
                    .select('*')
                    .eq('list_id', listId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setItems(data || []);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
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
            if (!ENABLE_CLOUD_SYNC) {
                const addedItem = await localItemService.addItem({
                    ...item,
                    household_id: householdId,
                    list_id: listId
                });
                // Replace optimistic item with real one (with real ID)
                if (addedItem) {
                    setItems(prev => prev.map(i => i.id === tempId ? addedItem : i));
                }
            } else {
                const { error } = await supabase
                    .from('shopping_items')
                    .insert([{ ...item, household_id: householdId, list_id: listId }]);

                if (error) throw error;
                // Realtime will handle the actual update
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
            if (!ENABLE_CLOUD_SYNC) {
                await localItemService.toggleItem(id, isPurchased);
            } else {
                const { error } = await supabase
                    .from('shopping_items')
                    .update({ is_purchased: isPurchased })
                    .eq('id', id);

                if (error) throw error;
            }
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
            if (!ENABLE_CLOUD_SYNC) {
                await localItemService.deleteItem(id);
            } else {
                const { error } = await supabase
                    .from('shopping_items')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            setItems(oldItems);
        }
    };

    const moveToHistory = async (id: string, finalPrice: number, totalSize: number, baseUnit: string) => {
        const item = items.find(i => i.id === id);
        if (!item || !householdId) return;

        // Optimistic Update: Remove from list
        const oldItems = [...items];
        setItems(prev => prev.filter(i => i.id !== id));

        try {
            if (!ENABLE_CLOUD_SYNC) {
                await localItemService.moveToHistory(item, finalPrice, totalSize, baseUnit);
            } else {
                // 1. Add to History
                const { error: historyError } = await supabase
                    .from('transaction_history')
                    .insert([{
                        household_id: householdId,
                        item_name: item.item_name,
                        final_price: finalPrice,
                        total_size: totalSize,
                        base_unit: baseUnit,
                        purchased_at: new Date().toISOString()
                    }]);

                if (historyError) throw historyError;

                // 2. Delete from Shopping List
                const { error: deleteError } = await supabase
                    .from('shopping_items')
                    .delete()
                    .eq('id', id);

                if (deleteError) throw deleteError;
            }

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
        refreshItems: fetchItems
    };
};
