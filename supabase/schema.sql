-- Tyform Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (automatically synced with auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Forms table
create table if not exists public.forms (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Untitled Form',
  description text,
  questions jsonb default '[]'::jsonb not null,
  settings jsonb default '{
    "showProgressBar": true,
    "showQuestionNumbers": true,
    "shuffleQuestions": false,
    "theme": {
      "primaryColor": "#000000",
      "backgroundColor": "#ffffff",
      "textColor": "#000000",
      "fontFamily": "Inter"
    }
  }'::jsonb not null,
  is_published boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Responses table
create table if not exists public.responses (
  id uuid default uuid_generate_v4() primary key,
  form_id uuid references public.forms(id) on delete cascade not null,
  answers jsonb default '{}'::jsonb not null,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default null
);

-- Domains table
create table if not exists public.domains (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  domain text not null unique,
  verified boolean default false not null,
  verification_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists forms_user_id_idx on public.forms(user_id);
create index if not exists forms_is_published_idx on public.forms(is_published);
create index if not exists responses_form_id_idx on public.responses(form_id);
create index if not exists responses_submitted_at_idx on public.responses(submitted_at);
create index if not exists domains_user_id_idx on public.domains(user_id);
create index if not exists domains_domain_idx on public.domains(domain);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.forms enable row level security;
alter table public.responses enable row level security;
alter table public.domains enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Forms policies
create policy "Users can view their own forms"
  on public.forms for select
  using (auth.uid() = user_id);

create policy "Users can create their own forms"
  on public.forms for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own forms"
  on public.forms for update
  using (auth.uid() = user_id);

create policy "Users can delete their own forms"
  on public.forms for delete
  using (auth.uid() = user_id);

create policy "Anyone can view published forms"
  on public.forms for select
  using (is_published = true);

-- Responses policies
create policy "Form owners can view responses"
  on public.responses for select
  using (
    exists (
      select 1 from public.forms
      where forms.id = responses.form_id
      and forms.user_id = auth.uid()
    )
  );

create policy "Anyone can submit responses to published forms"
  on public.responses for insert
  with check (
    exists (
      select 1 from public.forms
      where forms.id = form_id
      and forms.is_published = true
    )
  );

-- Domains policies
create policy "Users can view their own domains"
  on public.domains for select
  using (auth.uid() = user_id);

create policy "Users can create their own domains"
  on public.domains for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own domains"
  on public.domains for update
  using (auth.uid() = user_id);

create policy "Users can delete their own domains"
  on public.domains for delete
  using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Trigger to update updated_at on forms
drop trigger if exists on_forms_updated on public.forms;
create trigger on_forms_updated
  before update on public.forms
  for each row execute procedure public.handle_updated_at();
