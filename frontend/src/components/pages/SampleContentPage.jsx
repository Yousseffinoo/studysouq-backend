import { motion } from 'motion/react';
import { FileText, Calculator, TrendingUp, CheckCircle } from 'lucide-react';

export default function SampleContentPage() {
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
              <FileText className="w-10 h-10 text-[#2F6FED]" />
            </div>
            <h1 className="mb-4">Sample Content</h1>
            <p className="text-[#94A3B8]">Explore Edexcel-style Mathematics Questions and Examples</p>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto p-6 space-y-4">
            {/* Sample Questions */}
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="w-6 h-6 text-[#2F6FED]" />
                <h2 className="text-2xl font-semibold text-[#A9C7FF]">Sample Edexcel-style Math Questions</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Question 1: Algebra</h3>
                  <p className="text-[#94A3B8] mb-4">Solve for x: 2x + 5 = 17</p>
                  <div className="bg-[#2F6FED]/10 border border-[#2F6FED]/30 rounded-lg p-4">
                    <p className="text-[#94A3B8] text-sm mb-2">Solution:</p>
                    <p className="text-[#94A3B8]">2x + 5 = 17</p>
                    <p className="text-[#94A3B8]">2x = 12</p>
                    <p className="text-[#94A3B8]">x = 6</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Question 2: Calculus</h3>
                  <p className="text-[#94A3B8] mb-4">Differentiate: f(x) = 3x² – 5x + 1</p>
                  <div className="bg-[#2F6FED]/10 border border-[#2F6FED]/30 rounded-lg p-4">
                    <p className="text-[#94A3B8] text-sm mb-2">Solution:</p>
                    <p className="text-[#94A3B8]">f'(x) = 6x – 5</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Question 3: Integration</h3>
                  <p className="text-[#94A3B8] mb-4">Evaluate the integral: ∫(4x³) dx</p>
                  <div className="bg-[#2F6FED]/10 border border-[#2F6FED]/30 rounded-lg p-4">
                    <p className="text-[#94A3B8] text-sm mb-2">Solution:</p>
                    <p className="text-[#94A3B8]">∫(4x³) dx = x⁴ + C</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Solved Example */}
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-semibold text-[#A9C7FF]">Solved Example</h2>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Question:</h3>
                <p className="text-[#94A3B8] mb-6">Solve: 3x – 9 = 12</p>
                
                <h3 className="text-lg font-semibold text-white mb-3">Solution:</h3>
                <div className="space-y-2 text-[#94A3B8]">
                  <p>3x – 9 = 12</p>
                  <p>3x = 21</p>
                  <p>x = 7</p>
                </div>
              </div>
            </section>

            {/* Mock AI Tutor Conversation */}
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-[#2F6FED]" />
                <h2 className="text-2xl font-semibold text-[#A9C7FF]">Mock AI Tutor Conversation</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[#2F6FED]/10 border border-[#2F6FED]/30 rounded-xl p-4">
                  <p className="text-sm text-[#A9C7FF] mb-2">Student:</p>
                  <p className="text-[#94A3B8]">"How do I integrate x²?"</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-sm text-green-400 mb-2">AI Tutor:</p>
                  <p className="text-[#94A3B8] mb-2">
                    "Use the power rule: add 1 to power → divide by new exponent."
                  </p>
                  <p className="text-[#94A3B8]">
                    ∫x² dx = x³ / 3 + C
                  </p>
                </div>
              </div>
            </section>

            {/* Example Topics */}
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-6 text-[#A9C7FF]">Example Topics Included</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#2F6FED]">•</span>
                    <span className="text-[#94A3B8] font-semibold">Algebra</span>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#2F6FED]">•</span>
                    <span className="text-[#94A3B8] font-semibold">Functions</span>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#2F6FED]">•</span>
                    <span className="text-[#94A3B8] font-semibold">Trigonometry</span>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#2F6FED]">•</span>
                    <span className="text-[#94A3B8] font-semibold">Differentiation</span>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#2F6FED]">•</span>
                    <span className="text-[#94A3B8] font-semibold">Integration</span>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#2F6FED]">•</span>
                    <span className="text-[#94A3B8] font-semibold">Mechanics</span>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#2F6FED]">•</span>
                    <span className="text-[#94A3B8] font-semibold">Statistics</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="bg-gradient-to-br from-[#2F6FED]/10 to-[#A9C7FF]/10 border border-[#2F6FED]/30 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Want to Access More Content?</h2>
              <p className="text-[#94A3B8] mb-6">
                Sign up today and get 6 free questions per topic, plus unlimited access with premium!
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

