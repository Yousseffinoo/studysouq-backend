import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminLayout from '../../admin/AdminLayout';
import RichTextEditor from '../../admin/RichTextEditor';
import { getAllLessons, createLesson, updateLesson, deleteLesson } from '../../../services/adminService';

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    subject: 'physics',
    class: '9th',
    chapter: 1,
    order: 0,
    difficulty: 'medium',
    duration: 30,
    videoUrl: '',
    isPremium: false,
    isVisible: true
  });

  useEffect(() => {
    fetchLessons();
  }, [page, search, subjectFilter]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await getAllLessons({ page, limit: 10, search, subject: subjectFilter });
      if (response.success) {
        setLessons(response.data.lessons);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await updateLesson(editingLesson._id, formData);
        toast.success('Lesson updated successfully');
      } else {
        await createLesson(formData);
        toast.success('Lesson created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchLessons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await deleteLesson(id);
        toast.success('Lesson deleted successfully');
        fetchLessons();
      } catch (error) {
        toast.error('Failed to delete lesson');
      }
    }
  };

  const openEditModal = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      subject: lesson.subject,
      class: lesson.class,
      chapter: lesson.chapter,
      order: lesson.order,
      difficulty: lesson.difficulty,
      duration: lesson.duration,
      videoUrl: lesson.videoUrl || '',
      isPremium: lesson.isPremium,
      isVisible: lesson.isVisible
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingLesson(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      subject: 'physics',
      class: '9th',
      chapter: 1,
      order: 0,
      difficulty: 'medium',
      duration: 30,
      videoUrl: '',
      isPremium: false,
      isVisible: true
    });
  };

  const subjects = [
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'biology', label: 'Biology' },
    { value: 'computer-science', label: 'Computer Science' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Lessons Management</h1>
            <p className="text-[#94A3B8]">Create and manage educational content</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Lesson
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <Search className="w-5 h-5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-white placeholder:text-[#94A3B8] w-full"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#94A3B8]">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#94A3B8]">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#94A3B8]">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#94A3B8]">Chapter</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#94A3B8]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#94A3B8]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[#94A3B8]">
                      Loading lessons...
                    </td>
                  </tr>
                ) : lessons.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[#94A3B8]">
                      No lessons found
                    </td>
                  </tr>
                ) : (
                  lessons.map((lesson) => (
                    <tr key={lesson._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{lesson.title}</p>
                          <p className="text-[#94A3B8] text-sm">{lesson.description?.substring(0, 60)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                          {lesson.subject.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#94A3B8]">{lesson.class}</td>
                      <td className="px-6 py-4 text-[#94A3B8]">Ch. {lesson.chapter}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {lesson.isPremium && (
                            <span className="px-2 py-1 rounded text-xs bg-yellow-500/10 text-yellow-400">Premium</span>
                          )}
                          {lesson.isVisible ? (
                            <span className="px-2 py-1 rounded text-xs bg-green-500/10 text-green-400">Visible</span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-gray-500/10 text-gray-400">Hidden</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(lesson)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(lesson._id)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors"
              >
                Previous
              </button>
              <span className="text-[#94A3B8]">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/90 border border-white/10 rounded-2xl p-6 w-full max-w-4xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <X className="w-6 h-6 text-[#94A3B8]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-[#94A3B8]">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-[#94A3B8]">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                  >
                    {subjects.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-[#94A3B8]">Class *</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                  >
                    <option value="9th">9th</option>
                    <option value="10th">10th</option>
                    <option value="11th">11th</option>
                    <option value="12th">12th</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-[#94A3B8]">Chapter *</label>
                  <input
                    type="number"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: parseInt(e.target.value) })}
                    required
                    min="1"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-[#94A3B8]">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-[#94A3B8]">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#94A3B8]">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#94A3B8]">Video URL (optional)</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#94A3B8]">Content *</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Write the lesson content here. Supports rich text, formulas, and images..."
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[#94A3B8]">Premium Content</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[#94A3B8]">Visible to Users</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-colors"
                >
                  {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

