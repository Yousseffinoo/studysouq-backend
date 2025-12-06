import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Settings,
  CheckCircle,
  Trophy,
  Clock,
  Target,
  BarChart3,
  XCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import QuestionViewer from '../quiz/QuestionViewer';
import {
  getQuestionsByLesson,
  startQuizSession,
  getCurrentSession,
  endQuizSession,
  getLessonStats
} from '../../services/questionsService';
import { getLessonById } from '../../services/publicService';

const DIFFICULTIES = [
  { value: 'mixed', label: 'Mixed', description: 'All difficulty levels' },
  { value: 'easy', label: 'Easy', description: 'Basic concepts' },
  { value: 'medium', label: 'Medium', description: 'Standard difficulty' },
  { value: 'hard', label: 'Hard', description: 'Challenging questions' },
];

const SOURCES = [
  { value: 'mixed', label: 'Mixed', description: 'All question types' },
  { value: 'past_paper', label: 'Past Papers', description: 'Official exam questions' },
  { value: 'ai_generated', label: 'AI Generated', description: 'AI-created practice' },
  { value: 'manual', label: 'Custom', description: 'Teacher-made questions' },
];

const ANSWER_MODES = [
  { value: 'instant', label: 'Instant Reveal', description: 'See answer immediately', icon: Sparkles },
  { value: 'write', label: 'Draw Answer', description: 'Write on canvas', icon: Target },
  { value: 'upload', label: 'Upload Work', description: 'Submit your written work', icon: CheckCircle },
];

export default function QuizPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  // States
  const [lesson, setLesson] = useState(null);
  const [lessonStats, setLessonStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quiz config
  const [showConfig, setShowConfig] = useState(true);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('mixed');
  const [sourceType, setSourceType] = useState('mixed');
  const [answerMode, setAnswerMode] = useState('instant');

  // Quiz state
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Fetch lesson info
  useEffect(() => {
    const fetchData = async () => {
      if (!lessonId) return;

      setLoading(true);
      try {
        const lessonResult = await getLessonById(lessonId);
        if (lessonResult.success) {
          setLesson(lessonResult.data);
        } else {
          setError('Lesson not found');
        }

        // Get stats if logged in
        if (token) {
          const statsResult = await getLessonStats(lessonId);
          if (statsResult.success) {
            setLessonStats(statsResult.data);
          }
        }

        // Check for existing session
        const sessionResult = await getCurrentSession();
        if (sessionResult.success && sessionResult.data?.lesson === lessonId) {
          setSession(sessionResult.data);
          setShowConfig(false);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId, token]);

  const handleStartQuiz = async () => {
    if (!user || !token) {
      navigate('/login', { state: { from: `/quiz/${lessonId}` } });
      return;
    }

    try {
      const result = await startQuizSession({
        subject: lesson.subject,
        lesson: lessonId,
        numberOfQuestions,
        difficulty,
        sourceType,
        answerMode
      });

      if (result.success) {
        setSession(result.data);
        setShowConfig(false);
        setCurrentIndex(0);
      } else {
        setError(result.message || 'Failed to start quiz');
      }
    } catch (err) {
      console.error('Start quiz error:', err);
      setError('Failed to start quiz');
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < session.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCompleteQuiz = async () => {
    try {
      const result = await endQuizSession(session._id);
      if (result.success) {
        setSession(prev => ({ ...prev, ...result.data, status: 'completed' }));
        setShowResults(true);
      }
    } catch (err) {
      console.error('Complete quiz error:', err);
    }
  };

  const handleRetry = () => {
    setSession(null);
    setShowConfig(true);
    setShowResults(false);
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white text-black font-semibold hover:bg-white/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Quiz Results Screen
  if (showResults && session) {
    const accuracy = session.questionsAnswered > 0
      ? Math.round((session.questionsCorrect / session.questionsAnswered) * 100)
      : 0;

    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black border-2 border-white/20 p-8"
          >
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
              <p className="text-white/70">{lesson?.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 p-4 border-2 border-white/10">
                <p className="text-white/50 text-sm mb-1">Correct</p>
                <p className="text-2xl font-bold text-green-400">
                  {session.questionsCorrect} / {session.questionsAnswered}
                </p>
              </div>
              <div className="bg-white/5 p-4 border-2 border-white/10">
                <p className="text-white/50 text-sm mb-1">Accuracy</p>
                <p className="text-2xl font-bold text-white">{accuracy}%</p>
              </div>
              <div className="bg-white/5 p-4 border-2 border-white/10">
                <p className="text-white/50 text-sm mb-1">Average Score</p>
                <p className="text-2xl font-bold text-blue-400">{session.averageScore}%</p>
              </div>
              <div className="bg-white/5 p-4 border-2 border-white/10">
                <p className="text-white/50 text-sm mb-1">Time Spent</p>
                <p className="text-2xl font-bold text-purple-400">
                  {Math.floor(session.totalTimeSeconds / 60)}m {session.totalTimeSeconds % 60}s
                </p>
              </div>
            </div>

            {/* Performance Message */}
            <div className={`p-4 mb-8 border-2 ${
              accuracy >= 80 ? 'bg-green-500/10 border-green-500/30' :
              accuracy >= 60 ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              <p className={`text-lg ${
                accuracy >= 80 ? 'text-green-400' :
                accuracy >= 60 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {accuracy >= 80 ? '🎉 Excellent work! You\'ve mastered this topic!' :
                 accuracy >= 60 ? '👍 Good effort! Keep practicing to improve.' :
                 '💪 Don\'t give up! Review the material and try again.'}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRetry}
                className="flex-1 py-3 border-2 border-white/30 text-white hover:border-white/60 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate(`/lesson/${lessonId}`)}
                className="flex-1 py-3 bg-white text-black font-semibold hover:bg-white/90 transition-all"
              >
                Back to Lesson
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Configuration Screen
  if (showConfig) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black border-2 border-white/20 p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <Settings className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Practice Quiz</h1>
                <p className="text-white/70">{lesson?.title}</p>
              </div>
            </div>

            {/* Previous Stats */}
            {lessonStats && lessonStats.stats?.totalAttempts > 0 && (
              <div className="mb-8 p-4 bg-white/5 border-2 border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-white/70" />
                  <span className="text-white/70">Your Previous Performance</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">{lessonStats.stats.totalAttempts}</p>
                    <p className="text-xs text-white/50">Attempts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">
                      {Math.round((lessonStats.stats.correctAttempts / lessonStats.stats.totalAttempts) * 100)}%
                    </p>
                    <p className="text-xs text-white/50">Accuracy</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">
                      {Math.round(lessonStats.stats.averageScore)}%
                    </p>
                    <p className="text-xs text-white/50">Avg Score</p>
                  </div>
                </div>
              </div>
            )}

            {/* Number of Questions */}
            <div className="mb-6">
              <label className="block text-white mb-2">Number of Questions</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNumberOfQuestions(num)}
                    className={`flex-1 py-3 border-2 transition-all ${
                      numberOfQuestions === num
                        ? 'bg-white text-black border-white'
                        : 'border-white/30 text-white hover:border-white/60'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <label className="block text-white mb-2">Difficulty</label>
              <div className="grid grid-cols-2 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`p-4 border-2 text-left transition-all ${
                      difficulty === d.value
                        ? 'bg-white text-black border-white'
                        : 'border-white/30 text-white hover:border-white/60'
                    }`}
                  >
                    <p className="font-medium">{d.label}</p>
                    <p className={`text-sm ${
                      difficulty === d.value ? 'text-black/70' : 'text-white/50'
                    }`}>
                      {d.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Source Type */}
            <div className="mb-6">
              <label className="block text-white mb-2">Question Type</label>
              <div className="grid grid-cols-2 gap-2">
                {SOURCES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSourceType(s.value)}
                    className={`p-4 border-2 text-left transition-all ${
                      sourceType === s.value
                        ? 'bg-white text-black border-white'
                        : 'border-white/30 text-white hover:border-white/60'
                    }`}
                  >
                    <p className="font-medium">{s.label}</p>
                    <p className={`text-sm ${
                      sourceType === s.value ? 'text-black/70' : 'text-white/50'
                    }`}>
                      {s.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Answer Mode */}
            <div className="mb-8">
              <label className="block text-white mb-2">Answer Mode</label>
              <div className="space-y-2">
                {ANSWER_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setAnswerMode(mode.value)}
                    className={`w-full p-4 border-2 text-left flex items-center gap-4 transition-all ${
                      answerMode === mode.value
                        ? 'bg-white text-black border-white'
                        : 'border-white/30 text-white hover:border-white/60'
                    }`}
                  >
                    <mode.icon className="w-6 h-6" />
                    <div>
                      <p className="font-medium">{mode.label}</p>
                      <p className={`text-sm ${
                        answerMode === mode.value ? 'text-black/70' : 'text-white/50'
                      }`}>
                        {mode.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartQuiz}
              className="w-full py-4 bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Quiz
            </motion.button>

            {!user && (
              <p className="text-center text-white/50 mt-4 text-sm">
                You'll need to log in to start a quiz
              </p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Questions View
  if (session && session.questions?.length > 0) {
    const currentQuestion = session.questions[currentIndex]?.question;

    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-white">Loading question...</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-4">
        <QuestionViewer
          question={currentQuestion}
          questionIndex={currentIndex}
          totalQuestions={session.questions.length}
          sessionId={session._id}
          answerMode={answerMode}
          onNext={handleNextQuestion}
          onPrevious={handlePreviousQuestion}
          onComplete={handleCompleteQuiz}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-xl mb-4">No questions available for this lesson</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-white text-black font-semibold hover:bg-white/90"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

