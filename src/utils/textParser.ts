export interface ParsedItem {
    raw: string;
    name: string;
    qty: number;
    unit: string;
}

const UNITS_ID = {
    'kg': ['kg', 'kilo', 'kilogram'],
    'liter': ['liter', 'ltr', 'l'],
    'pcs': ['buah', 'biji', 'pcs', 'bungkus', 'pack', 'kaleng', 'botol', 'ikat', 'sisir', 'papan', 'kotak', 'sachet'],
    'ons': ['ons'],
    'gram': ['gram', 'gr', 'g']
};

const UNITS_EN = {
    'kg': ['kg', 'kilo', 'kilogram'],
    'liter': ['liter', 'ltr', 'l'],
    'pcs': ['piece', 'pcs', 'pack', 'bag', 'can', 'bottle', 'bunch', 'box', 'sachet'],
    'lb': ['lb', 'pound', 'lbs'],
    'oz': ['oz', 'ounce']
};

const NUMBER_WORDS_ID: { [key: string]: number } = {
    'satu': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5,
    'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9, 'sepuluh': 10,
    'sebelas': 11, 'seratus': 100,
    'setengah': 0.5, 'seperempat': 0.25
};

const NUMBER_WORDS_EN: { [key: string]: number } = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12,
    'half': 0.5, 'quarter': 0.25, 'a': 1, 'an': 1
};

const getUnitFromWord = (word: string, lang: 'id-ID' | 'en-US'): string | null => {
    const map = lang === 'id-ID' ? UNITS_ID : UNITS_EN;
    const cleanWord = word.toLowerCase().replace(/[.,]$/, ''); // Remove trailing punctuation
    for (const [standard, variants] of Object.entries(map)) {
        if (variants.includes(cleanWord)) return standard;
    }
    return null;
};

const parseNumber = (text: string, lang: 'id-ID' | 'en-US'): number | null => {
    const cleanText = text.toLowerCase().replace(',', '.');
    const num = parseFloat(cleanText);
    if (!isNaN(num)) return num;

    const wordMap = lang === 'id-ID' ? NUMBER_WORDS_ID : NUMBER_WORDS_EN;
    return wordMap[cleanText] || null;
};

export const parseVoiceInput = (text: string, lang: 'id-ID' | 'en-US' = 'id-ID'): ParsedItem => {
    // 1. Clean and split text
    const rawClean = text.trim();
    const words = rawClean.split(/\s+/);

    if (words.length === 0) return { raw: text, name: '', qty: 1, unit: 'pcs' };

    let qty = 1;
    let unit = 'pcs';
    let nameWords = [...words];

    // 2. Right-to-Left Parsing

    // Step A: Check Last Word for Unit
    const lastWord = nameWords[nameWords.length - 1];
    const detectedUnit = getUnitFromWord(lastWord, lang);

    if (detectedUnit) {
        unit = detectedUnit;
        nameWords.pop(); // Remove unit from name

        // Step B: Check Word Before Unit for Quantity
        if (nameWords.length > 0) {
            const secondLastWord = nameWords[nameWords.length - 1];
            const detectedQty = parseNumber(secondLastWord, lang);

            if (detectedQty !== null) {
                qty = detectedQty;
                nameWords.pop(); // Remove qty from name
            }
        }
    } else {
        // No Unit detected, check if last word is Quantity (e.g. "Roti tawar satu")
        const detectedQty = parseNumber(lastWord, lang);
        if (detectedQty !== null) {
            qty = detectedQty;
            nameWords.pop();
        }
    }

    // Step C: Remaining words are Item Name
    // Remove common prefixes if they exist at the start (e.g. "Beli", "Tolong catat")
    let name = nameWords.join(' ');
    const prefixRegex = /^(beli|buy|tambahkan|add|catat|note)\s+/i;
    name = name.replace(prefixRegex, '');

    return {
        raw: text,
        name: name || 'Item', // Fallback if name is empty
        qty,
        unit
    };
};
