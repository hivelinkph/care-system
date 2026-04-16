import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET: admin report — all providers with KPI averages
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
        .from('users')
        .select('role, facility_id')
        .eq('id', user.id)
        .single();
    if (!profile || profile.role !== 'admin')
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [{ data: providers }, { data: kpis }, { data: ratings }] = await Promise.all([
        supabase.from('providers').select('id, name, specialty, description').eq('facility_id', profile.facility_id).order('name'),
        supabase.from('kpis').select('id, name, description').eq('facility_id', profile.facility_id).order('created_at'),
        supabase.from('provider_ratings').select('provider_id, kpi_id, score'),
    ]);

    return NextResponse.json({
        providers: providers ?? [],
        kpis: kpis ?? [],
        ratings: ratings ?? [],
    });
}

// POST: submit or update a rating
export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { provider_id, kpi_id, score } = await req.json();
    if (!provider_id || !kpi_id || score < 1 || score > 5)
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const { data, error } = await supabase
        .from('provider_ratings')
        .upsert(
            { provider_id, kpi_id, rater_id: user.id, score },
            { onConflict: 'provider_id,kpi_id,rater_id' }
        )
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ rating: data });
}
