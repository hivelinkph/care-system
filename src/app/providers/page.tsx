import { createClient } from '@/utils/supabase/server';
import ProviderCard from '@/components/ProviderCard';
import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

export default async function PublicProvidersPage() {
    const supabase = await createClient();
    const { data: providers } = await supabase
        .from('providers')
        .select('*')
        .order('name');

    return (
        <div className="min-h-screen bg-[var(--color-brand-bg)]">
            {/* Nav */}
            <div className="border-b border-[var(--color-brand-border)] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Stethoscope size={20} className="text-teal-600" />
                    <span className="font-heading font-bold text-[var(--color-brand-primary)]">Our Providers</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity">Home</Link>
                    <Link href="/login" className="text-sm font-bold bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                        Log In to Rate
                    </Link>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-heading font-extrabold text-[var(--color-brand-primary)] mb-2">
                        Care Providers
                    </h1>
                    <p className="text-base opacity-60">
                        Meet the dedicated professionals delivering care at our facility.
                    </p>
                </div>

                {!providers || providers.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Stethoscope size={40} className="mx-auto mb-4 opacity-30" />
                        <p>No providers listed yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {providers.map(p => (
                            <ProviderCard key={p.id} provider={p} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
