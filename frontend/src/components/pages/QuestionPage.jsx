import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Lock, CheckCircle, XCircle, Eye, Loader2, AlertCircle } from 'lucide-react';
import { getQuestions, getLessonById } from '../../services/publicService';
import AITutorChat from '../AITutorChat';
import { Link } from 'react-router-dom';
import { answerTextToImage } from '../../utils/answerImage';

export default function QuestionPage({ user }) {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [lessonTitle, setLessonTitle] = useState('Practice Questions');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isPremium = user?.isPremium || false;
  const currentQuestion = questions[currentQuestionIndex];
  const freeQuestionLimit = 6;
  const isQuestionLocked = !isPremium && currentQuestionIndex >= freeQuestionLimit;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch lesson details
        if (lessonId) {
          const lessonResult = await getLessonById(lessonId);
          if (lessonResult.success) {
            setLessonTitle(lessonResult.data.title || 'Practice Questions');
          }
        }

        // Fetch questions for this lesson
        const questionsResult = await getQuestions({ lesson: lessonId });
        if (questionsResult.success) {
          const fetchedQuestions = questionsResult.data || [];
          console.log('Fetched questions:', fetchedQuestions);
          console.log('Questions count:', fetchedQuestions.length);
          if (fetchedQuestions.length > 0) {
            console.log('First question:', fetchedQuestions[0]);
          }
          setQuestions(fetchedQuestions);
        } else {
          console.error('Failed to fetch questions:', questionsResult.message);
          setError(questionsResult.message || 'Failed to load questions');
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchData();
    }
  }, [lessonId]);

  // Reset answer visibility when question changes
  useEffect(() => {
    setShowAnswer(false);
    setSelectedAnswer(null);
  }, [currentQuestionIndex]);

  const handleAnswer = async (isCorrect) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: isCorrect ? 'correct' : 'wrong'
    });

    // Save answer to backend if available
    if (currentQuestion && user) {
      try {
        // You can add progress tracking here if needed
        console.log('Answer saved:', {
          userId: user.id || user._id,
          lessonId,
          questionId: currentQuestion._id || currentQuestion.id,
          isCorrect,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error saving answer:', err);
      }
    }

    // Show saved feedback
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleSelectAnswer = async (answerIndex) => {
    if (!currentQuestion) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = currentQuestion.correctAnswer === answerIndex;
    await handleAnswer(isCorrect);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2F6FED] animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Questions</h2>
          <p className="text-[#94A3B8] mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Empty state - show this only after loading is complete
  if (!loading && questions.length === 0) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Questions Available</h2>
          <p className="text-[#94A3B8] mb-4">
            There are no questions available for this lesson yet. Please check back later or contact support.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-colors"
          >
            Go Back to Lesson
          </button>
        </div>
      </div>
    );
  }

  // If no current question but questions exist, reset index
  if (!currentQuestion && questions.length > 0) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2F6FED] animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading question...</p>
        </div>
      </div>
    );
  }

  // Get answer text/image
  const correctAnswerOption = currentQuestion.options && currentQuestion.options[currentQuestion.correctAnswer];
  const correctAnswerText = correctAnswerOption 
    ? (typeof correctAnswerOption === 'string' ? correctAnswerOption : (correctAnswerOption.text || correctAnswerOption))
    : '';
  const correctAnswerImage = correctAnswerOption && typeof correctAnswerOption === 'object' && correctAnswerOption.image
    ? (correctAnswerOption.image.url || correctAnswerOption.image)
    : null;
  const answerImage = correctAnswerText && !correctAnswerImage ? answerTextToImage(correctAnswerText) : null;
  return <>
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.4
        }}>
            <button onClick={() => navigate(-1)} className="inline-flex items-center text-[#94A3B8] hover:text-white transition-colors mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lesson
            </button>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="mb-12">
            <h1 className="mb-4">{lessonTitle}</h1>
            <div className="flex items-center justify-between">
              <p className="text-[#94A3B8]">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              {!isPremium && <p className="text-[#F7C94C] text-sm">
                  {freeQuestionLimit - currentQuestionIndex} free questions remaining
                </p>}
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div initial={{
              width: 0
            }} animate={{
              width: `${(currentQuestionIndex + 1) / questions.length * 100}%`
            }} transition={{
              duration: 0.5
            }} className="h-full bg-gradient-to-r from-[#2F6FED] to-[#A9C7FF]" />
            </div>
          </motion.div>

          {isQuestionLocked ? <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-12 text-center">
              <Lock className="w-16 h-16 text-[#F7C94C] mx-auto mb-6" />
              <h2 className="mb-4">Unlock More Questions</h2>
              <p className="text-[#94A3B8] mb-8 max-w-md mx-auto">
                You've reached the limit of free questions. Upgrade to premium to access all {questions.length} practice questions and detailed solutions.
              </p>
              <Link to="/pricing" className="inline-block px-8 py-3 bg-gradient-to-r from-[#F7C94C] to-[#2F6FED] hover:opacity-90 rounded-xl transition-all duration-300">
                Upgrade to Premium
              </Link>
            </motion.div> : <>
              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div key={currentQuestionIndex} initial={{
              opacity: 0,
              y: 30
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -30
            }} transition={{
              duration: 0.4
            }} className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8 mb-8">
                  <div className="mb-6">
                    <h3 className="text-[#A9C7FF] mb-4">Question</h3>
                    {/* Question Text Box - Separate */}
                    <div className="bg-[#0A0E14] rounded-xl p-6 border border-white/5 mb-4">
                      <p className="text-lg">{currentQuestion.questionText || currentQuestion.question}</p>
                    </div>
                    {/* Question Image Box - Separate */}
                    {currentQuestion.questionImage && (
                      <div className="bg-[#0A0E14] rounded-xl p-6 border border-white/5">
                        <img 
                          src={currentQuestion.questionImage?.url || currentQuestion.questionImage} 
                          alt="Question" 
                          className="rounded-lg w-full max-w-2xl mx-auto"
                          style={{ maxHeight: '500px', maxWidth: '672px', width: '100%', height: 'auto', objectFit: 'contain' }}
                          onError={(e) => {
                            console.error('Error loading question image:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Options section completely removed - answer will only show in Answer section */}

                  {/* Answer Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[#A9C7FF]">Answer</h3>
                      {currentQuestion.isPremium && !isPremium && <div className="flex items-center text-[#F7C94C] text-sm">
                          <Lock className="w-4 h-4 mr-2" />
                          Premium
                        </div>}
                    </div>

                    {showAnswer ? (
                      currentQuestion.isPremium && !isPremium ? (
                        <div className="relative">
                          <div className="blur-sm bg-[#0A0E14] rounded-xl p-6 border border-white/5">
                            <p>Answer content is hidden</p>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-[#0B1D34]/80 rounded-xl">
                            <div className="text-center">
                              <Lock className="w-8 h-8 text-[#F7C94C] mx-auto mb-3" />
                              <p className="text-sm mb-3">Premium answer</p>
                              <Link to="/pricing" className="text-[#2F6FED] hover:text-[#A9C7FF] text-sm transition-colors">
                                Upgrade to unlock
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4"
                        >
                          {/* Answer Text Box - Separate */}
                          {(correctAnswerText || correctAnswerImage || answerImage) && (
                            <div className="bg-[#0A0E14] rounded-xl p-6 border border-[#2F6FED]/30">
                              {correctAnswerText && (
                                <p className="text-[#94A3B8]">
                                  <strong className="text-[#A9C7FF]">Correct Answer:</strong> {correctAnswerText}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Answer Image Box - Separate */}
                          {correctAnswerImage && (
                            <div className="bg-[#0A0E14] rounded-xl p-6 border border-[#2F6FED]/30">
                              <img 
                                src={correctAnswerImage} 
                                alt="Correct answer" 
                                className="rounded-lg w-full max-w-2xl mx-auto border border-[#2F6FED]/40"
                                style={{ maxHeight: '500px', maxWidth: '672px', width: '100%', height: 'auto', objectFit: 'contain' }}
                                onError={(e) => {
                                  console.error('Error loading answer image:', e);
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          {answerImage && !correctAnswerImage && (
                            <div className="bg-[#0A0E14] rounded-xl p-6 border border-[#2F6FED]/30">
                              <img 
                                src={answerImage} 
                                alt="Answer explanation" 
                                className="rounded-lg w-full max-w-2xl mx-auto border border-[#2F6FED]/40"
                                style={{ maxHeight: '500px', maxWidth: '672px', width: '100%', height: 'auto', objectFit: 'contain' }}
                              />
                            </div>
                          )}
                          
                          {/* Hint Box - Separate */}
                          {currentQuestion.hint && (
                            <div className="bg-[#0A0E14] rounded-xl p-6 border border-[#2F6FED]/30">
                              <p className="text-[#94A3B8]">
                                <strong className="text-[#A9C7FF]">Hint:</strong> {currentQuestion.hint}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )
                    ) : (
                      <button
                        onClick={() => setShowAnswer(true)}
                        disabled={currentQuestion.isPremium && !isPremium}
                        className="w-full px-6 py-3 bg-[#2F6FED]/20 hover:bg-[#2F6FED]/30 border border-[#2F6FED] rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        Reveal Answer
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button onClick={() => handleAnswer(true)} disabled={answers[currentQuestionIndex] !== null && answers[currentQuestionIndex] !== undefined} className="flex-1 px-6 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-600 rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      I Got It Right
                    </button>
                    <button onClick={() => handleAnswer(false)} disabled={answers[currentQuestionIndex] !== null && answers[currentQuestionIndex] !== undefined} className="flex-1 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600 rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                      <XCircle className="w-5 h-5 mr-2" />
                      I Got It Wrong
                    </button>
                  </div>

                  {/* Saved Feedback */}
                  <AnimatePresence>
                    {savedFeedback && <motion.div initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0
                }} className="mt-4 p-3 bg-green-600/20 border border-green-600 rounded-lg text-center text-green-400 text-sm">
                        ✓ Saved!
                      </motion.div>}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button onClick={previousQuestion} disabled={currentQuestionIndex === 0} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>

                <div className="flex gap-2">
                  {questions.slice(0, Math.min(questions.length, isPremium ? questions.length : freeQuestionLimit)).map((_, index) => <button key={index} onClick={() => {
                setCurrentQuestionIndex(index);
                setShowAnswer(false);
              }} className={`w-10 h-10 rounded-lg transition-all ${index === currentQuestionIndex ? 'bg-[#2F6FED] text-white' : answers[index] === 'correct' ? 'bg-green-600/30 border border-green-600' : answers[index] === 'wrong' ? 'bg-red-600/30 border border-red-600' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}>
                      {index + 1}
                    </button>)}
                </div>

                <button onClick={nextQuestion} disabled={currentQuestionIndex === questions.length - 1 || currentQuestionIndex === freeQuestionLimit - 1 && !isPremium} className="px-6 py-3 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </>}
        </div>
      </div>

      {/* AI Tutor Chat */}
      <AITutorChat />
    </>;
}