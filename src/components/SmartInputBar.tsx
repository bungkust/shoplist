import React, { useState } from 'react';
import { IonInput, IonIcon } from '@ionic/react';
import { sendOutline } from 'ionicons/icons';
import { parseVoiceInput } from '../utils/textParser';

interface SmartInputBarProps {
    onAdd: (item: { item_name: string; quantity: number; unit: string }) => void;
}

const SmartInputBar: React.FC<SmartInputBarProps> = ({ onAdd }) => {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        if (!text.trim()) return;

        const parsed = parseVoiceInput(text, 'id-ID'); // Default to ID for now

        // Fallback if parsing fails to find a name (should rarely happen with current logic)
        const name = parsed.name || text;
        const qty = parsed.qty || 1;
        const unit = parsed.unit || 'pcs';

        onAdd({
            item_name: name,
            quantity: qty,
            unit: unit
        });

        setText('');
    };

    return (
        <div className="sticky top-0 z-20 pt-2 pb-4 px-1">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-floating border border-white/50 p-2 flex items-center gap-2 transition-all duration-300 focus-within:shadow-glow focus-within:border-blue-100 focus-within:bg-white">
                <div className="flex-1 pl-2">
                    <IonInput
                        value={text}
                        placeholder="Add item (e.g. 'Milk 2 liters')"
                        onIonChange={e => setText(e.detail.value!)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                handleSubmit();
                            }
                        }}
                        className="text-base font-medium text-text-main placeholder:text-gray-400"
                        style={{ '--padding-start': '0' }}
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={!text.trim()}
                    className={`
                        h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300
                        ${text.trim()
                            ? 'bg-gradient-primary text-white shadow-lg scale-100 rotate-0'
                            : 'bg-gray-100 text-gray-300 scale-95 rotate-12'}
                    `}
                >
                    <IonIcon icon={sendOutline} className="text-xl" />
                </button>
            </div>
        </div>
    );
};

export default SmartInputBar;
