import React, { useState } from 'react';
import { IonInput, IonButton, IonIcon } from '@ionic/react';
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
        <div className="sticky top-0 z-10 bg-app-bg pt-2 pb-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex items-center gap-2">
                <div className="flex-1">
                    <IonInput
                        value={text}
                        placeholder="Type item (e.g. Bread 2 pcs)"
                        onIonChange={e => setText(e.detail.value!)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                handleSubmit();
                            }
                        }}
                        className="text-sm"
                    />
                </div>
                <IonButton
                    fill="clear"
                    size="small"
                    onClick={handleSubmit}
                    disabled={!text.trim()}
                    className="m-0 h-8"
                >
                    <IonIcon slot="icon-only" icon={sendOutline} />
                </IonButton>
            </div>
        </div>
    );
};

export default SmartInputBar;
