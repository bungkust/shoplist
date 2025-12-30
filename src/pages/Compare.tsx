import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonIcon, IonSelect, IonSelectOption, IonModal } from '@ionic/react';
import { checkmarkCircleOutline, refreshOutline, pricetagOutline, cubeOutline, alertCircleOutline, chevronDownOutline, closeCircleOutline, addCircleOutline, trashOutline } from 'ionicons/icons';

interface Option {
    id: number;
    price: string;
    qty: string;
    unit: string;
}

const Compare: React.FC = () => {
    const [options, setOptions] = useState<Option[]>([
        { id: 1, price: '', qty: '', unit: localStorage.getItem('last_unit') || 'pcs' },
        { id: 2, price: '', qty: '', unit: localStorage.getItem('last_unit') || 'pcs' }
    ]);

    const [result, setResult] = useState<{
        winnerId: number | null,
        savings: string | null,
        details?: {
            winnerPrice: string,
            winnerUnit: string,
            items: Array<{ id: number, price: string, unit: string, unitPrice: number, diff: string, isWinner: boolean }>
        }
    }>({ winnerId: null, savings: null });

    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Persist the last used unit from the first option as a generic preference
        if (options.length > 0) {
            localStorage.setItem('last_unit', options[0].unit);
        }
    }, [options]);

    const handleOptionChange = (id: number, field: keyof Option, value: string) => {
        let newValue = value;
        if (field === 'price') {
            const raw = value.replace(/\D/g, '');
            newValue = raw ? parseInt(raw, 10).toLocaleString('id-ID') : '';
        }
        setOptions(options.map(opt => opt.id === id ? { ...opt, [field]: newValue } : opt));
    };

    const addOption = () => {
        const newId = options.length > 0 ? Math.max(...options.map(o => o.id)) + 1 : 1;
        setOptions([...options, {
            id: newId,
            price: '',
            qty: '',
            unit: options[options.length - 1]?.unit || 'pcs'
        }]);
    };

    const removeOption = (id: number) => {
        if (options.length <= 2) return;
        setOptions(options.filter(opt => opt.id !== id));
    };

    const handleCompare = () => {
        calculateResult();
    }

    const calculateResult = () => {
        setError(null);
        setResult({ winnerId: null, savings: null });

        // Validate
        const validOptions = options.filter(o => o.price && o.qty && parseFloat(o.qty) > 0);

        if (validOptions.length < 2) {
            setError('Please enter details for at least 2 options.');
            return;
        }

        const calculated = validOptions.map(opt => {
            const p = parseFloat(opt.price.replace(/\./g, ''));
            const q = parseFloat(opt.qty);
            return {
                ...opt,
                unitPrice: p / q
            };
        });

        // Find winner (lowest unit price)
        const sorted = [...calculated].sort((a, b) => a.unitPrice - b.unitPrice);
        const winner = sorted[0];
        const runnerUp = sorted[1];

        const fmt = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 2 });

        // Check for tie
        if (winner.unitPrice === runnerUp.unitPrice) {
            setResult({
                winnerId: -1, // Tie
                savings: null,
                details: {
                    winnerPrice: fmt(winner.unitPrice),
                    winnerUnit: winner.unit,
                    items: calculated.map(c => ({
                        id: c.id,
                        price: fmt(parseFloat(c.price)),
                        unit: c.unit,
                        unitPrice: c.unitPrice,
                        diff: '0',
                        isWinner: c.unitPrice === winner.unitPrice
                    }))
                }
            });
        } else {
            const savingsPercent = ((runnerUp.unitPrice - winner.unitPrice) / runnerUp.unitPrice) * 100;

            setResult({
                winnerId: winner.id,
                savings: `${savingsPercent.toFixed(0)}%`,
                details: {
                    winnerPrice: fmt(winner.unitPrice),
                    winnerUnit: winner.unit,
                    items: calculated.map(c => ({
                        id: c.id,
                        price: fmt(parseFloat(c.price)),
                        unit: c.unit,
                        unitPrice: c.unitPrice,
                        diff: fmt(c.unitPrice - winner.unitPrice),
                        isWinner: c.id === winner.id
                    }))
                }
            });
        }
        setShowModal(true);
    };

    const reset = () => {
        setOptions([
            { id: 1, price: '', qty: '', unit: localStorage.getItem('last_unit') || 'pcs' },
            { id: 2, price: '', qty: '', unit: localStorage.getItem('last_unit') || 'pcs' }
        ]);
        setResult({ winnerId: null, savings: null });
        setError(null);
        setShowModal(false);
    };

    const renderInputCard = (opt: Option, index: number, isWinner: boolean) => (
        <div key={opt.id} className={`
            relative rounded-3xl p-5 transition-all duration-500 animate-enter-up
            ${isWinner
                ? 'bg-white ring-4 ring-green-400/30 shadow-floating scale-[1.02] z-10'
                : 'bg-white shadow-soft'}
        `}>
            {isWinner && (
                <div className="absolute -top-3 right-6 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 animate-scale-in">
                    <IonIcon icon={checkmarkCircleOutline} />
                    BEST VALUE
                </div>
            )}

            {options.length > 2 && (
                <div
                    onClick={() => removeOption(opt.id)}
                    className="absolute -top-2 -left-2 bg-red-100 text-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-20 active:scale-90 transition-transform"
                >
                    <IonIcon icon={trashOutline} className="text-sm" />
                </div>
            )}

            <div className="flex items-center gap-3 mb-4">
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${isWinner ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-primary'}
                `}>
                    {String.fromCharCode(65 + index)}
                </div>
                <h3 className="font-bold text-text-main text-lg">Option {String.fromCharCode(65 + index)}</h3>
            </div>

            <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                        <IonIcon icon={pricetagOutline} className="text-gray-400 text-xs" />
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Price</label>
                    </div>
                    <IonInput
                        type="text"
                        inputmode="numeric"
                        placeholder="25.000"
                        value={opt.price}
                        onIonChange={e => handleOptionChange(opt.id, 'price', e.detail.value!)}
                        className="font-bold text-2xl -mt-1 text-text-main"
                    />
                </div>

                <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-3 bg-gray-50 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                            <IonIcon icon={cubeOutline} className="text-gray-400 text-xs" />
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Qty</label>
                        </div>
                        <IonInput
                            type="number"
                            placeholder="10"
                            value={opt.qty}
                            onIonChange={e => handleOptionChange(opt.id, 'qty', e.detail.value!)}
                            className="font-bold text-lg -mt-1 text-text-main"
                        />
                    </div>

                    <div className="col-span-2 relative">
                        <div className="absolute inset-0 bg-gray-50 rounded-2xl border border-gray-100 pointer-events-none"></div>
                        <div className="relative h-full flex items-center justify-center">
                            <IonSelect
                                value={opt.unit}
                                onIonChange={e => handleOptionChange(opt.id, 'unit', e.detail.value)}
                                interface="popover"
                                mode="md"
                                className="w-full h-full font-bold text-sm text-text-main flex items-center justify-center pl-2 pr-6 bg-transparent z-10"
                                style={{ '--placeholder-color': 'var(--ion-color-medium)', '--padding-start': '10px' }}
                            >
                                <IonSelectOption value="pcs">pcs</IonSelectOption>
                                <IonSelectOption value="piece">piece</IonSelectOption>
                                <IonSelectOption value="unit">unit</IonSelectOption>
                                <IonSelectOption value="kg">kg</IonSelectOption>
                                <IonSelectOption value="gram">gram</IonSelectOption>
                                <IonSelectOption value="liter">liter</IonSelectOption>
                                <IonSelectOption value="ml">ml</IonSelectOption>
                                <IonSelectOption value="oz">oz</IonSelectOption>
                                <IonSelectOption value="gallon">gallon</IonSelectOption>
                                <IonSelectOption value="pack">pack</IonSelectOption>
                                <IonSelectOption value="box">box</IonSelectOption>
                                <IonSelectOption value="bag">bag</IonSelectOption>
                                <IonSelectOption value="sachet">sachet</IonSelectOption>
                                <IonSelectOption value="carton">carton</IonSelectOption>
                                <IonSelectOption value="roll">roll</IonSelectOption>
                                <IonSelectOption value="sheet">sheet</IonSelectOption>
                                <IonSelectOption value="meter">meter</IonSelectOption>
                                <IonSelectOption value="cm">cm</IonSelectOption>
                            </IonSelect>

                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-0 text-gray-400">
                                <IonIcon icon={chevronDownOutline} className="text-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Price Compare</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ion-padding">
                <div className="max-w-md mx-auto pb-20 pt-2">

                    {error && (
                        <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-2xl text-center animate-enter-up flex items-center justify-center gap-2">
                            <IonIcon icon={alertCircleOutline} />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-6 relative">
                        {options.map((opt, index) => renderInputCard(opt, index, result.winnerId === opt.id))}
                    </div>

                    <div className="mt-6">
                        <IonButton
                            expand="block"
                            fill="outline"
                            className="h-12 font-bold rounded-2xl border-dashed border-2"
                            onClick={addOption}
                        >
                            <IonIcon slot="start" icon={addCircleOutline} />
                            Add Option
                        </IonButton>
                    </div>

                    <div className="mt-8 space-y-4">
                        <IonButton
                            expand="block"
                            className="h-14 font-bold rounded-2xl"
                            onClick={handleCompare}
                            shape="round"
                        >
                            Compare Prices
                        </IonButton>

                        <IonButton
                            expand="block"
                            fill="clear"
                            onClick={reset}
                            className="h-12 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <IonIcon slot="start" icon={refreshOutline} />
                            Reset
                        </IonButton>
                    </div>

                    <IonModal
                        isOpen={showModal}
                        onDidDismiss={() => setShowModal(false)}
                        className="auto-height-modal flex items-center justify-center"
                        style={{
                            '--border-radius': '24px',
                            '--height': 'auto',
                            '--max-height': '80%',
                            '--width': '90%',
                            '--max-width': '400px',
                            '--background': 'transparent',
                            '--box-shadow': 'none',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <div className={`
                            relative h-auto overflow-hidden
                            ${result.winnerId === -1 ? 'bg-gray-800' : 'bg-gradient-to-br from-green-500 to-emerald-600'}
                            text-white
                        `}>
                            <div className="absolute top-4 right-4 z-50" onClick={() => setShowModal(false)}>
                                <IonIcon icon={closeCircleOutline} className="text-3xl text-white/50 hover:text-white transition-colors" />
                            </div>

                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>

                            <div className="p-8 text-center relative z-10 pt-12">
                                <h3 className="text-3xl font-black mb-1 tracking-tight drop-shadow-sm">
                                    {result.winnerId === -1 ? 'It\'s a Tie!' : `Option ${options.findIndex(o => o.id === result.winnerId) !== -1 ? String.fromCharCode(65 + options.findIndex(o => o.id === result.winnerId)) : ''} Wins!`}
                                </h3>
                                {result.winnerId !== -1 && (
                                    <div className="inline-block bg-white text-emerald-600 px-4 py-1 rounded-full text-sm font-bold shadow-lg mt-1 transform hover:scale-105 transition-transform">
                                        Save {result.savings}
                                    </div>
                                )}
                            </div>

                            <div className="bg-black/10 backdrop-blur-sm p-6 border-t border-white/10 relative z-10">
                                {result.details && (
                                    <div className="space-y-3">
                                        {result.details.items.map((item) => (
                                            <div key={item.id} className={`flex justify-between items-center p-3 rounded-xl transition-colors ${item.isWinner ? 'bg-white/20 ring-1 ring-white/30' : 'bg-black/5'}`}>
                                                <span className="opacity-90 font-medium flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                                        {String.fromCharCode(65 + options.findIndex(o => o.id === item.id))}
                                                    </div>
                                                    Option {String.fromCharCode(65 + options.findIndex(o => o.id === item.id))}
                                                </span>
                                                <span className="font-mono font-bold text-lg">
                                                    Rp {item.price} <span className="text-xs opacity-60 font-sans">/{item.unit}</span>
                                                </span>
                                            </div>
                                        ))}

                                        {result.winnerId !== -1 && (
                                            <div className="mt-4 pt-4 border-t border-white/10 text-center">
                                                <p className="text-xs uppercase tracking-widest opacity-70 mb-1 font-bold">You Save</p>
                                                <p className="text-2xl font-black text-white drop-shadow-sm">
                                                    Rp {result.details.items.find(i => !i.isWinner)?.diff || '0'} <span className="text-sm font-medium opacity-80">/ {result.details.winnerUnit}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </IonModal>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default Compare;
