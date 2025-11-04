import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import notify from '../utils/notify';

interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  class_section: string;
  student_id: string;
  active: boolean;
  notes: string;
}

function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<Student, 'id'>>({
    name: '',
    email: '',
    grade: '',
    class_section: '',
    student_id: '',
    active: true,
    notes: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadStudents();
    }
  }, [user]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', user!.id)
        .order('name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error loading students:', error);
      notify.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, value } = target;
    
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({ 
      name: '', 
      email: '', 
      grade: '', 
      class_section: '', 
      student_id: '', 
      active: true, 
      notes: '' 
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      notify.error('You must be logged in');
      return;
    }

    try {
      setSaving(true);
      
      if (editingId === null) {
        // Create new student
        const { data, error } = await supabase
          .from('students')
          .insert([{
            teacher_id: user.id,
            name: form.name,
            email: form.email,
            grade: form.grade,
            class_section: form.class_section,
            student_id: form.student_id,
            active: form.active,
            notes: form.notes,
          }])
          .select()
          .single();

        if (error) throw error;
        setStudents(prev => [...prev, data]);
        notify.success('Student added successfully');
      } else {
        // Update existing student
        const { data, error } = await supabase
          .from('students')
          .update({
            name: form.name,
            email: form.email,
            grade: form.grade,
            class_section: form.class_section,
            student_id: form.student_id,
            active: form.active,
            notes: form.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        setStudents(prev => prev.map(s => (s.id === editingId ? data : s)));
        notify.success('Student updated successfully');
      }
      
      resetForm();
    } catch (error: any) {
      console.error('Error saving student:', error);
      notify.error(editingId ? 'Failed to update student' : 'Failed to add student');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (id: string) => {
    const student = students.find(s => s.id === id);
    if (!student) return;
    const { id: _id, ...rest } = student;
    setForm(rest);
    setEditingId(id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setStudents(prev => prev.filter(s => s.id !== id));
      if (editingId === id) resetForm();
      notify.success('Student deleted successfully');
    } catch (error: any) {
      console.error('Error deleting student:', error);
      notify.error('Failed to delete student');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Students Manager</h2>
        <p className="text-gray-600 mt-1">Manage your students and track their essay submissions</p>
      </div>

      {/* Form */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {editingId === null ? 'Add New Student' : 'Edit Student'}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Student name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              name="grade"
              value={form.grade}
              onChange={handleChange}
              placeholder="e.g., 10, Year 10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Section</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              name="class_section"
              value={form.class_section}
              onChange={handleChange}
              placeholder="e.g., A, B1, English 101"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              name="student_id"
              value={form.student_id}
              onChange={handleChange}
              placeholder="Unique student ID"
            />
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Active Student</span>
            </label>
          </div>
          
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes about the student"
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Saving...' : (editingId === null ? 'Add Student' : 'Update Student')}
          </button>
          {editingId !== null && (
            <button 
              type="button" 
              onClick={resetForm} 
              className="bg-gray-400 text-white py-2 px-6 rounded-lg hover:bg-gray-500 font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Section</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.grade || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.class_section || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.student_id || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {s.active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-3">
                    <button 
                      onClick={() => handleEdit(s.id)} 
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(s.id)} 
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <p className="text-gray-600 font-medium">No students added yet</p>
                      <p className="text-sm text-gray-500 mt-1">Add your first student using the form above</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Students;