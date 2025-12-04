import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminLayout from '../../admin/AdminLayout';
import RichTextEditor from '../../admin/RichTextEditor';
import { getAllNotes, createNote, updateNote, deleteNote } from '../../../services/adminService';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    subject: 'physics',
    class: '9th',
    chapter: 1,
    type: 'summary',
    tags: [],
    isPremium: false,
    isVisible: true
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [page, search, subjectFilter, typeFilter]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await getAllNotes({ 
        page, 
        limit: 10, 
        search, 
        subject: subjectFilter,
        type: typeFilter 
      });
      if (response.success) {
        setNotes(response.data.notes);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await updateNote(editingNote._id, formData);
        toast.success('Note updated successfully');
      } else {
        await createNote(formData);
        toast.success('Note created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchNotes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        toast.success('Note deleted successfully');
        fetchNotes();
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      summary: note.summary || '',
      subject: note.subject,
      class: note.class,
      chapter: note.chapter,
      type: note.type,
      tags: note.tags || [],
      isPremium: note.isPremium,
      isVisible: note.isVisible
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      summary: '',
      subject: 'physics',
      class: '9th',
      chapter: 1,
      type: 'summary',
      tags: [],
      isPremium: false,
      isVisible: true
    });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const subjects = [
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'biology', label: 'Biology' },
    { value: 'computer-science', label: 'Computer Science' }
  ];

  const noteTypes = [
    { value: 'formula', label: 'Formula' },
    { value: 'definition', label: 'Definition' },
    { value: 'theorem', label: 'Theorem' },
    { value: 'example', label: 'Example' },
    { value: 'summary', label: 'Summary' },
    { value: 'tips', label: 'Tips' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Notes Management</h1>
            <p className="text-[#94A3B8]">Create formulas, definitions, and study notes</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Note
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <Search className="w-5 h-5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search notes..."
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
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none"
          >
            <option value="">All Types</option>
            {noteTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-[#94A3B8]">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#94A3B8]">
              No notes found
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <FileText className="w-8 h-8 text-[#2F6FED]" />
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(note)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{note.title}</h3>
                
                {note.summary && (
                  <p className="text-[#94A3B8] text-sm mb-3 line-clamp-2">{note.summary}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400 capitalize">
                    {note.subject.replace('-', ' ')}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400 capitalize">
                    {note.type}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-gray-500/10 text-gray-400">
                    {note.class}
                  </span>
                  {note.isPremium && (
                    <span className="px-2 py-1 rounded text-xs bg-yellow-500/10 text-yellow-400">
                      Premium
                    </span>
                  )}
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 rounded text-xs bg-white/5 text-[#94A3B8]">
                        #{tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="px-2 py-1 rounded text-xs text-[#94A3B8]">
                        +{note.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/90 border border-white/10 rounded-2xl p-6 w-full max-w-4xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <X className="w-6 h-6 text-[#94A3B8]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
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
                  <label className="block text-sm mb-2 text-[#94A3B8]">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                  >
                    {noteTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
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
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#94A3B8]">Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows="2"
                  placeholder="Brief summary or preview..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#94A3B8]">Content * (Supports LaTeX formulas)</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Write the note content here. Use formula button for LaTeX math expressions..."
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#94A3B8]">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag and press Enter"
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#2F6FED]/10 text-[#2F6FED] rounded-full text-sm flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
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
                  {editingNote ? 'Update Note' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

