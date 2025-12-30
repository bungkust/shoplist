import type { TransactionHistory } from '../services/types';

export interface CategoryStat {
    category: string;
    total: number;
    percentage: number;
    count: number;
}

export const calculateTotalSpending = (transactions: TransactionHistory[]): number => {
    return transactions.reduce((sum, t) => sum + t.final_price, 0);
};

export const groupSpendingByCategory = (transactions: TransactionHistory[]): CategoryStat[] => {
    const totalSpending = calculateTotalSpending(transactions);
    const groups: Record<string, { total: number; count: number }> = {};

    transactions.forEach(t => {
        const category = t.category || 'Lainnya';
        if (!groups[category]) {
            groups[category] = { total: 0, count: 0 };
        }
        groups[category].total += t.final_price;
        groups[category].count += 1;
    });

    return Object.entries(groups)
        .map(([category, data]) => ({
            category,
            total: data.total,
            count: data.count,
            percentage: totalSpending > 0 ? (data.total / totalSpending) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total);
};
