import { login, signup } from './actions'
import { UserCircle2, ShieldHalf, LayoutDashboard } from 'lucide-react'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const error = params?.error as string | undefined
    const success = params?.success as string | undefined

    return (
        <div className="min-h-screen bg-[var(--color-brand-surface)] flex items-center justify-center p-4">
            <div className="max-w-md w-full surface-card shadow-sm">

                <div className="p-8">
                    <div className="text-center mb-8">
                        {/* Kyte Logo placeholder / icon */}
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-[var(--color-brand-accent)] text-white mb-4">
                            <LayoutDashboard size={24} />
                        </div>
                        <h1 className="text-3xl font-heading font-bold text-[var(--color-brand-primary)]">Log in</h1>
                        <p className="text-[var(--color-brand-primary)] opacity-70 mt-2 text-sm font-body">Access your workspace</p>
                    </div>

                    <form action={login} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-brand-primary)] mb-1 font-body">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <UserCircle2 size={16} />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="pl-9 w-full px-3 py-2.5 input-classic font-body text-sm"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-[var(--color-brand-primary)] font-body">
                                    Password
                                </label>
                                <a href="#" className="font-body text-xs font-medium text-[var(--color-brand-accent)] hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <ShieldHalf size={16} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="pl-9 w-full px-3 py-2.5 input-classic font-body text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded font-medium border border-red-100 flex items-center font-body">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-teal-50 text-teal-700 text-sm p-3 rounded font-medium border border-teal-100 font-body">
                                {success}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full btn-primary font-bold py-3 px-4 text-center text-sm"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-[var(--color-brand-surface)] p-6 text-center border-t border-[var(--color-brand-border)]">
                    <p className="text-sm font-body text-[var(--color-brand-primary)] opacity-70 mb-4">
                        Don't have an account?
                    </p>
                    <form action={signup}>
                        <button
                            type="submit"
                            className="w-full btn-secondary font-bold py-2.5 px-4 text-center text-sm"
                        >
                            Sign up
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
