import { useState } from 'react';

interface Student {
  id: number;
  name: string;
  email: string;
  grade: string;
  classSection: string;
  studentId: string;
  active: boolean;
  notes: string;
}

function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<Omit<Student, 'id'>>({
    name: '',
    email: '',
    grade: '',
    classSection: '',
    studentId: '',
    active: true,
    notes: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm({ name: '', email: '', grade: '', classSection: '', studentId: '', active: true, notes: '' });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) {
      const newStudent: Student = { id: Date.now(), ...form };
      setStudents(prev => [...prev, newStudent]);
    } else {
      setStudents(prev => prev.map(s => (s.id === editingId ? { id: editingId, ...form } : s)));
    }
    resetForm();
  };

  const handleEdit = (id: number) => {
    const student = students.find(s => s.id === id);
    if (!student) return;
    const { id: _id, ...rest } = student;
    setForm(rest);
    setEditingId(id);
  };

  const handleDelete = (id: number) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Students Manager</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 border p-4 rounded bg-gray-50">
        <input
          className="border p-2"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          className="border p-2"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          className="border p-2"
          name="grade"
          value={form.grade}
          onChange={handleChange}
          placeholder="Grade Level"
        />
        <input
          className="border p-2"
          name="classSection"
          value={form.classSection}
          onChange={handleChange}
          placeholder="Class Section"
        />
        <input
          className="border p-2"
          name="studentId"
          value={form.studentId}
          onChange={handleChange}
          placeholder="Student ID"
        />
        <div className="flex items-center space-x-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="mr-2"
            />
            Active
          </label>
        </div>
        <input
          className="border p-2 col-span-full"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes"
        />
        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded">
          {editingId === null ? 'Add Student' : 'Update Student'}
        </button>
        {editingId !== null && (
          <button type="button" onClick={resetForm} className="bg-gray-400 text-white py-2 px-4 rounded">
            Cancel
          </button>
        )}
      </form>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Grade</th>
            <th className="p-2">Section</th>
            <th className="p-2">Student ID</th>
            <th className="p-2">Active</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id} className="border-b">
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.email}</td>
              <td className="p-2">{s.grade}</td>
              <td className="p-2">{s.classSection}</td>
              <td className="p-2">{s.studentId}</td>
              <td className="p-2">{s.active ? 'Yes' : 'No'}</td>
              <td className="p-2 space-x-2">
                <button onClick={() => handleEdit(s.id)} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={7} className="p-4 text-center text-gray-500">No students added yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Students;