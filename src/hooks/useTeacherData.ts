import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export type Rubric = { id: string; name: string; subject: string; exam_board?: string };
export type Student = { id: string; name: string };

async function fetchRubrics(userId: string): Promise<Rubric[]> {
  const { data, error } = await supabase
    .from('rubrics')
    .select('id, name, subject, exam_board')
    .eq('teacher_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function fetchStudents(userId: string): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('id, name')
    .eq('teacher_id', userId)
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data || [];
}

export function useTeacherRubrics() {
  const { user } = useAuth();
  return useQuery<Rubric[], Error>(
    ['teacher', 'rubrics', user?.id],
    () => fetchRubrics(user!.id),
    { enabled: !!user, refetchOnWindowFocus: true, staleTime: 60_000, cacheTime: 5 * 60_000, retry: 1 }
  );
}

export function useTeacherStudents() {
  const { user } = useAuth();
  return useQuery<Student[], Error>(
    ['teacher', 'students', user?.id],
    () => fetchStudents(user!.id),
    { enabled: !!user, refetchOnWindowFocus: true, staleTime: 60_000, cacheTime: 5 * 60_000, retry: 1 }
  );
}
