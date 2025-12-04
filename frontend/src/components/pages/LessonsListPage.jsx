import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileText, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { getLessonsBySection, getSectionById, getSubjectById } from '../../services/publicService';

export default function LessonsListPage() {
  const { subjectId, sectionId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [section, setSection] = useState(null);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch section details if sectionId exists
        if (sectionId) {
          const sectionResult = await getSectionById(sectionId);
          if (sectionResult.success) {
            setSection(sectionResult.data);
          }
        }

        // Fetch subject details
        if (subjectId) {
          const subjectResult = await getSubjectById(subjectId);
          if (subjectResult.success) {
            setSubject(subjectResult.data);
          }
        }

        // Fetch lessons
        if (sectionId) {
          const lessonsResult = await getLessonsBySection(sectionId);
          if (lessonsResult.success) {
            setLessons(lessonsResult.data || []);
          } else {
            setError(lessonsResult.message || 'Failed to load lessons');
          }
        } else if (subjectId) {
          // If no sectionId, fetch lessons by subject
          const lessonsResult = await getLessons({ subject: subjectId });
          if (lessonsResult.success) {
            setLessons(lessonsResult.data || []);
          } else {
            setError(lessonsResult.message || 'Failed to load lessons');
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load lessons. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId, sectionId]);

  // Determine back link
  const backLink = sectionId ? `/subjects/${subjectId}` : '/subjects';
  const backText = sectionId ? 'Back to Sections' : 'Back to Subjects';

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2F6FED] animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading lessons...</p>
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
          <h2 className="text-xl font-semibold mb-2">Error Loading Lessons</h2>
          <p className="text-[#94A3B8] mb-4">{error}</p>
          <Link
            to={backLink}
            className="inline-block px-6 py-3 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-colors"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }
  
  return <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4
      }}>
          <Link to={backLink} className="inline-flex items-center text-[#94A3B8] hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backText}
          </Link>
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
          <h1 className="mb-4">{section?.name || subject?.name || 'Lessons'}</h1>
          <p className="text-[#94A3B8] text-lg">
            {section?.description || subject?.description || 'Select a lesson to begin learning'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => {
            const lessonId = lesson._id || lesson.id;
            return <motion.div key={lessonId} initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: index * 0.05
        }} whileHover={{
          y: -8
        }}>
              <Link to={`/lesson/${lessonId}`} className="block group h-full">
                <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-6 h-full hover:border-white/30 transition-all duration-300 hover:shadow-xl flex flex-col">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2F6FED] to-[#A9C7FF] flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="mb-3 group-hover:text-[#A9C7FF] transition-colors duration-300">
                    {lesson.title}
                  </h3>
                  
                  <p className="text-[#94A3B8] text-sm mb-4 flex-1">
                    {lesson.description || 'No description available'}
                  </p>

                  <div className="flex items-center text-[#2F6FED] group-hover:text-[#A9C7FF] transition-colors duration-300 text-sm">
                    <span>Start Lesson</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>;
          })}
        </div>

        {lessons.length === 0 && <div className="text-center py-20">
            <p className="text-gray-800">No lessons available yet. Please check back soon!</p>
          </div>}
      </div>
    </div>;
}