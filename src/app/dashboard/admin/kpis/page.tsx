import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import KPIManagerClient from './KPIManagerClient';

export default async function KPIsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
    if (!profile || profile.role !== 'admin') redirect('/dashboard');

    const { data: kpis } = await supabase.from('kpis').select('*').order('created_at');

    return <KPIManagerClient initialKpis={kpis ?? []} />;
}
