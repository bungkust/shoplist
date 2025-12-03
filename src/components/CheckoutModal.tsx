import React, { useState, useEffect } from 'react';
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonInput, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { closeOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { supabase } from '../services/supabaseClient';
import type { ShoppingItem } from '../types/supabase';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ShoppingItem | null;
    onConfirm: (finalPrice: number, totalSize: number, baseUnit: string) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, item, onConfirm }) => {
    const [price, setPrice] = useState<string>('');
    const [size, setSize] = useState<string>('');
    const [unit, setUnit] = useState<string>('');

    // Smart Logic State
    const [lastPrice, setLastPrice] = useState<number | null>(null);
    const [priceComparison, setPriceComparison] = useState<'cheaper' | 'expensive' | 'same' | null>(null);

    useEffect(() => {
        if (item) {
            setPrice('');
            setSize(item.quantity.toString());
            setUnit(item.unit);
            setLastPrice(null);
            setPriceComparison(null);
            fetchLastPrice(item.item_name, item.unit);
        }
    }, [item]);

    const fetchLastPrice = async (itemName: string, itemUnit: string) => {
        // Simple logic: Find last purchase with same unit (MVP)
        const { data } = await supabase
            .from('transaction_history')
            .select('final_price, total_size')
            .eq('item_name', itemName)
            .eq('base_unit', itemUnit)
            .order('purchased_at', { ascending: false })
            .limit(1)
            .single();

        if (data) {
            const unitPrice = data.final_price / data.total_size;
            setLastPrice(unitPrice);
        }
    };

    useEffect(() => {
        if (price && size && lastPrice) {
            const currentUnitPrice = parseFloat(price) / parseFloat(size);
            if (currentUnitPrice < lastPrice) setPriceComparison('cheaper');
            else if (currentUnitPrice > lastPrice) setPriceComparison('expensive');
            else setPriceComparison('same');
        } else {
            setPriceComparison(null);
        }
    }, [price, size, lastPrice]);

    const handleConfirm = () => {
        if (price && size && unit) {
            onConfirm(parseFloat(price), parseFloat(size), unit);
            onClose();
        }
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} initialBreakpoint={0.75} breakpoints={[0, 0.75]}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Konfirmasi Pembelian</IonTitle>
                    <IonTitle>Confirm Purchase</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div className="space-y-6">

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-text-main">{item?.item_name}</h2>
                        <p className="text-text-muted">Enter price details for history.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-2">
                            <IonItem lines="none">
                                <IonLabel position="stacked">Total Price (Rp)</IonLabel>
                                <IonInput
                                    type="number"
                                    placeholder="Example: 50000"
                                    value={price}
                                    onIonChange={e => setPrice(e.detail.value!)}
                                />
                            </IonItem>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 p-2 flex-1">
                                <IonItem lines="none">
                                    <IonLabel position="stacked">Size</IonLabel>
                                    <IonInput
                                        type="number"
                                        value={size}
                                        onIonChange={e => setSize(e.detail.value!)}
                                    />
                                </IonItem>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-2 flex-1">
                                <IonItem lines="none">
                                    <IonLabel position="stacked">Unit</IonLabel>
                                    <IonInput
                                        value={unit}
                                        onIonChange={e => setUnit(e.detail.value!)}
                                    />
                                </IonItem>
                            </div>
                        </div>
                    </div>

                    {/* Smart Feedback */}
                    {priceComparison && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 ${priceComparison === 'cheaper' ? 'bg-green-50 text-green-700' :
                            priceComparison === 'expensive' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'
                            }`}>
                            <IonIcon icon={priceComparison === 'cheaper' ? checkmarkCircleOutline : alertCircleOutline} className="text-2xl" />
                            <div>
                                <p className="font-bold">
                                    {priceComparison === 'cheaper' ? 'BEST PRICE! ✅' :
                                        priceComparison === 'expensive' ? 'More Expensive ❌' : 'Same Price'}
                                </p>
                                <p className="text-sm">
                                    {priceComparison === 'cheaper' ? 'Cheaper than last purchase.' :
                                        'More expensive than usual.'}
                                </p>
                            </div>
                        </div>
                    )}

                    <IonButton expand="block" onClick={handleConfirm} className="h-12 font-bold rounded-xl" shape="round">
                        Simpan ke Riwayat
                    </IonButton>

                </div>
            </IonContent>
        </IonModal>
    );
};

export default CheckoutModal;
