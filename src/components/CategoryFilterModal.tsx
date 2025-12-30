import React, { useState, useEffect, useMemo } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonSearchbar, IonFooter } from '@ionic/react';
import { closeOutline, checkmarkDoneOutline, trashOutline } from 'ionicons/icons';

interface CategoryFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    selectedCategories: string[];
    onApply: (selected: string[]) => void;
}

const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({ isOpen, onClose, categories, selectedCategories, onApply }) => {
    const [tempSelected, setTempSelected] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Sync temp state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempSelected(selectedCategories);
            setSearchTerm('');
        }
    }, [isOpen, selectedCategories]);

    const filteredCategories = useMemo(() => {
        return categories.filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [categories, searchTerm]);

    const toggleCategory = (cat: string) => {
        setTempSelected(prev => {
            if (prev.includes(cat)) {
                return prev.filter(c => c !== cat);
            } else {
                return [...prev, cat];
            }
        });
    };

    const handleApply = () => {
        onApply(tempSelected);
        onClose();
    };

    const handleReset = () => {
        setTempSelected([]);
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} initialBreakpoint={0.75} breakpoints={[0, 0.5, 0.75, 1]}>
            <div className="flex flex-col h-full bg-white">
                <IonHeader className="ion-no-border">
                    <IonToolbar>
                        <IonTitle>Filter Category</IonTitle>
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
                            placeholder="Search categories..."
                            className="searchbar-custom"
                        />
                    </div>
                </IonHeader>

                <div className="flex-1 overflow-y-auto px-4">
                    <div className="space-y-1">
                        {filteredCategories.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                No categories found
                            </div>
                        ) : (
                            filteredCategories.map(cat => (
                                <div
                                    key={cat}
                                    onClick={() => toggleCategory(cat)}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer
                                        ${tempSelected.includes(cat)
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-100 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className={`font-medium ${tempSelected.includes(cat) ? 'text-blue-700' : 'text-gray-700'}`}>
                                        {cat}
                                    </span>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                        ${tempSelected.includes(cat)
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-300'
                                        }`}
                                    >
                                        {tempSelected.includes(cat) && (
                                            <IonIcon icon={checkmarkDoneOutline} className="text-white text-sm" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <IonFooter className="ion-no-border p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-3">
                        <button
                            onClick={handleReset}
                            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <IonIcon icon={trashOutline} />
                            Reset
                        </button>
                        <button
                            onClick={handleApply}
                            className="flex-[2] py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            Apply Filter ({tempSelected.length})
                        </button>
                    </div>
                </IonFooter>
            </div>
        </IonModal>
    );
};

export default CategoryFilterModal;
