export const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Sayuran & Buah': ['apel', 'jeruk', 'pisang', 'mangga', 'anggur', 'bayam', 'kangkung', 'wortel', 'tomat', 'cabe', 'bawang', 'kentang', 'ubi', 'jagung', 'brokoli', 'sawi', 'timun', 'terong', 'labu', 'jamur', 'buah', 'sayur', 'salad', 'petai', 'jengkol'],
    'Daging & Ikan': ['ayam', 'sapi', 'kambing', 'ikan', 'udang', 'cumi', 'kepiting', 'kerang', 'lele', 'gurame', 'nila', 'salmon', 'tuna', 'sarden', 'kornet', 'sosis', 'bakso', 'nugget', 'daging', 'fillet', 'steak', 'iga', 'buntut'],
    'Produk Susu & Telur': ['susu', 'telur', 'keju', 'yogurt', 'mentega', 'margarin', 'krim', 'yakult', 'cimory', 'greenfields', 'diamond', 'ultra'],
    'Roti & Kue': ['roti', 'kue', 'donat', 'biskuit', 'wafer', 'coklat', 'permen', 'snack', 'keripik', 'chiki', 'tarr', 'bolu', 'brownies', 'pudding', 'agar'],
    'Bahan Masakan': ['beras', 'minyak', 'gula', 'garam', 'kecap', 'saus', 'sambal', 'tepung', 'bumbu', 'penyedap', 'merica', 'ketumbar', 'kunyit', 'jahe', 'lengkuas', 'santan', 'kara', 'mie', 'pasta', 'spaghetti', 'makaroni', 'bihun', 'soun', 'royco', 'masako', 'micin', 'msg', 'terasi'],
    'Minuman': ['air', 'aqua', 'teh', 'kopi', 'sirup', 'jus', 'soda', 'cola', 'fanta', 'sprite', 'pocari', 'mizone', 'beer', 'bir', 'alkohol', 'wine', 'latte', 'espresso', 'cappuccino', 'boba'],
    'Makanan Beku': ['es krim', 'ice cream', 'frozen', 'kentang goreng', 'french fries', 'nugget', 'sosis'],
    'Perawatan Diri': ['sabun', 'shampoo', 'sampo', 'odol', 'pasta gigi', 'sikat gigi', 'deodoran', 'parfum', 'lotion', 'bedak', 'lipstik', 'makeup', 'skincare', 'masker', 'tisu', 'kapas', 'pembalut', 'cotton', 'serum', 'toner'],
    'Kesehatan & Obat': ['obat', 'vitamin', 'suplemen', 'betadine', 'hansaplast', 'masker medis', 'termometer', 'tolak angin', 'minyak kayu putih', 'paracetamol', 'panadol', 'bodrex'],
    'Perlengkapan Bayi': ['popok', 'pampers', 'susu bayi', 'bubur bayi', 'minyak telon', 'bedak bayi', 'tisu basah', 'mamypoko', 'sweety'],
    'Peralatan Rumah': ['sapu', 'pel', 'ember', 'gayung', 'piring', 'gelas', 'sendok', 'garpu', 'pisau', 'wajan', 'panci', 'kompor', 'gas', 'baterai', 'lampu', 'bohlam', 'korek'],
    'Pembersih Rumah': ['deterjen', 'rinso', 'molto', 'sabun cuci', 'sunlight', 'mama lemon', 'pembersih lantai', 'karbol', 'wipol', 'baygon', 'vape', 'kamper', 'soklin', 'downy'],
    'Hewan Peliharaan': ['makanan kucing', 'whiskas', 'makanan anjing', 'pedigree', 'pasir kucing', 'royal canin', 'me-o'],
    'Elektronik': ['kabel', 'charger', 'headset', 'earphone', 'powerbank', 'mouse', 'keyboard', 'usb', 'flashdisk'],
    'Hobi & Mainan': ['mainan', 'bola', 'raket', 'buku', 'pensil', 'pulpen', 'kertas', 'spidol', 'crayon']
};

export const detectCategory = (itemName: string): string | null => {
    if (!itemName) return null;

    const lowerName = itemName.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(keyword => lowerName.includes(keyword))) {
            return category;
        }
    }

    return null;
};
