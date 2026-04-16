'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-surface)] transition-colors border border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary)]"
            title="Sign out"
        >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
        </button>
    )
}
