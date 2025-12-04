import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Redirect back to where user came from, or default based on role
        const from = location.state?.from || (result.user.role === 'admin' ? '/admin/dashboard' : '/subjects');
        navigate(from, { replace: true });
      } else {
        // Display validation errors if available
        if (result.errors && result.errors.length > 0) {
          setError(result.errors.map(err => err.message).join(', '));
        } else {
          setError(result.message || 'Invalid email or password');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <Logo className="w-20 md:w-32 h-auto mx-auto mb-4" />
            <h1 className="mb-2">Welcome Back</h1>
            <p className="text-[#94A3B8]">Sign in to continue your learning journey</p>
          </div>

          {/* Form */}
          <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>}

              <div>
                <label className="block text-sm mb-2 text-[#94A3B8]">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="your@email.com" 
                    autoComplete="off"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#2F6FED] transition-colors" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#94A3B8]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    autoComplete="new-password"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#2F6FED] transition-colors" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-[#94A3B8]">
                  <input type="checkbox" className="mr-2 rounded" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-[#2F6FED] hover:text-[#A9C7FF] transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  borderRadius: '9999px',
                  padding: '16px 32px',
                  backgroundColor: '#2F6FED',
                  fontWeight: '600',
                  boxShadow: '0 10px 30px rgba(47, 111, 237, 0.5)'
                }}
                className="w-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#94A3B8]">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#2F6FED] hover:text-[#A9C7FF] transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>;
}