import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonIcon, IonToast } from '@ionic/react';
import { refreshOutline, timeOutline } from 'ionicons/icons';
import { supabase } from '../services/supabaseClient';
import type { TransactionHistory } from '../types/supabase';

const History: React.FC = () => {
  const [history, setHistory] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [householdId, setHouseholdId] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
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

  useEffect(() => {
    if (householdId) {
      fetchHistory();
    }
  }, [householdId]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('transaction_history')
      .select('*')
      .eq('household_id', householdId)
      .order('purchased_at', { ascending: false });

    setHistory(data || []);
    setLoading(false);
  };

  const handleRestock = async (item: TransactionHistory) => {
    if (!householdId) return;

    // Fetch the first available list for the household
    const { data: lists } = await supabase
      .from('list_master')
      .select('id')
      .eq('household_id', householdId)
      .limit(1);

    if (!lists || lists.length === 0) {
      setToastMessage('No shopping list found. Please create one first.');
      setShowToast(true);
      return;
    }

    const targetListId = lists[0].id;

    const { error } = await supabase
      .from('shopping_items')
      .insert([{
        item_name: item.item_name,
        quantity: item.total_size,
        unit: item.base_unit,
        household_id: householdId,
        list_id: targetListId
      }]);

    if (!error) {
      setToastMessage('Item added back to list!');
      setShowToast(true);
    } else {
      setToastMessage('Failed to add item.');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>History</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="max-w-md mx-auto pb-20">
          {loading ? (
            <p className="text-center text-text-muted mt-10">Loading history...</p>
          ) : history.length === 0 ? (
            <div className="text-center mt-20 opacity-60">
              <IonIcon icon={timeOutline} className="text-6xl text-gray-300" />
              <p className="text-text-muted mt-2">No transaction history yet.</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {history.map((item, index) => (
                <div
                  key={item.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="animate-enter-up bg-white rounded-xl p-4 shadow-soft border border-gray-50 flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-50 p-3 rounded-2xl text-gray-400 group-hover:bg-blue-50 group-hover:text-primary transition-colors duration-300">
                      <IonIcon icon={timeOutline} className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-main text-lg leading-tight">{item.item_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-primary">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.final_price)}
                        </span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-text-muted">
                          {item.total_size} {item.base_unit}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(item.purchased_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <IonButton
                    fill="clear"
                    size="small"
                    className="h-10 w-10 rounded-full hover:bg-blue-50 text-primary transition-colors"
                    onClick={() => handleRestock(item)}
                  >
                    <IonIcon slot="icon-only" icon={refreshOutline} />
                  </IonButton>
                </div>
              ))}
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
      </IonContent>
    </IonPage>
  );
};

export default History;
