-- Supabase schema for Simple Rubriq MVP
-- Run this using Supabase SQL editor or with the Supabase CLI: `supabase db reset` with migrations

-- Ensure required extension for UUID generation
create extension if not exists pgcrypto;

-- =========================
-- Tables
-- =========================
create table if not exists public.rubrics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  criteria jsonb not null,
  subject text,
  teacher_id uuid not null,
  created_at timestamptz default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null,
  name text not null,
  email text,
  grade text,
  class_section text,
  student_id text,
  active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.essays (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  word_count int not null,
  created_at timestamptz default now(),
  teacher_id uuid not null,
  rubric_id uuid references public.rubrics(id),
  student_id uuid references public.students(id)
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  essay_id uuid references public.essays(id),
  rubric_id uuid references public.rubrics(id),
  grammar_issues jsonb,
  strengths jsonb,
  improvements jsonb,
  suggested_feedback text,
  overall_score int,
  created_at timestamptz default now()
);

-- Useful indexes
create index if not exists idx_essays_teacher on public.essays(teacher_id);
create index if not exists idx_essays_student on public.essays(student_id);
create index if not exists idx_rubrics_teacher on public.rubrics(teacher_id);
create index if not exists idx_students_teacher on public.students(teacher_id);
create index if not exists idx_feedback_essay on public.feedback(essay_id);
create index if not exists idx_feedback_rubric on public.feedback(rubric_id);

-- =========================
-- Row Level Security
-- =========================
alter table public.essays enable row level security;
alter table public.rubrics enable row level security;
alter table public.students enable row level security;
alter table public.feedback enable row level security;

-- Students policies
create policy "Teachers can select own students"
  on public.students for select
  using (teacher_id = auth.uid());

create policy "Teachers can insert own students"
  on public.students for insert
  with check (teacher_id = auth.uid());

create policy "Teachers can update own students"
  on public.students for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Teachers can delete own students"
  on public.students for delete
  using (teacher_id = auth.uid());

-- Essays policies
create policy "Teachers can select own essays"
  on public.essays for select
  using (teacher_id = auth.uid());

create policy "Teachers can insert own essays"
  on public.essays for insert
  with check (teacher_id = auth.uid());

create policy "Teachers can update own essays"
  on public.essays for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Teachers can delete own essays"
  on public.essays for delete
  using (teacher_id = auth.uid());

-- Rubrics policies
create policy "Teachers can select own rubrics"
  on public.rubrics for select
  using (teacher_id = auth.uid());

create policy "Teachers can insert own rubrics"
  on public.rubrics for insert
  with check (teacher_id = auth.uid());

create policy "Teachers can update own rubrics"
  on public.rubrics for update
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

create policy "Teachers can delete own rubrics"
  on public.rubrics for delete
  using (teacher_id = auth.uid());

-- Feedback policies (no direct teacher_id; join via essays/rubrics)
create policy "Teachers can select feedback for their essays/rubrics"
  on public.feedback for select
  using (
    exists (
      select 1 from public.essays e
      where e.id = feedback.essay_id and e.teacher_id = auth.uid()
    )
    or exists (
      select 1 from public.rubrics r
      where r.id = feedback.rubric_id and r.teacher_id = auth.uid()
    )
  );

create policy "Teachers can insert feedback for their essays/rubrics"
  on public.feedback for insert
  with check (
    exists (
      select 1 from public.essays e
      where e.id = feedback.essay_id and e.teacher_id = auth.uid()
    )
    or exists (
      select 1 from public.rubrics r
      where r.id = feedback.rubric_id and r.teacher_id = auth.uid()
    )
  );

create policy "Teachers can update feedback for their essays/rubrics"
  on public.feedback for update
  using (
    exists (
      select 1 from public.essays e
      where e.id = feedback.essay_id and e.teacher_id = auth.uid()
    )
    or exists (
      select 1 from public.rubrics r
      where r.id = feedback.rubric_id and r.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.essays e
      where e.id = feedback.essay_id and e.teacher_id = auth.uid()
    )
    or exists (
      select 1 from public.rubrics r
      where r.id = feedback.rubric_id and r.teacher_id = auth.uid()
    )
  );

create policy "Teachers can delete feedback for their essays/rubrics"
  on public.feedback for delete
  using (
    exists (
      select 1 from public.essays e
      where e.id = feedback.essay_id and e.teacher_id = auth.uid()
    )
    or exists (
      select 1 from public.rubrics r
      where r.id = feedback.rubric_id and r.teacher_id = auth.uid()
    )
  );
