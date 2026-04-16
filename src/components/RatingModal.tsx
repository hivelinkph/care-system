"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

type KPI = { id: string; name: string; description?: string };
type Provider = { id: string; name: string; specialty?: string };

type Props = {
    provider: Provider;
    kpis: KPI[];
    onClose: () => void;
    onSubmitted: () => void;
};

export default function RatingModal({ provider, kpis, onClose, onSubmitted }: Props) {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const allRated = kpis.length > 0 && kpis.every(k => scores[k.id] !== undefined);

    const handleSubmit = async () => {
        if (!allRated) return;
        setSubmitting(true);
        setError(null);
        try {
            for (const kpi of kpis) {
                const res = await fetch('/api/ratings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider_id: provider.id, kpi_id: kpi.id, score: scores[kpi.id] }),
                });
                if (!res.ok) {
                    const { error: msg } = await res.json();
                    throw new Error(msg || 'Failed to submit rating');
                }
            }
            onSubmitted();
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-brand-border)]">
                    <div>
                        <h2 className="font-heading font-bold text-[var(--color-brand-primary)] text-lg">
                            Rate {provider.name}
                        </h2>
                        {provider.specialty && (
                            <p className="text-sm text-teal-600 mt-0.5">{provider.specialty}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* KPI Scores */}
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    {kpis.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                            No KPIs defined yet. Ask your admin to add KPIs first.
                        </p>
                    )}
                    {kpis.map(kpi => (
                        <div key={kpi.id}>
                            <div className="mb-2">
                                <span className="text-sm font-semibold text-[var(--color-brand-primary)]">{kpi.name}</span>
                                {kpi.description && (
                                    <p className="text-xs text-gray-500 mt-0.5">{kpi.description}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setScores(s => ({ ...s, [kpi.id]: n }))}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                                            scores[kpi.id] === n
                                                ? 'border-teal-500 bg-teal-500 text-white'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300'
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
                                <span>Lowest</span>
                                <span>Highest</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--color-brand-border)] space-y-3">
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        onClick={handleSubmit}
                        disabled={!allRated || submitting}
                        className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {submitting && <Loader2 size={16} className="animate-spin" />}
                        {submitting ? 'Submitting...' : 'Submit Rating'}
                    </button>
                    <p className="text-xs text-gray-400 text-center">
                        Rate each KPI from 1 (lowest) to 5 (highest)
                    </p>
                </div>
            </div>
        </div>
    );
}
