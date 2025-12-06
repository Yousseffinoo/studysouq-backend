import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Trophy,
  XCircle,
  Sparkles,
  Loader2,
  Brain,
  Zap,
  ChevronRight,
  ChevronLeft,
  Eye,
  Send,
  RefreshCw,
  MessageCircle,
  X,
  PenTool,
  Upload,
  FileText
} from 'lucide-react';
import DrawingCanvas from '../quiz/DrawingCanvas';
import { useAuth } from '../../contexts/AuthContext';
import MarkdownViewer from '../MarkdownViewer';
import { getLessonById } from '../../services/publicService';
import api from '../../config/api';

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/50' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/50' },
  { value: 'hard', label: 'Hard', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/50' },
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
  const [answerMode, setAnswerMode] = useState('text'); // 'instant', 'text', 'draw', 'upload'

  // AI Generation
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');

  // Mathius Tutor Chat
  const [showTutor, setShowTutor] = useState(false);
  const [tutorMessages, setTutorMessages] = useState([]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const chatEndRef = useRef(null);

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
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lessonId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutorMessages]);

  const handleStartQuiz = async () => {
    if (!user || !token) {
      navigate('/login', { state: { from: `/quiz/${lessonId}` } });
      return;
    }

    setGenerating(true);
    setError(null);
    setGenerationStatus('🧠 Mathius is preparing your questions...');

    try {
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
        setUserAnswer('');
      } else {
        setError(response.data.message || 'Failed to generate questions');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Mathius is temporarily unavailable. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setSubmitting(true);
    try {
      const question = questions[currentIndex];
      
      const response = await api.post('/questions/submit', {
        questionIndex: currentIndex,
        question: question,
        answerText: userAnswer,
        answerType: 'text',
        lessonId
      });

      if (response.data.success) {
        setAnswers(prev => ({
          ...prev,
          [currentIndex]: {
            userAnswer,
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

  const handleShowAnswer = () => {
    const question = questions[currentIndex];
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        userAnswer: null,
        result: { isCorrect: null, marksAwarded: 0, maxMarks: question.marks, score: 0 },
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
      setShowAnswer(answers[currentIndex + 1] !== undefined);
      setUserAnswer('');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(answers[currentIndex - 1] !== undefined);
      setUserAnswer('');
    }
  };

  const handleComplete = () => setShowResults(true);
  const handleRetry = () => {
    setShowConfig(true);
    setShowResults(false);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserAnswer('');
  };

  // Mathius Tutor Chat
  const sendTutorMessage = async () => {
    if (!tutorInput.trim() || tutorLoading) return;

    const userMessage = { role: 'user', content: tutorInput };
    setTutorMessages(prev => [...prev, userMessage]);
    setTutorInput('');
    setTutorLoading(true);

    try {
      const response = await api.post('/questions/tutor-chat', {
        message: tutorInput,
        context: {
          currentQuestion: questions[currentIndex]?.questionText,
          lessonTopic: lesson?.title,
          previousMessages: tutorMessages.slice(-6)
        }
      });

      if (response.data.success) {
        setTutorMessages(prev => [...prev, response.data.data]);
      }
    } catch (err) {
      setTutorMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting. Please try again!" 
      }]);
    } finally {
      setTutorLoading(false);
    }
  };

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
      accuracy: Object.keys(answers).length > 0 ? Math.round((correct / Object.keys(answers).length) * 100) : 0,
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
          <button onClick={() => { setError(null); setShowConfig(true); }} className="px-6 py-3 bg-white text-black font-semibold hover:bg-white/90 mr-4">
            Try Again
          </button>
          <button onClick={() => navigate(-1)} className="px-6 py-3 border-2 border-white/30 text-white hover:border-white/60">
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
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-black border-2 border-white/20 p-8">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Practice Complete!</h1>
              <p className="text-white/70">{lesson?.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 p-4 border-2 border-white/10">
                <p className="text-white/50 text-sm mb-1">Correct</p>
                <p className="text-2xl font-bold text-green-400">{results.correct} / {results.answered}</p>
              </div>
              <div className="bg-white/5 p-4 border-2 border-white/10">
                <p className="text-white/50 text-sm mb-1">Accuracy</p>
                <p className="text-2xl font-bold text-white">{results.accuracy}%</p>
              </div>
              <div className="bg-white/5 p-4 border-2 border-white/10">
                <p className="text-white/50 text-sm mb-1">Marks</p>
                <p className="text-2xl font-bold text-blue-400">{results.marksAwarded} / {results.totalMarks}</p>
              </div>
              <div className="bg-white/5 p-4 border-2 border-white/10">
                <p className="text-white/50 text-sm mb-1">Time</p>
                <p className="text-2xl font-bold text-purple-400">{Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s</p>
              </div>
            </div>
            <div className={`p-4 mb-8 border-2 ${results.accuracy >= 80 ? 'bg-green-500/10 border-green-500/30' : results.accuracy >= 60 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <p className={`text-lg ${results.accuracy >= 80 ? 'text-green-400' : results.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {results.accuracy >= 80 ? '🎉 Excellent! You\'ve mastered this topic!' : results.accuracy >= 60 ? '👍 Good effort! Keep practicing!' : '💪 Review the material and try again.'}
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={handleRetry} className="flex-1 py-3 border-2 border-white/30 text-white hover:border-white/60">Try Again</button>
              <button onClick={() => navigate(`/lesson/${lessonId}`)} className="flex-1 py-3 bg-white text-black font-semibold hover:bg-white/90">Back to Lesson</button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // AI Generation Loading
  if (generating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md px-4">
          <div className="relative mb-8">
            <Brain className="w-24 h-24 text-white mx-auto animate-pulse" />
            <motion.div className="absolute inset-0 flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <Zap className="w-8 h-8 text-yellow-400" />
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Mathius is Working</h2>
          <p className="text-white/70 mb-6">{generationStatus}</p>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 8 }} />
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
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white mb-8">
            <ArrowLeft className="w-5 h-5" /> Back to Lesson
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black border-2 border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <Brain className="w-10 h-10 text-white" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Practice Questions</h1>
                <p className="text-white/70">{lesson?.title}</p>
              </div>
            </div>

            <div className="mb-8 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Powered by Mathius AI</p>
                  <p className="text-white/60 text-sm">Questions generated specifically for this topic using our advanced AI tutor.</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-white mb-3">Number of Questions: <span className="font-bold">{numberOfQuestions}</span></label>
              <input
                type="range"
                min="1"
                max="30"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white slider"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${((numberOfQuestions - 1) / 29) * 100}%, rgba(255,255,255,0.2) ${((numberOfQuestions - 1) / 29) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <div className="flex justify-between text-white/50 text-sm mt-2">
                <span>1</span>
                <span>15</span>
                <span>30</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-white mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button key={d.value} onClick={() => setDifficulty(d.value)} className={`p-4 border-2 text-center transition-all ${difficulty === d.value ? 'bg-white text-black border-white' : 'border-white/30 text-white hover:border-white/60'}`}>
                    <p className={`font-bold ${difficulty === d.value ? 'text-black' : d.color}`}>{d.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Answer Mode Selection */}
            <div className="mb-8">
              <label className="block text-white mb-3">How do you want to answer?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAnswerMode('instant')}
                  className={`p-4 border-2 text-left transition-all flex items-start gap-3 ${answerMode === 'instant' ? 'bg-white text-black border-white' : 'border-white/30 text-white hover:border-white/60'}`}
                >
                  <Eye className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Reveal Instantly</p>
                    <p className={`text-sm ${answerMode === 'instant' ? 'text-black/70' : 'text-white/50'}`}>See answer immediately</p>
                  </div>
                </button>
                <button
                  onClick={() => setAnswerMode('text')}
                  className={`p-4 border-2 text-left transition-all flex items-start gap-3 ${answerMode === 'text' ? 'bg-white text-black border-white' : 'border-white/30 text-white hover:border-white/60'}`}
                >
                  <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Type Answer</p>
                    <p className={`text-sm ${answerMode === 'text' ? 'text-black/70' : 'text-white/50'}`}>Get AI feedback</p>
                  </div>
                </button>
                <button
                  onClick={() => setAnswerMode('draw')}
                  className={`p-4 border-2 text-left transition-all flex items-start gap-3 ${answerMode === 'draw' ? 'bg-white text-black border-white' : 'border-white/30 text-white hover:border-white/60'}`}
                >
                  <PenTool className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Draw Answer</p>
                    <p className={`text-sm ${answerMode === 'draw' ? 'text-black/70' : 'text-white/50'}`}>Write on canvas</p>
                  </div>
                </button>
                <button
                  onClick={() => setAnswerMode('upload')}
                  className={`p-4 border-2 text-left transition-all flex items-start gap-3 ${answerMode === 'upload' ? 'bg-white text-black border-white' : 'border-white/30 text-white hover:border-white/60'}`}
                >
                  <Upload className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Upload Work</p>
                    <p className={`text-sm ${answerMode === 'upload' ? 'text-black/70' : 'text-white/50'}`}>Photo or PDF</p>
                  </div>
                </button>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleStartQuiz} className="w-full py-4 bg-white text-black font-bold text-lg hover:bg-white/90 flex items-center justify-center gap-2">
              <Play className="w-5 h-5" /> Start Practice
            </motion.button>

            {!user && <p className="text-center text-white/50 mt-4 text-sm">You'll need to log in to start</p>}
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
            <button onClick={handleRetry} className="flex items-center gap-2 text-white/70 hover:text-white">
              <ArrowLeft className="w-5 h-5" /> Exit
            </button>
            <div className="flex items-center gap-4">
              <span className="text-white/70">Question {currentIndex + 1} of {questions.length}</span>
              <button onClick={() => setShowTutor(true)} className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/50 text-purple-400 hover:bg-purple-500/30 transition-colors" title="Ask Mathius for help">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Help</span>
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-white/10 h-2 mb-8 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>

          {/* Question Card */}
          <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-black border-2 border-white/20 p-6 md:p-8 mb-6">
            {/* Badge */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 text-sm font-medium border-2 ${DIFFICULTIES.find(d => d.value === question.difficulty)?.bg || 'border-white/30'}`}>
                {question.difficulty?.toUpperCase()}
              </span>
              <span className="text-white/50">|</span>
              <span className="text-white/70">{question.marks} mark{question.marks > 1 ? 's' : ''}</span>
              <span className="ml-auto px-2 py-1 bg-purple-500/20 text-purple-400 text-xs border border-purple-500/30">Mathius AI</span>
            </div>

            {/* Question */}
            <div className="prose prose-invert max-w-none mb-8">
              <MarkdownViewer content={question.questionText} />
            </div>

            {/* Answer Input */}
            {!showAnswer && !hasAnswered && (
              <div className="border-t-2 border-white/10 pt-6 space-y-4">
                {/* Instant Reveal Mode */}
                {answerMode === 'instant' && (
                  <button onClick={handleShowAnswer} className="w-full py-4 bg-white text-black font-semibold hover:bg-white/90 flex items-center justify-center gap-2">
                    <Eye className="w-5 h-5" /> Reveal Answer
                  </button>
                )}

                {/* Type Answer Mode */}
                {answerMode === 'text' && (
                  <>
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer here... (Use $...$ for math notation)"
                      className="w-full h-32 bg-black border-2 border-white/30 p-4 text-white placeholder-white/30 focus:border-white focus:outline-none resize-none"
                    />
                    <div className="flex gap-3">
                      <button onClick={handleSubmitAnswer} disabled={!userAnswer.trim() || submitting} className="flex-1 py-3 bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2">
                        {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Mathius is checking...</> : <><Send className="w-5 h-5" /> Submit Answer</>}
                      </button>
                      <button onClick={handleShowAnswer} className="px-6 py-3 border-2 border-white/30 text-white hover:border-white/60 flex items-center gap-2">
                        <Eye className="w-5 h-5" /> Skip
                      </button>
                    </div>
                  </>
                )}

                {/* Draw Answer Mode */}
                {answerMode === 'draw' && (
                  <div className="space-y-4">
                    <DrawingCanvas 
                      onSave={(blob) => {
                        // Convert blob to base64 for submission
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setUserAnswer(reader.result);
                        };
                        reader.readAsDataURL(blob);
                      }} 
                    />
                    <div className="flex gap-3">
                      <button 
                        onClick={handleSubmitAnswer} 
                        disabled={!userAnswer || submitting} 
                        className="flex-1 py-3 bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Mathius is checking...</> : <><Send className="w-5 h-5" /> Submit Drawing</>}
                      </button>
                      <button onClick={handleShowAnswer} className="px-6 py-3 border-2 border-white/30 text-white hover:border-white/60 flex items-center gap-2">
                        <Eye className="w-5 h-5" /> Skip
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Mode */}
                {answerMode === 'upload' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-white/30 p-8 text-center hover:border-white/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setUserAnswer(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-white/50 mx-auto mb-3" />
                        <p className="text-white mb-1">Click to upload your work</p>
                        <p className="text-white/50 text-sm">JPG, PNG, or PDF</p>
                      </label>
                    </div>
                    {userAnswer && (
                      <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                        ✓ File uploaded and ready to submit
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button 
                        onClick={handleSubmitAnswer} 
                        disabled={!userAnswer || submitting} 
                        className="flex-1 py-3 bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Mathius is checking...</> : <><Send className="w-5 h-5" /> Submit Work</>}
                      </button>
                      <button onClick={handleShowAnswer} className="px-6 py-3 border-2 border-white/30 text-white hover:border-white/60 flex items-center gap-2">
                        <Eye className="w-5 h-5" /> Skip
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Answer Revealed */}
            {(showAnswer || hasAnswered) && currentAnswer && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border-t-2 border-white/10 pt-6 space-y-6">
                {/* Result */}
                {currentAnswer.result?.isCorrect !== null && (
                  <div className={`p-4 border-2 ${currentAnswer.result.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      {currentAnswer.result.isCorrect ? <CheckCircle className="w-6 h-6 text-green-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
                      <span className={`font-bold text-lg ${currentAnswer.result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {currentAnswer.result.isCorrect ? 'Correct!' : 'Not quite right'}
                      </span>
                      <span className="ml-auto text-white/70">{currentAnswer.result.marksAwarded}/{currentAnswer.result.maxMarks} marks</span>
                    </div>
                    {currentAnswer.result.feedback && <p className="text-white/80">{currentAnswer.result.feedback}</p>}
                  </div>
                )}

                {/* Your Answer */}
                {currentAnswer.userAnswer && (
                  <div className="p-4 bg-white/5 border-2 border-white/10">
                    <h4 className="text-white/50 text-sm mb-2">Your Answer</h4>
                    {currentAnswer.userAnswer.startsWith('data:image') ? (
                      <img 
                        src={currentAnswer.userAnswer} 
                        alt="Your drawn answer" 
                        className="max-w-full h-auto rounded border border-white/20"
                      />
                    ) : (
                      <p className="text-white">{currentAnswer.userAnswer}</p>
                    )}
                  </div>
                )}

                {/* Correct Answer */}
                <div className="p-4 bg-white/5 border-2 border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> Correct Answer
                  </h4>
                  <div className="prose prose-invert max-w-none">
                    <MarkdownViewer content={currentAnswer.correctAnswer || question.answerText} />
                  </div>
                </div>

                {/* Explanation */}
                {(currentAnswer.explanation || question.explanation) && (
                  <div className="p-4 bg-blue-500/5 border-2 border-blue-500/20">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-400" /> Explanation
                    </h4>
                    <div className="prose prose-invert max-w-none text-white/80">
                      <MarkdownViewer content={currentAnswer.explanation || question.explanation} />
                    </div>
                  </div>
                )}

                {/* Steps */}
                {(currentAnswer.steps || question.steps)?.length > 0 && (
                  <div className="p-4 bg-purple-500/5 border-2 border-purple-500/20">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-400" /> Step-by-Step Working
                    </h4>
                    <div className="space-y-3">
                      {(currentAnswer.steps || question.steps).map((step, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="w-6 h-6 bg-purple-500/30 text-purple-300 flex items-center justify-center text-sm flex-shrink-0 rounded">
                            {step.stepNumber || i + 1}
                          </span>
                          <div className="text-white/80">
                            {step.title && <strong className="text-white">{step.title}: </strong>}
                            <MarkdownViewer content={step.content} />
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
                      <Zap className="w-5 h-5 text-yellow-400" /> Tips
                    </h4>
                    <ul className="list-disc list-inside text-white/70 space-y-1">
                      {question.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={handlePrevious} disabled={currentIndex === 0} className="flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white disabled:opacity-30 hover:border-white/60">
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>
            {currentIndex === questions.length - 1 ? (
              <button onClick={handleComplete} className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold hover:bg-white/90">
                <Trophy className="w-5 h-5" /> Complete
              </button>
            ) : (
              <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold hover:bg-white/90">
                Next <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mathius Tutor Chat */}
        <AnimatePresence>
          {showTutor && (
            <motion.div initial={{ opacity: 0, x: 400 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 400 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-black border-l-2 border-white/20 flex flex-col z-50">
              <div className="flex items-center justify-between p-4 border-b-2 border-white/20">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="text-white font-semibold">Mathius Tutor</h3>
                    <p className="text-white/50 text-xs">Ask me anything!</p>
                  </div>
                </div>
                <button onClick={() => setShowTutor(false)} className="text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {tutorMessages.length === 0 && (
                  <div className="text-center text-white/50 py-8">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-purple-400/50" />
                    <p>Hi! I'm Mathius, your AI tutor.</p>
                    <p className="text-sm mt-2">Ask me for hints or help understanding this question!</p>
                  </div>
                )}
                {tutorMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-white text-black' : 'bg-purple-500/20 border border-purple-500/30 text-white'}`}>
                      <MarkdownViewer content={msg.content} />
                    </div>
                  </div>
                ))}
                {tutorLoading && (
                  <div className="flex justify-start">
                    <div className="bg-purple-500/20 border border-purple-500/30 p-3 rounded-lg">
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t-2 border-white/20">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendTutorMessage()}
                    placeholder="Ask Mathius for help..."
                    className="flex-1 bg-white/5 border-2 border-white/20 px-4 py-2 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none"
                  />
                  <button onClick={sendTutorMessage} disabled={tutorLoading || !tutorInput.trim()} className="px-4 bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
