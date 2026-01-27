export interface ChangelogItem {
    message: string;
    type: 'new' | 'fix' | 'improvement';
}

export interface ReleaseNote {
    version: string;
    date: string;
    items: ChangelogItem[];
}

export const WHATS_NEW_DATA: ReleaseNote[] = [
    {
        version: '1.0.3',
        date: '2025-01-26',
        items: [
            { message: 'Added "What\'s New" in Settings', type: 'new' },
            { message: 'Full Brand support for Voice Input', type: 'improvement' },
            { message: 'Bug fixes and performance improvements', type: 'fix' },
        ]
    },
    {
        version: '1.0.2',
        date: '2025-01-26', // Updated to match user context roughly
        items: [
            { message: 'Added "Brand" field to shopping items', type: 'new' },
            { message: 'Improved voice input with Brand detection', type: 'improvement' },
            { message: 'Added voice format: [Item] [Brand] [Qty] [Unit]', type: 'new' },
        ]
    },
    {
        version: '1.0.1',
        date: '2025-01-24',
        items: [
            { message: 'Added Voice Input support', type: 'new' },
            { message: 'Added History & Spending tracking', type: 'new' },
            { message: 'Improved offline data sync', type: 'improvement' },
        ]
    },
    {
        version: '1.0.0',
        date: '2025-01-20',
        items: [
            { message: 'Initial Release', type: 'new' },
            { message: 'Manage multiple shopping lists', type: 'new' },
        ]
    }
];
