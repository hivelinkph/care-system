"use client";

import { Stethoscope } from "lucide-react";

type Provider = {
    id: string;
    name: string;
    specialty?: string;
    description?: string;
    photo_url?: string;
};

type Props = {
    provider: Provider;
    onRate?: (provider: Provider) => void;
};

export default function ProviderCard({ provider, onRate }: Props) {
    return (
        <div className="bg-white border border-[var(--color-brand-border)] rounded-xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                {provider.photo_url ? (
                    <img
                        src={provider.photo_url}
                        alt={provider.name}
                        className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-[var(--color-brand-border)]"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                        <Stethoscope size={22} className="text-teal-600" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-[var(--color-brand-primary)] text-base leading-tight">
                        {provider.name}
                    </h3>
                    {provider.specialty && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-medium rounded">
                            {provider.specialty}
                        </span>
                    )}
                </div>
            </div>

            {provider.description && (
                <p className="text-sm text-[var(--color-brand-primary)] opacity-70 leading-relaxed line-clamp-3">
                    {provider.description}
                </p>
            )}

            {onRate && (
                <button
                    onClick={() => onRate(provider)}
                    className="mt-auto w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    Rate Provider
                </button>
            )}
        </div>
    );
}
