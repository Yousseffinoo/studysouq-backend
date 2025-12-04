import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, MessageSquare, FileText, Lightbulb } from 'lucide-react';
export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const targetSection = location.state?.targetSection;
    const hashSection = location.hash ? location.hash.replace('#', '') : null;
    const sectionToScroll = targetSection || hashSection;

    if (sectionToScroll) {
      // Allow DOM to paint before scrolling
      requestAnimationFrame(() => {
        const element = document.getElementById(sectionToScroll);
        if (element) {
          const offset = 96;
          const y = element.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({
            top: y >= 0 ? y : 0,
            behavior: 'smooth',
          });
        }
      });

      if (targetSection) {
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location, navigate]);

  const features = [{
    icon: FileText,
    title: 'Comprehensive Notes',
    description: 'Clear, structured notes covering every topic in the Edexcel syllabus',
    color: '#2F6FED'
  }, {
    icon: BookOpen,
    title: 'Practice Questions',
    description: 'Thousands of questions with detailed solutions to master every concept',
    color: '#A9C7FF'
  }, {
    icon: MessageSquare,
    title: 'AI Tutor',
    description: 'Get instant help from our AI tutor whenever you need clarification',
    color: '#F7C94C'
  }, {
    icon: Lightbulb,
    title: 'AI Weak Topic Insights',
    description: 'AI feature for identifying weak topics so you know exactly what to revise next',
    color: '#F7C94C'
  }];
  return <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section id="home" className="relative min-h-[90vh] flex items-center justify-center px-4 scroll-mt-24 lg:scroll-mt-32">
        {/* Math background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <path d="M100,500 Q300,200 500,500 T900,500" stroke="currentColor" fill="none" strokeWidth="2" />
            <circle cx="200" cy="300" r="50" stroke="currentColor" fill="none" strokeWidth="2" />
            <circle cx="800" cy="700" r="50" stroke="currentColor" fill="none" strokeWidth="2" />
            <line x1="300" y1="600" x2="400" y2="400" stroke="currentColor" strokeWidth="2" />
            <line x1="600" y1="300" x2="700" y2="500" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }}>
            <h1 className="mb-6 bg-gradient-to-r from-white via-[#A9C7FF] to-[#2F6FED] bg-clip-text text-transparent">
              Learn Edexcel Maths with Clarity & Confidence
            </h1>
          </motion.div>

          <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }} className="text-[#94A3B8] text-lg sm:text-xl mb-12 max-w-2xl mx-auto">
            Master IGCSE & A-Level Mathematics with comprehensive notes, practice questions, and AI-powered tutoring
          </motion.p>

          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.6
        }}>
            <Link to="/subjects" className="inline-block px-8 py-4 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#2F6FED]/20">
              Start Learning
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="subjects" className="py-20 px-4 scroll-mt-24 lg:scroll-mt-32">
        <div className="max-w-7xl mx-auto">
          <motion.h2 initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="text-center mb-16">
            Everything You Need to Excel
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => <motion.div key={feature.title} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: index * 0.1
          }} whileHover={{
            y: -8
          }} className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 hover:shadow-xl">
                {feature.badge && <div className="mb-6 text-left text-sm uppercase tracking-wide text-[#A9C7FF]">
                    {feature.badge}
                  </div>}
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{
              backgroundColor: `${feature.color}20`
            }}>
                  {feature.icon && <feature.icon className="w-8 h-8" style={{
                color: feature.color
              }} />}
                </div>
                <h3 className="mb-4">{feature.title}</h3>
                {feature.description && <p className="text-[#94A3B8]">{feature.description}</p>}
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-20 px-4 scroll-mt-24 lg:scroll-mt-32">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="bg-gradient-to-br from-[#2F6FED]/20 to-[#F7C94C]/20 border border-[#2F6FED]/30 rounded-3xl p-12 text-center">
            <h2 className="mb-6">Ready to Start Learning?</h2>
            <p className="text-[#94A3B8] text-lg mb-8">
              Join thousands of students mastering Edexcel Mathematics
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/subjects" className="px-8 py-4 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-xl transition-all duration-300">
                Browse Subjects
              </Link>
              <Link to="/pricing" state={{ targetSection: 'pricing-plans' }} className="px-8 py-4 border border-[#F7C94C] hover:bg-[#F7C94C]/10 rounded-xl transition-all duration-300">
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>;
}