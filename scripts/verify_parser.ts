
import { parseVoiceInput } from '../src/utils/textParser';

const testCases = [
    { input: "Susu merk Ultra Milk 1 liter", expected: { name: "Susu", brand: "Ultra Milk", qty: 1, unit: "liter" } },
    { input: "Kecap brand Bango 2 botol", expected: { name: "Kecap", brand: "Bango", qty: 2, unit: "pcs" } }, // Assumes botol -> pcs mapping or similar if strict
    { input: "Roti dari Sari Roti 1 bungkus", expected: { name: "Roti", brand: "Sari Roti", qty: 1, unit: "pcs" } }, // Assumes bungkus -> pcs
    { input: "Susu Ultra Milk 1 liter", expected: { name: "Susu Ultra Milk", brand: undefined, qty: 1, unit: "liter" } }
];

console.log("Running Text Parser Verification...");
let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
    const result = parseVoiceInput(test.input, 'id-ID');

    // Normalize unit for comparison (the parser maps 'botol' to 'pcs', 'bungkus' to 'pcs')
    // We should check if the actual unit matches the expected unit OR if the mapping is correct.
    // In textParser.ts, 'botol' and 'bungkus' are in 'pcs' array. So parser returns 'pcs'.

    const nameMatch = result.name === test.expected.name;
    const brandMatch = result.brand === test.expected.brand;
    const qtyMatch = result.qty === test.expected.qty;
    const unitMatch = result.unit === test.expected.unit;

    if (nameMatch && brandMatch && qtyMatch && unitMatch) {
        console.log(`[PASS] Case ${index + 1}: ${test.input}`);
        passed++;
    } else {
        console.log(`[FAIL] Case ${index + 1}: ${test.input}`);
        console.log(`   Expected:`, test.expected);
        console.log(`   Actual:  `, result);
        failed++;
    }
});

console.log(`\nResults: ${passed} Passed, ${failed} Failed.`);
if (failed > 0) process.exit(1);
