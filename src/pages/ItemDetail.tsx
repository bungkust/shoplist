import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton, IonIcon, IonSpinner } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { walletOutline, timeOutline, storefrontOutline } from 'ionicons/icons';
import { supabase } from '../services/supabaseClient';
import { localItemService } from '../services/localService';
import { ENABLE_CLOUD_SYNC } from '../config';
import type { TransactionHistory } from '../types/supabase';

const ItemDetail: React.FC = () => {
    const { itemName } = useParams<{ itemName: string }>();
    const [history, setHistory] = useState<TransactionHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [decodedName, setDecodedName] = useState('');

    useEffect(() => {
        if (itemName) {
            const name = decodeURIComponent(itemName);
            setDecodedName(name);
            fetchItemHistory(name);
        }
    }, [itemName]);

    const fetchItemHistory = async (name: string) => {
        setLoading(true);
        if (!ENABLE_CLOUD_SYNC) {
            // Local Mode
            const allHistory = await localItemService.getHistory('guest_household', 0, 1000); // Fetch enough to filter
            const itemHistory = allHistory
                .filter(t => t.item_name === name)
                .sort((a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime());
            setHistory(itemHistory);
            setLoading(false);
            return;
        }

        // Cloud Mode
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('household_id')
            .eq('id', user.id)
            .single();

        if (profile && profile.household_id) {
            const { data } = await supabase
                .from('transaction_history')
                .select('*')
                .eq('household_id', profile.household_id)
                .eq('item_name', name)
                .order('purchased_at', { ascending: false });

            setHistory(data || []);
        }
        setLoading(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/history" />
                    </IonButtons>
                    <IonTitle>{decodedName}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="bg-gray-50">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <IonSpinner />
                    </div>
                ) : (
                    <div className="p-4 space-y-6 pb-20">
                        {/* Price Fluctuation Chart (Trend Line) */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Price Trend</h3>
                                <span className="text-gray-500 text-xs font-medium bg-gray-100 px-2 py-1 rounded-lg">
                                    {history.length} purchases
                                </span>
                            </div>
                            <div className="h-48 w-full bg-gray-50 rounded-2xl p-4 relative overflow-hidden border border-gray-100">
                                {(() => {
                                    const data = [...history].reverse(); // Oldest to Newest
                                    if (data.length < 2) {
                                        return (
                                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                                Not enough data for trend
                                            </div>
                                        );
                                    }

                                    const prices = data.map(d => d.final_price);
                                    const minPrice = Math.min(...prices);
                                    const maxPrice = Math.max(...prices);
                                    const range = maxPrice - minPrice || 1;

                                    const width = 300;
                                    const height = 120; // Slightly taller for page view
                                    const padding = 10;

                                    const points = data.map((d, i) => {
                                        const x = (i / (data.length - 1)) * width;
                                        const normalizedPrice = (d.final_price - minPrice) / range;
                                        const y = height - (normalizedPrice * (height - 2 * padding)) - padding;
                                        return `${x},${y}`;
                                    }).join(' ');

                                    const areaPath = `
                                      M 0,${height} 
                                      ${points.split(' ').map((p) => `L ${p}`).join(' ')} 
                                      L ${width},${height} Z
                                    `;

                                    return (
                                        <div className="relative h-full w-full flex flex-col justify-between">
                                            <div className="absolute top-0 left-0 right-0 flex justify-between text-[10px] font-bold text-gray-400 px-1">
                                                <span>{new Date(data[0].purchased_at).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })}</span>
                                                <span>{new Date(data[data.length - 1].purchased_at).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })}</span>
                                            </div>

                                            <div className="absolute inset-0 top-4 bottom-4">
                                                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                                    <defs>
                                                        <linearGradient id="trendGradientPage" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path d={areaPath} fill="url(#trendGradientPage)" />
                                                    <polyline
                                                        points={points}
                                                        fill="none"
                                                        stroke="#3b82f6"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    {data.map((d, i) => {
                                                        const x = (i / (data.length - 1)) * width;
                                                        const normalizedPrice = (d.final_price - minPrice) / range;
                                                        const y = height - (normalizedPrice * (height - 2 * padding)) - padding;
                                                        return (
                                                            <circle
                                                                key={i}
                                                                cx={x}
                                                                cy={y}
                                                                r="4"
                                                                className="fill-white stroke-blue-500 stroke-2"
                                                            />
                                                        );
                                                    })}
                                                </svg>
                                            </div>

                                            <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                High: {formatCurrency(maxPrice)}
                                            </div>
                                            <div className="absolute bottom-2 left-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                Low: {formatCurrency(minPrice)}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Purchase History List */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide ml-2">Purchase History</h3>
                            <div className="space-y-3">
                                {history.map((h, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                                                <IonIcon icon={walletOutline} className="text-xl" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-base">{h.list_name || 'Unknown List'}</p>
                                                {h.store_name && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                        <IonIcon icon={storefrontOutline} className="text-[10px]" />
                                                        {h.store_name}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <IonIcon icon={timeOutline} className="text-[10px]" />
                                                    {new Date(h.purchased_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-lg">{formatCurrency(h.final_price)}</p>
                                            <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-lg inline-block mt-1">
                                                {h.total_size} {h.base_unit}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default ItemDetail;
