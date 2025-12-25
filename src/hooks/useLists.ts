import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import type { ListMaster } from '../types/supabase';
import { ENABLE_CLOUD_SYNC } from '../config';
import { localListService } from '../services/localService';

export const useLists = (householdId: string | null) => {
    const [lists, setLists] = useState<ListMaster[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 20;

    useEffect(() => {
        if (!householdId) return;

        if (page === 0) {
            fetchLists(true);
        } else {
            fetchLists(false);
        }

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
                        setPage(0); // Reset to first page on realtime update
                        fetchLists(true);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [householdId, page]);

    const fetchLists = async (reset = false) => {
        if (!householdId) return;
        setLoading(true);

        const currentPage = reset ? 0 : page;

        try {
            if (!ENABLE_CLOUD_SYNC) {
                const data = await localListService.getLists(householdId, currentPage, PAGE_SIZE);
                if (reset) {
                    setLists(data);
                } else {
                    setLists(prev => [...prev, ...data]);
                }
                setHasMore(data.length === PAGE_SIZE);
            } else {
                const start = currentPage * PAGE_SIZE;
                const end = start + PAGE_SIZE - 1;

                const { data, error } = await supabase
                    .from('list_master')
                    .select('*')
                    .eq('household_id', householdId)
                    .order('created_at', { ascending: false })
                    .range(start, end);

                if (error) throw error;

                const newData = data || [];
                if (reset) {
                    setLists(newData);
                } else {
                    setLists(prev => [...prev, ...newData]);
                }
                setHasMore(newData.length === PAGE_SIZE);
            }
        } catch (error) {
            console.error('Error fetching lists:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreLists = () => {
        setPage(prev => prev + 1);
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
        refreshLists: () => {
            setPage(0);
            fetchLists(true);
        },
        hasMore,
        loadMoreLists
    };
};
