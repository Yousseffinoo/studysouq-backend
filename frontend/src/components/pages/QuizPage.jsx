import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Sparkles,
  Loader2,
  Brain,
  Zap,
  ChevronRight,
  ChevronLeft,
  Eye,
  PenTool,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MarkdownViewer from '../MarkdownViewer';
import DrawingCanvas from '../quiz/DrawingCanvas';
import { getLessonById } from '../../services/publicService';
import api from '../../config/api';

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', description: 'Basic concepts', color: 'text-green-400' },
  { value: 'medium', label: 'Medium', description: 'Standard difficulty', color: 'text-yellow-400' },
  { value: 'hard', label: 'Hard', description: 'Challenging questions', color: 'text-red-400' },
];

const ANSWER_MODES = [
  { value: 'instant', label: 'Instant Reveal', description: 'See answer immediately after each question', icon: Eye },
  { value: 'write', label: 'Draw Answer', description: 'Write/draw your answer on canvas', icon: PenTool },
  { value: 'upload', label: 'Upload Work', description: 'Upload photo of your work', icon: Upload },
];

export default function QuizPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // States
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quiz config
  const [showConfig, setShowConfig] = useState(true);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [answerMode, setAnswerMode] = useState('instant');

  // AI Generation state
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { index: { answer, result } }
  const [showAnswer, setShowAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState(null);

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
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  // Generate AI questions
  const handleStartQuiz = async () => {
    if (!user || !token) {
      navigate('/login', { state: { from: `/quiz/${lessonId}` } });
      return;
    }

    setGenerating(true);
    setError(null);
    setGenerationStatus('🧠 Initializing AI Question Generator...');

    try {
      // Simulate progress stages
      setTimeout(() => setGenerationStatus('📚 Learning from existing questions database...'), 500);
      setTimeout(() => setGenerationStatus('✏️ Stage 1: Generating questions (GPT-4.1)...'), 1500);
      setTimeout(() => setGenerationStatus('✅ Stage 2: Verifying questions (GPT-4o-mini)...'), 3000);
      setTimeout(() => setGenerationStatus('📝 Stage 3: Generating solutions (GPT-4.1)...'), 4500);
      setTimeout(() => setGenerationStatus('✅ Stage 4: Verifying solutions (GPT-4o-mini)...'), 6000);
      setTimeout(() => setGenerationStatus('💡 Stage 5: Creating explanations (GPT-4o)...'), 7500);

      // Make API call
      const response = await api.post('/questions/generate', {
        lessonId,
        difficulty,
        numberOfQuestions
      });

      if (response.data.success) {
        setQuestions(response.data.data.questions);
        setShowConfig(false);
        setCurrentIndex(0);
        setAnswers({});
        setStartTime(Date.now());
        setGenerationStatus('🎉 Questions ready!');
      } else {
        setError(response.data.message || 'Failed to generate questions');
      }
    } catch (err) {
      console.error('Generate error:', err);
      setError(err.response?.data?.message || 'Failed to generate AI questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Submit answer for AI review
  const handleSubmitAnswer = async (answerText) => {
    if (!answerText?.trim()) return;

    setSubmitting(true);
    try {
      const question = questions[currentIndex];
      
      const response = await api.post('/questions/submit', {
        sessionId: null,
        questionIndex: currentIndex,
        question: question,
        answerText: answerText,
        answerType: answerMode,
        lessonId,
        subject: lesson?.subject
      });

      if (response.data.success) {
        setAnswers(prev => ({
          ...prev,
          [currentIndex]: {
            answer: answerText,
            result: response.data.data.review,
            correctAnswer: response.data.data.correctAnswer,
            explanation: response.data.data.explanation,
            steps: response.data.data.steps
          }
        }));
        setShowAnswer(true);
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Show answer instantly (instant mode)
  const handleShowAnswer = () => {
    const question = questions[currentIndex];
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        answer: null,
        result: { isCorrect: null, marksAwarded: 0, maxMarks: question.marks },
        correctAnswer: question.answerText,
        explanation: question.explanation,
        steps: question.steps
      }
    }));
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(answers[currentIndex - 1] !== undefined);
    }
  };

  const handleComplete = () => {
    setShowResults(true);
  };

  const handleRetry = () => {
    setShowConfig(true);
    setShowResults(false);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const handleRegenerate = () => {
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setShowAnswer(false);
    handleStartQuiz();
  };

  // Calculate results
  const calculateResults = () => {
    let correct = 0;
    let totalMarks = 0;
    let awardedMarks = 0;

    Object.values(answers).forEach(a => {
      if (a.result?.isCorrect) correct++;
      totalMarks += a.result?.maxMarks || 0;
      awardedMarks += a.result?.marksAwarded || 0;
    });

    return {
      correct,
      total: questions.length,
      answered: Object.keys(answers).length,
      accuracy: Object.keys(answers).length > 0 
        ? Math.round((correct / Object.keys(answers).length) * 100) 
        : 0,
      marksAwarded: awardedMarks,
      totalMarks,
      timeSpent: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !generating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-xl mb-4">{error}</p>
          <button
            onClick={() => { setError(null); setShowConfig(true); }}
            className="px-6 py-3 bg-white text-black font-semibold hover:bg-white/90 mr-4"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border-2 border-white/30 text-white hover:border-white/60"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const results = calculateResults();
    
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
                  {results.correct} / {results.answered}
                </p>
              </div>
              <div className="bg-white/5 p-4 border-2 border-white/10">
                <p className="text-white/50 text-sm mb-1">Accuracy</p>
                <p className="text-2xl font-bold text-white">{results.accuracy}%</p>
              </div>
              <div className="bg-white/5 p-4 border-2 border-white/10">
                <p className="text-white/50 text-sm mb-1">Marks</p>
                <p className="text-2xl font-bold text-blue-400">
                  {results.marksAwarded} / {results.totalMarks}
                </p>
              </div>
              <div className="bg-white/5 p-4 border-2 border-white/10">
                <p className="text-white/50 text-sm mb-1">Time</p>
                <p className="text-2xl font-bold text-purple-400">
                  {Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s
                </p>
              </div>
            </div>

            {/* Performance */}
            <div className={`p-4 mb-8 border-2 ${
              results.accuracy >= 80 ? 'bg-green-500/10 border-green-500/30' :
              results.accuracy >= 60 ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              <p className={`text-lg ${
                results.accuracy >= 80 ? 'text-green-400' :
                results.accuracy >= 60 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {results.accuracy >= 80 ? '🎉 Excellent! You\'ve mastered this topic!' :
                 results.accuracy >= 60 ? '👍 Good effort! Keep practicing to improve.' :
                 '💪 Review the material and try again.'}
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
                className="flex-1 py-3 bg-white text-black font-semibold hover:bg-white/90"
              >
                Back to Lesson
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // AI Generation Loading Screen
  if (generating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md px-4"
        >
          <div className="relative mb-8">
            <Brain className="w-24 h-24 text-white mx-auto animate-pulse" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="w-8 h-8 text-yellow-400" />
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Generating AI Questions</h2>
          <p className="text-white/70 mb-6">{generationStatus}</p>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 10 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Configuration Screen
  if (showConfig) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
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
              <div className="relative">
                <Brain className="w-10 h-10 text-white" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Practice Quiz</h1>
                <p className="text-white/70">{lesson?.title}</p>
              </div>
            </div>

            {/* AI Info Banner */}
            <div className="mb-8 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">AI-Powered Questions</p>
                  <p className="text-white/60 text-sm">
                    Questions are generated using a multi-step AI pipeline that learns from 
                    Edexcel past papers to create authentic exam-style practice.
                  </p>
                </div>
              </div>
            </div>

            {/* Number of Questions */}
            <div className="mb-6">
              <label className="block text-white mb-2">Number of Questions</label>
              <div className="flex gap-2">
                {[3, 5, 10, 15].map((num) => (
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
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`p-4 border-2 text-center transition-all ${
                      difficulty === d.value
                        ? 'bg-white text-black border-white'
                        : 'border-white/30 text-white hover:border-white/60'
                    }`}
                  >
                    <p className={`font-bold ${difficulty === d.value ? 'text-black' : d.color}`}>
                      {d.label}
                    </p>
                    <p className={`text-xs ${difficulty === d.value ? 'text-black/70' : 'text-white/50'}`}>
                      {d.description}
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
                      <p className={`text-sm ${answerMode === mode.value ? 'text-black/70' : 'text-white/50'}`}>
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
              disabled={generating}
              className="w-full py-4 bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Brain className="w-5 h-5" />
              Generate AI Questions
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

  // Question View
  if (questions.length > 0) {
    const question = questions[currentIndex];
    const hasAnswered = answers[currentIndex] !== undefined;
    const currentAnswer = answers[currentIndex];

    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              Exit Quiz
            </button>
            <div className="flex items-center gap-4">
              <span className="text-white/70">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 text-white/70 hover:text-white"
                title="Regenerate questions"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-2 mb-8 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black border-2 border-white/20 p-6 md:p-8 mb-6"
          >
            {/* Difficulty & Marks Badge */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 text-sm font-medium border-2 ${
                question.difficulty === 'easy' ? 'border-green-500/50 text-green-400' :
                question.difficulty === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                'border-red-500/50 text-red-400'
              }`}>
                {question.difficulty?.toUpperCase()}
              </span>
              <span className="text-white/50">|</span>
              <span className="text-white/70">{question.marks} mark{question.marks > 1 ? 's' : ''}</span>
              <span className="ml-auto px-2 py-1 bg-purple-500/20 text-purple-400 text-xs">
                AI Generated
              </span>
            </div>

            {/* Question Text */}
            <div className="prose prose-invert max-w-none mb-8">
              <MarkdownViewer content={question.questionText} />
            </div>

            {/* Answer Section */}
            {!showAnswer && !hasAnswered && (
              <div className="border-t-2 border-white/10 pt-6">
                {answerMode === 'instant' && (
                  <button
                    onClick={handleShowAnswer}
                    className="w-full py-4 bg-white text-black font-semibold hover:bg-white/90 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    Reveal Answer
                  </button>
                )}
                
                {answerMode === 'write' && (
                  <DrawingCanvas
                    onSubmit={handleSubmitAnswer}
                    submitting={submitting}
                  />
                )}

                {answerMode === 'upload' && (
                  <div className="space-y-4">
                    <textarea
                      placeholder="Type your answer here, or describe what you wrote..."
                      className="w-full h-32 bg-black border-2 border-white/30 p-4 text-white placeholder-white/30 focus:border-white focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleSubmitAnswer(e.target.value);
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const textarea = e.target.previousElementSibling;
                        handleSubmitAnswer(textarea?.value);
                      }}
                      disabled={submitting}
                      className="w-full py-3 bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Checking with AI...</>
                      ) : (
                        <><CheckCircle className="w-5 h-5" /> Submit Answer</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Answer Revealed */}
            {(showAnswer || hasAnswered) && currentAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t-2 border-white/10 pt-6 space-y-6"
              >
                {/* AI Review Result */}
                {currentAnswer.result?.isCorrect !== null && (
                  <div className={`p-4 border-2 ${
                    currentAnswer.result.isCorrect 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {currentAnswer.result.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                      <span className={`font-bold text-lg ${
                        currentAnswer.result.isCorrect ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {currentAnswer.result.isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                      <span className="ml-auto text-white/70">
                        {currentAnswer.result.marksAwarded}/{currentAnswer.result.maxMarks} marks
                      </span>
                    </div>
                    {currentAnswer.result.feedback && (
                      <p className="text-white/80">{currentAnswer.result.feedback}</p>
                    )}
                  </div>
                )}

                {/* Correct Answer */}
                <div className="p-4 bg-white/5 border-2 border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Correct Answer
                  </h4>
                  <div className="prose prose-invert max-w-none">
                    <MarkdownViewer content={currentAnswer.correctAnswer || question.answerText} />
                  </div>
                </div>

                {/* Explanation */}
                {(currentAnswer.explanation || question.explanation) && (
                  <div className="p-4 bg-blue-500/5 border-2 border-blue-500/20">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                      Explanation
                    </h4>
                    <div className="prose prose-invert max-w-none text-white/80">
                      <MarkdownViewer content={currentAnswer.explanation || question.explanation} />
                    </div>
                  </div>
                )}

                {/* Step-by-step */}
                {(currentAnswer.steps || question.steps)?.length > 0 && (
                  <div className="p-4 bg-purple-500/5 border-2 border-purple-500/20">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Step-by-Step Working
                    </h4>
                    <div className="space-y-3">
                      {(currentAnswer.steps || question.steps).map((step, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="w-6 h-6 bg-purple-500/30 text-purple-300 flex items-center justify-center text-sm flex-shrink-0">
                            {step.stepNumber || i + 1}
                          </span>
                          <div className="text-white/80">
                            {step.title && <strong className="text-white">{step.title}: </strong>}
                            {step.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {question.tips?.length > 0 && (
                  <div className="p-4 bg-yellow-500/5 border-2 border-yellow-500/20">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Tips
                    </h4>
                    <ul className="list-disc list-inside text-white/70 space-y-1">
                      {question.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/60 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold hover:bg-white/90"
              >
                <Trophy className="w-5 h-5" />
                Complete Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold hover:bg-white/90"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
