import React, { useState, useEffect } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonInput, IonIcon } from '@ionic/react';
import { closeOutline, checkmarkCircleOutline, alertCircleOutline, pricetagOutline, cubeOutline, storefrontOutline, searchOutline } from 'ionicons/icons';
import { supabase } from '../services/supabaseClient';
import { localStoreService } from '../services/localService';
import type { ShoppingItem } from '../types/supabase';
import { modalEnterAnimation, modalLeaveAnimation } from '../utils/animations';
import { detectCategory } from '../utils/categoryHelper';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ShoppingItem | null;

    onConfirm: (finalPrice: number, totalSize: number, baseUnit: string, itemName: string, category?: string, storeName?: string) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, item, onConfirm }) => {
    const [price, setPrice] = useState<string>('');
    const [size, setSize] = useState<string>('');
    const [unit, setUnit] = useState<string>('');
    const [itemName, setItemName] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Store State
    const [store, setStore] = useState<string>('');
    const [storeSearchTerm, setStoreSearchTerm] = useState<string>('');
    const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
    const [availableStores, setAvailableStores] = useState<string[]>([]);

    const CATEGORIES = [
        'Sayuran & Buah', 'Daging & Ikan', 'Produk Susu & Telur', 'Roti & Kue',
        'Bahan Masakan', 'Makanan Ringan', 'Minuman', 'Makanan Beku',
        'Perawatan Diri', 'Kesehatan & Obat', 'Perlengkapan Bayi',
        'Peralatan Rumah', 'Pembersih Rumah', 'Hewan Peliharaan',
        'Elektronik', 'Hobi & Mainan', 'Lainnya'
    ].sort();

    const filteredCategories = CATEGORIES.filter(c =>
        c.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStores = availableStores.filter(s =>
        s.toLowerCase().includes(storeSearchTerm.toLowerCase())
    );

    useEffect(() => {
        const loadStores = async () => {
            const stores = await localStoreService.getStores('guest_household');
            setAvailableStores(stores);
        };
        loadStores();
    }, [isOpen]);

    // Smart Logic State
    const [lastPrice, setLastPrice] = useState<number | null>(null);
    const [priceComparison, setPriceComparison] = useState<'cheaper' | 'expensive' | 'same' | null>(null);



    useEffect(() => {
        if (item) {
            setPrice('');
            setSize(item.quantity.toString());
            setUnit(item.unit);
            setItemName(item.item_name);

            // Auto-detect category
            // Auto-detect category
            const detected = detectCategory(item.item_name);
            const defaultCategory = detected || 'Lainnya';
            setCategory(defaultCategory);
            setSearchTerm(defaultCategory);

            setStore('');
            setStoreSearchTerm('');
            setIsStoreDropdownOpen(false);

            setIsDropdownOpen(false);
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

    const handleConfirm = async () => {
        if (price && size && unit && itemName) {
            const finalStore = store.trim();
            if (finalStore) {
                await localStoreService.addStore('guest_household', finalStore);
            }
            onConfirm(parseFloat(price), parseFloat(size), unit, itemName, category || undefined, finalStore || undefined);
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
                        <IonTitle className="text-base">Confirm Purchase</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={onClose} className="text-gray-500">
                                <IonIcon icon={closeOutline} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <div className="p-4 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4 pt-2">

                        <div className="text-center animate-enter-up">
                            {/* Editable Item Name */}
                            <div className="bg-gray-50 rounded-xl px-3 py-1 mb-1 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <IonInput
                                    value={itemName}
                                    onIonChange={e => setItemName(e.detail.value!)}
                                    className="font-bold text-base text-center text-text-main"
                                    placeholder="Item Name"
                                />
                            </div>
                            <p className="text-text-muted text-[10px]">Enter details to save to history.</p>
                        </div>

                        <div className="grid grid-cols-12 gap-2 animate-enter-up" style={{ animationDelay: '0.1s' }}>
                            {/* Price Input (6 cols) */}
                            <div className="col-span-6 bg-gray-50 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <div className="flex items-center gap-1 mb-0.5">
                                    <IonIcon icon={pricetagOutline} className="text-gray-400 text-[10px]" />
                                    <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Price</label>
                                </div>
                                <IonInput
                                    type="number"
                                    placeholder="0"
                                    value={price}
                                    onIonChange={e => setPrice(e.detail.value!)}
                                    className="font-bold text-base -mt-0.5 text-text-main"
                                />
                            </div>

                            {/* Size (3 cols) */}
                            <div className="col-span-3 bg-gray-50 rounded-xl px-2 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <div className="flex items-center gap-1 mb-0.5">
                                    <IonIcon icon={cubeOutline} className="text-gray-400 text-[10px]" />
                                    <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Size</label>
                                </div>
                                <IonInput
                                    type="number"
                                    placeholder="0"
                                    value={size}
                                    onIonChange={e => setSize(e.detail.value!)}
                                    className="font-bold text-sm -mt-0.5 text-text-main"
                                />
                            </div>

                            {/* Unit (3 cols) */}
                            <div className="col-span-3 bg-gray-50 rounded-xl px-2 py-1.5 flex flex-col justify-center focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-0.5 text-center block">Unit</label>
                                <IonInput
                                    value={unit}
                                    placeholder="Pcs"
                                    onIonChange={e => setUnit(e.detail.value!)}
                                    className="text-center font-bold text-sm -mt-0.5 text-text-main"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category Selection (Searchable) */}
                    <div className="mt-3" style={{ animationDelay: '0.2s' }}>
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Category (Optional)</label>
                        <div className="relative">
                            <IonInput
                                value={searchTerm}
                                onIonChange={e => {
                                    setSearchTerm(e.detail.value!);
                                    setCategory(e.detail.value!); // Allow custom input
                                    setIsDropdownOpen(true);
                                }}
                                onIonFocus={() => setIsDropdownOpen(true)}
                                placeholder="Search or type category..."
                                className="w-full bg-gray-50 text-text-main font-medium rounded-xl px-3 py-1.5 text-xs --padding-start: 12px"
                            />

                            {isDropdownOpen && filteredCategories.length > 0 && (
                                <div
                                    className="absolute left-0 right-0 mt-2 !bg-white rounded-xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto z-[9999] opacity-100"
                                    style={{
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    {filteredCategories.map(cat => (
                                        <div
                                            key={cat}
                                            onClick={() => {
                                                setCategory(cat);
                                                setSearchTerm(cat);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 font-medium truncate"
                                            style={{ backgroundColor: '#ffffff' }}
                                        >
                                            {cat}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Store Selection (Searchable) */}
                    <div className="mt-2" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                            <IonIcon icon={storefrontOutline} className="text-gray-400 text-[10px]" />
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Store (Optional)</label>
                        </div>
                        <div className="relative">
                            <IonIcon icon={searchOutline} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10" />
                            <IonInput
                                value={storeSearchTerm}
                                onIonChange={e => {
                                    setStoreSearchTerm(e.detail.value!);
                                    setStore(e.detail.value!); // Allow custom input
                                    setIsStoreDropdownOpen(true);
                                }}
                                onIonFocus={() => setIsStoreDropdownOpen(true)}
                                placeholder="Search or enter store..."
                                className="w-full bg-gray-50 text-text-main font-medium rounded-xl px-3 py-1.5 text-xs --padding-start: 32px"
                            />

                            {isStoreDropdownOpen && (filteredStores.length > 0 || storeSearchTerm) && (
                                <div
                                    className="absolute left-0 right-0 mt-2 !bg-white rounded-xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto z-[9999] opacity-100"
                                    style={{
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    {filteredStores.map(s => (
                                        <div
                                            key={s}
                                            onClick={() => {
                                                setStore(s);
                                                setStoreSearchTerm(s);
                                                setIsStoreDropdownOpen(false);
                                            }}
                                            className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 font-medium truncate"
                                            style={{ backgroundColor: '#ffffff' }}
                                        >
                                            {s}
                                        </div>
                                    ))}
                                    {storeSearchTerm && !filteredStores.includes(storeSearchTerm) && (
                                        <div
                                            onClick={() => {
                                                setStore(storeSearchTerm);
                                                setIsStoreDropdownOpen(false);
                                            }}
                                            className="px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer font-bold"
                                            style={{ backgroundColor: '#ffffff' }}
                                        >
                                            + Add "{storeSearchTerm}"
                                        </div>
                                    )}
                                </div>
                            )}
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
                        disabled={!price || !size || !unit || !itemName}
                        className={`h-12 font-bold rounded-xl shadow-floating transition-transform mt-4 ${(!price || !size || !unit || !itemName) ? 'opacity-50' : 'hover:scale-[1.02]'
                            }`}
                        shape="round"
                    >
                        Confirm Purchase
                    </IonButton>

                </div>
            </div>
        </IonModal>
    );
};

export default CheckoutModal;
