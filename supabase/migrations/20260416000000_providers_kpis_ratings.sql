-- Providers, KPIs, and Provider Ratings

CREATE TABLE public.providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100),
    description TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE public.kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE public.provider_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
    kpi_id UUID REFERENCES public.kpis(id) ON DELETE CASCADE NOT NULL,
    rater_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE (provider_id, kpi_id, rater_id)
);

CREATE INDEX idx_providers_facility ON public.providers(facility_id);
CREATE INDEX idx_kpis_facility ON public.kpis(facility_id);
CREATE INDEX idx_ratings_provider ON public.provider_ratings(provider_id);
CREATE INDEX idx_ratings_kpi ON public.provider_ratings(kpi_id);

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_ratings ENABLE ROW LEVEL SECURITY;

-- Providers: public read, admin write
CREATE POLICY "Public can view providers" ON public.providers
    FOR SELECT USING (true);
CREATE POLICY "Admins can insert providers" ON public.providers
    FOR INSERT WITH CHECK (
        facility_id = public.get_user_facility_id() AND
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );
CREATE POLICY "Admins can delete providers" ON public.providers
    FOR DELETE USING (
        facility_id = public.get_user_facility_id() AND
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- KPIs: authenticated facility members read, admin write
CREATE POLICY "Facility users can view KPIs" ON public.kpis
    FOR SELECT USING (facility_id = public.get_user_facility_id());
CREATE POLICY "Admins can insert KPIs" ON public.kpis
    FOR INSERT WITH CHECK (
        facility_id = public.get_user_facility_id() AND
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );
CREATE POLICY "Admins can delete KPIs" ON public.kpis
    FOR DELETE USING (
        facility_id = public.get_user_facility_id() AND
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- Ratings: authenticated users insert own, all authenticated read
CREATE POLICY "Users can insert own ratings" ON public.provider_ratings
    FOR INSERT WITH CHECK (auth.uid() = rater_id);
CREATE POLICY "Users can update own ratings" ON public.provider_ratings
    FOR UPDATE USING (auth.uid() = rater_id);
CREATE POLICY "Authenticated users can view ratings" ON public.provider_ratings
    FOR SELECT USING (auth.uid() IS NOT NULL);
