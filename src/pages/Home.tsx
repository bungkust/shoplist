import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFab, IonFabButton, IonIcon, IonAlert, IonActionSheet, IonToast, IonButton } from '@ionic/react';
import { addOutline, listOutline, ellipsisVertical, trashOutline, createOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useLists } from '../hooks/useLists';
import type { ListMaster } from '../types/supabase';

const Home: React.FC = () => {
    // ... (state remains same)
    const [householdId, setHouseholdId] = useState<string | null>(null);
    const [isCreateAlertOpen, setIsCreateAlertOpen] = useState(false);
    const [isRenameAlertOpen, setIsRenameAlertOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedList, setSelectedList] = useState<ListMaster | null>(null);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const history = useHistory();

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('household_id')
                    .eq('id', user.id)
                    .single();
                if (data) setHouseholdId(data.household_id);
            }
        };
        getProfile();
    }, []);

    const { lists, loading, createList, updateList, deleteList } = useLists(householdId);

    const handleCreateList = async (name: string) => {
        if (name.trim()) {
            const result = await createList(name);
            if (result) {
                setToastMessage('List created successfully');
                setShowToast(true);
            } else {
                setToastMessage('Failed to create list');
                setShowToast(true);
            }
        }
    };

    const handleRenameList = async (name: string) => {
        if (selectedList && name.trim()) {
            const success = await updateList(selectedList.id, name);
            if (success) {
                setToastMessage('List renamed');
                setShowToast(true);
            } else {
                setToastMessage('Failed to rename list');
                setShowToast(true);
            }
            setSelectedList(null);
        }
    };

    const handleDeleteList = async () => {
        if (selectedList) {
            const success = await deleteList(selectedList.id);
            if (success) {
                setToastMessage('List deleted');
                setShowToast(true);
            } else {
                setToastMessage('Failed to delete list');
                setShowToast(true);
            }
            setSelectedList(null);
        }
    };

    const openOptions = (e: React.MouseEvent, list: ListMaster) => {
        e.stopPropagation();
        setSelectedList(list);
        setShowActionSheet(true);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My Lists</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-padding bg-app-bg">
                <div className="max-w-md mx-auto pb-20">

                    {loading ? (
                        <p className="text-center text-text-muted mt-10">Loading lists...</p>
                    ) : lists.length === 0 ? (
                        <div className="text-center mt-20 opacity-60">
                            <IonIcon icon={listOutline} className="text-6xl text-gray-300" />
                            <p className="text-text-muted mt-2">No shopping lists yet.</p>
                            <p className="text-sm text-gray-400">Tap + to create a new one.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            {lists.map(list => (
                                <div
                                    key={list.id}
                                    onClick={() => history.push(`/list/${list.id}`)}
                                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-95 transition-transform cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                            <IonIcon icon={listOutline} />
                                        </div>
                                        <h3 className="font-bold text-text-main text-lg">{list.name}</h3>
                                    </div>
                                    <IonButton fill="clear" onClick={(e) => openOptions(e, list)} className="m-0 h-8 w-8">
                                        <IonIcon slot="icon-only" icon={ellipsisVertical} className="text-gray-400" />
                                    </IonButton>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                <IonFab vertical="bottom" horizontal="end" slot="fixed" className="mb-4 mr-4">
                    <IonFabButton onClick={() => setIsCreateAlertOpen(true)}>
                        <IonIcon icon={addOutline} />
                    </IonFabButton>
                </IonFab>

                <IonAlert
                    isOpen={isCreateAlertOpen}
                    onDidDismiss={() => setIsCreateAlertOpen(false)}
                    header="Create New List"
                    inputs={[
                        {
                            name: 'name',
                            type: 'text',
                            placeholder: 'List Name (e.g., Weekly)'
                        }
                    ]}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Create',
                            handler: (data) => handleCreateList(data.name)
                        }
                    ]}
                />

                <IonAlert
                    isOpen={isRenameAlertOpen}
                    onDidDismiss={() => {
                        setIsRenameAlertOpen(false);
                        if (!isDeleteAlertOpen) setSelectedList(null); // Clear unless switching to delete
                    }}
                    header="Rename List"
                    inputs={[
                        {
                            name: 'name',
                            type: 'text',
                            value: selectedList?.name,
                            placeholder: 'List Name'
                        }
                    ]}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Save',
                            handler: (data) => handleRenameList(data.name)
                        }
                    ]}
                />

                <IonAlert
                    isOpen={isDeleteAlertOpen}
                    onDidDismiss={() => {
                        setIsDeleteAlertOpen(false);
                        setSelectedList(null);
                    }}
                    header="Delete List?"
                    message={`Are you sure you want to delete "${selectedList?.name}"? This action cannot be undone.`}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Delete',
                            role: 'destructive',
                            handler: handleDeleteList
                        }
                    ]}
                />

                <IonActionSheet
                    isOpen={showActionSheet}
                    onDidDismiss={() => setShowActionSheet(false)}
                    header="List Options"
                    buttons={[
                        {
                            text: 'Rename',
                            icon: createOutline,
                            handler: () => {
                                setIsRenameAlertOpen(true);
                            }
                        },
                        {
                            text: 'Delete',
                            role: 'destructive',
                            icon: trashOutline,
                            handler: () => {
                                setIsDeleteAlertOpen(true);
                            }
                        },
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            data: {
                                action: 'cancel',
                            },
                        },
                    ]}
                />

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="top"
                    color={toastMessage.includes('Failed') ? 'danger' : 'success'}
                />

            </IonContent>
        </IonPage>
    );
};

export default Home;
