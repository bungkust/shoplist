import { localItemService, STORAGE_KEYS } from './src/services/localService.ts';

// Mock localStorage
const mockHistory = [
    {
        id: '1',
        item_name: 'Kopi Kapal Api',
        category: 'Minuman',
        purchased_at: new Date().toISOString(),
        final_price: 10000,
        total_size: 1,
        base_unit: 'pcs',
        household_id: 'guest_household'
    },
    {
        id: '2',
        item_name: 'Roti Tawar',
        category: 'Makanan',
        purchased_at: new Date().toISOString(),
        final_price: 15000,
        total_size: 1,
        base_unit: 'pcs',
        household_id: 'guest_household'
    },
    {
        id: '3',
        item_name: 'Teh Botol',
        category: 'Minuman',
        purchased_at: new Date().toISOString(),
        final_price: 5000,
        total_size: 1,
        base_unit: 'pcs',
        household_id: 'guest_household'
    }
];

const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock
});

// Setup data
localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(mockHistory));

async function runDebug() {
    console.log('--- Debugging History Filter ---');

    // Test 1: Fetch all
    const all = await localItemService.getHistory('guest_household');
    console.log(`Test 1 (All): Found ${all.length} items. Expected 3.`);

    // Test 2: Filter by Category 'Minuman'
    const minuman = await localItemService.getHistory('guest_household', 0, 20, '', ['Minuman']);
    console.log(`Test 2 (Category 'Minuman'): Found ${minuman.length} items. Expected 2.`);
    minuman.forEach(i => console.log(` - ${i.item_name} (${i.category})`));

    // Test 3: Filter by Category 'makanan' (case insensitive check?)
    // Note: The current implementation checks for exact match: categories.includes(itemCategory)
    const makanan = await localItemService.getHistory('guest_household', 0, 20, '', ['Makanan']);
    console.log(`Test 3 (Category 'Makanan'): Found ${makanan.length} items. Expected 1.`);

    // Test 4: Filter by Search 'roti'
    const roti = await localItemService.getHistory('guest_household', 0, 20, 'roti', []);
    console.log(`Test 4 (Search 'roti'): Found ${roti.length} items. Expected 1.`);

    // Test 5: Filter by Category 'Minuman' AND Search 'teh'
    const tehMinuman = await localItemService.getHistory('guest_household', 0, 20, 'teh', ['Minuman']);
    console.log(`Test 5 (Category 'Minuman' + Search 'teh'): Found ${tehMinuman.length} items. Expected 1.`);
}

runDebug();
