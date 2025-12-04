import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminLayout from '../../admin/AdminLayout';
import RichTextEditor from '../../admin/RichTextEditor';
import { getAllQuestions, createQuestion, updateQuestion, deleteQuestion } from '../../../services/adminService';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    questionText: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    correctAnswer: 0,
    explanation: '',
    hint: '',
    subject: 'physics',
    class: '9th',
    chapter: 1,
    difficulty: 'medium',
    marks: 1,
    type: 'mcq',
    isPremium: false,
    isVisible: true
  });

  useEffect(() => {
    fetchQuestions();
  }, [page, search, subjectFilter, difficultyFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await getAllQuestions({ 
        page, 
        limit: 10, 
        search, 
        subject: subjectFilter,
        difficulty: difficultyFilter 
      });
      if (response.success) {
        setQuestions(response.data.questions);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const hasCorrectAnswer = formData.options.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      toast.error('Please mark at least one option as correct');
      return;
    }

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, formData);
        toast.success('Question updated successfully');
      } else {
        await createQuestion(formData);
        toast.success('Question created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(id);
        toast.success('Question deleted successfully');
        fetchQuestions();
      } catch (error) {
        toast.error('Failed to delete question');
      }
    }
  };

  const openEditModal = (question) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.questionText,
      options: question.options.map(opt => ({
        text: opt.text,
        isCorrect: opt.isCorrect || false
      })),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      hint: question.hint || '',
      subject: question.subject,
      class: question.class,
      chapter: question.chapter,
      difficulty: question.difficulty,
      marks: question.marks,
      type: question.type,
      isPremium: question.isPremium,
      isVisible: question.isVisible
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setFormData({
      questionText: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswer: 0,
      explanation: '',
      hint: '',
      subject: 'physics',
      class: '9th',
      chapter: 1,
      difficulty: 'medium',
      marks: 1,
      type: 'mcq',
      isPremium: false,
      isVisible: true
    });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    
    // If marking as correct, unmark others
    if (field === 'isCorrect' && value) {
      newOptions.forEach((opt, idx) => {
        if (idx !== index) opt.isCorrect = false;
      });
      setFormData({ ...formData, options: newOptions, correctAnswer: index });
    } else {
      setFormData({ ...formData, options: newOptions });
    }
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
            <h1 className="text-3xl font-bold text-white mb-2">Questions Management</h1>
            <p className="text-[#94A3B8]">Create MCQs and practice questions</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <Search className="w-5 h-5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search questions..."
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
            value={difficultyFilter}
            onChange={(e) => { setDifficultyFilter(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-[#94A3B8]">
              Loading questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8]">
              No questions found
            </div>
          ) : (
            questions.map((question, idx) => (
              <div
                key={question._id}
                className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-[#2F6FED]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#2F6FED] font-bold">{(page - 1) * 10 + idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400 capitalize">
                          {question.subject.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          question.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                          question.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {question.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-gray-500/10 text-gray-400">
                          {question.class} • Ch.{question.chapter}
                        </span>
                        {question.isPremium && (
                          <span className="px-2 py-1 rounded text-xs bg-yellow-500/10 text-yellow-400">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-white font-medium mb-3">{question.questionText}</p>
                      <div className="space-y-2">
                        {question.options?.map((option, optIdx) => (
                          <div 
                            key={optIdx}
                            className={`p-3 rounded-lg border ${
                              option.isCorrect 
                                ? 'border-green-500/30 bg-green-500/5' 
                                : 'border-white/5 bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[#94A3B8]">{String.fromCharCode(65 + optIdx)}.</span>
                              <span className={option.isCorrect ? 'text-green-400' : 'text-[#94A3B8]'}>
                                {option.text}
                              </span>
                              {option.isCorrect && (
                                <span className="ml-auto text-xs text-green-400">✓ Correct</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(question)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
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
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <X className="w-6 h-6 text-[#94A3B8]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="block text-sm mb-2 text-[#94A3B8]">Difficulty *</label>
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
                  <label className="block text-sm mb-2 text-[#94A3B8]">Marks *</label>
                  <input
                    type="number"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                    required
                    min="1"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-[#94A3B8]">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="true-false">True/False</option>
                    <option value="numerical">Numerical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#94A3B8]">Question Text * (Supports LaTeX)</label>
                <RichTextEditor
                  value={formData.questionText}
                  onChange={(value) => setFormData({ ...formData, questionText: value })}
                  placeholder="Enter your question here. Use formula button for math expressions..."
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#94A3B8]">Options * (Mark the correct answer)</label>
                <div className="space-y-3">
                  {formData.options.map((option, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) => updateOption(idx, 'isCorrect', e.target.checked)}
                        className="w-5 h-5 flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(idx, 'text', e.target.value)}
                        required
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#94A3B8]">Explanation * (Why is the answer correct?)</label>
                <RichTextEditor
                  value={formData.explanation}
                  onChange={(value) => setFormData({ ...formData, explanation: value })}
                  placeholder="Explain the correct answer..."
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#94A3B8]">Hint (optional)</label>
                <textarea
                  value={formData.hint}
                  onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                  rows="2"
                  placeholder="Give students a hint..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#2F6FED]"
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
                  <span className="text-sm text-[#94A3B8]">Premium Question</span>
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
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

