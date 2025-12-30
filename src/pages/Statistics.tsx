import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonIcon, IonSegment, IonSegmentButton } from '@ionic/react';
import { pieChartOutline, walletOutline, trendingUpOutline } from 'ionicons/icons';
import { STORAGE_KEYS } from '../services/localService';
import type { TransactionHistory } from '../services/types';
import { calculateTotalSpending, groupSpendingByCategory } from '../utils/statisticsHelper';
import type { CategoryStat } from '../utils/statisticsHelper';

const Statistics: React.FC = () => {
    const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
    const [stats, setStats] = useState<CategoryStat[]>([]);
    const [totalSpending, setTotalSpending] = useState(0);
    const [filter, setFilter] = useState<'month' | 'all'>('month');

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        let data: TransactionHistory[] = [];

        const localData = localStorage.getItem(STORAGE_KEYS.HISTORY);
        data = localData ? JSON.parse(localData) : [];

        // Filter Data
        if (filter === 'month') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            data = data.filter(t => new Date(t.purchased_at) >= startOfMonth);
        }

        setTransactions(data);
        setTotalSpending(calculateTotalSpending(data));
        setStats(groupSpendingByCategory(data));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };



    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonTitle>Statistics</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="bg-gray-50">
                <div className="p-4 space-y-6 pb-20">

                    {/* Filter Segment */}
                    <div className="bg-gray-100 p-1 rounded-xl">
                        <IonSegment value={filter} onIonChange={e => setFilter(e.detail.value as any)} mode="ios">
                            <IonSegmentButton value="month">
                                <IonLabel>This Month</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="all">
                                <IonLabel>All Time</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                    </div>

                    {/* Total Spending Card */}
                    <div className="bg-gradient-primary rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-blue-100 font-medium mb-1">Total Spending</p>
                            <h1 className="text-3xl font-bold">{formatCurrency(totalSpending)}</h1>
                            <div className="flex items-center gap-2 mt-4 text-sm bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                                <IonIcon icon={walletOutline} />
                                <span>{transactions.length} Transactions</span>
                            </div>
                        </div>
                        <IonIcon icon={pieChartOutline} className="absolute -bottom-4 -right-4 text-9xl text-white/10 rotate-12" />
                    </div>

                    {/* Category Breakdown */}
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 mb-3 px-1">Spending by Category</h3>
                        <div className="space-y-3">
                            {stats.map((stat, index) => (
                                <div key={stat.category} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                                                ${index === 0 ? 'bg-red-100 text-red-600' :
                                                    index === 1 ? 'bg-orange-100 text-orange-600' :
                                                        index === 2 ? 'bg-yellow-100 text-yellow-600' :
                                                            'bg-blue-100 text-blue-600'
                                                }`}>
                                                {stat.category.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{stat.category}</p>
                                                <p className="text-xs text-gray-500">{stat.count} items</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">{formatCurrency(stat.total)}</p>
                                            <p className="text-xs text-gray-500">{stat.percentage.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : index === 2 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                            style={{ width: `${stat.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {stats.length === 0 && (
                                <div className="text-center py-10 text-gray-400">
                                    <IonIcon icon={trendingUpOutline} className="text-4xl mb-2" />
                                    <p>No spending data yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions (Read Only) */}
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 mb-3 px-1">Recent Transactions</h3>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            {transactions.slice(0, 5).map((t, i) => (
                                <div
                                    key={t.id}
                                    className={`p-4 flex justify-between items-center ${i !== 4 ? 'border-b border-gray-100' : ''}`}
                                >
                                    <div>
                                        <p className="font-bold text-gray-800">{t.item_name}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(t.purchased_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-blue-600">{formatCurrency(t.final_price)}</p>
                                    </div>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <div className="p-6 text-center text-gray-400 text-sm">
                                    No transactions found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Statistics;
