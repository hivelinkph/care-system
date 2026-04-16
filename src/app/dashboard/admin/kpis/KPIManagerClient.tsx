"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Target } from "lucide-react";
import Link from "next/link";

type KPI = { id: string; name: string; description?: string; created_at: string };

export default function KPIManagerClient({ initialKpis }: { initialKpis: KPI[] }) {
    const [kpis, setKpis] = useState<KPI[]>(initialKpis);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [adding, setAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!name.trim()) return;
        setAdding(true);
        setError(null);
        try {
            const res = await fetch('/api/kpis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setKpis(prev => [...prev, json.kpi]);
            setName('');
            setDescription('');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            const res = await fetch('/api/kpis', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error);
            }
            setKpis(prev => prev.filter(k => k.id !== id));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-brand-surface)]">
            <div className="max-w-2xl mx-auto px-6 py-10">
                {/* Back link */}
                <Link href="/dashboard" className="text-sm text-teal-600 hover:underline mb-6 inline-block">
                    ← Back to Dashboard
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <Target size={24} className="text-teal-600" />
                    <div>
                        <h1 className="text-xl font-heading font-extrabold text-[var(--color-brand-primary)]">KPI Management</h1>
                        <p className="text-sm opacity-60">Define the criteria customers use to rate providers.</p>
                    </div>
                </div>

                {/* Add KPI form */}
                <div className="bg-white border border-[var(--color-brand-border)] rounded-xl p-6 mb-6 shadow-sm">
                    <h2 className="font-semibold text-[var(--color-brand-primary)] mb-4 text-sm">Add New KPI</h2>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="KPI name (e.g. Communication, Reliability)"
                            className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400"
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        />
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Description (optional)"
                            className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400"
                        />
                        {error && <p className="text-xs text-red-500">{error}</p>}
                        <button
                            onClick={handleAdd}
                            disabled={!name.trim() || adding}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            Add KPI
                        </button>
                    </div>
                </div>

                {/* KPI list */}
                <div className="space-y-3">
                    {kpis.length === 0 && (
                        <p className="text-sm text-center text-gray-400 py-8">No KPIs yet. Add your first one above.</p>
                    )}
                    {kpis.map((kpi, i) => (
                        <div key={kpi.id} className="bg-white border border-[var(--color-brand-border)] rounded-xl px-5 py-4 flex items-center justify-between shadow-sm">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                                        KPI {i + 1}
                                    </span>
                                    <span className="font-semibold text-sm text-[var(--color-brand-primary)]">{kpi.name}</span>
                                </div>
                                {kpi.description && (
                                    <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
                                )}
                            </div>
                            <button
                                onClick={() => handleDelete(kpi.id)}
                                disabled={deletingId === kpi.id}
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                {deletingId === kpi.id
                                    ? <Loader2 size={16} className="animate-spin" />
                                    : <Trash2 size={16} />}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
