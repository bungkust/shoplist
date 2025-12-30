import { useState, useEffect } from 'react';
import type { ListMaster } from '../services/types';
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
    }, [householdId, page]);

    const fetchLists = async (reset = false) => {
        if (!householdId) return;
        setLoading(true);

        const currentPage = reset ? 0 : page;

        try {
            const data = await localListService.getLists(householdId, currentPage, PAGE_SIZE);
            if (reset) {
                setLists(data);
            } else {
                setLists(prev => [...prev, ...data]);
            }
            setHasMore(data.length === PAGE_SIZE);
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
            const data = await localListService.createList(householdId, name);
            if (data) {
                setLists(prev => [data, ...prev]);
            }
            return data;
        } catch (error) {
            console.error('Error creating list:', error);
            return null;
        }
    };

    const updateList = async (id: string, name: string) => {
        try {
            // Optimistic Update
            setLists(prev => prev.map(list => list.id === id ? { ...list, name } : list));

            return await localListService.updateList(id, name);
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

            return await localListService.deleteList(id);
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
