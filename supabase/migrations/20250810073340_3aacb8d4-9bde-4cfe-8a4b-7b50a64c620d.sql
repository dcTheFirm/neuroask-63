-- Widen numeric precision to prevent overflow on analytics updates

ALTER TABLE public.dashboard_analytics
ALTER COLUMN average_score TYPE numeric(5,2) USING ROUND(COALESCE(average_score::numeric,0), 2),
ALTER COLUMN hours_practiced TYPE numeric(10,2) USING ROUND(COALESCE(hours_practiced::numeric,0), 2);

ALTER TABLE public.dashboard_analytics
ALTER COLUMN average_score SET DEFAULT 0.00,
ALTER COLUMN hours_practiced SET DEFAULT 0.00;