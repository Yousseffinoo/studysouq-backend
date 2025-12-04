import api from '../config/api';

// ==================== DASHBOARD ====================
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};

export const getRecentActivities = async (limit = 20) => {
  const response = await api.get(`/admin/dashboard/activities?limit=${limit}`);
  return response.data;
};

export const getAnalytics = async (period = 30) => {
  const response = await api.get(`/admin/dashboard/analytics?period=${period}`);
  return response.data;
};

// ==================== USERS ====================
export const getAllUsers = async (params = {}) => {
  const { page = 1, limit = 10, search = '', role = '', sort = '-createdAt' } = params;
  const response = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}&role=${role}&sort=${sort}`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const toggleUserBan = async (id) => {
  const response = await api.patch(`/admin/users/${id}/ban`);
  return response.data;
};

export const getUserStats = async () => {
  const response = await api.get('/admin/users/stats');
  return response.data;
};

// ==================== LESSONS ====================
export const getAllLessons = async (params = {}) => {
  const { page = 1, limit = 10, search = '', subject = '', class: classFilter = '', isPremium = '' } = params;
  const response = await api.get(`/admin/lessons?page=${page}&limit=${limit}&search=${search}&subject=${subject}&class=${classFilter}&isPremium=${isPremium}`);
  return response.data;
};

export const getLessonById = async (id) => {
  const response = await api.get(`/admin/lessons/${id}`);
  return response.data;
};

export const createLesson = async (lessonData) => {
  const response = await api.post('/admin/lessons', lessonData);
  return response.data;
};

export const updateLesson = async (id, lessonData) => {
  const response = await api.put(`/admin/lessons/${id}`, lessonData);
  return response.data;
};

export const deleteLesson = async (id) => {
  const response = await api.delete(`/admin/lessons/${id}`);
  return response.data;
};

export const getLessonStats = async () => {
  const response = await api.get('/admin/lessons/stats');
  return response.data;
};

// ==================== NOTES ====================
export const getAllNotes = async (params = {}) => {
  const { page = 1, limit = 10, search = '', subject = '', type = '' } = params;
  const response = await api.get(`/admin/notes?page=${page}&limit=${limit}&search=${search}&subject=${subject}&type=${type}`);
  return response.data;
};

export const getNoteById = async (id) => {
  const response = await api.get(`/admin/notes/${id}`);
  return response.data;
};

export const createNote = async (noteData) => {
  const response = await api.post('/admin/notes', noteData);
  return response.data;
};

export const updateNote = async (id, noteData) => {
  const response = await api.put(`/admin/notes/${id}`, noteData);
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await api.delete(`/admin/notes/${id}`);
  return response.data;
};

// ==================== QUESTIONS ====================
export const getAllQuestions = async (params = {}) => {
  const { page = 1, limit = 10, search = '', subject = '', difficulty = '' } = params;
  const response = await api.get(`/admin/questions?page=${page}&limit=${limit}&search=${search}&subject=${subject}&difficulty=${difficulty}`);
  return response.data;
};

export const getQuestionById = async (id) => {
  const response = await api.get(`/admin/questions/${id}`);
  return response.data;
};

export const createQuestion = async (questionData) => {
  const response = await api.post('/admin/questions', questionData);
  return response.data;
};

export const updateQuestion = async (id, questionData) => {
  const response = await api.put(`/admin/questions/${id}`, questionData);
  return response.data;
};

export const deleteQuestion = async (id) => {
  const response = await api.delete(`/admin/questions/${id}`);
  return response.data;
};

// ==================== IMAGES ====================
export const getAllImages = async (params = {}) => {
  const { page = 1, limit = 20, status = '', category = '', subject = '' } = params;
  const response = await api.get(`/admin/images?page=${page}&limit=${limit}&status=${status}&category=${category}&subject=${subject}`);
  return response.data;
};

export const uploadImage = async (formData) => {
  const response = await api.post('/admin/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const approveImage = async (id) => {
  const response = await api.patch(`/admin/images/${id}/approve`);
  return response.data;
};

export const rejectImage = async (id, reason) => {
  const response = await api.patch(`/admin/images/${id}/reject`, { reason });
  return response.data;
};

export const deleteImage = async (id) => {
  const response = await api.delete(`/admin/images/${id}`);
  return response.data;
};

// ==================== PRICING ====================
export const getAllPricingPlans = async () => {
  const response = await api.get('/admin/pricing');
  return response.data;
};

export const getPricingPlanById = async (id) => {
  const response = await api.get(`/admin/pricing/${id}`);
  return response.data;
};

export const createPricingPlan = async (pricingData) => {
  const response = await api.post('/admin/pricing', pricingData);
  return response.data;
};

export const updatePricingPlan = async (id, pricingData) => {
  const response = await api.put(`/admin/pricing/${id}`, pricingData);
  return response.data;
};

export const deletePricingPlan = async (id) => {
  const response = await api.delete(`/admin/pricing/${id}`);
  return response.data;
};

export const updatePaymentConfig = async (configData) => {
  const response = await api.put('/admin/pricing/payment-config', configData);
  return response.data;
};

// ==================== AI CONFIG ====================
export const getAllAIConfigs = async () => {
  const response = await api.get('/admin/ai-config');
  return response.data;
};

export const getAIConfigByProvider = async (provider) => {
  const response = await api.get(`/admin/ai-config/${provider}`);
  return response.data;
};

export const upsertAIConfig = async (configData) => {
  const response = await api.post('/admin/ai-config', configData);
  return response.data;
};

export const deleteAIConfig = async (provider) => {
  const response = await api.delete(`/admin/ai-config/${provider}`);
  return response.data;
};

export const toggleAIProvider = async (provider) => {
  const response = await api.patch(`/admin/ai-config/${provider}/toggle`);
  return response.data;
};

export const setDefaultAIProvider = async (provider) => {
  const response = await api.patch(`/admin/ai-config/${provider}/set-default`);
  return response.data;
};

export default {
  // Dashboard
  getDashboardStats,
  getRecentActivities,
  getAnalytics,
  // Users
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserBan,
  getUserStats,
  // Lessons
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonStats,
  // Notes
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  // Questions
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  // Images
  getAllImages,
  uploadImage,
  approveImage,
  rejectImage,
  deleteImage,
  // Pricing
  getAllPricingPlans,
  getPricingPlanById,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  updatePaymentConfig,
  // AI Config
  getAllAIConfigs,
  getAIConfigByProvider,
  upsertAIConfig,
  deleteAIConfig,
  toggleAIProvider,
  setDefaultAIProvider
};

