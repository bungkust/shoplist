import React, { useState, useEffect } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonInput, IonIcon } from '@ionic/react';
import { closeOutline, checkmarkCircleOutline, alertCircleOutline, pricetagOutline, cubeOutline } from 'ionicons/icons';
import { supabase } from '../services/supabaseClient';
import type { ShoppingItem } from '../types/supabase';
import { modalEnterAnimation, modalLeaveAnimation } from '../utils/animations';

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
            .maybeSingle();

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
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onClose}
            className="checkout-modal-centered"
            enterAnimation={modalEnterAnimation}
            leaveAnimation={modalLeaveAnimation}
        >
            <div className="flex flex-col h-full bg-white">
                <IonHeader className="ion-no-border">
                    <IonToolbar>
                        <IonTitle>Confirm Purchase</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={onClose} className="text-gray-500">
                                <IonIcon icon={closeOutline} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <div className="p-4 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6 pt-2">

                        <div className="text-center animate-enter-up">
                            <h2 className="text-2xl font-bold text-text-main">{item?.item_name}</h2>
                            <p className="text-text-muted">Enter details to save to history.</p>
                        </div>

                        <div className="space-y-4 animate-enter-up" style={{ animationDelay: '0.1s' }}>
                            {/* Price Input */}
                            <div className="bg-gray-50 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <div className="flex items-center gap-2 mb-1">
                                    <IonIcon icon={pricetagOutline} className="text-gray-400 text-xs" />
                                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Price (Rp)</label>
                                </div>
                                <IonInput
                                    type="number"
                                    placeholder="0"
                                    value={price}
                                    onIonChange={e => setPrice(e.detail.value!)}
                                    className="font-bold text-2xl -mt-1 text-text-main"
                                />
                            </div>

                            {/* Size & Unit */}
                            <div className="grid grid-cols-5 gap-3">
                                <div className="col-span-3 bg-gray-50 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                    <div className="flex items-center gap-2 mb-1">
                                        <IonIcon icon={cubeOutline} className="text-gray-400 text-xs" />
                                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Size</label>
                                    </div>
                                    <IonInput
                                        type="number"
                                        placeholder="0"
                                        value={size}
                                        onIonChange={e => setSize(e.detail.value!)}
                                        className="font-bold text-lg -mt-1 text-text-main"
                                    />
                                </div>
                                <div className="col-span-2 bg-gray-50 rounded-2xl px-2 py-2 flex items-center justify-center focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                    <IonInput
                                        value={unit}
                                        placeholder="Unit"
                                        onIonChange={e => setUnit(e.detail.value!)}
                                        className="text-center font-medium text-sm text-text-main"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Smart Feedback */}
                        {priceComparison && (
                            <div className={`p-4 rounded-2xl flex items-center gap-3 animate-scale-in ${priceComparison === 'cheaper' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' :
                                priceComparison === 'expensive' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' :
                                    'bg-gray-50 text-gray-600'
                                }`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${priceComparison === 'cheaper' ? 'bg-green-100' :
                                    priceComparison === 'expensive' ? 'bg-red-100' : 'bg-gray-200'
                                    }`}>
                                    <IonIcon icon={priceComparison === 'cheaper' ? checkmarkCircleOutline : alertCircleOutline} className="text-xl" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">
                                        {priceComparison === 'cheaper' ? 'Great Deal! ✅' :
                                            priceComparison === 'expensive' ? 'Pricey! ❌' : 'Standard Price'}
                                    </p>
                                    <p className="text-xs opacity-90">
                                        {priceComparison === 'cheaper' ? 'Cheaper than your last buy.' :
                                            'More expensive than usual.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <IonButton
                            expand="block"
                            onClick={handleConfirm}
                            disabled={!price || !size || !unit}
                            className={`h-14 font-bold rounded-2xl shadow-floating transition-transform mt-6 ${(!price || !size || !unit) ? 'opacity-50' : 'hover:scale-[1.02]'
                                }`}
                            shape="round"
                        >
                            Confirm Purchase
                        </IonButton>

                    </div>
                </div>
            </div>
        </IonModal>
    );
};

export default CheckoutModal;
