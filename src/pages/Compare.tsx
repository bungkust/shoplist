import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, refreshOutline, calculatorOutline, arrowForwardOutline, pricetagOutline, cubeOutline } from 'ionicons/icons';

const Compare: React.FC = () => {
    const [priceA, setPriceA] = useState<string>('');
    const [qtyA, setQtyA] = useState<string>('');
    const [unitA, setUnitA] = useState<string>('pcs');

    const [priceB, setPriceB] = useState<string>('');
    const [qtyB, setQtyB] = useState<string>('');
    const [unitB, setUnitB] = useState<string>('pcs');

    const [result, setResult] = useState<{ winner: 'A' | 'B' | 'Tie' | null, savings: string | null }>({ winner: null, savings: null });

    useEffect(() => {
        calculate();
    }, [priceA, qtyA, priceB, qtyB]);

    const calculate = () => {
        if (priceA && qtyA && priceB && qtyB) {
            const pA = parseFloat(priceA);
            const qA = parseFloat(qtyA);
            const pB = parseFloat(priceB);
            const qB = parseFloat(qtyB);

            if (qA > 0 && qB > 0) {
                const unitPriceA = pA / qA;
                const unitPriceB = pB / qB;

                if (unitPriceA < unitPriceB) {
                    const percent = ((unitPriceB - unitPriceA) / unitPriceB) * 100;
                    setResult({ winner: 'A', savings: `${percent.toFixed(0)}%` });
                } else if (unitPriceB < unitPriceA) {
                    const percent = ((unitPriceA - unitPriceB) / unitPriceA) * 100;
                    setResult({ winner: 'B', savings: `${percent.toFixed(0)}%` });
                } else {
                    setResult({ winner: 'Tie', savings: null });
                }
            }
        } else {
            setResult({ winner: null, savings: null });
        }
    };

    const reset = () => {
        setPriceA('');
        setQtyA('');
        setUnitA('pcs');
        setPriceB('');
        setQtyB('');
        setUnitB('pcs');
        setResult({ winner: null, savings: null });
    };

    const renderInputCard = (
        label: string,
        price: string, setPrice: (val: string) => void,
        qty: string, setQty: (val: string) => void,
        unit: string, setUnit: (val: string) => void,
        isWinner: boolean,
        isLoser: boolean
    ) => (
        <div className={`
            relative rounded-3xl p-5 transition-all duration-500 animate-enter-up
            ${isWinner
                ? 'bg-white ring-4 ring-green-400/30 shadow-floating scale-[1.02] z-10'
                : isLoser
                    ? 'bg-white/60 opacity-80 scale-95 grayscale-[0.5]'
                    : 'bg-white shadow-soft'}
        `}>
            {isWinner && (
                <div className="absolute -top-3 right-6 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 animate-scale-in">
                    <IonIcon icon={checkmarkCircleOutline} />
                    BEST VALUE
                </div>
            )}

            <div className="flex items-center gap-3 mb-4">
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${isWinner ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-primary'}
                `}>
                    {label.slice(-1)}
                </div>
                <h3 className="font-bold text-text-main text-lg">{label}</h3>
            </div>

            <div className="space-y-4">
                {/* Price Input - Prominent */}
                <div className="bg-gray-50 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                        <IonIcon icon={pricetagOutline} className="text-gray-400 text-xs" />
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Price (Rp)</label>
                    </div>
                    <IonInput
                        type="number"
                        placeholder="0"
                        value={price}
                        onIonChange={e => setPrice(e.detail.value!)}
                        className="font-bold text-2xl -mt-1 text-text-main"
                    />
                </div>

                {/* Qty & Unit - Side by Side */}
                <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-3 bg-gray-50 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                            <IonIcon icon={cubeOutline} className="text-gray-400 text-xs" />
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Qty</label>
                        </div>
                        <IonInput
                            type="number"
                            placeholder="0"
                            value={qty}
                            onIonChange={e => setQty(e.detail.value!)}
                            className="font-bold text-lg -mt-1 text-text-main"
                        />
                    </div>
                    <div className="col-span-2 bg-gray-50 rounded-2xl px-2 py-2 flex items-center justify-center focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <IonInput
                            value={unit}
                            placeholder="Unit"
                            onIonChange={e => setUnit(e.detail.value!)}
                            className="text-center font-medium text-sm text-text-main"
                        />
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

                    {/* Intro / Result */}
                    <div className="mb-6">
                        {!result.winner ? (
                            <div className="text-center animate-enter-up">
                                <div className="bg-white/50 backdrop-blur-sm inline-flex items-center justify-center p-3 rounded-2xl mb-2 shadow-sm">
                                    <IonIcon icon={calculatorOutline} className="text-3xl text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-text-main">Compare Prices</h2>
                                <p className="text-text-muted text-sm">Enter details to find the best deal.</p>
                            </div>
                        ) : (
                            <div className={`
                                p-6 rounded-3xl text-center shadow-floating relative overflow-hidden animate-scale-in
                                ${result.winner === 'Tie' ? 'bg-gray-800 text-white' : 'bg-gradient-primary text-white'}
                            `}>
                                {/* Decorative Background */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8 blur-xl"></div>

                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold mb-1">
                                        {result.winner === 'Tie' ? 'It\'s a Tie!' : `Option ${result.winner} is Best!`}
                                    </h3>
                                    <p className={`text-base opacity-90 font-medium`}>
                                        {result.winner === 'Tie' ? 'Both items have the same value.' : `You save ${result.savings} with this choice.`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-6 relative">
                        {/* VS Badge */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-md">
                            <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-400">
                                VS
                            </div>
                        </div>

                        {/* Item A */}
                        {renderInputCard(
                            'Option A',
                            priceA, setPriceA,
                            qtyA, setQtyA,
                            unitA, setUnitA,
                            result.winner === 'A',
                            result.winner === 'B'
                        )}

                        {/* Item B */}
                        {renderInputCard(
                            'Option B',
                            priceB, setPriceB,
                            qtyB, setQtyB,
                            unitB, setUnitB,
                            result.winner === 'B',
                            result.winner === 'A'
                        )}
                    </div>

                    <div className="mt-8">
                        <IonButton
                            expand="block"
                            fill="clear"
                            onClick={reset}
                            className="h-12 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <IonIcon slot="start" icon={refreshOutline} />
                            Reset Calculator
                        </IonButton>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default Compare;
