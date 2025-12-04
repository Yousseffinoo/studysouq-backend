import api from '../config/api';

/**
 * Public API Service
 * Frontend service for handling all public API calls (subjects, sections, lessons, questions, notes)
 */

// ==================== SUBJECTS ====================

/**
 * Get all subjects
 */
export const getSubjects = async () => {
  try {
    const response = await api.get('/subjects');
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('Get subjects error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch subjects',
      data: []
    };
  }
};

/**
 * Get subject by ID
 */
export const getSubjectById = async (subjectId) => {
  try {
    const response = await api.get(`/subjects/${subjectId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Get subject by ID error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch subject',
      data: null
    };
  }
};

// ==================== SECTIONS ====================

/**
 * Get all sections
 */
export const getSections = async (subjectId = null) => {
  try {
    const url = subjectId 
      ? `/subjects/${subjectId}/sections`
      : '/sections';
    const response = await api.get(url);
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('Get sections error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch sections',
      data: []
    };
  }
};

/**
 * Get section by ID
 */
export const getSectionById = async (sectionId) => {
  try {
    const response = await api.get(`/sections/${sectionId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Get section by ID error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch section',
      data: null
    };
  }
};

// ==================== LESSONS ====================

/**
 * Get all lessons
 */
export const getLessons = async (params = {}) => {
  try {
    const { page = 1, limit = 20, search = '', subject = '', section = '' } = params;
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (subject) queryParams.append('subject', subject);
    if (section) queryParams.append('section', section);

    const response = await api.get(`/lessons?${queryParams.toString()}`);
    return {
      success: true,
      data: response.data.data?.lessons || [],
      pagination: {
        totalPages: response.data.data?.totalPages || 1,
        currentPage: response.data.data?.currentPage || 1,
        total: response.data.data?.total || 0
      }
    };
  } catch (error) {
    console.error('Get lessons error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch lessons',
      data: [],
      pagination: { totalPages: 1, currentPage: 1, total: 0 }
    };
  }
};

/**
 * Get lessons by section ID
 */
export const getLessonsBySection = async (sectionId) => {
  try {
    const response = await api.get(`/sections/${sectionId}/lessons`);
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('Get lessons by section error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch lessons',
      data: []
    };
  }
};

/**
 * Get lesson by ID
 */
export const getLessonById = async (lessonId) => {
  try {
    const response = await api.get(`/lessons/${lessonId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Get lesson by ID error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch lesson',
      data: null
    };
  }
};

// ==================== QUESTIONS ====================

/**
 * Get all questions
 */
export const getQuestions = async (params = {}) => {
  try {
    const { page = 1, limit = 20, search = '', subject = '', lesson = '', difficulty = '' } = params;
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (subject) queryParams.append('subject', subject);
    if (lesson) queryParams.append('lesson', lesson);
    if (difficulty) queryParams.append('difficulty', difficulty);

    const response = await api.get(`/questions?${queryParams.toString()}`);
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('Get questions error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch questions',
      data: []
    };
  }
};

/**
 * Get question by ID
 */
export const getQuestionById = async (questionId) => {
  try {
    const response = await api.get(`/questions/${questionId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Get question by ID error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch question',
      data: null
    };
  }
};

/**
 * Submit answer
 */
export const submitAnswer = async (questionId, answer) => {
  try {
    const response = await api.post(`/questions/${questionId}/answer`, {
      answer
    });
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Submit answer error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to submit answer',
      data: null
    };
  }
};

// ==================== NOTES ====================

/**
 * Get all notes
 */
export const getNotes = async (params = {}) => {
  try {
    const { page = 1, limit = 20, search = '', subject = '', lesson = '' } = params;
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (subject) queryParams.append('subject', subject);
    if (lesson) queryParams.append('lesson', lesson);

    const response = await api.get(`/notes?${queryParams.toString()}`);
    return {
      success: true,
      data: response.data.data?.notes || [],
      pagination: {
        totalPages: response.data.data?.totalPages || 1,
        currentPage: response.data.data?.currentPage || 1,
        total: response.data.data?.total || 0
      }
    };
  } catch (error) {
    console.error('Get notes error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch notes',
      data: [],
      pagination: { totalPages: 1, currentPage: 1, total: 0 }
    };
  }
};

/**
 * Get note by ID
 */
export const getNoteById = async (noteId) => {
  try {
    const response = await api.get(`/notes/${noteId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Get note by ID error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch note',
      data: null
    };
  }
};

