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
      <IonContent fullscreen className="ion-padding bg-app-bg">
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
              {history.map(item => (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-text-main">{item.item_name}</h3>
                    <p className="text-sm text-text-muted">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.final_price)} / {item.total_size} {item.base_unit}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.purchased_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <IonButton fill="outline" size="small" className="rounded-lg" onClick={() => handleRestock(item)}>
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
