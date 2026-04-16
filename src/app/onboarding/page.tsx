import { submitOnboarding } from './actions'
import { Building2, User } from 'lucide-react'

export default async function OnboardingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const error = params?.error as string | undefined

    return (
        <div className="min-h-screen bg-[var(--color-brand-surface)] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full surface-card p-8 shadow-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-[var(--color-brand-accent)] text-white mb-6">
                        <Building2 size={24} />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-[var(--color-brand-primary)]">Welcome</h1>
                    <p className="text-[var(--color-brand-primary)] opacity-70 mt-2 text-sm font-body">Set up your facility workspace</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded font-medium border border-red-100 mb-6 font-body">
                        {error}
                    </div>
                )}

                <form action={submitOnboarding} className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold text-[var(--color-brand-primary)] uppercase tracking-wider opacity-60 font-body">Your Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-brand-primary)] mb-1 font-body">First Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <User size={16} />
                                    </div>
                                    <input
                                        name="firstName"
                                        type="text"
                                        required
                                        className="pl-9 w-full px-3 py-2.5 input-classic font-body text-sm"
                                        placeholder="Jane"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-brand-primary)] mb-1 font-body">Last Name</label>
                                <input
                                    name="lastName"
                                    type="text"
                                    required
                                    className="w-full px-3 py-2.5 input-classic font-body text-sm"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 mt-6 border-t border-[var(--color-brand-border)]">
                        <h2 className="text-xs font-bold text-[var(--color-brand-primary)] uppercase tracking-wider opacity-60 font-body">Facility Details</h2>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-brand-primary)] mb-1 font-body">Facility Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Building2 size={16} />
                                </div>
                                <input
                                    name="facilityName"
                                    type="text"
                                    required
                                    className="pl-9 w-full px-3 py-2.5 input-classic font-body text-sm"
                                    placeholder="Company Name"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full btn-primary font-bold py-3 px-4 text-center mt-6 text-sm"
                    >
                        Create Workspace
                    </button>
                </form>
            </div>
        </div>
    )
}
