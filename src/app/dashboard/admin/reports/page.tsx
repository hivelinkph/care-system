import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ReportClient from './ReportClient';

export default async function ReportsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
    if (!profile || profile.role !== 'admin') redirect('/dashboard');

    return <ReportClient />;
}
