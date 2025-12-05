import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Target, Award, Users, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-20 px-4 bg-black">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back to Home Button */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white hover:text-white/70 transition-colors text-[14px] font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-white/20 mb-6">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-white text-[40px] sm:text-[48px] font-bold mb-4">About StudySouq</h1>
            <p className="text-white/60 text-[16px]">Your Personal AI Mathematics Tutor</p>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto space-y-8">
            <section className="bg-black border-2 border-white/20 p-8">
              <h2 className="text-[24px] font-bold mb-4 text-white">Who We Are</h2>
              <p className="text-white/70 leading-relaxed mb-4 text-[16px]">
                StudySouq is an AI-powered educational platform designed for A-Level and O-Level Edexcel Mathematics students.
              </p>
              <p className="text-white/70 leading-relaxed text-[16px]">
                Our mission is to provide personalized, adaptive learning with INFINITE AI-generated questions trained on 10,000+ handmade problems.
              </p>
            </section>

            <section className="bg-black border-2 border-white/20 p-8">
              <h2 className="text-[24px] font-bold mb-4 text-white">What We Offer</h2>
              <p className="text-white/70 leading-relaxed mb-4 text-[16px]">Our platform combines:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-white mt-1 text-[18px]">•</span>
                  <span className="text-white/70 text-[16px]">INFINITE AI-generated questions per lesson</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-white mt-1 text-[18px]">•</span>
                  <span className="text-white/70 text-[16px]">AI tutor trained on 10,000+ handmade questions</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-white mt-1 text-[18px]">•</span>
                  <span className="text-white/70 text-[16px]">Custom handmade notes for every lesson</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-white mt-1 text-[18px]">•</span>
                  <span className="text-white/70 text-[16px]">100% Edexcel-style practice questions</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-white mt-1 text-[18px]">•</span>
                  <span className="text-white/70 text-[16px]">Full mock exams and progress tracking</span>
                </div>
              </div>
            </section>

            <section className="bg-black border-2 border-white/20 p-8">
              <h2 className="text-[24px] font-bold mb-4 text-white">Our Commitment</h2>
              <p className="text-white/70 leading-relaxed mb-4 text-[16px]">
                StudySouq provides unlimited practice with AI-generated questions, ensuring you never run out of problems to solve.
              </p>
              <p className="text-white/70 leading-relaxed text-[16px]">
                We are committed to making exam preparation easier, smarter, and more effective with 24/7 AI tutor support.
              </p>
            </section>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-black border-2 border-white/20 p-6">
                <div className="w-12 h-12 border-2 border-white/30 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[20px] font-bold mb-2 text-white">Infinite Questions</h3>
                <p className="text-white/70 text-[14px]">
                  Unlimited AI-generated practice problems on every lesson
                </p>
              </div>

              <div className="bg-black border-2 border-white/20 p-6">
                <div className="w-12 h-12 border-2 border-white/30 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[20px] font-bold mb-2 text-white">Edexcel Focused</h3>
                <p className="text-white/70 text-[14px]">
                  A-Level & O-Level Mathematics only - 100% exam-aligned
                </p>
              </div>

              <div className="bg-black border-2 border-white/20 p-6">
                <div className="w-12 h-12 border-2 border-white/30 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[20px] font-bold mb-2 text-white">Handmade Notes</h3>
                <p className="text-white/70 text-[14px]">
                  Custom notes for every lesson, designed for clarity
                </p>
              </div>

              <div className="bg-black border-2 border-white/20 p-6">
                <div className="w-12 h-12 border-2 border-white/30 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[20px] font-bold mb-2 text-white">24/7 AI Tutor</h3>
                <p className="text-white/70 text-[14px]">
                  Instant help trained on 10,000+ questions
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <section className="bg-black border-2 border-white p-8 text-center mt-8">
              <h2 className="text-[24px] font-bold mb-4 text-white">Ready to Excel in Mathematics?</h2>
              <p className="text-white/70 mb-6 text-[16px]">
                Join students mastering A-Level & O-Level Edexcel Maths with infinite AI practice
              </p>
              <Link
                to="/signup"
                className="inline-block px-8 py-4 bg-white text-black font-bold hover:bg-white/90 transition-all duration-300 text-[16px]"
              >
                Get Started
              </Link>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
