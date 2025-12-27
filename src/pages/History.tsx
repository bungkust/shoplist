import React, { useState, useEffect, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonIcon, IonToast, IonActionSheet, useIonViewDidEnter, IonRefresher, IonRefresherContent } from '@ionic/react';
import type { RefresherEventDetail } from '@ionic/react';
import { refreshOutline, timeOutline, searchOutline, closeCircle } from 'ionicons/icons';
import { supabase } from '../services/supabaseClient';
import type { TransactionHistory, ListMaster } from '../types/supabase';
import { ENABLE_CLOUD_SYNC } from '../config';
import { localItemService, localListService } from '../services/localService';
import { useHistory } from 'react-router-dom';

const History: React.FC = () => {
  const history = useHistory();
  const [historyData, setHistory] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [householdId, setHouseholdId] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

  // Detail Modal
  // const [selectedHistoryItem, setSelectedHistoryItem] = useState<{ name: string, history: TransactionHistory[] } | null>(null);

  // Rebuy Logic States
  const [showListSelection, setShowListSelection] = useState(false);
  const [availableLists, setAvailableLists] = useState<ListMaster[]>([]);
  const [selectedItemForRestock, setSelectedItemForRestock] = useState<TransactionHistory | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      if (!ENABLE_CLOUD_SYNC) {
        setHouseholdId('guest_household');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('household_id')
          .eq('id', user.id)
          .single();
        if (data) setHouseholdId(data.household_id);
      }
    };
    getProfile();
  }, []);

  const fetchHistoryRef = useRef<(reset?: boolean) => void>(() => { });

  const fetchHistory = async (reset = false) => {
    if (!householdId) return;

    const currentPage = reset ? 0 : page;
    setLoading(true);

    if (!ENABLE_CLOUD_SYNC) {
      const data = await localItemService.getHistory(householdId, currentPage, PAGE_SIZE);
      if (reset) {
        setHistory(data);
      } else {
        setHistory(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
      setLoading(false);
      return;
    }

    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE - 1;

    const { data } = await supabase
      .from('transaction_history')
      .select('*')
      .eq('household_id', householdId)
      .order('purchased_at', { ascending: false })
      .range(start, end);

    const newData = data || [];
    if (reset) {
      setHistory(newData);
    } else {
      setHistory(prev => [...prev, ...newData]);
    }
    setHasMore(newData.length === PAGE_SIZE);
    setLoading(false);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    if (page > 0) {
      fetchHistory(false);
    }
  }, [page]);

  fetchHistoryRef.current = fetchHistory;

  useIonViewDidEnter(() => {
    if (householdId) {
      setPage(0);
      fetchHistoryRef.current(true);
    }
  });

  const doRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    setPage(0);
    await fetchHistory(true);
    event.detail.complete();
  };

  useEffect(() => {
    if (householdId) {
      setPage(0);
      fetchHistory(true);
    }
  }, [householdId]);

  const handleRestockClick = async (e: React.MouseEvent, item: TransactionHistory) => {
    e.stopPropagation(); // Prevent opening detail modal
    if (!householdId) return;

    let lists: ListMaster[] = [];

    if (!ENABLE_CLOUD_SYNC) {
      lists = await localListService.getLists(householdId);
    } else {
      const { data } = await supabase
        .from('list_master')
        .select('*')
        .eq('household_id', householdId);
      lists = data || [];
    }

    if (lists.length === 0) {
      setToastMessage('No shopping list found. Please create one first.');
      setShowToast(true);
      return;
    }

    if (lists.length === 1) {
      // Auto-add to the only list
      executeRestock(item, lists[0].id);
    } else {
      // Show selection
      setAvailableLists(lists);
      setSelectedItemForRestock(item);
      setShowListSelection(true);
    }
  };

  const executeRestock = async (item: TransactionHistory, listId: string) => {
    if (!householdId) return;

    if (!ENABLE_CLOUD_SYNC) {
      await localItemService.addItem({
        item_name: item.item_name,
        quantity: item.total_size,
        unit: item.base_unit,
        household_id: householdId,
        list_id: listId
      });
      setToastMessage('Item added back to list!');
      setShowToast(true);
    } else {
      const { error } = await supabase
        .from('shopping_items')
        .insert([{
          item_name: item.item_name,
          quantity: item.total_size,
          unit: item.base_unit,
          household_id: householdId,
          list_id: listId
        }]);

      if (!error) {
        setToastMessage('Item added back to list!');
        setShowToast(true);
      } else {
        setToastMessage('Failed to add item.');
        setShowToast(true);
      }
    }
  };

  const openItemDetail = (itemName: string) => {
    // Navigate to detail page
    history.push(`/history/item/${encodeURIComponent(itemName)}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // Filter Logic
  const filteredHistory = historyData.filter(t => {
    const matchesSearch = t.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(historyData.map(t => t.category || 'Lainnya')))];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>History</IonTitle>
        </IonToolbar>
        <div className="px-4 pb-2">
          {/* Search Bar */}
          <div className="bg-gray-100 rounded-xl flex items-center px-3 py-2 mb-3">
            <IonIcon icon={searchOutline} className="text-gray-400 text-lg mr-2" />
            <input
              type="text"
              placeholder="Search history..."
              className="bg-transparent w-full outline-none text-gray-800 placeholder-gray-400"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}>
                <IonIcon icon={closeCircle} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                    ${selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      </IonHeader>
      <IonContent fullscreen className="bg-gray-50">
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <div className="p-4 space-y-6 pb-20">
          {loading && historyData.length === 0 ? (
            <p className="text-center text-gray-400 mt-10">Loading history...</p>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center mt-20 opacity-60">
              <IonIcon icon={timeOutline} className="text-6xl text-gray-300" />
              <p className="text-gray-400 mt-2">No transactions found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openItemDetail(item.item_name)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-500">
                      <IonIcon icon={timeOutline} className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base leading-tight">{item.item_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-blue-600">
                          {formatCurrency(item.final_price)}
                        </span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-500">
                          {item.total_size} {item.base_unit}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(item.purchased_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {item.list_name && ` • ${item.list_name}`}
                      </p>
                    </div>
                  </div>
                  <IonButton
                    fill="clear"
                    size="small"
                    className="h-10 w-10 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
                    onClick={(e) => handleRestockClick(e, item)}
                  >
                    <IonIcon slot="icon-only" icon={refreshOutline} />
                  </IonButton>
                </div>
              ))}

              {hasMore && (
                <div className="pt-4">
                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={loadMore}
                    disabled={loading}
                    className="font-bold rounded-2xl"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </IonButton>
                </div>
              )}
            </div>
          )}
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
          color="success"
        />

        <IonActionSheet
          isOpen={showListSelection}
          onDidDismiss={() => setShowListSelection(false)}
          header="Select List to Restock"
          buttons={[
            ...availableLists.map(list => ({
              text: list.name,
              handler: () => {
                if (selectedItemForRestock) {
                  executeRestock(selectedItemForRestock, list.id);
                }
              }
            })),
            {
              text: 'Cancel',
              role: 'cancel',
              data: {
                action: 'cancel',
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default History;
