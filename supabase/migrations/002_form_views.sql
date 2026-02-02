-- Migration: Add form views tracking
-- Run this in your Supabase SQL Editor

-- Form views table for analytics
create table if not exists public.form_views (
  id uuid default uuid_generate_v4() primary key,
  form_id uuid references public.forms(id) on delete cascade not null,
  viewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  visitor_id text, -- Anonymous visitor identifier (fingerprint or session id)
  ip_address text,
  user_agent text,
  referrer text,
  country text,
  device_type text, -- 'desktop', 'mobile', 'tablet'
  started_form boolean default false, -- Did they start filling the form?
  completed_form boolean default false, -- Did they complete the form?
  drop_off_question_id text, -- Which question did they drop off on?
  time_spent_seconds integer, -- Total time spent on form
  metadata jsonb default '{}'::jsonb
);

-- Indexes for efficient querying
create index if not exists form_views_form_id_idx on public.form_views(form_id);
create index if not exists form_views_viewed_at_idx on public.form_views(viewed_at);
create index if not exists form_views_visitor_id_idx on public.form_views(visitor_id);

-- Enable RLS
alter table public.form_views enable row level security;

-- Policies for form_views
create policy "Form owners can view their form views"
  on public.form_views for select
  using (
    exists (
      select 1 from public.forms
      where forms.id = form_views.form_id
      and forms.user_id = auth.uid()
    )
  );

create policy "Anyone can insert form views for published forms"
  on public.form_views for insert
  with check (
    exists (
      select 1 from public.forms
      where forms.id = form_id
      and forms.is_published = true
    )
  );

-- Function to get form analytics summary
create or replace function get_form_analytics(
  p_form_id uuid,
  p_start_date timestamp with time zone default null,
  p_end_date timestamp with time zone default null
)
returns json
language plpgsql
security definer
as $$
declare
  result json;
  v_start_date timestamp with time zone;
  v_end_date timestamp with time zone;
begin
  -- Default to last 30 days if not specified
  v_start_date := coalesce(p_start_date, now() - interval '30 days');
  v_end_date := coalesce(p_end_date, now());

  select json_build_object(
    'totalViews', (
      select count(*) from form_views 
      where form_id = p_form_id 
      and viewed_at between v_start_date and v_end_date
    ),
    'uniqueVisitors', (
      select count(distinct visitor_id) from form_views 
      where form_id = p_form_id 
      and viewed_at between v_start_date and v_end_date
    ),
    'totalStarts', (
      select count(*) from form_views 
      where form_id = p_form_id 
      and started_form = true
      and viewed_at between v_start_date and v_end_date
    ),
    'totalCompletions', (
      select count(*) from form_views 
      where form_id = p_form_id 
      and completed_form = true
      and viewed_at between v_start_date and v_end_date
    ),
    'avgTimeSpent', (
      select avg(time_spent_seconds) from form_views 
      where form_id = p_form_id 
      and time_spent_seconds is not null
      and viewed_at between v_start_date and v_end_date
    ),
    'submissionCount', (
      select count(*) from responses 
      where form_id = p_form_id 
      and submitted_at between v_start_date and v_end_date
    ),
    'deviceBreakdown', (
      select json_object_agg(
        coalesce(device_type, 'unknown'), 
        count
      ) from (
        select device_type, count(*) 
        from form_views 
        where form_id = p_form_id 
        and viewed_at between v_start_date and v_end_date
        group by device_type
      ) t
    )
  ) into result;

  return result;
end;
$$;
