import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { GraduationCap, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { getSubjects } from '../../services/publicService';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getSubjects();
        if (result.success) {
          // Transform API data to match expected format
          const transformedSubjects = result.data.map(subject => {
            // Use slug or _id as identifier
            const subjectId = subject.slug || subject._id;
            return {
              id: subjectId,
              _id: subject._id,
              name: subject.name,
              description: subject.description || '',
              level: subject.level,
              slug: subject.slug
            };
          });
          setSubjects(transformedSubjects);
        } else {
          setError(result.message || 'Failed to load subjects');
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-[16px]">Loading subjects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-black">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-[24px] font-bold mb-2 text-white">Error Loading Subjects</h2>
          <p className="text-white/60 mb-4 text-[16px]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-black font-bold hover:bg-white/90 transition-colors text-[16px]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (subjects.length === 0) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-white/60 text-[18px]">No subjects available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-white text-[40px] sm:text-[56px] md:text-[64px] font-bold mb-6">
            Choose Your Subject
          </h1>
          <p className="text-white/70 text-[16px] sm:text-[18px] max-w-2xl mx-auto leading-relaxed">
            Edexcel A-Level & O-Level Mathematics
          </p>
          <p className="text-white/50 text-[14px] sm:text-[16px] max-w-2xl mx-auto mt-4">
            INFINITE AI-generated questions on every lesson • Trained on 10,000+ handmade questions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subjects.map((subject, index) => {
            // Use subject ID (slug or _id) for navigation
            const subjectId = subject.slug || subject._id || subject.id;
            const linkTo = `/subjects/${subjectId}`;

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link to={linkTo} className="block group h-full">
                  <div className="relative bg-black border-2 border-white/20 p-8 h-full hover:border-white transition-all duration-300">
                    <div className="w-16 h-16 border-2 border-white/30 flex items-center justify-center mb-6 group-hover:border-white transition-all duration-300">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-white text-[24px] sm:text-[28px] font-bold mb-4 group-hover:text-white/80 transition-colors duration-300">
                      {subject.name}
                    </h2>

                    <p className="text-white/60 text-[14px] sm:text-[16px] mb-6 leading-relaxed">
                      {subject.description}
                    </p>

                    <div className="flex items-center text-white text-[14px] font-bold uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                      <span>View Sections</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 border-2 border-white/20 p-8 text-center"
        >
          <h3 className="text-white text-[20px] sm:text-[24px] font-bold mb-4">
            Why Choose StudySouq?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div>
              <p className="text-white text-[32px] font-bold mb-2">∞</p>
              <p className="text-white/70 text-[14px]">Infinite questions per lesson</p>
            </div>
            <div>
              <p className="text-white text-[32px] font-bold mb-2">10,000+</p>
              <p className="text-white/70 text-[14px]">Handmade training questions</p>
            </div>
            <div>
              <p className="text-white text-[32px] font-bold mb-2">24/7</p>
              <p className="text-white/70 text-[14px]">AI tutor availability</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
