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

            <IonContent fullscreen className="ion-padding">
                <div className="max-w-md mx-auto pb-20 pt-4">

                    {/* Welcome Section */}
                    <div className="mb-6 animate-enter-up">
                        <h1 className="text-3xl font-bold text-text-main">Hello! 👋</h1>
                        <p className="text-text-muted">Ready to shop today?</p>
                    </div>

                    {loading ? (
                        <div className="space-y-4 mt-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : lists.length === 0 ? (
                        <div className="text-center mt-20 opacity-60 animate-enter-up">
                            <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IonIcon icon={listOutline} className="text-5xl text-primary/50" />
                            </div>
                            <h3 className="text-lg font-bold text-text-main">No lists yet</h3>
                            <p className="text-text-muted mt-1">Create your first shopping list now!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            {lists.map((list, index) => (
                                <div
                                    key={list.id}
                                    onClick={() => history.push(`/list/${list.id}`)}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                    className="animate-enter-up bg-white rounded-xl p-4 shadow-soft hover:shadow-medium border border-gray-50 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-2xl text-primary shadow-sm group-hover:scale-110 transition-transform duration-300">
                                            <IonIcon icon={listOutline} className="text-xl" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="font-bold text-text-main text-lg leading-tight">{list.name}</h3>
                                            <span className="text-xs text-text-muted mt-1">Tap to view items</span>
                                        </div>
                                    </div>
                                    <IonButton fill="clear" onClick={(e) => openOptions(e, list)} className="m-0 h-10 w-10 text-gray-300 hover:text-primary transition-colors">
                                        <IonIcon slot="icon-only" icon={ellipsisVertical} />
                                    </IonButton>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                <IonFab vertical="bottom" horizontal="end" slot="fixed" className="mb-6 mr-4">
                    <IonFabButton onClick={() => setIsCreateAlertOpen(true)} className="shadow-floating hover:scale-110 transition-transform duration-200 overflow-hidden">
                        <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                            <IonIcon icon={addOutline} className="text-white text-2xl" />
                        </div>
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
