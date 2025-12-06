import api from '../config/api';

/**
 * Questions Service - Frontend API calls for quiz system
 */

// Get questions for a lesson
export const getQuestionsByLesson = async (lessonId, params = {}) => {
  try {
    const response = await api.get(`/questions/by-lesson/${lessonId}`, { params });
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get questions error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch questions',
      data: []
    };
  }
};

// Start a quiz session
export const startQuizSession = async (sessionData) => {
  try {
    const response = await api.post('/questions/session/start', sessionData);
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Start session error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to start quiz session'
    };
  }
};

// Get current active session
export const getCurrentSession = async () => {
  try {
    const response = await api.get('/questions/session/current');
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get session error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'No active session'
    };
  }
};

// Submit an answer
export const submitAnswer = async (answerData) => {
  try {
    // Handle file uploads
    if (answerData.answerImage || answerData.answerCanvas) {
      const formData = new FormData();
      Object.keys(answerData).forEach(key => {
        if (key === 'answerImage' || key === 'answerCanvas') {
          if (answerData[key]) {
            formData.append('answer', answerData[key]);
          }
        } else {
          formData.append(key, answerData[key]);
        }
      });
      const response = await api.post('/questions/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { success: true, data: response.data.data || response.data };
    }

    const response = await api.post('/questions/submit', answerData);
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Submit answer error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to submit answer'
    };
  }
};

// End quiz session
export const endQuizSession = async (sessionId) => {
  try {
    const response = await api.post(`/questions/session/${sessionId}/end`);
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('End session error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to end session'
    };
  }
};

// Get student progress/analytics
export const getStudentProgress = async () => {
  try {
    const response = await api.get('/questions/progress');
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get progress error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get progress'
    };
  }
};

// Get recommendations based on weak topics
export const getRecommendations = async () => {
  try {
    const response = await api.get('/questions/recommendations');
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get recommendations error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get recommendations'
    };
  }
};

// Get lesson-specific stats
export const getLessonStats = async (lessonId) => {
  try {
    const response = await api.get(`/questions/lesson-stats/${lessonId}`);
    return { success: true, data: response.data.data || response.data };
  } catch (error) {
    console.error('Get lesson stats error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get lesson stats'
    };
  }
};

export default {
  getQuestionsByLesson,
  startQuizSession,
  getCurrentSession,
  submitAnswer,
  endQuizSession,
  getStudentProgress,
  getRecommendations,
  getLessonStats
};

