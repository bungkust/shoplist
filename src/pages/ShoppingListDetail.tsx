import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonFab, IonFabButton, IonToast, IonButtons, IonBackButton } from '@ionic/react';
import { micOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useShoppingList } from '../hooks/useShoppingList';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { parseVoiceInput } from '../utils/textParser';
import ShopCard from '../components/ShopCard';
import VoiceModal from '../components/VoiceModal';
import CheckoutModal from '../components/CheckoutModal';
import SmartInputBar from '../components/SmartInputBar';
import { supabase } from '../services/supabaseClient';
import type { ShoppingItem } from '../types/supabase';

const ShoppingListDetail: React.FC = () => {
    const { id: listId } = useParams<{ id: string }>();
    const [householdId, setHouseholdId] = useState<string | null>(null);
    const [listName, setListName] = useState<string>('Shopping List');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);

    const { items, loading, addItem, toggleItem, deleteItem, moveToHistory } = useShoppingList(householdId, listId || null);

    const handleToggle = async (id: string, is_purchased: boolean) => {
        await toggleItem(id, is_purchased);
    };

    const handleFabClick = () => {
        setIsModalOpen(true);
        startListening();
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        stopListening();
    };

    // Fetch Household ID and List Name
    useEffect(() => {
        const getProfileAndList = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('household_id')
                    .eq('id', user.id)
                    .single();
                if (data) setHouseholdId(data.household_id);
            }

            if (listId) {
                const { data: listData } = await supabase
                    .from('list_master')
                    .select('name')
                    .eq('id', listId)
                    .single();
                if (listData) setListName(listData.name);
            }
        };
        getProfileAndList();
    }, [listId]);

    // Process transcript when listening stops
    useEffect(() => {
        if (!isListening && transcript && isModalOpen) {
            if (!householdId) return; // Safety check

            const parsed = parseVoiceInput(transcript, 'en-US');

            if (parsed.name) {
                addItem({
                    item_name: parsed.name,
                    quantity: parsed.qty,
                    unit: parsed.unit
                });
                setToastMessage(`Added: ${parsed.name}`);
                setShowToast(true);
            }

            // Close modal after a short delay
            setTimeout(() => {
                setIsModalOpen(false);
                resetTranscript(); // Clear transcript to prevent duplication
            }, 500);
        }
    }, [isListening, transcript, isModalOpen, householdId]);

    const handleCheckoutConfirm = (finalPrice: number, totalSize: number, baseUnit: string) => {
        if (selectedItem) {
            moveToHistory(selectedItem.id, finalPrice, totalSize, baseUnit);
            setToastMessage('Saved to History');
            setShowToast(true);
        }
    };

    const handleManualAdd = (item: { item_name: string; quantity: number; unit: string }) => {
        if (!householdId) return;
        addItem(item);
        setToastMessage(`Added: ${item.item_name}`);
        setShowToast(true);
    };

    if (!householdId) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/home" />
                        </IonButtons>
                        <IonTitle>Loading...</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <div className="flex justify-center items-center h-full">
                        <p className="text-text-muted">Loading list details...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" />
                    </IonButtons>
                    <IonTitle>{listName}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-padding bg-app-bg">
                <div className="flex flex-col h-full max-w-md mx-auto relative pb-20">

                    {/* Smart Input Bar */}
                    <SmartInputBar onAdd={handleManualAdd} />

                    {/* List Items */}
                    <div className="space-y-1 mt-2">
                        {loading ? (
                            <p className="text-center text-text-muted mt-10">Loading...</p>
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center mt-20 space-y-4 opacity-60">
                                <IonIcon icon={micOutline} className="text-6xl text-gray-300" />
                                <p className="text-text-muted">No items in this list</p>
                            </div>
                        ) : (
                            items.map(item => (
                                <ShopCard
                                    key={item.id}
                                    item={item}
                                    onToggle={handleToggle}
                                    onDelete={deleteItem}
                                    onEdit={(item) => {
                                        setSelectedItem(item);
                                        setIsCheckoutOpen(true);
                                    }}
                                />
                            ))
                        )}
                    </div>

                </div>

                {/* FAB */}
                <IonFab vertical="bottom" horizontal="end" slot="fixed" className="mb-4 mr-4">
                    <IonFabButton onClick={handleFabClick} className="fab-trigger">
                        <IonIcon icon={micOutline} />
                    </IonFabButton>
                </IonFab>

                <VoiceModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    transcript={transcript}
                    isListening={isListening}
                />

                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    item={selectedItem}
                    onConfirm={handleCheckoutConfirm}
                />

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

export default ShoppingListDetail;
