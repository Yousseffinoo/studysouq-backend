import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Trophy,
  XCircle,
  Brain,
  Zap,
  ChevronRight,
  ChevronLeft,
  Send,
  Loader2,
  BookOpen,
  Check,
  MessageCircle,
  X,
  Eye,
  Clock,
  Target
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MarkdownViewer from '../MarkdownViewer';
import api from '../../config/api';

export default function MocksPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // States
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Config
  const [showConfig, setShowConfig] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(20);
  const [difficulty, setDifficulty] = useState('mixed');

  // Generation
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  // Mock exam state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Tutor
  const [showTutor, setShowTutor] = useState(false);
  const [tutorMessages, setTutorMessages] = useState([]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Timer
  useEffect(() => {
    let interval;
    if (startTime && !showResults) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, showResults]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public/subjects`);
        const data = await response.json();
        console.log('Subjects response:', data);
        if (data.success) {
          setSubjects(data.data?.subjects || data.data || []);
        }
      } catch (err) {
        console.error('Load subjects error:', err);
        setError('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedSubject) {
        setLessons([]);
        return;
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public/subjects/${selectedSubject}/lessons`);
        const data = await response.json();
        console.log('Lessons response:', data);
        setLessons(data.data || []);
      } catch (err) {
        console.error('Failed to fetch lessons:', err);
      }
    };
    fetchLessons();
    setSelectedLessons([]);
  }, [selectedSubject]);

  const toggleLesson = (lessonId) => {
    setSelectedLessons(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const selectAllLessons = () => {
    if (selectedLessons.length === lessons.length) {
      setSelectedLessons([]);
    } else {
      setSelectedLessons(lessons.map(l => l._id));
    }
  };

  const handleStartMock = async () => {
    if (!user || !token) {
      navigate('/login', { state: { from: '/mocks' } });
      return;
    }

    if (selectedLessons.length === 0) {
      setError('Please select at least one lesson');
      return;
    }

    setGenerating(true);
    setError(null);
    setGenerationStatus('🧠 Mathius is preparing your mock exam...');

    try {
      const response = await api.post('/questions/mock-exam', {
        lessonIds: selectedLessons,
        numberOfQuestions,
        difficulty
      });

      if (response.data.success) {
        setQuestions(response.data.data.data);
        setShowConfig(false);
        setCurrentIndex(0);
        setAnswers({});
        setStartTime(Date.now());
        setUserAnswer('');
      } else {
        setError(response.data.message || 'Failed to generate mock exam');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Mathius is temporarily unavailable.');
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
        question,
        answerText: userAnswer,
        answerType: 'text',
        lessonId: question.lessonId
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
    setTimeElapsed(0);
  };

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
          lessonTopic: questions[currentIndex]?.lessonTitle,
          previousMessages: tutorMessages.slice(-6)
        }
      });
      if (response.data.success) {
        setTutorMessages(prev => [...prev, response.data.data]);
      }
    } catch (err) {
      setTutorMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble. Please try again!" }]);
    } finally {
      setTutorLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      timeSpent: timeElapsed
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  // Results
  if (showResults) {
    const results = calculateResults();
    const grade = results.accuracy >= 90 ? 'A*' : results.accuracy >= 80 ? 'A' : results.accuracy >= 70 ? 'B' : results.accuracy >= 60 ? 'C' : results.accuracy >= 50 ? 'D' : 'E';

    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-black border-2 border-white/20 p-8">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Mock Exam Complete!</h1>
              <div className="inline-block px-6 py-2 bg-white text-black text-2xl font-bold mt-2">
                Grade: {grade}
              </div>
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
                <p className="text-white/50 text-sm mb-1">Total Time</p>
                <p className="text-2xl font-bold text-blue-400">{formatTime(results.timeSpent)}</p>
              </div>
              <div className="bg-white/5 p-4 border-2 border-white/10">
                <p className="text-white/50 text-sm mb-1">Marks</p>
                <p className="text-2xl font-bold text-purple-400">{results.marksAwarded} / {results.totalMarks}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={handleRetry} className="flex-1 py-3 border-2 border-white/30 text-white hover:border-white/60">
                New Mock Exam
              </button>
              <button onClick={() => navigate('/progress')} className="flex-1 py-3 bg-white text-black font-semibold hover:bg-white/90">
                View Progress
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Generation Loading
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
          <h2 className="text-2xl font-bold text-white mb-4">Creating Your Mock Exam</h2>
          <p className="text-white/70 mb-2">{generationStatus}</p>
          <p className="text-white/50 text-sm">Generating {numberOfQuestions} questions from {selectedLessons.length} topics...</p>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-6">
            <motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 15 }} />
          </div>
        </motion.div>
      </div>
    );
  }

  // Configuration
  if (showConfig) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white mb-8">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black border-2 border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <Target className="w-10 h-10 text-white" />
                <Zap className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Mock Exam</h1>
                <p className="text-white/70">Test yourself across multiple topics</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/30 text-red-400">
                {error}
              </div>
            )}

            {/* Subject Selection */}
            <div className="mb-6">
              <label className="block text-white mb-2">Select Subject</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {subjects.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => setSelectedSubject(s.slug)}
                    className={`p-3 border-2 text-left transition-all ${
                      selectedSubject === s.slug ? 'bg-white text-black border-white' : 'border-white/30 text-white hover:border-white/60'
                    }`}
                  >
                    <p className="font-medium">{s.name}</p>
                    <p className={`text-xs ${selectedSubject === s.slug ? 'text-black/70' : 'text-white/50'}`}>{s.level}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Lesson Selection */}
            {selectedSubject && lessons.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white">Select Topics ({selectedLessons.length} selected)</label>
                  <button onClick={selectAllLessons} className="text-sm text-purple-400 hover:text-purple-300">
                    {selectedLessons.length === lessons.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto border-2 border-white/20 p-2 space-y-1">
                  {lessons.map((l) => (
                    <button
                      key={l._id}
                      onClick={() => toggleLesson(l._id)}
                      className={`w-full p-3 flex items-center gap-3 text-left transition-all ${
                        selectedLessons.includes(l._id) ? 'bg-purple-500/20 border border-purple-500/50' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                        selectedLessons.includes(l._id) ? 'border-purple-500 bg-purple-500' : 'border-white/30'
                      }`}>
                        {selectedLessons.includes(l._id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-white">{l.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Questions & Difficulty */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-white mb-3">Number of Questions: <span className="font-bold">{numberOfQuestions}</span></label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white slider"
                  style={{
                    background: `linear-gradient(to right, white 0%, white ${((numberOfQuestions - 1) / 49) * 100}%, rgba(255,255,255,0.2) ${((numberOfQuestions - 1) / 49) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
                <div className="flex justify-between text-white/50 text-sm mt-2">
                  <span>1</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>
              <div>
                <label className="block text-white mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {['mixed', 'easy', 'medium', 'hard'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 border-2 transition-all text-sm capitalize ${
                        difficulty === d ? 'bg-white text-black border-white' : 'border-white/30 text-white hover:border-white/60'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartMock}
              disabled={selectedLessons.length === 0}
              className="w-full py-4 bg-white text-black font-bold text-lg hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> Start Mock Exam
            </motion.button>

            {!user && <p className="text-center text-white/50 mt-4 text-sm">You'll need to log in</p>}
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
            <button onClick={() => { if (confirm('Exit mock exam?')) handleRetry(); }} className="flex items-center gap-2 text-white/70 hover:text-white">
              <ArrowLeft className="w-5 h-5" /> Exit
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/70">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
              </div>
              <span className="text-white/70">Q{currentIndex + 1}/{questions.length}</span>
              <button onClick={() => setShowTutor(true)} className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/50 text-purple-400 hover:bg-purple-500/30">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Help</span>
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-white/10 h-2 mb-8 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>

          {/* Question */}
          <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-black border-2 border-white/20 p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className={`px-3 py-1 text-sm font-medium border-2 ${
                question.difficulty === 'easy' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                question.difficulty === 'hard' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
              }`}>
                {question.difficulty?.toUpperCase()}
              </span>
              <span className="text-white/50">|</span>
              <span className="text-white/70">{question.marks} mark{question.marks > 1 ? 's' : ''}</span>
              {question.lessonTitle && (
                <>
                  <span className="text-white/50">|</span>
                  <span className="text-purple-400 text-sm">{question.lessonTitle}</span>
                </>
              )}
            </div>

            <div className="prose prose-invert max-w-none mb-8">
              <MarkdownViewer content={question.questionText} />
            </div>

            {/* Answer Input */}
            {!showAnswer && !hasAnswered && (
              <div className="border-t-2 border-white/10 pt-6 space-y-4">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer... (Use $...$ for math)"
                  className="w-full h-32 bg-black border-2 border-white/30 p-4 text-white placeholder-white/30 focus:border-white focus:outline-none resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={handleSubmitAnswer} disabled={!userAnswer.trim() || submitting} className="flex-1 py-3 bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Checking...</> : <><Send className="w-5 h-5" /> Submit</>}
                  </button>
                  <button onClick={handleShowAnswer} className="px-6 py-3 border-2 border-white/30 text-white hover:border-white/60 flex items-center gap-2">
                    <Eye className="w-5 h-5" /> Skip
                  </button>
                </div>
              </div>
            )}

            {/* Answer Display */}
            {(showAnswer || hasAnswered) && currentAnswer && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border-t-2 border-white/10 pt-6 space-y-4">
                {currentAnswer.result?.isCorrect !== null && (
                  <div className={`p-4 border-2 ${currentAnswer.result.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <div className="flex items-center gap-3">
                      {currentAnswer.result.isCorrect ? <CheckCircle className="w-6 h-6 text-green-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
                      <span className={`font-bold ${currentAnswer.result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {currentAnswer.result.isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                      <span className="ml-auto text-white/70">{currentAnswer.result.marksAwarded}/{currentAnswer.result.maxMarks}</span>
                    </div>
                    {currentAnswer.result.feedback && <p className="text-white/80 mt-2">{currentAnswer.result.feedback}</p>}
                  </div>
                )}

                <div className="p-4 bg-white/5 border-2 border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> Correct Answer
                  </h4>
                  <MarkdownViewer content={currentAnswer.correctAnswer || question.answerText} />
                </div>
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
                <Trophy className="w-5 h-5" /> Finish Exam
              </button>
            ) : (
              <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold hover:bg-white/90">
                Next <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tutor Chat */}
        <AnimatePresence>
          {showTutor && (
            <motion.div initial={{ opacity: 0, x: 400 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 400 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-black border-l-2 border-white/20 flex flex-col z-50">
              <div className="flex items-center justify-between p-4 border-b-2 border-white/20">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="text-white font-semibold">Mathius Tutor</h3>
                    <p className="text-white/50 text-xs">Need help?</p>
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
                    <p>Hi! I'm Mathius.</p>
                    <p className="text-sm mt-2">Ask me for hints!</p>
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
                    placeholder="Ask for help..."
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

