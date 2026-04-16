import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PatientDailyTasks from '@/components/PatientDailyTasks'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'
import { Database, Stethoscope, Target, BarChart3 } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('users')
        .select('id, first_name, last_name, role, facilities!inner(name)')
        .eq('id', user.id)
        .single()

    if (!profile) redirect('/onboarding')

    const facilityName = Array.isArray(profile.facilities)
        ? (profile.facilities as any[])[0]?.name
        : (profile.facilities as any)?.name;

    const isAdmin = (profile as any).role === 'admin';

    return (
        <main className="min-h-screen bg-[var(--color-brand-surface)] flex flex-col">
            <div className="bg-[var(--color-brand-bg)] text-[var(--color-brand-primary)] border-b border-[var(--color-brand-border)] p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src="https://cdn.prod.website-files.com/60870ff4852ead369670e13e/60870ff4852ead759670e169_favicon.png"
                        alt="Kyte Icon"
                        className="w-6 h-6"
                    />
                    <span className="font-heading font-bold truncate max-w-64">{facilityName}</span>
                </div>

                {/* Navigation */}
                <div className="flex-1 flex items-center gap-1 px-8">
                    <Link
                        href="/dashboard/providers"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-black/5 transition-all text-[var(--color-brand-primary)] opacity-70 hover:opacity-100"
                    >
                        <Stethoscope size={16} className="text-teal-600" />
                        <span>Providers</span>
                    </Link>
                    <Link
                        href="/dashboard/knowledge"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-black/5 transition-all text-[var(--color-brand-primary)] opacity-70 hover:opacity-100"
                    >
                        <Database size={16} className="text-teal-600" />
                        <span>AI Knowledge Base</span>
                    </Link>
                    {isAdmin && (
                        <>
                            <Link
                                href="/dashboard/admin/kpis"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-black/5 transition-all text-[var(--color-brand-primary)] opacity-70 hover:opacity-100"
                            >
                                <Target size={16} className="text-teal-600" />
                                <span>KPI Management</span>
                            </Link>
                            <Link
                                href="/dashboard/admin/reports"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-black/5 transition-all text-[var(--color-brand-primary)] opacity-70 hover:opacity-100"
                            >
                                <BarChart3 size={16} className="text-teal-600" />
                                <span>Reports</span>
                            </Link>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <LogoutButton />
                    <div className="font-body text-sm font-medium opacity-80">
                        {profile.first_name} {profile.last_name}
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-3xl mx-auto w-full pt-8 px-4 pb-20">
                <PatientDailyTasks
                    patientId="123"
                    patientName="Juan Dela Cruz"
                    roomNumber="101-A"
                />
            </div>
        </main>
    )
}
