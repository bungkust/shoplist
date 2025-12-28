import React, { useState, useEffect, useMemo } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonIcon, IonSearchbar } from '@ionic/react';
import { closeOutline, chevronForwardOutline, cartOutline } from 'ionicons/icons';
import type { ListMaster } from '../types/supabase';

interface ListSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    lists: ListMaster[];
    onSelect: (listId: string) => void;
}

const ListSelectionModal: React.FC<ListSelectionModalProps> = ({ isOpen, onClose, lists, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Reset search when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    const filteredLists = useMemo(() => {
        return lists.filter(list => list.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [lists, searchTerm]);

    const handleSelect = (listId: string) => {
        onSelect(listId);
        onClose();
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} initialBreakpoint={0.6} breakpoints={[0, 0.6, 1]}>
            <div className="flex flex-col h-full bg-white">
                <IonHeader className="ion-no-border">
                    <IonToolbar>
                        <IonTitle>Select List</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={onClose}>
                                <IonIcon icon={closeOutline} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                    <div className="px-4 pb-2">
                        <IonSearchbar
                            value={searchTerm}
                            onIonInput={e => setSearchTerm(e.detail.value!)}
                            placeholder="Search lists..."
                            className="searchbar-custom"
                        />
                    </div>
                </IonHeader>

                <IonContent className="ion-padding-horizontal">
                    <div className="space-y-2 pb-4">
                        {filteredLists.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                No lists found
                            </div>
                        ) : (
                            filteredLists.map(list => (
                                <div
                                    key={list.id}
                                    onClick={() => handleSelect(list.id)}
                                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <IonIcon icon={cartOutline} />
                                        </div>
                                        <span className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                                            {list.name}
                                        </span>
                                    </div>
                                    <IonIcon icon={chevronForwardOutline} className="text-gray-300 group-hover:text-blue-500" />
                                </div>
                            ))
                        )}
                    </div>
                </IonContent>
            </div>
        </IonModal>
    );
};

export default ListSelectionModal;
