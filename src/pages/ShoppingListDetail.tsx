import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonFab, IonFabButton, IonToast, IonButtons, IonBackButton } from '@ionic/react';
import { micOutline } from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useShoppingList } from '../hooks/useShoppingList';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { parseVoiceInput } from '../utils/textParser';
import ModernItemCard from '../components/ui/ModernItemCard';
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
        if (is_purchased) {
            const item = items.find(i => i.id === id);
            if (item) {
                setSelectedItem(item);
                setIsCheckoutOpen(true);
            }
        } else {
            await toggleItem(id, false);
        }
    };

    const handleFabClick = () => {
        // setIsModalOpen(true); // Disable custom modal, using native popup
        const lang = (localStorage.getItem('voice_lang') as 'en-US' | 'id-ID') || 'en-US';
        startListening(lang);
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
        if (!isListening && transcript) {
            if (!householdId) return; // Safety check

            const lang = (localStorage.getItem('voice_lang') as 'en-US' | 'id-ID') || 'en-US';
            const parsed = parseVoiceInput(transcript, lang);

            if (parsed.name) {
                Haptics.impact({ style: ImpactStyle.Light });
                addItem({
                    item_name: parsed.name,
                    quantity: parsed.qty,
                    unit: parsed.unit
                });

                if (!navigator.onLine) {
                    setToastMessage('Offline. Data saved locally.');
                } else {
                    setToastMessage(`Added: ${parsed.name}`);
                }
                setShowToast(true);
            }

            // Close modal after a short delay
            setTimeout(() => {
                // setIsModalOpen(false);
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

    const handleManualAdd = async (item: { item_name: string; quantity: number; unit: string }) => {
        if (!householdId) return;

        await Haptics.impact({ style: ImpactStyle.Light });
        addItem(item);

        if (!navigator.onLine) {
            setToastMessage('Offline. Data saved locally.');
        } else {
            setToastMessage(`Added: ${item.item_name}`);
        }
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

            <IonContent fullscreen>
                <div className="flex flex-col h-full max-w-md mx-auto relative px-4 pt-2 pb-24">

                    {/* Summary Header */}
                    <div className="flex items-center justify-between mb-4 animate-enter-up">
                        <div>
                            <h2 className="text-xl font-bold text-text-main">Items</h2>
                            <p className="text-sm text-text-muted">
                                {items.filter(i => !i.is_purchased).length} remaining
                            </p>
                        </div>
                        <div className="bg-blue-50 text-primary px-3 py-1 rounded-full text-xs font-bold">
                            {items.length} Total
                        </div>
                    </div>

                    {/* Smart Input Bar */}
                    <SmartInputBar onAdd={handleManualAdd} />

                    {/* List Items */}
                    <div className="space-y-3 mt-4">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center mt-10 space-y-4 opacity-60 animate-enter-up">
                                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center">
                                    <IonIcon icon={micOutline} className="text-4xl text-gray-300" />
                                </div>
                                <div className="text-center">
                                    <p className="text-text-main font-medium">Your list is empty</p>
                                    <p className="text-sm text-text-muted">Tap the mic or type to add items</p>
                                </div>
                            </div>
                        ) : (
                            items.map(item => (
                                <ModernItemCard
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
                <IonFab vertical="bottom" horizontal="end" slot="fixed" className="mb-6 mr-4">
                    <IonFabButton onClick={handleFabClick} className="shadow-floating hover:scale-110 transition-transform">
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
