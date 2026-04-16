"use client";

import { useEffect, useState } from "react";
import { BarChart3, Loader2, Stethoscope } from "lucide-react";
import Link from "next/link";

type Provider = { id: string; name: string; specialty?: string };
type KPI = { id: string; name: string };
type Rating = { provider_id: string; kpi_id: string; score: number };

function StarRating({ score, count }: { score: number; count: number }) {
    const filled = Math.round(score);
    return (
        <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <svg
                        key={i}
                        className={`w-4 h-4 ${i <= filled ? 'text-amber-400' : 'text-gray-200'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
            <span className="text-xs text-gray-400">{score.toFixed(1)} ({count})</span>
        </div>
    );
}

export default function ReportClient() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/ratings')
            .then(r => r.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setProviders(data.providers);
                setKpis(data.kpis);
                setRatings(data.ratings);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    // Aggregate: for each (provider, kpi) → { avg, count }
    const agg: Record<string, Record<string, { sum: number; count: number }>> = {};
    for (const r of ratings) {
        if (!agg[r.provider_id]) agg[r.provider_id] = {};
        if (!agg[r.provider_id][r.kpi_id]) agg[r.provider_id][r.kpi_id] = { sum: 0, count: 0 };
        agg[r.provider_id][r.kpi_id].sum += r.score;
        agg[r.provider_id][r.kpi_id].count += 1;
    }

    // Overall average per provider
    const overallAvg = (providerId: string) => {
        const kpiScores = kpis
            .map(k => agg[providerId]?.[k.id])
            .filter(Boolean) as { sum: number; count: number }[];
        if (!kpiScores.length) return null;
        const totalSum = kpiScores.reduce((a, b) => a + b.sum / b.count, 0);
        return totalSum / kpiScores.length;
    };

    return (
        <div className="min-h-screen bg-[var(--color-brand-surface)]">
            <div className="max-w-6xl mx-auto px-6 py-10">
                <Link href="/dashboard" className="text-sm text-teal-600 hover:underline mb-6 inline-block">
                    ← Back to Dashboard
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <BarChart3 size={24} className="text-teal-600" />
                    <div>
                        <h1 className="text-xl font-heading font-extrabold text-[var(--color-brand-primary)]">Provider KPI Report</h1>
                        <p className="text-sm opacity-60">Aggregated ratings from customers across all KPIs.</p>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                        <Loader2 size={20} className="animate-spin" />
                        <span>Loading report...</span>
                    </div>
                )}

                {error && <p className="text-red-500 text-sm py-8 text-center">{error}</p>}

                {!loading && !error && providers.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <Stethoscope size={40} className="mx-auto mb-4 opacity-30" />
                        <p>No providers or ratings yet.</p>
                    </div>
                )}

                {!loading && !error && providers.length > 0 && kpis.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-8">
                        No KPIs defined.{' '}
                        <Link href="/dashboard/admin/kpis" className="text-teal-600 hover:underline">
                            Add KPIs
                        </Link>{' '}
                        to start collecting ratings.
                    </p>
                )}

                {!loading && !error && providers.length > 0 && kpis.length > 0 && (
                    <div className="bg-white border border-[var(--color-brand-border)] rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[var(--color-brand-surface)] border-b border-[var(--color-brand-border)]">
                                        <th className="text-left px-5 py-3 font-semibold text-[var(--color-brand-primary)] whitespace-nowrap">
                                            Provider
                                        </th>
                                        {kpis.map(kpi => (
                                            <th key={kpi.id} className="px-4 py-3 font-semibold text-[var(--color-brand-primary)] text-center whitespace-nowrap">
                                                {kpi.name}
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 font-semibold text-[var(--color-brand-primary)] text-center whitespace-nowrap">
                                            Overall
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {providers.map((provider, i) => {
                                        const avg = overallAvg(provider.id);
                                        return (
                                            <tr
                                                key={provider.id}
                                                className={`border-b border-[var(--color-brand-border)] last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-[var(--color-brand-primary)]">{provider.name}</div>
                                                    {provider.specialty && (
                                                        <div className="text-xs text-teal-600 mt-0.5">{provider.specialty}</div>
                                                    )}
                                                </td>
                                                {kpis.map(kpi => {
                                                    const data = agg[provider.id]?.[kpi.id];
                                                    return (
                                                        <td key={kpi.id} className="px-4 py-4 text-center">
                                                            {data ? (
                                                                <StarRating
                                                                    score={data.sum / data.count}
                                                                    count={data.count}
                                                                />
                                                            ) : (
                                                                <span className="text-gray-300 text-xs">No ratings</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-4 py-4 text-center">
                                                    {avg !== null ? (
                                                        <StarRating score={avg} count={0} />
                                                    ) : (
                                                        <span className="text-gray-300 text-xs">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
