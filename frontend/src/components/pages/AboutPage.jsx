import { motion } from 'motion/react';
import { BookOpen, Target, Award, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2F6FED]/20 to-[#A9C7FF]/20 rounded-2xl mb-6">
              <BookOpen className="w-10 h-10 text-[#2F6FED]" />
            </div>
            <h1 className="mb-4">About StudySouq</h1>
            <p className="text-[#94A3B8]">Your Personal AI Mathematics Tutor</p>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto p-6 space-y-4">
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">Who We Are</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">
                StudySouq is an AI-powered educational platform designed for IGCSE, AS Level, and A2 Edexcel Mathematics students in Egypt.
              </p>
              <p className="text-[#94A3B8] leading-relaxed">
                Our mission is to provide personalized, adaptive learning that helps every student understand concepts faster, improve through practice, and perform confidently in exams.
              </p>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">What We Offer</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">Our platform combines:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[#2F6FED] mt-1">•</span>
                  <span className="text-[#94A3B8]">High-quality study materials</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#2F6FED] mt-1">•</span>
                  <span className="text-[#94A3B8]">AI-assisted tutoring</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#2F6FED] mt-1">•</span>
                  <span className="text-[#94A3B8]">Topic-based practice questions</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#2F6FED] mt-1">•</span>
                  <span className="text-[#94A3B8]">Student progress tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#2F6FED] mt-1">•</span>
                  <span className="text-[#94A3B8]">Smart learning recommendations</span>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">Our Commitment</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">
                StudySouq provides an innovative way for students to learn at their own pace, get instant AI feedback, and strengthen weak areas.
              </p>
              <p className="text-[#94A3B8] leading-relaxed">
                We are committed to making exam preparation easier, smarter, and more effective for every learner.
              </p>
            </section>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-[#2F6FED]/20 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-[#2F6FED]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personalized Learning</h3>
                <p className="text-[#94A3B8] text-sm">
                  Adaptive content tailored to your learning pace and style
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-[#2F6FED]/20 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-[#2F6FED]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Exam-Focused</h3>
                <p className="text-[#94A3B8] text-sm">
                  Content aligned with Edexcel Mathematics syllabus
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-[#2F6FED]/20 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-[#2F6FED]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Comprehensive Materials</h3>
                <p className="text-[#94A3B8] text-sm">
                  Complete coverage of all topics and learning objectives
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-[#2F6FED]/20 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-[#2F6FED]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Tutor Support</h3>
                <p className="text-[#94A3B8] text-sm">
                  Get instant help and guidance whenever you need it
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <section className="bg-gradient-to-br from-[#2F6FED]/10 to-[#A9C7FF]/10 border border-[#2F6FED]/30 rounded-2xl p-8 text-center mt-8">
              <h2 className="text-2xl font-semibold mb-4">Ready to Excel in Mathematics?</h2>
              <p className="text-[#94A3B8] mb-6">
                Join thousands of students who are achieving their academic goals with StudySouq
              </p>
              <a
                href="/signup"
                className="inline-block px-8 py-3 bg-[#2F6FED] hover:bg-[#2F6FED]/80 transition-all duration-300"
                style={{
                  borderRadius: '9999px',
                  fontWeight: '600',
                  boxShadow: '0 10px 30px rgba(47, 111, 237, 0.5)'
                }}
              >
                Get Started
              </a>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

