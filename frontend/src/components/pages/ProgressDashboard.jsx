import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Award,
  BookOpen,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Star,
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentProgress, getRecommendations } from '../../services/questionsService';

export default function ProgressDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !token) {
      navigate('/login', { state: { from: '/progress' } });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [progressResult, recsResult] = await Promise.all([
          getStudentProgress(),
          getRecommendations()
        ]);

        if (progressResult.success) {
          setProgress(progressResult.data);
        }
        if (recsResult.success) {
          setRecommendations(recsResult.data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !token) {
    return null;
  }

  const overall = progress?.overall || {};
  const byDifficulty = progress?.byDifficulty || {};
  const bySubject = progress?.bySubject || [];
  const recentSessions = progress?.recentSessions || [];
  const weakTopics = recommendations?.weakTopics || [];
  const aiRecommendations = recommendations?.recommendations;
  const suggestedQuestions = recommendations?.suggestedQuestions || [];

  const overallAccuracy = overall.totalAttempts > 0
    ? Math.round((overall.correctAttempts / overall.totalAttempts) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Your Progress</h1>
          <p className="text-white/70 mb-8">Track your learning journey and identify areas to improve</p>
        </motion.div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black border-2 border-white/20 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-white/70">Total Questions</span>
            </div>
            <p className="text-3xl font-bold text-white">{overall.totalAttempts || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-black border-2 border-white/20 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-white/70">Accuracy</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{overallAccuracy}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black border-2 border-white/20 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-white/70">Avg Score</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {Math.round(overall.averageScore || 0)}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-black border-2 border-white/20 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-white/70">Time Spent</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">
              {Math.round((overall.totalTime || 0) / 60)}m
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Difficulty Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black border-2 border-white/20 p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-white" />
                <h2 className="text-xl font-bold text-white">Performance by Difficulty</h2>
              </div>

              <div className="space-y-4">
                {['easy', 'medium', 'hard'].map((level) => {
                  const stats = byDifficulty[level];
                  const successRate = stats?.successRate || 0;
                  const color = level === 'easy' ? 'green' : level === 'medium' ? 'yellow' : 'red';

                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white capitalize">{level}</span>
                        <span className={`text-${color}-400`}>
                          {successRate}% ({stats?.correctAttempts || 0}/{stats?.totalAttempts || 0})
                        </span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${color}-500 transition-all duration-500`}
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Subject Performance */}
            {bySubject.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-black border-2 border-white/20 p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-5 h-5 text-white" />
                  <h2 className="text-xl font-bold text-white">Performance by Subject</h2>
                </div>

                <div className="space-y-4">
                  {bySubject.map((subject, idx) => {
                    const successRate = subject.totalAttempts > 0
                      ? Math.round((subject.correctAttempts / subject.totalAttempts) * 100)
                      : 0;

                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white capitalize">{subject._id}</span>
                          <span className="text-white/70">
                            {successRate}% ({subject.correctAttempts}/{subject.totalAttempts})
                          </span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${successRate}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-black border-2 border-white/20 p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-white" />
                  <h2 className="text-xl font-bold text-white">Recent Quiz Sessions</h2>
                </div>

                <div className="space-y-3">
                  {recentSessions.slice(0, 5).map((session, idx) => {
                    const accuracy = session.questionsAnswered > 0
                      ? Math.round((session.questionsCorrect / session.questionsAnswered) * 100)
                      : 0;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <div>
                          <p className="text-white font-medium">
                            {session.lesson?.title || 'Quiz Session'}
                          </p>
                          <p className="text-white/50 text-sm">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            accuracy >= 70 ? 'text-green-400' : 
                            accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {accuracy}%
                          </p>
                          <p className="text-white/50 text-sm">
                            {session.questionsCorrect}/{session.questionsAnswered}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Recommendations */}
          <div className="space-y-8">
            {/* Weak Topics */}
            {weakTopics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-black border-2 border-red-500/30 p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h2 className="text-xl font-bold text-white">Areas to Improve</h2>
                </div>

                <div className="space-y-3">
                  {weakTopics.slice(0, 5).map((topic, idx) => (
                    <Link
                      key={idx}
                      to={`/quiz/${topic._id}`}
                      className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-colors group"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {topic.lesson?.title || 'Unknown Topic'}
                        </p>
                        <p className="text-red-400 text-sm">
                          {Math.round(topic.successRate)}% success rate
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI Recommendations */}
            {aiRecommendations && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-black border-2 border-blue-500/30 p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Lightbulb className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">AI Recommendations</h2>
                </div>

                {aiRecommendations.encouragement && (
                  <p className="text-blue-400 mb-4 p-3 bg-blue-500/10 border border-blue-500/20">
                    {aiRecommendations.encouragement}
                  </p>
                )}

                {aiRecommendations.priorityTopics?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-white/70 text-sm mb-2">Focus Areas</h3>
                    <div className="space-y-2">
                      {aiRecommendations.priorityTopics.slice(0, 3).map((topic, idx) => (
                        <div key={idx} className="p-2 bg-white/5 border border-white/10">
                          <p className="text-white text-sm">{idx + 1}. {topic.topic}</p>
                          <p className="text-white/50 text-xs">{topic.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiRecommendations.estimatedStudyHours && (
                  <p className="text-white/70 text-sm">
                    Estimated study time: <span className="text-white">{aiRecommendations.estimatedStudyHours} hours</span>
                  </p>
                )}
              </motion.div>
            )}

            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="bg-black border-2 border-green-500/30 p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Suggested Practice</h2>
                </div>

                <div className="space-y-3">
                  {suggestedQuestions.slice(0, 3).map((question, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-green-500/10 border border-green-500/20"
                    >
                      <p className="text-white text-sm line-clamp-2">
                        {question.questionText}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 text-xs ${
                          question.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                          question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {question.difficulty}
                        </span>
                        <span className="text-white/50 text-xs">{question.marks} marks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

