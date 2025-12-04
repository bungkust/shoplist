import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import type { ListMaster } from '../types/supabase';
import { ENABLE_CLOUD_SYNC } from '../config';
import { localListService } from '../services/localService';

export const useLists = (householdId: string | null) => {
    const [lists, setLists] = useState<ListMaster[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!householdId) return;

        fetchLists();

        // Realtime Subscription for Lists (Only in Cloud Mode)
        if (ENABLE_CLOUD_SYNC) {
            const channel = supabase
                .channel('list_master_changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'list_master',
                        filter: `household_id=eq.${householdId}`
                    },
                    (payload) => {
                        console.log('List change:', payload);
                        fetchLists();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [householdId]);

    const fetchLists = async () => {
        if (!householdId) return;
        setLoading(true);
        try {
            if (!ENABLE_CLOUD_SYNC) {
                const data = await localListService.getLists(householdId);
                setLists(data);
            } else {
                const { data, error } = await supabase
                    .from('list_master')
                    .select('*')
                    .eq('household_id', householdId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setLists(data || []);
            }
        } catch (error) {
            console.error('Error fetching lists:', error);
        } finally {
            setLoading(false);
        }
    };

    const createList = async (name: string) => {
        if (!householdId) return null;

        try {
            if (!ENABLE_CLOUD_SYNC) {
                const data = await localListService.createList(householdId, name);
                if (data) {
                    setLists(prev => [data, ...prev]);
                }
                return data;
            } else {
                const { data, error } = await supabase
                    .from('list_master')
                    .insert([{ household_id: householdId, name: name }])
                    .select()
                    .single();

                if (error) throw error;

                // Optimistic Update
                if (data) {
                    setLists(prev => [data, ...prev]);
                }
                return data;
            }
        } catch (error) {
            console.error('Error creating list:', error);
            return null;
        }
    };

    const updateList = async (id: string, name: string) => {
        try {
            // Optimistic Update
            setLists(prev => prev.map(list => list.id === id ? { ...list, name } : list));

            if (!ENABLE_CLOUD_SYNC) {
                return await localListService.updateList(id, name);
            } else {
                const { error } = await supabase
                    .from('list_master')
                    .update({ name })
                    .eq('id', id);

                if (error) throw error;
                return true;
            }
        } catch (error) {
            console.error('Error updating list:', error);
            // Revert on error
            fetchLists();
            return false;
        }
    };

    const deleteList = async (id: string) => {
        try {
            // Optimistic Update
            setLists(prev => prev.filter(list => list.id !== id));

            if (!ENABLE_CLOUD_SYNC) {
                return await localListService.deleteList(id);
            } else {
                const { error } = await supabase
                    .from('list_master')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return true;
            }
        } catch (error) {
            console.error('Error deleting list:', error);
            fetchLists();
            return false;
        }
    };

    return {
        lists,
        loading,
        createList,
        updateList,
        deleteList,
        refreshLists: fetchLists
    };
};
