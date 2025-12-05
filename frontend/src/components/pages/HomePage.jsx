import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, ArrowRight, Brain, BookOpen, FileText, ClipboardCheck, ChevronDown } from 'lucide-react';

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const targetSection = location.state?.targetSection;
    const hashSection = location.hash ? location.hash.replace('#', '') : null;
    const sectionToScroll = targetSection || hashSection;

    if (sectionToScroll) {
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

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${(totalScroll / windowHeight) * 100}`;
      setScrollProgress(Math.min(parseFloat(scroll), 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNextSection = () => {
    const whySection = document.getElementById('why-studysouq');
    if (whySection) {
      whySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-50">
        <div
          className="h-full bg-white transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Enhanced Animated Math Background - CSS Only */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-math-pattern" />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center z-10">
        <div className="max-w-7xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h1 className="text-white font-bold text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] leading-[0.95] mb-8 tracking-[-0.02em]">
              Master Maths.<br />
              Finally.
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="space-y-3 mb-12 max-w-4xl mx-auto"
          >
            <p className="text-white text-[18px] sm:text-[22px] md:text-[26px] font-normal leading-[1.3]">
              <span className="font-bold">INFINITE</span> AI-generated questions per lesson.
            </p>
            <p className="text-white text-[18px] sm:text-[22px] md:text-[26px] font-normal leading-[1.3]">
              Trained on <span className="font-bold">10,000+</span> handmade questions.
            </p>
            <p className="text-white text-[18px] sm:text-[22px] md:text-[26px] font-normal leading-[1.3]">
              Built for <span className="font-bold">Edexcel A-Level & O-Level</span> Maths only.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col items-center gap-6 mb-20"
          >
            <Link
              to="/subjects"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-black text-[16px] sm:text-[18px] font-bold hover:bg-white/90 transition-all duration-200"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-white/50 text-[14px] sm:text-[16px]">
              6 free questions per topic · No credit card required
            </p>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            onClick={scrollToNextSection}
            className="scroll-indicator mx-auto cursor-pointer hover:border-white/30 transition-all"
            aria-label="Scroll to next section"
          />
        </div>
      </section>

      {/* Scroll Down Arrow */}
      <div className="relative py-8 flex justify-center">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </motion.div>
      </div>

      {/* PROBLEM SECTION */}
      <section id="why-studysouq" className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-24">
          <ProblemStatement text="Traditional tutoring is expensive." delay={0} />
          <ProblemStatement text="Practice questions don't adapt to you." delay={0} />
          <ProblemStatement text="You keep making the same mistakes." delay={0} />
        </div>
      </section>

      {/* Scroll Down Arrow */}
      <div className="relative py-8 flex justify-center">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </motion.div>
      </div>

      {/* Scroll Down Arrow */}
      <div className="relative py-8 flex justify-center bg-white/[0.01]">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </motion.div>
      </div>

      {/* TUTORING COST COMPARISON */}
      <section className="relative py-24 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-white text-[36px] sm:text-[48px] md:text-[60px] font-bold text-center mb-16 leading-tight"
          >
            The Real Cost
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="border border-white/20 p-8 bg-white/[0.02]"
            >
              <h3 className="text-white text-[28px] sm:text-[32px] font-bold mb-4">Private Tutor</h3>
              <p className="text-white text-[36px] sm:text-[42px] font-bold mb-2">400 EGP</p>
              <p className="text-white/60 text-[16px] mb-6">per session (1 hour)</p>
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-white/60">
                  <span className="text-[18px]">✗</span>
                  <span className="text-[14px]">Limited availability</span>
                </div>
                <div className="flex items-start gap-2 text-white/60">
                  <span className="text-[18px]">✗</span>
                  <span className="text-[14px]">Fixed schedule</span>
                </div>
                <div className="flex items-start gap-2 text-white/60">
                  <span className="text-[18px]">✗</span>
                  <span className="text-[14px]">No instant feedback</span>
                </div>
              </div>
              <p className="text-white/40 text-[14px] mt-6">
                16 sessions/month = <span className="text-white font-bold">6,400 EGP</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="border-2 border-white p-8 bg-white/[0.05] relative"
            >
              <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 text-[11px] font-bold">BEST VALUE</div>
              <h3 className="text-white text-[28px] sm:text-[32px] font-bold mb-4">StudySouq</h3>
              <p className="text-white text-[36px] sm:text-[42px] font-bold mb-2">249 EGP</p>
              <p className="text-white/60 text-[16px] mb-6">per month (unlimited)</p>
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-white">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span className="text-[14px]">24/7 access</span>
                </div>
                <div className="flex items-start gap-2 text-white">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span className="text-[14px]">Study anytime</span>
                </div>
                <div className="flex items-start gap-2 text-white">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span className="text-[14px]">Instant AI feedback</span>
                </div>
              </div>
              <p className="text-white text-[16px] mt-6">
                Save <span className="font-bold text-[20px]">6,151 EGP</span> per month
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scroll Down Arrow */}
      <div className="relative py-8 flex justify-center">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </motion.div>
      </div>

      {/* FEATURES SECTION */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-white text-[36px] sm:text-[48px] md:text-[60px] font-bold text-center mb-16 leading-tight"
          >
            Everything You Need
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={BookOpen}
              title="Custom Handmade Notes"
              description="Carefully crafted notes for every lesson, designed to make complex concepts simple."
              delay={0.2}
            />
            <FeatureCard
              icon={FileText}
              title="Infinite AI Questions"
              description="UNLIMITED questions on every lesson. Our AI generates endless practice problems trained on 10,000+ handmade Edexcel questions."
              delay={0.4}
            />
            <FeatureCard
              icon={ClipboardCheck}
              title="Full Mock Exams"
              description="Complete practice exams that simulate real test conditions. Track your performance."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Scroll Down Arrow */}
      <div className="relative py-8 flex justify-center bg-white/[0.01]">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </motion.div>
      </div>

      {/* HOW IT WORKS */}
      <section className="relative py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-white text-[36px] sm:text-[48px] md:text-[60px] font-bold text-center mb-20 leading-tight"
          >
            How it works
          </motion.h2>

          <div className="space-y-16">
            <HowItWorksStep
              number="1"
              text="Answer practice questions."
              delay={0.2}
            />
            <HowItWorksStep
              number="2"
              text="AI tracks your mistakes."
              delay={0.4}
            />
            <HowItWorksStep
              number="3"
              text="Get personalized practice."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Scroll Down Arrow */}
      <div className="relative py-8 flex justify-center">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </motion.div>
      </div>

      {/* SOLUTION SECTION */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-24">
          <SolutionStatement text="AI analyzes every answer." delay={0} />
          <SolutionStatement text="Identifies your weak spots." delay={0} />
          <SolutionStatement text="Gives you targeted practice." delay={0} />
        </div>
      </section>

      {/* Scroll Down Arrow */}
      <div className="relative py-8 flex justify-center">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </motion.div>
      </div>

      {/* Scroll Down Arrow */}
      <div className="relative py-8 flex justify-center bg-white/[0.01]">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </motion.div>
      </div>

      {/* EXAMPLE QUESTION SHOWCASE */}
      <section className="relative py-24 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-white text-[36px] sm:text-[48px] md:text-[60px] font-bold text-center mb-16 leading-tight"
          >
            See it in action
          </motion.h2>

          {/* Question Box */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border border-white/20 p-8 sm:p-10 mb-12"
          >
            <p className="text-white/40 text-[14px] sm:text-[16px] font-bold mb-4 tracking-wider uppercase">Question</p>
            <p className="text-white text-[18px] sm:text-[22px] md:text-[24px] leading-[1.4] font-normal">
              Differentiate y = 3x² + 5x - 2 with respect to x.
            </p>
          </motion.div>

          {/* Student's Answer with Steps */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="border border-white/20 p-8 sm:p-10 mb-12 bg-white/[0.02]"
          >
            <p className="text-white/40 text-[14px] sm:text-[16px] font-bold mb-6 tracking-wider uppercase">Student's Work</p>
            <div className="space-y-6">
              <div>
                <p className="text-white/70 text-[14px] mb-2">Step 1:</p>
                <p className="text-white text-[16px] sm:text-[18px]">Apply power rule: d/dx(xⁿ) = nxⁿ⁻¹</p>
              </div>
              <div>
                <p className="text-white/70 text-[14px] mb-2">Step 2:</p>
                <p className="text-white text-[16px] sm:text-[18px]">d/dx(3x²) = 6x</p>
              </div>
              <div>
                <p className="text-white/70 text-[14px] mb-2">Step 3:</p>
                <p className="text-white text-[16px] sm:text-[18px]">d/dx(5x) = 5</p>
              </div>
              <div>
                <p className="text-white/70 text-[14px] mb-2">Step 4:</p>
                <p className="text-white text-[16px] sm:text-[18px]">d/dx(-2) = 0</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-white text-[18px] sm:text-[20px] font-bold">Final Answer: dy/dx = 6x + 5</p>
              </div>
            </div>
          </motion.div>

          {/* AI Insight Box with Green Success Theme */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="border-2 border-green-500/30 p-8 sm:p-10 bg-green-500/5 relative"
          >
            <div className="absolute top-4 right-4 bg-green-500 text-black px-4 py-2 text-[14px] font-bold">
              3/3 MARKS
            </div>
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-green-400" />
              <p className="text-green-400 text-[14px] sm:text-[16px] font-bold tracking-wider uppercase">AI Insight</p>
            </div>
            <div className="space-y-4">
              <p className="text-white text-[18px] sm:text-[20px] leading-[1.5]">
                <span className="text-green-400 font-bold">Excellent work!</span> You correctly applied the power rule to each term.
              </p>
              <div className="bg-white/5 border-l-4 border-green-500 p-4">
                <p className="text-white/90 text-[16px] leading-relaxed">
                  <strong>Strength:</strong> You showed all working steps clearly and applied differentiation rules accurately.
                </p>
              </div>
              <p className="text-white/70 text-[16px] leading-relaxed">
                You've now completed 3 differentiation questions with perfect scores. Ready to try integration next?
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scroll Down Arrow */}
      <div className="relative py-8 flex justify-center">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </motion.div>
      </div>

      {/* PRICING SECTION */}
      <section id="pricing" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-white text-[36px] sm:text-[48px] md:text-[60px] font-bold mb-8 leading-tight">
              Simple Pricing
            </h2>
            <p className="text-white text-[18px] sm:text-[22px] font-normal max-w-3xl mx-auto leading-[1.4]">
              Choose the plan that works for you.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="border-2 border-white p-8 sm:p-12"
            >
              <div className="text-center mb-10">
                <h3 className="text-white text-[48px] sm:text-[56px] font-bold mb-3 leading-none">249 EGP</h3>
                <p className="text-white/70 text-[20px] sm:text-[24px] mb-6">per month</p>

                <div className="border-t border-white/20 pt-6 mt-6">
                  <h3 className="text-white text-[40px] sm:text-[48px] font-bold mb-3 leading-none">1,499 EGP</h3>
                  <p className="text-white/70 text-[18px] sm:text-[20px]">per year <span className="text-white/50">(save 40%)</span></p>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <PricingPoint text="Unlimited AI tutor access" />
                <PricingPoint text="24/7 availability" />
                <PricingPoint text="Instant step-by-step solutions" />
                <PricingPoint text="Edexcel-specific content" />
                <PricingPoint text="Custom handmade notes" />
                <PricingPoint text="Full mock exams" />
                <PricingPoint text="Smart progress tracking" />
              </div>

              <div className="mb-10 py-6 border-t border-b border-white/20 text-center">
                <p className="text-white text-[28px] sm:text-[32px] font-bold mb-2">6 free questions</p>
                <p className="text-white/70 text-[16px] sm:text-[18px]">Per topic. No credit card required.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/subjects"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-black text-[18px] sm:text-[20px] font-bold hover:bg-white/90 transition-all duration-200"
                >
                  Try it free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/pricing"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-10 py-5 border-2 border-white text-white text-[18px] sm:text-[20px] font-bold hover:bg-white hover:text-black transition-all duration-200"
                >
                  Subscribe Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-32 px-6 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-white text-[42px] sm:text-[56px] md:text-[70px] font-bold leading-[1] mb-12"
          >
            Stop struggling.<br />
            Start mastering.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center gap-5"
          >
            <Link
              to="/subjects"
              className="inline-flex items-center justify-center gap-2 px-14 py-5 bg-white text-black text-[18px] sm:text-[22px] font-bold hover:bg-white/90 transition-all duration-200"
            >
              Start free trial
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="text-white/50 text-[15px] sm:text-[17px]">No credit card required</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Helper Components
function ProblemStatement({ text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="text-center min-h-[40vh] flex items-center justify-center"
    >
      <p className="text-white text-[28px] sm:text-[36px] md:text-[44px] font-bold leading-[1.1] max-w-4xl">
        {text}
      </p>
    </motion.div>
  );
}

function SolutionStatement({ text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="text-center min-h-[40vh] flex items-center justify-center"
    >
      <p className="text-white text-[28px] sm:text-[36px] md:text-[44px] font-bold leading-[1.1] max-w-4xl">
        {text}
      </p>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="border border-white/20 p-8 hover:border-white/30 transition-all duration-300"
    >
      <Icon className="w-10 h-10 text-white mb-6" />
      <h3 className="text-white text-[20px] sm:text-[22px] font-bold mb-4">{title}</h3>
      <p className="text-white/70 text-[15px] sm:text-[16px] leading-relaxed">{description}</p>
    </motion.div>
  );
}

function PricingPoint({ text }) {
  return (
    <div className="flex items-start gap-3">
      <Check className="flex-shrink-0 w-5 h-5 text-white mt-0.5" />
      <p className="text-[16px] sm:text-[17px] text-white">{text}</p>
    </div>
  );
}

function HowItWorksStep({ number, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-12 text-center md:text-left"
    >
      <div className="text-white/15 text-[120px] sm:text-[150px] md:text-[180px] font-bold leading-none">
        {number}
      </div>
      <div className="flex-1 flex items-center justify-center md:justify-start min-h-[150px]">
        <p className="text-white text-[26px] sm:text-[32px] md:text-[38px] font-bold leading-[1.1] max-w-2xl">
          {text}
        </p>
      </div>
    </motion.div>
  );
}
