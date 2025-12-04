import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { getLessonById, getNotes } from '../../services/publicService';
import AITutorChat from '../AITutorChat';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonNotes, setLessonNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isPremium = user?.isPremium || false;

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch lesson details
        const lessonResult = await getLessonById(lessonId);
        if (lessonResult.success) {
          setCurrentLesson(lessonResult.data);
          
          // Fetch notes for this lesson
          const notesResult = await getNotes({ lesson: lessonId });
          if (notesResult.success && notesResult.data.length > 0) {
            setLessonNotes(notesResult.data[0]); // Use first note if available
          }
        } else {
          setError(lessonResult.message || 'Lesson not found');
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2F6FED] animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentLesson) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lesson Not Found</h2>
          <p className="text-[#94A3B8] mb-4">{error || 'The lesson you are looking for does not exist.'}</p>
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
              Back to Lessons
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
            <h1 className="mb-4">{currentLesson.title}</h1>
            <p className="text-[#94A3B8] text-lg">
              {currentLesson.description}
            </p>
          </motion.div>

          {/* Notes Section - Always Premium */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl overflow-hidden mb-8">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <BookOpen className="w-6 h-6 text-[#2F6FED] mr-3" />
                  <h2>Lesson Notes</h2>
                </div>
                {!isPremium && <div className="flex items-center text-[#F7C94C] text-sm">
                    <Lock className="w-4 h-4 mr-2" />
                    Premium Only
                  </div>}
              </div>

              {(isPremium && user && token) ? (
                lessonNotes ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="bg-[#0A0E14] rounded-xl p-6 border border-white/5">
                      {lessonNotes.content ? (
                        <div 
                          dangerouslySetInnerHTML={{ __html: lessonNotes.content }} 
                          className="text-[#94A3B8]"
                        />
                      ) : (
                        <>
                          <h3 className="text-[#A9C7FF] mb-4">Introduction</h3>
                          <p className="text-[#94A3B8] mb-4">
                            {lessonNotes.summary || `This section covers the fundamental concepts of ${currentLesson.title.toLowerCase()}. 
                            You'll learn key principles, formulas, and problem-solving techniques.`}
                          </p>
                          
                          {lessonNotes.content && (
                            <>
                              <h3 className="text-[#A9C7FF] mb-4 mt-6">Key Concepts</h3>
                              <div 
                                className="text-[#94A3B8]"
                                dangerouslySetInnerHTML={{ __html: lessonNotes.content }}
                              />
                            </>
                          )}

                          <div className="mt-6 p-4 bg-[#2F6FED]/10 border border-[#2F6FED]/30 rounded-lg">
                            <p className="text-[#A9C7FF] text-sm">
                              💡 <strong>Pro Tip:</strong> Practice is key! Make sure to work through all the practice questions to master this topic.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <div className="bg-[#0A0E14] rounded-xl p-6 border border-white/5">
                      <h3 className="text-[#A9C7FF] mb-4">Introduction</h3>
                      <p className="text-[#94A3B8] mb-4">
                        {currentLesson.content || `This section covers the fundamental concepts of ${currentLesson.title.toLowerCase()}. 
                        You'll learn key principles, formulas, and problem-solving techniques.`}
                      </p>
                      
                      <h3 className="text-[#A9C7FF] mb-4 mt-6">Key Concepts</h3>
                      <ul className="text-[#94A3B8] space-y-2">
                        <li>Understanding the theoretical foundation</li>
                        <li>Applying formulas and methods</li>
                        <li>Solving real-world problems</li>
                        <li>Common mistakes to avoid</li>
                      </ul>

                      <div className="mt-6 p-4 bg-[#2F6FED]/10 border border-[#2F6FED]/30 rounded-lg">
                        <p className="text-[#A9C7FF] text-sm">
                          💡 <strong>Pro Tip:</strong> Practice is key! Make sure to work through all the practice questions to master this topic.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ) : (!user || !token) ? (
                <div className="relative">
                  <div className="blur-sm select-none pointer-events-none">
                    <div className="bg-[#0A0E14] rounded-xl p-6 border border-white/5">
                      <h3 className="text-[#A9C7FF] mb-4">Introduction</h3>
                      <p className="text-[#94A3B8] mb-4">
                        This section covers the fundamental concepts of mathematics. 
                        You'll learn key principles, formulas, and problem-solving techniques.
                      </p>
                      <div className="h-32 bg-white/5 rounded"></div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-[#0B1D34]/80 to-[#0B1D34]">
                    <div className="text-center p-8">
                      <Lock className="w-12 h-12 text-[#F7C94C] mx-auto mb-4" />
                      <h3 className="mb-4">Login Required</h3>
                      <p className="text-[#94A3B8] mb-6 max-w-md">
                        Please login to access lesson notes and premium content
                      </p>
                      <button
                        onClick={() => {
                          navigate('/login', { state: { from: `/lesson/${lessonId}` } });
                        }}
                        className="inline-block px-8 py-3 bg-gradient-to-r from-[#F7C94C] to-[#2F6FED] hover:opacity-90 rounded-xl transition-all duration-300"
                      >
                        Login Now
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="blur-sm select-none pointer-events-none">
                    <div className="bg-[#0A0E14] rounded-xl p-6 border border-white/5">
                      <h3 className="text-[#A9C7FF] mb-4">Introduction</h3>
                      <p className="text-[#94A3B8] mb-4">
                        This section covers the fundamental concepts of mathematics. 
                        You'll learn key principles, formulas, and problem-solving techniques.
                      </p>
                      <div className="h-32 bg-white/5 rounded"></div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-[#0B1D34]/80 to-[#0B1D34]">
                    <div className="text-center p-8">
                      <Lock className="w-12 h-12 text-[#F7C94C] mx-auto mb-4" />
                      <h3 className="mb-4">Unlock Premium Notes</h3>
                      <p className="text-[#94A3B8] mb-6 max-w-md">
                        Get access to comprehensive notes, detailed explanations, and study guides for all lessons
                      </p>
                      <button
                        onClick={() => {
                          navigate('/pricing', { state: { targetSection: 'pricing-plans' } });
                        }}
                        className="inline-block px-8 py-3 bg-gradient-to-r from-[#F7C94C] to-[#2F6FED] hover:opacity-90 rounded-xl transition-all duration-300"
                      >
                        Upgrade to Premium
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Practice Questions CTA */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.4
        }}>
            <Link to={`/lesson/${lessonId}/questions`} className="block group">
              <div className="bg-gradient-to-br from-[#2F6FED]/20 to-[#F7C94C]/20 border border-[#2F6FED]/30 rounded-2xl p-8 hover:border-[#2F6FED]/50 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-3">Practice Questions</h3>
                    <p className="text-[#94A3B8]">
                      Test your understanding with curated practice problems
                    </p>
                  </div>
                  <svg className="w-8 h-8 text-[#2F6FED] group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* AI Tutor Chat */}
      <AITutorChat />
    </>;
}