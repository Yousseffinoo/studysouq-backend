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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-black">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="text-center mb-12">
            <Logo className="w-20 md:w-32 h-auto mx-auto mb-6" />
            <h1 className="text-white text-[32px] sm:text-[40px] font-bold mb-3">Welcome Back</h1>
            <p className="text-white/60 text-[16px]">Sign in to continue your learning journey</p>
          </div>

          {/* Form */}
          <div className="bg-black border-2 border-white/20 p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border-2 border-red-500/50 text-red-400 text-[14px]">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[14px] mb-3 text-white/70 font-bold uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="off"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors text-[16px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] mb-3 text-white/70 font-bold uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors text-[16px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[14px]">
                <label className="flex items-center text-white/70">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4 border-2 border-white/20 bg-white/5 focus:ring-0 focus:ring-offset-0"
                  />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-white hover:text-white/70 transition-colors underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white text-black text-[16px] font-bold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center text-[14px] text-white/70">
              Don't have an account?{' '}
              <Link to="/signup" className="text-white hover:text-white/70 transition-colors underline font-bold">
                Sign up
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
