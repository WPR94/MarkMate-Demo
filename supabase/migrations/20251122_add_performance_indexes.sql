-- Performance indexes to speed up common filters and joins
-- Safe to run multiple times

create index if not exists idx_essays_teacher_id on public.essays(teacher_id);
create index if not exists idx_essays_created_at on public.essays(created_at);

create index if not exists idx_rubrics_teacher_id on public.rubrics(teacher_id);
create index if not exists idx_students_teacher_id on public.students(teacher_id);

create index if not exists idx_feedback_essay_id on public.feedback(essay_id);
