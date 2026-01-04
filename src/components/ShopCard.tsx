import React from 'react';
import { IonIcon, IonCheckbox } from '@ionic/react';
import { trashOutline } from 'ionicons/icons';
import type { ShoppingItem } from '../services/types';

interface ShopCardProps {
    item: ShoppingItem;
    onToggle: (id: string, isPurchased: boolean) => void;
    onDelete: (id: string) => void;
    onEdit?: (item: ShoppingItem) => void;
}

const ShopCard: React.FC<ShopCardProps> = ({ item, onToggle, onDelete, onEdit }) => {
    return (
        <div className={`shop-card ${item.is_purchased ? 'bg-gray-50' : 'bg-white'}`}>

            <div className="flex items-center gap-3 flex-1">
                {/* Checkbox Bulat */}
                <div onClick={(e) => {
                    e.stopPropagation();
                    onToggle(item.id, !item.is_purchased);
                }}>
                    <IonCheckbox
                        mode="ios"
                        checked={item.is_purchased}
                        className="pointer-events-none" // Handle click on parent div for better target
                    />
                </div>

                <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onEdit && onEdit(item)}
                >
                    {/* Typography Token: text-main & text-muted */}
                    <h3 className={`font-bold text-lg ${item.is_purchased ? 'text-done' : 'text-text-main'}`}>
                        {item.item_name}
                    </h3>
                    <p className="text-sm text-text-muted">
                        {item.quantity} {item.unit}
                    </p>
                </div>
            </div>

            {/* Delete Button (Danger Color) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                }}
                className="text-gray-300 hover:text-danger transition-colors p-2 active:text-danger"
            >
                <IonIcon icon={trashOutline} size="large" />
            </button>

        </div>
    );
};

export default ShopCard;
