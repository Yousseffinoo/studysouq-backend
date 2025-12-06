import api from '../config/api';

// Generate AI questions for a lesson
export const generateAIQuestions = async (lessonId, difficulty, numberOfQuestions) => {
  try {
    const response = await api.post('/questions/generate', {
      lessonId,
      difficulty,
      numberOfQuestions
    });
    return response.data;
  } catch (error) {
    console.error('Generate AI questions error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to generate questions'
    };
  }
};

// Submit answer for AI review
export const submitAnswer = async (data) => {
  try {
    const response = await api.post('/questions/submit', data);
    return response.data;
  } catch (error) {
    console.error('Submit answer error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to submit answer'
    };
  }
};

// Get questions by lesson (from database)
export const getQuestionsByLesson = async (lessonId, filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/questions/by-lesson/${lessonId}?${params}`);
    return response.data;
  } catch (error) {
    console.error('Get questions error:', error);
    return { success: false, message: 'Failed to fetch questions' };
  }
};

// Start AI quiz session
export const startAISession = async (data) => {
  try {
    const response = await api.post('/questions/session/start', data);
    return response.data;
  } catch (error) {
    console.error('Start session error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to start session'
    };
  }
};

// Get student progress
export const getProgress = async () => {
  try {
    const response = await api.get('/questions/progress');
    return response.data;
  } catch (error) {
    console.error('Get progress error:', error);
    return { success: false, message: 'Failed to fetch progress' };
  }
};

// Get recommendations
export const getRecommendations = async () => {
  try {
    const response = await api.get('/questions/recommendations');
    return response.data;
  } catch (error) {
    console.error('Get recommendations error:', error);
    return { success: false, message: 'Failed to fetch recommendations' };
  }
};

// Legacy functions for backward compatibility
export const startQuizSession = startAISession;
export const getCurrentSession = async () => ({ success: false, data: null });
export const endQuizSession = async () => ({ success: true });
export const getLessonStats = async (lessonId) => {
  try {
    const response = await api.get('/questions/progress');
    return response.data;
  } catch (error) {
    return { success: false, data: null };
  }
};

export default {
  generateAIQuestions,
  submitAnswer,
  getQuestionsByLesson,
  startAISession,
  getProgress,
  getRecommendations,
  startQuizSession,
  getCurrentSession,
  endQuizSession,
  getLessonStats
};
