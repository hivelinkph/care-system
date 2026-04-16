"use client";

import { useState } from "react";
import ProviderCard from "@/components/ProviderCard";
import RatingModal from "@/components/RatingModal";
import { Stethoscope, CheckCircle2 } from "lucide-react";

type Provider = { id: string; name: string; specialty?: string; description?: string; photo_url?: string };
type KPI = { id: string; name: string; description?: string };

export default function ProvidersClient({ providers, kpis }: { providers: Provider[]; kpis: KPI[] }) {
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());

    return (
        <div className="min-h-screen bg-[var(--color-brand-surface)]">
            <div className="max-w-5xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-heading font-extrabold text-[var(--color-brand-primary)] mb-1">
                        Care Providers
                    </h1>
                    <p className="text-sm opacity-60">
                        Rate providers on each KPI to help improve care quality.
                    </p>
                </div>

                {providers.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Stethoscope size={40} className="mx-auto mb-4 opacity-30" />
                        <p>No providers listed yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {providers.map(p => (
                            <div key={p.id} className="relative">
                                {ratedIds.has(p.id) && (
                                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-2 py-1 rounded-full border border-teal-200">
                                        <CheckCircle2 size={12} />
                                        Rated
                                    </div>
                                )}
                                <ProviderCard
                                    provider={p}
                                    onRate={kpis.length > 0 ? setSelectedProvider : undefined}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {kpis.length === 0 && providers.length > 0 && (
                    <p className="mt-6 text-sm text-center text-gray-400">
                        No KPIs have been set up yet. Ask your admin to add KPIs before rating.
                    </p>
                )}
            </div>

            {selectedProvider && (
                <RatingModal
                    provider={selectedProvider}
                    kpis={kpis}
                    onClose={() => setSelectedProvider(null)}
                    onSubmitted={() => setRatedIds(s => new Set([...s, selectedProvider.id]))}
                />
            )}
        </div>
    );
}
