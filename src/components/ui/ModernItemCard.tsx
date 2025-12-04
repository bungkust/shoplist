// src/components/ui/ModernItemCard.tsx
import React from 'react';
import { IonIcon, IonCheckbox } from '@ionic/react';
import { trashOutline } from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface ModernItemCardProps {
    item: any; // Using any for now to match flexibility, but ideally should be ShoppingItem
    onToggle: (id: string, is_purchased: boolean) => void;
    onDelete: (id: string) => void;
    onEdit?: (item: any) => void;
}

const ModernItemCard: React.FC<ModernItemCardProps> = ({ item, onToggle, onDelete, onEdit }) => {
    return (
        // CONTAINER KARTU UTAMA
        // - animate-enter-up: Animasi masuk halus
        // - bg-white rounded-xl shadow-soft: Tampilan kartu modern
        // - active:scale-[0.98]: Efek ditekan (micro-interaction)
        <div
            className="animate-enter-up bg-white rounded-xl shadow-soft hover:shadow-medium border border-gray-50 p-4 mb-3 flex items-center justify-between transition-all duration-200 active:scale-[0.98] group"
            onClick={() => onEdit && onEdit(item)}
        >

            {/* Bagian Kiri: Checkbox & Teks */}
            <div className="flex items-center gap-4 flex-1">
                {/* Checkbox Bulat Modern */}
                <div
                    onClick={async (e) => {
                        e.stopPropagation();
                        await Haptics.impact({ style: ImpactStyle.Light });
                        onToggle(item.id, !item.is_purchased);
                    }}
                    className="relative cursor-pointer"
                >
                    <IonCheckbox
                        mode="ios" // Mode iOS lebih bulat & bersih
                        checked={item.is_purchased}
                        style={{
                            '--size': '26px',
                            '--border-radius': '50%',
                            '--checkbox-background-checked': 'var(--ion-color-primary)',
                            '--border-width': '2px',
                            '--border-color': '#cbd5e1' // Slate-300
                        }}
                    />
                </div>

                {/* Teks */}
                <div className="flex flex-col">
                    {/* Judul Barang */}
                    <span className={`text-lg font-semibold text-text-main transition-all duration-300 ${item.is_purchased ? 'line-through text-gray-400 decoration-2' : ''}`}>
                        {item.item_name}
                    </span>
                    {/* Detail Qty & Unit */}
                    <span className="text-sm text-text-muted">
                        {item.quantity} {item.unit}
                    </span>
                </div>
            </div>

            {/* Bagian Kanan: Tombol Hapus */}
            <button
                onClick={async (e) => {
                    e.stopPropagation(); // Supaya tidak memicu checkbox
                    await Haptics.impact({ style: ImpactStyle.Medium });
                    onDelete(item.id);
                }}
                // Touch target besar (p-3) tapi ikon kecil, agar mudah ditekan di HP
                className="p-3 text-gray-300 hover:text-red-500 transition-colors active:bg-gray-100 rounded-full"
            >
                <IonIcon icon={trashOutline} size="small" />
            </button>

        </div>
    );
};

export default ModernItemCard;
