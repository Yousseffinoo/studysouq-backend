import { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, ArrowLeft, Loader2, AlertCircle, Lock } from 'lucide-react';
import { getSubjectById, getSections } from '../../services/publicService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function SectionsPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [subject, setSubject] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch subject details
        const subjectResult = await getSubjectById(subjectId);
        if (!subjectResult.success) {
          setError(subjectResult.message || 'Subject not found');
          setLoading(false);
          return;
        }
        setSubject(subjectResult.data);

        // Fetch sections for this subject
        const sectionsResult = await getSections(subjectId);
        if (sectionsResult.success) {
          setSections(sectionsResult.data || []);
        } else {
          console.warn('Failed to fetch sections:', sectionsResult.message);
          setSections([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchData();
    }
  }, [subjectId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2F6FED] animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading sections...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !subject) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Subject Not Found</h2>
          <p className="text-[#94A3B8] mb-4">{error || 'The subject you are looking for does not exist.'}</p>
          <Link
            to="/subjects"
            className="inline-block px-6 py-3 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-colors"
          >
            Back to Subjects
          </Link>
        </div>
      </div>
    );
  }

  // If no sections, redirect to lessons (for subjects without sections like IGCSE)
  if (sections.length === 0) {
    return <Navigate to={`/subjects/${subjectId}/lessons`} replace />;
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
          <Link to="/subjects" className="inline-flex items-center text-[#94A3B8] hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Subjects
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
      }} className="text-center mb-16">
          <h1 className="mb-6">{subject.name}</h1>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
            Select a section to access lessons, notes, and practice questions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => {
            const sectionId = section._id || section.id;
            const isPremium = section.isPremium || false;
            const userIsPremium = user?.isPremium || false;
            
            const handleSectionClick = (e) => {
              // Check if section is premium
              if (isPremium) {
                // Check if user is logged in
                if (!user || !token) {
                  e.preventDefault();
                  toast.info('Please login to access premium sections');
                  navigate('/login', { state: { from: `/subjects/${subjectId}` } });
                  return;
                }
                
                // Check if user has premium access
                if (!userIsPremium) {
                  e.preventDefault();
                  toast.info('This is a premium section. Please upgrade to access.');
                  navigate('/pricing', { state: { targetSection: 'pricing-plans' } });
                  return;
                }
              }
            };
            
            return <motion.div key={sectionId} initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: index * 0.1
        }} whileHover={{
          y: -8
        }}>
              <Link 
                to={`/subjects/${subjectId}/${sectionId}`} 
                onClick={handleSectionClick}
                className="block group"
              >
                <div className={`bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border ${isPremium && !userIsPremium ? 'border-[#F7C94C]/50' : 'border-white/10'} rounded-2xl p-8 hover:border-white/30 transition-all duration-300 hover:shadow-xl`}>
                  <div className="flex items-start">
                    <div className={`w-14 h-14 rounded-xl ${isPremium && !userIsPremium ? 'bg-gradient-to-br from-[#F7C94C] to-[#F7C94C]/80' : 'bg-gradient-to-br from-[#2F6FED] to-[#A9C7FF]'} flex items-center justify-center flex-shrink-0`}>
                      {isPremium && !userIsPremium ? (
                        <Lock className="w-7 h-7 text-white" />
                      ) : (
                        <BookOpen className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <div className="ml-6 flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="group-hover:text-[#A9C7FF] transition-colors duration-300">
                          {section.name}
                        </h3>
                        {isPremium && !userIsPremium && (
                          <span className="px-2 py-1 bg-[#F7C94C]/20 border border-[#F7C94C]/50 rounded text-xs text-[#F7C94C]">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-[#94A3B8] text-sm">
                        {section.description || 'No description available'}
                      </p>
                      <div className="mt-4 flex items-center text-[#2F6FED] group-hover:text-[#A9C7FF] transition-colors duration-300">
                        <span className="text-sm">View Lessons</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>;
          })}
        </div>
      </div>
    </div>;
}