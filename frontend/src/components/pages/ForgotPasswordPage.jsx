import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowLeft } from 'lucide-react';
import Logo from '../Logo';
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = e => {
    e.preventDefault();
    // Mock password reset - in production, this would call an API
    setSubmitted(true);
  };
  return <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <Logo className="w-20 h-20 mx-auto mb-4" />
            <h1 className="mb-2">Reset Password</h1>
            <p className="text-[#94A3B8]">
              {submitted ? 'Check your email' : 'Enter your email to receive reset instructions'}
            </p>
          </div>

          {/* Form */}
          <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
            {submitted ? <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[#94A3B8] mb-6">
                  If an account exists with <strong className="text-white">{email}</strong>, you will receive password reset instructions shortly.
                </p>
                <Link 
                  to="/login" 
                  style={{
                    borderRadius: '9999px',
                    padding: '16px 32px',
                    backgroundColor: '#2F6FED',
                    fontWeight: '600',
                    boxShadow: '0 10px 30px rgba(47, 111, 237, 0.5)'
                  }}
                  className="inline-block w-full transition-all duration-300 text-center hover:scale-105 hover:shadow-xl"
                >
                  Back to Login
                </Link>
              </div> : <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-[#94A3B8]">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#2F6FED] transition-colors" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  style={{
                    borderRadius: '9999px',
                    padding: '16px 32px',
                    backgroundColor: '#2F6FED',
                    fontWeight: '600',
                    boxShadow: '0 10px 30px rgba(47, 111, 237, 0.5)'
                  }}
                  className="w-full transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl"
                >
                  Send Reset Link
                </button>

                <Link to="/login" className="flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors text-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </form>}
          </div>
        </motion.div>
      </div>
    </div>;
}