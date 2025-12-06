import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, BookOpen, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { getLessonById } from '../../services/publicService';
import AITutorChat from '../AITutorChat';
import MarkdownViewer from '../MarkdownViewer';
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

        // Fetch lesson details (notes are now embedded in lesson)
        const lessonResult = await getLessonById(lessonId);
        console.log('=== LESSON FETCH ===');
        console.log('Lesson Result:', lessonResult);

        if (lessonResult.success) {
          const lesson = lessonResult.data;
          setCurrentLesson(lesson);
          console.log('Current Lesson:', lesson);
          console.log('Lesson Notes:', lesson.notes);

          // Notes are now embedded in the lesson object
          if (lesson.notes && lesson.notes.content) {
            setLessonNotes(lesson.notes);
            console.log('Notes content found:', lesson.notes.content);
          } else {
            console.log('No notes content in lesson');
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

  // Debug user and premium status
  useEffect(() => {
    console.log('=== AUTH STATUS ===');
    console.log('User:', user);
    console.log('Token:', token ? 'EXISTS' : 'MISSING');
    console.log('isPremium:', isPremium);
    console.log('lessonNotes:', lessonNotes);
  }, [user, token, isPremium, lessonNotes]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading lesson...</p>
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
          <p className="text-white/70 mb-4">{error || 'The lesson you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-semibold"
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
            <button onClick={() => navigate(-1)} className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-8">
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
            <p className="text-white/70 text-lg">
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
        }} className="bg-black border-2 border-white/20 overflow-hidden mb-8">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <BookOpen className="w-6 h-6 text-white mr-3" />
                  <h2>Lesson Notes</h2>
                </div>
                {!isPremium && <div className="flex items-center text-white text-sm">
                    <Lock className="w-4 h-4 mr-2" />
                    Premium Only
                  </div>}
              </div>

              {lessonNotes ? (
                (isPremium && user && token) ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="bg-white/5 p-6 border-2 border-white/10">
                      {/* Notes Content with Markdown + Math Rendering */}
                      {lessonNotes.content && (
                        <MarkdownViewer
                          content={lessonNotes.content}
                          className="text-white/90 mb-6"
                        />
                      )}

                      {/* Display Note Images if they exist */}
                      {lessonNotes.images && lessonNotes.images.length > 0 && (
                        <div className="mt-8 space-y-4">
                          <h3 className="text-white flex items-center mb-4">
                            <ImageIcon className="w-5 h-5 mr-2" />
                            Images & Diagrams
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {lessonNotes.images.map((image, index) => (
                              <div key={index} className="border-2 border-white/20 overflow-hidden">
                                <img
                                  src={image.url}
                                  alt={image.caption || `Diagram ${index + 1}`}
                                  className="w-full h-auto"
                                />
                                {image.caption && (
                                  <div className="p-3 bg-white/5 border-t-2 border-white/10">
                                    <p className="text-sm text-white/70">{image.caption}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Summary if available */}
                      {lessonNotes.summary && (
                        <div className="mt-6 p-4 bg-white/10 border-2 border-white/20">
                          <p className="text-white/90 text-sm">
                            💡 <strong>Summary:</strong> {lessonNotes.summary}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (!user || !token) ? (
                  <div className="relative">
                    <div className="blur-sm select-none pointer-events-none">
                      <div className="bg-white/5 p-6 border-2 border-white/10">
                        <h3 className="text-white mb-4">Introduction</h3>
                        <p className="text-white/80 mb-4">
                          This section covers the fundamental concepts of mathematics.
                          You'll learn key principles, formulas, and problem-solving techniques.
                        </p>
                        <div className="h-32 bg-white/5"></div>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-black/80 to-black">
                      <div className="text-center p-8">
                        <Lock className="w-12 h-12 text-white mx-auto mb-4" />
                        <h3 className="mb-4">Login Required</h3>
                        <p className="text-white/70 mb-6 max-w-md">
                          Please login to access lesson notes and premium content
                        </p>
                        <button
                          onClick={() => {
                            navigate('/login', { state: { from: `/lesson/${lessonId}` } });
                          }}
                          className="inline-block px-8 py-3 bg-white text-black hover:bg-white/90 transition-all duration-300 font-semibold"
                        >
                          Login Now
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="blur-sm select-none pointer-events-none">
                      <div className="bg-white/5 p-6 border-2 border-white/10">
                        <h3 className="text-white mb-4">Introduction</h3>
                        <p className="text-white/80 mb-4">
                          This section covers the fundamental concepts of mathematics.
                          You'll learn key principles, formulas, and problem-solving techniques.
                        </p>
                        <div className="h-32 bg-white/5"></div>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-black/80 to-black">
                      <div className="text-center p-8">
                        <Lock className="w-12 h-12 text-white mx-auto mb-4" />
                        <h3 className="mb-4">Unlock Premium Notes</h3>
                        <p className="text-white/70 mb-6 max-w-md">
                          Get access to comprehensive notes, detailed explanations, and study guides for all lessons
                        </p>
                        <button
                          onClick={() => {
                            navigate('/pricing', { state: { targetSection: 'pricing-plans' } });
                          }}
                          className="inline-block px-8 py-3 bg-white text-black hover:bg-white/90 transition-all duration-300 font-semibold"
                        >
                          Upgrade to Premium
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                  <div className="prose prose-invert max-w-none">
                    <div className="bg-white/5 p-6 border-2 border-white/10">
                      <p className="text-white/70 text-center py-8">
                        📝 No notes available for this lesson yet.
                      </p>
                      <p className="text-white/50 text-sm text-center">
                        Notes will be added soon to help you master this topic.
                      </p>
                    </div>
                  </div>
                )
              ) : (!user || !token) ? (
                <div className="relative">
                  <div className="blur-sm select-none pointer-events-none">
                    <div className="bg-white/5 p-6 border-2 border-white/10">
                      <h3 className="text-white mb-4">Introduction</h3>
                      <p className="text-white/80 mb-4">
                        This section covers the fundamental concepts of mathematics.
                        You'll learn key principles, formulas, and problem-solving techniques.
                      </p>
                      <div className="h-32 bg-white/5"></div>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-black/80 to-black">
                    <div className="text-center p-8">
                      <Lock className="w-12 h-12 text-white mx-auto mb-4" />
                      <h3 className="mb-4">Login Required</h3>
                      <p className="text-white/70 mb-6 max-w-md">
                        Please login to access lesson notes and premium content
                      </p>
                      <button
                        onClick={() => {
                          navigate('/login', { state: { from: `/lesson/${lessonId}` } });
                        }}
                        className="inline-block px-8 py-3 bg-white text-black hover:bg-white/90 transition-all duration-300 font-semibold"
                      >
                        Login Now
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="blur-sm select-none pointer-events-none">
                    <div className="bg-white/5 p-6 border-2 border-white/10">
                      <h3 className="text-white mb-4">Introduction</h3>
                      <p className="text-white/80 mb-4">
                        This section covers the fundamental concepts of mathematics.
                        You'll learn key principles, formulas, and problem-solving techniques.
                      </p>
                      <div className="h-32 bg-white/5"></div>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-black/80 to-black">
                    <div className="text-center p-8">
                      <Lock className="w-12 h-12 text-white mx-auto mb-4" />
                      <h3 className="mb-4">Unlock Premium Notes</h3>
                      <p className="text-white/70 mb-6 max-w-md">
                        Get access to comprehensive notes, detailed explanations, and study guides for all lessons
                      </p>
                      <button
                        onClick={() => {
                          navigate('/pricing', { state: { targetSection: 'pricing-plans' } });
                        }}
                        className="inline-block px-8 py-3 bg-white text-black hover:bg-white/90 transition-all duration-300 font-semibold"
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
              <div className="bg-black border-2 border-white/20 p-8 hover:border-white transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-3">Practice Questions</h3>
                    <p className="text-white/70">
                      Test your understanding with curated practice problems
                    </p>
                  </div>
                  <svg className="w-8 h-8 text-white group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
