
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

const NUMBER_WORDS_ID = {
    'satu': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5,
    'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9, 'sepuluh': 10,
    'sebelas': 11, 'seratus': 100,
    'setengah': 0.5, 'seperempat': 0.25
};

const NUMBER_WORDS_EN = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12,
    'half': 0.5, 'quarter': 0.25, 'a': 1, 'an': 1
};

const getUnitFromWord = (word, lang) => {
    const map = lang === 'id-ID' ? UNITS_ID : UNITS_EN;
    const cleanWord = word.toLowerCase().replace(/[.,]$/, '');

    for (const [standard, variants] of Object.entries(map)) {
        if (variants.includes(cleanWord)) return standard;
    }

    for (const [standard, variants] of Object.entries(map)) {
        for (const variant of variants) {
            if (cleanWord.endsWith(variant) && cleanWord.length > variant.length) {
                const prefix = cleanWord.substring(0, cleanWord.length - variant.length);
                if (!isNaN(parseFloat(prefix))) {
                    return standard;
                }
            }
        }
    }

    return null;
};

const parseNumber = (text, lang) => {
    const cleanText = text.toLowerCase().replace(',', '.');

    const num = parseFloat(cleanText);
    if (!isNaN(num)) return num;

    const wordMap = lang === 'id-ID' ? NUMBER_WORDS_ID : NUMBER_WORDS_EN;
    if (wordMap[cleanText]) return wordMap[cleanText];

    const match = cleanText.match(/^(\d+(\.\d+)?)/);
    if (match) {
        return parseFloat(match[1]);
    }

    return null;
};

const parseVoiceInput = (text, lang = 'id-ID') => {
    const rawClean = text.trim();
    const words = rawClean.split(/\s+/);

    if (words.length === 0) return { raw: text, name: '', qty: 1, unit: 'pcs' };

    let qty = 1;
    let unit = 'pcs';
    let nameWords = [...words];

    const lastWord = nameWords[nameWords.length - 1];
    const detectedUnit = getUnitFromWord(lastWord, lang);

    if (detectedUnit) {
        unit = detectedUnit;

        const cleanLast = lastWord.toLowerCase().replace(',', '.');
        const match = cleanLast.match(/^(\d+(\.\d+)?)/);

        if (match) {
            qty = parseFloat(match[1]);
            nameWords.pop();
        } else {
            nameWords.pop();

            if (nameWords.length > 0) {
                const secondLastWord = nameWords[nameWords.length - 1];
                const detectedQty = parseNumber(secondLastWord, lang);

                if (detectedQty !== null) {
                    qty = detectedQty;
                    nameWords.pop();
                }
            }
        }
    } else {
        const detectedQty = parseNumber(lastWord, lang);
        if (detectedQty !== null) {
            qty = detectedQty;
            nameWords.pop();
        }
    }

    let name = nameWords.join(' ');
    const prefixRegex = /^(beli|buy|tambahkan|add|catat|note)\s+/i;
    name = name.replace(prefixRegex, '');

    return {
        raw: text,
        name: name || 'Item',
        qty,
        unit
    };
};

// Test Cases
console.log("--- Testing 'en-US' ---");
console.log("telur 1 kilo:", parseVoiceInput("telur 1 kilo", "en-US"));
console.log("telur 1kilo:", parseVoiceInput("telur 1kilo", "en-US"));

console.log("\n--- Testing 'id-ID' ---");
console.log("telur 1 kilo:", parseVoiceInput("telur 1 kilo", "id-ID"));
console.log("telur 1kilo:", parseVoiceInput("telur 1kilo", "id-ID"));
console.log("telur satu kilo:", parseVoiceInput("telur satu kilo", "id-ID"));
