import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, X, Loader2, Crown, Sparkles, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

// Check if Paymob is ready (set this to true when Paymob verification is complete)
const PAYMOB_READY = import.meta.env.VITE_PAYMOB_READY === 'true' || false;

/**
 * Premium Pricing Page Component
 * Modern pricing UI with Paymob payment integration
 * 
 * Features:
 * - Fetch pricing plans from backend
 * - Start payment process
 * - Handle payment iframe
 * - Verify payment status
 */

export default function PremiumPricingPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // State management
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [paymentId, setPaymentId] = useState(null);

  // Fetch pricing plans on component mount
  useEffect(() => {
    fetchPricingPlans();
  }, []);

  /**
   * Fetch available pricing plans from backend
   */
  const fetchPricingPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/payments/plans`);
      const data = await response.json();

      if (data.success) {
        setPlans(data.data);
      } else {
        toast.error('Failed to load pricing plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle plan selection and start payment
   */
  const handleSelectPlan = async (plan) => {
    // Check if Paymob is ready
    if (!PAYMOB_READY) {
      setShowPaymentNotReadyModal(true);
      return;
    }

    // Check if user is logged in
    if (!user || !token) {
      toast.info('Please login to continue');
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    // Check if user already has premium
    if (user.isPremium && user.premiumPlan) {
      toast.info('You already have an active premium subscription!');
      return;
    }

    setSelectedPlan(plan);
    await startPayment(plan);
  };

  /**
   * Start payment process
   * Calls backend API to initiate Paymob payment
   */
  const startPayment = async (plan) => {
    try {
      setProcessingPayment(true);
      console.log('Starting payment for plan:', plan.name);

      const response = await fetch(`${API_BASE_URL}/payments/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planType: plan.type,
          planName: plan.name,
          amount: plan.price,
          currency: plan.currency || 'EGP',
          // Optional: Add phone, city, country if you have them
          phone: user.phone || '+201000000000',
          city: 'Cairo',
          country: 'Egypt',
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Payment initiated:', data.data);
        
        // Store payment ID for verification later
        setPaymentId(data.data.paymentId);
        
        // Open payment iframe
        setIframeUrl(data.data.iframeUrl);
        setShowIframe(true);
        
        toast.success('Payment initiated! Please complete the payment.');
      } else {
        toast.error(data.message || 'Failed to start payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to start payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  /**
   * Close payment iframe
   */
  const closeIframe = () => {
    setShowIframe(false);
    setIframeUrl('');
    setSelectedPlan(null);
    
    // Optional: Verify payment status after closing
    if (paymentId) {
      setTimeout(() => {
        verifyPayment(paymentId);
      }, 2000);
    }
  };

  /**
   * Verify payment status manually
   */
  const verifyPayment = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/verify/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data.isPremium) {
        toast.success('🎉 Payment successful! Premium activated!');
        // Refresh page or redirect to dashboard
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (data.data.status === 'pending') {
        toast.info('Payment is still processing...');
      } else {
        toast.warning('Payment verification pending. Please check your email.');
      }
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E14] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#2F6FED] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E14] py-20 px-4">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2F6FED]/10 border border-[#2F6FED]/30 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-[#2F6FED]" />
          <span className="text-sm text-[#2F6FED] font-medium">Premium Plans</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Choose Your Premium Plan
        </h1>
        <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
          Unlock unlimited access to AI tutoring, homework analysis, and premium features
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-[#0B1D34] border-2 rounded-2xl p-8 ${
              plan.popular
                ? 'border-[#2F6FED] shadow-2xl shadow-[#2F6FED]/20'
                : 'border-white/10'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1 bg-gradient-to-r from-[#2F6FED] to-[#1F5FDD] text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              </div>
            )}

            {/* Best Value Badge */}
            {plan.bestValue && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1 bg-gradient-to-r from-[#F7C94C] to-[#F59E0B] text-[#0A0E14] text-sm font-bold rounded-full">
                  Best Value
                </div>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-xl text-[#94A3B8]">{plan.currency}</span>
              </div>
              <p className="text-sm text-[#94A3B8]">{plan.duration}</p>
              
              {/* Savings Badge */}
              {plan.savings && (
                <div className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                  {plan.savings}
                </div>
              )}
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-8">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#2F6FED]/20 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#2F6FED]" />
                  </div>
                  <span className="text-sm text-[#E2E8F0]">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            {PAYMOB_READY ? (
              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={processingPayment && selectedPlan?.id === plan.id}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#2F6FED] to-[#1F5FDD] text-white hover:shadow-lg hover:shadow-[#2F6FED]/50'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processingPayment && selectedPlan?.id === plan.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    Get {plan.name}
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 bg-gray-600/50 text-white border border-gray-600/50 cursor-not-allowed opacity-70"
              >
                <Lock className="w-5 h-5" />
                Payment Coming Soon
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Payment Iframe Modal */}
      {showIframe && iframeUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1D34] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Complete Payment</h3>
              <button
                onClick={closeIframe}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Iframe */}
            <div className="relative h-[calc(90vh-80px)]">
              <iframe
                src={iframeUrl}
                className="w-full h-full"
                title="Payment Gateway"
                frameBorder="0"
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Money Back Guarantee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center"
      >
        <p className="text-[#94A3B8] text-sm">
          🔒 Secure payment powered by Paymob • 💳 All payment methods accepted • 
          ✨ Instant activation after payment
        </p>
      </motion.div>
    </div>
  );
}

