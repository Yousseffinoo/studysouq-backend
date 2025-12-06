import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  PenTool,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import MarkdownViewer from '../MarkdownViewer';
import DrawingCanvas from './DrawingCanvas';
import { submitAnswer } from '../../services/questionsService';

export default function QuestionViewer({
  question,
  questionIndex,
  totalQuestions,
  sessionId,
  onNext,
  onPrevious,
  onComplete,
  answerMode = 'instant' // 'instant', 'write', 'upload'
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [activeMode, setActiveMode] = useState(answerMode);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [question]);

  // Reset state when question changes
  useEffect(() => {
    setShowAnswer(false);
    setUserAnswer('');
    setSelectedFile(null);
    setResult(null);
    setTimeSpent(0);
  }, [question._id]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShowAnswer = async () => {
    // For instant mode, just show the answer
    if (activeMode === 'instant') {
      setShowAnswer(true);

      // Record the instant reveal
      await submitAnswer({
        sessionId,
        questionId: question._id,
        questionIndex,
        answerType: 'instant',
        answerText: '',
        timeSpent
      });
    }
  };

  const handleSubmitText = async () => {
    if (!userAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await submitAnswer({
        sessionId,
        questionId: question._id,
        questionIndex,
        answerType: 'text',
        answerText: userAnswer,
        timeSpent
      });

      if (response.success) {
        setResult(response.data);
        setShowAnswer(true);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCanvasSubmit = async (canvasBlob) => {
    setIsSubmitting(true);
    try {
      const response = await submitAnswer({
        sessionId,
        questionId: question._id,
        questionIndex,
        answerType: 'canvas',
        answerCanvas: canvasBlob,
        timeSpent
      });

      if (response.success) {
        setResult(response.data);
        setShowAnswer(true);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    try {
      const response = await submitAnswer({
        sessionId,
        questionId: question._id,
        questionIndex,
        answerType: selectedFile.type.includes('pdf') ? 'pdf' : 'image',
        answerImage: selectedFile,
        timeSpent
      });

      if (response.success) {
        setResult(response.data);
        setShowAnswer(true);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-white/70">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <div className="flex items-center gap-2 text-white/50">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeSpent)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {question.difficulty && (
            <span className={`px-3 py-1 text-sm font-medium ${
              question.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
              question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {question.difficulty}
            </span>
          )}
          {question.marks && (
            <span className="px-3 py-1 bg-white/10 text-white/70 text-sm">
              {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/10 mb-8">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black border-2 border-white/20 p-8 mb-6"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="p-2 bg-white/10 rounded">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <MarkdownViewer
              content={question.questionText}
              className="text-white text-lg"
            />
          </div>
        </div>

        {/* Question Images */}
        {question.questionImages?.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-6">
            {question.questionImages.map((img, idx) => (
              <div key={idx} className="border-2 border-white/20 overflow-hidden">
                <img
                  src={img.url}
                  alt={img.caption || `Question image ${idx + 1}`}
                  className="w-full h-auto"
                />
                {img.caption && (
                  <p className="p-2 bg-white/5 text-white/70 text-sm">{img.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Answer Mode Selector */}
      {!showAnswer && (
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveMode('instant')}
            className={`flex items-center gap-2 px-4 py-2 border-2 transition-all ${
              activeMode === 'instant'
                ? 'bg-white text-black border-white'
                : 'border-white/30 text-white hover:border-white/60'
            }`}
          >
            <Eye className="w-4 h-4" />
            Show Answer
          </button>
          <button
            onClick={() => setActiveMode('write')}
            className={`flex items-center gap-2 px-4 py-2 border-2 transition-all ${
              activeMode === 'write'
                ? 'bg-white text-black border-white'
                : 'border-white/30 text-white hover:border-white/60'
            }`}
          >
            <PenTool className="w-4 h-4" />
            Draw Answer
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className={`flex items-center gap-2 px-4 py-2 border-2 transition-all ${
              activeMode === 'upload'
                ? 'bg-white text-black border-white'
                : 'border-white/30 text-white hover:border-white/60'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Work
          </button>
        </div>
      )}

      {/* Answer Input Area */}
      {!showAnswer && (
        <AnimatePresence mode="wait">
          {activeMode === 'instant' && (
            <motion.div
              key="instant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={handleShowAnswer}
                className="w-full py-4 bg-white text-black font-semibold hover:bg-white/90 transition-colors text-lg"
              >
                Reveal Answer
              </button>
            </motion.div>
          )}

          {activeMode === 'write' && (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DrawingCanvas onSave={handleCanvasSubmit} />
            </motion.div>
          )}

          {activeMode === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black border-2 border-white/20 p-8"
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-white/50 mx-auto mb-4" />
                <p className="text-white mb-4">Upload your written work</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 border-2 border-white/30 text-white hover:border-white/60 cursor-pointer transition-all"
                >
                  Choose File
                </label>
                {selectedFile && (
                  <div className="mt-4">
                    <p className="text-white/70 mb-4">Selected: {selectedFile.name}</p>
                    <button
                      onClick={handleFileUpload}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-white text-black font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Answer & Result Section */}
      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Result Badge */}
            {result && (
              <div className={`p-6 border-2 ${
                result.isCorrect
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-4">
                  {result.isCorrect ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500" />
                  )}
                  <div>
                    <p className={`text-lg font-semibold ${
                      result.isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.isCorrect ? 'Correct!' : 'Not quite right'}
                    </p>
                    {result.score !== null && (
                      <p className="text-white/70">Score: {result.score}%</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Correct Answer */}
            <div className="bg-black border-2 border-green-500/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-green-400" />
                <h3 className="text-green-400 font-semibold">Correct Answer</h3>
              </div>
              <MarkdownViewer
                content={question.answerText}
                className="text-white"
              />

              {/* Answer Images */}
              {question.answerImages?.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {question.answerImages.map((img, idx) => (
                    <div key={idx} className="border-2 border-white/20 overflow-hidden">
                      <img src={img.url} alt={img.caption || `Answer image ${idx + 1}`} className="w-full h-auto" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Explanation */}
            {(result?.explanation || question.explanation) && (
              <div className="bg-black border-2 border-blue-500/30 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-blue-400" />
                  <h3 className="text-blue-400 font-semibold">Explanation</h3>
                </div>
                <MarkdownViewer
                  content={result?.explanation || question.explanation}
                  className="text-white/90"
                />
              </div>
            )}

            {/* Step-by-step working */}
            {(result?.steps || question.steps)?.length > 0 && (
              <div className="bg-black border-2 border-purple-500/30 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <h3 className="text-purple-400 font-semibold">Step-by-step Solution</h3>
                </div>
                <div className="space-y-4">
                  {(result?.steps || question.steps).map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-8 h-8 bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold shrink-0">
                        {step.stepNumber || idx + 1}
                      </div>
                      <div className="flex-1">
                        <MarkdownViewer content={step.content} className="text-white/80" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {result?.feedback && (
              <div className="bg-black border-2 border-yellow-500/30 p-6">
                <h3 className="text-yellow-400 font-semibold mb-2">Feedback</h3>
                <p className="text-white/80">{result.feedback}</p>
                {result.suggestions?.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="text-white/70 flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
        <button
          onClick={onPrevious}
          disabled={questionIndex === 0}
          className="flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white hover:border-white/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        {questionIndex === totalQuestions - 1 ? (
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-white text-black font-semibold hover:bg-white/90 transition-colors"
          >
            Complete Quiz
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold hover:bg-white/90 transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

