import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, refreshOutline } from 'ionicons/icons';

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

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Price Compare</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ion-padding bg-app-bg">
                <div className="max-w-md mx-auto space-y-6 pb-20">

                    <div className="text-center mt-4">
                        <p className="text-text-muted">Find out which one is cheaper!</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Item A */}
                        <div className={`rounded-xl p-3 border-2 transition-colors ${result.winner === 'A' ? 'border-green-500 bg-green-50' : result.winner === 'B' ? 'border-red-100 bg-red-50' : 'border-gray-200 bg-white'}`}>
                            <h3 className="font-bold text-center mb-2 text-text-main">Item A</h3>
                            <div className="space-y-2">
                                <div className="bg-white rounded-lg border border-gray-200 px-2">
                                    <IonInput
                                        type="number"
                                        placeholder="Price"
                                        value={priceA}
                                        onIonChange={e => setPriceA(e.detail.value!)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="bg-white rounded-lg border border-gray-200 px-2 flex-1">
                                        <IonInput
                                            type="number"
                                            placeholder="Qty"
                                            value={qtyA}
                                            onIonChange={e => setQtyA(e.detail.value!)}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg border border-gray-200 w-20 flex items-center justify-center">
                                        <IonInput
                                            value={unitA}
                                            placeholder="Unit"
                                            onIonChange={e => setUnitA(e.detail.value!)}
                                            className="text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                            {result.winner === 'A' && (
                                <div className="mt-2 text-center text-green-700 font-bold text-sm flex items-center justify-center gap-1">
                                    <IonIcon icon={checkmarkCircleOutline} />
                                    <span>Winner!</span>
                                </div>
                            )}
                        </div>

                        {/* Item B */}
                        <div className={`rounded-xl p-3 border-2 transition-colors ${result.winner === 'B' ? 'border-green-500 bg-green-50' : result.winner === 'A' ? 'border-red-100 bg-red-50' : 'border-gray-200 bg-white'}`}>
                            <h3 className="font-bold text-center mb-2 text-text-main">Item B</h3>
                            <div className="space-y-2">
                                <div className="bg-white rounded-lg border border-gray-200 px-2">
                                    <IonInput
                                        type="number"
                                        placeholder="Price"
                                        value={priceB}
                                        onIonChange={e => setPriceB(e.detail.value!)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="bg-white rounded-lg border border-gray-200 px-2 flex-1">
                                        <IonInput
                                            type="number"
                                            placeholder="Qty"
                                            value={qtyB}
                                            onIonChange={e => setQtyB(e.detail.value!)}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg border border-gray-200 w-20 flex items-center justify-center">
                                        <IonInput
                                            value={unitB}
                                            placeholder="Unit"
                                            onIonChange={e => setUnitB(e.detail.value!)}
                                            className="text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                            {result.winner === 'B' && (
                                <div className="mt-2 text-center text-green-700 font-bold text-sm flex items-center justify-center gap-1">
                                    <IonIcon icon={checkmarkCircleOutline} />
                                    <span>Winner!</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Result Summary */}
                    {result.winner && (
                        <div className={`p-4 rounded-xl text-center shadow-sm ${result.winner === 'Tie' ? 'bg-gray-100' : 'bg-blue-600 text-white'}`}>
                            <h3 className="text-xl font-bold">
                                {result.winner === 'Tie' ? 'Same Price!' : `Choose Item ${result.winner}!`}
                            </h3>
                            <p className={`text-sm mt-1 ${result.winner === 'Tie' ? 'text-gray-600' : 'text-blue-100'}`}>
                                {result.winner === 'Tie' ? 'No difference in price.' : `Save ${result.savings} compared to the other.`}
                            </p>
                        </div>
                    )}

                    <IonButton expand="block" fill="outline" onClick={reset} className="rounded-xl h-12" shape="round">
                        <IonIcon slot="start" icon={refreshOutline} />
                        Reset Calculator
                    </IonButton>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default Compare;
