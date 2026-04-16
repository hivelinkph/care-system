import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProvidersClient from './ProvidersClient';

export default async function DashboardProvidersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const [{ data: providers }, { data: kpis }] = await Promise.all([
        supabase.from('providers').select('*').order('name'),
        supabase.from('kpis').select('*').order('created_at'),
    ]);

    return <ProvidersClient providers={providers ?? []} kpis={kpis ?? []} />;
}
