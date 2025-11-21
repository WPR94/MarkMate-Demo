-- Calibration / Moderation tables migration
create table if not exists public.calibration_sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rubric_id uuid references public.rubrics(id) on delete set null,
  created_by uuid not null,
  status text not null default 'active', -- active | closed | draft
  created_at timestamptz default now()
);

create table if not exists public.calibration_session_essays (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.calibration_sessions(id) on delete cascade,
  essay_id uuid references public.essays(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.calibration_marks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.calibration_sessions(id) on delete cascade,
  essay_id uuid references public.essays(id) on delete cascade,
  marker_id uuid not null,
  scores jsonb not null, -- { ao1: int, ao2: int, ao3: int, ao4: int }
  notes text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_calib_sessions_rubric on public.calibration_sessions(rubric_id);
create index if not exists idx_calib_session_essays_session on public.calibration_session_essays(session_id);
create index if not exists idx_calib_marks_session on public.calibration_marks(session_id);
create index if not exists idx_calib_marks_essay on public.calibration_marks(essay_id);
create index if not exists idx_calib_marks_marker on public.calibration_marks(marker_id);

-- Enable RLS
alter table public.calibration_sessions enable row level security;
alter table public.calibration_session_essays enable row level security;
alter table public.calibration_marks enable row level security;

-- Policies: teachers access only their own sessions (created_by)
create policy "Teachers select own calibration sessions" on public.calibration_sessions for select using (created_by = auth.uid());
create policy "Teachers insert calibration sessions" on public.calibration_sessions for insert with check (created_by = auth.uid());
create policy "Teachers update own calibration sessions" on public.calibration_sessions for update using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "Teachers delete own calibration sessions" on public.calibration_sessions for delete using (created_by = auth.uid());

-- Policies: session essays visible if session owned
create policy "Teachers select session essays" on public.calibration_session_essays for select using (
  exists (select 1 from public.calibration_sessions s where s.id = calibration_session_essays.session_id and s.created_by = auth.uid())
);
create policy "Teachers insert session essays" on public.calibration_session_essays for insert with check (
  exists (select 1 from public.calibration_sessions s where s.id = calibration_session_essays.session_id and s.created_by = auth.uid())
);
create policy "Teachers delete session essays" on public.calibration_session_essays for delete using (
  exists (select 1 from public.calibration_sessions s where s.id = calibration_session_essays.session_id and s.created_by = auth.uid())
);

-- Policies: marks visible/insertable if session owned OR marker is owner
create policy "Teachers select calibration marks" on public.calibration_marks for select using (
  exists (select 1 from public.calibration_sessions s where s.id = calibration_marks.session_id and s.created_by = auth.uid())
  or marker_id = auth.uid()
);
create policy "Teachers insert calibration marks" on public.calibration_marks for insert with check (
  exists (select 1 from public.calibration_sessions s where s.id = calibration_marks.session_id and s.created_by = auth.uid())
  or marker_id = auth.uid()
);
create policy "Teachers update own calibration marks" on public.calibration_marks for update using (marker_id = auth.uid()) with check (marker_id = auth.uid());
create policy "Teachers delete own calibration marks" on public.calibration_marks for delete using (marker_id = auth.uid());
