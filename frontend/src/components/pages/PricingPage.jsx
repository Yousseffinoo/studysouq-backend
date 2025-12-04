import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Crown, Loader2, X, Lock, CreditCard, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { toast } from 'react-toastify';

// Check if Paymob is ready (set this to true when Paymob verification is complete)
const PAYMOB_READY = import.meta.env.VITE_PAYMOB_READY === 'true' || false;

export default function PricingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // State for payment processing
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [showPaymentNotReadyModal, setShowPaymentNotReadyModal] = useState(false);
  
  // State for pricing plans
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Fetch pricing plans from API
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await fetch(`${API_BASE_URL}/payments/plans`);
        const data = await response.json();
        
        if (data.success) {
          setPricingPlans(data.data || []);
        } else {
          console.error('Failed to fetch pricing plans:', data.message);
          toast.error('Failed to load pricing plans');
        }
      } catch (error) {
        console.error('Error fetching pricing plans:', error);
        toast.error('Failed to load pricing plans');
      } finally {
        setLoadingPlans(false);
      }
    };
    
    fetchPricingPlans();
  }, []);

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

  // Handle payment
  const handlePayment = async (planType, planName, amount, currency = 'EGP') => {
    console.log('handlePayment called:', { planType, planName, amount, currency });
    console.log('User:', user);
    console.log('Token:', token);
    
    // Check if Paymob is ready
    if (!PAYMOB_READY) {
      setSelectedPlan({ planType, planName, amount, currency });
      setShowPaymentNotReadyModal(true);
      return;
    }

    // Check if user is logged in
    if (!user || !token) {
      console.log('User not logged in, redirecting to login');
      toast.info('Please login to subscribe');
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    // Check if already premium
    if (user.isPremium && user.premiumPlan) {
      toast.info('You already have an active premium subscription!');
      return;
    }

    setSelectedPlan({ planType, planName, amount, currency });
    setProcessingPayment(true);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planType,
          planName,
          amount,
          currency: currency || 'EGP',
          phone: user.phone || '+201000000000',
          city: 'Cairo',
          country: 'Egypt',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Check if test mode
        if (data.data.isTestMode) {
          toast.warning('⚠️ TEST MODE: Paymob not configured!', {
            autoClose: 5000,
          });
          toast.info('Please configure Paymob credentials in backend .env file', {
            autoClose: 7000,
          });
          console.log('TEST MODE DATA:', data.data);
        } else {
          setPaymentId(data.data.paymentId);
          setIframeUrl(data.data.iframeUrl);
          setShowIframe(true);
          toast.success('Payment initiated! Please complete the payment.');
        }
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

  // Close iframe
  const closeIframe = () => {
    setShowIframe(false);
    setIframeUrl('');
    setSelectedPlan(null);

    // Verify payment after closing
    if (paymentId) {
      setTimeout(() => verifyPayment(paymentId), 2000);
    }
  };

  // Verify payment
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
        setTimeout(() => window.location.reload(), 1500);
      } else if (data.data.status === 'pending') {
        toast.info('Payment is still processing...');
      }
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  // Helper function to get duration text
  const getDurationText = (duration) => {
    if (duration === 30) return '/month';
    if (duration === 365) return '/year';
    if (duration === 730) return '/2 years';
    return `/${duration} days`;
  };

  // Helper function to format price
  const formatPrice = (price, currency = 'EGP') => {
    return `${currency} ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loadingPlans) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2F6FED] animate-spin mx-auto mb-4" />
          <p className="text-[#94A3B8]">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-center mb-16">
          <h1 className="mb-6">Unlock Your Full Potential</h1>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
            Get unlimited access to all premium features and accelerate your mathematics journey
          </p>
        </motion.div>

        <div id="pricing-plans" className={`grid grid-cols-1 ${pricingPlans.length > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8 mb-16 scroll-mt-24 lg:scroll-mt-32`}>
          {/* Free Plan */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.1
        }} className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
            <h3 className="mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-4xl">EGP 0</span>
              <span className="text-[#94A3B8]">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-sm">
                <Check className="w-5 h-5 text-[#2F6FED] mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-[#94A3B8]">6 free questions per lesson</span>
              </li>
              <li className="flex items-start text-sm">
                <Check className="w-5 h-5 text-[#2F6FED] mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-[#94A3B8]">Basic progress tracking</span>
              </li>
              <li className="flex items-start text-sm">
                <Check className="w-5 h-5 text-[#2F6FED] mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-[#94A3B8]">Community support</span>
              </li>
            </ul>
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[#94A3B8] cursor-not-allowed">
              Current Plan
            </button>
          </motion.div>

          {/* Dynamic Pricing Plans from API */}
          {pricingPlans.map((plan, index) => {
            const isPopular = plan.popular || plan.displayOrder === 1;
            const isYearly = plan.duration === 365 || plan.type === 'yearly';
            
            return (
              <motion.div
                key={plan._id || plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + (index * 0.1) }}
                className={`relative ${
                  isPopular
                    ? 'bg-gradient-to-br from-[#2F6FED]/20 to-[#F7C94C]/20 border-2 border-[#F7C94C] rounded-2xl p-8 lg:scale-105'
                    : 'bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#F7C94C] to-[#2F6FED] rounded-full text-sm flex items-center">
                    <Crown className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                )}
                
                {isYearly && !isPopular && (
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="mb-0">{plan.name}</h3>
                    <span className="px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-xs text-green-400">
                      Save 50%
                    </span>
                  </div>
                )}
                
                {!isYearly && <h3 className="mb-2">{plan.name}</h3>}
                
                <div className="mb-6">
                  <span className="text-4xl">{formatPrice(plan.price, plan.currency)}</span>
                  <span className="text-[#94A3B8]">{getDurationText(plan.duration)}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {(plan.features || []).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm">
                      <Check className={`w-5 h-5 ${isPopular ? 'text-[#F7C94C]' : 'text-[#A9C7FF]'} mr-2 flex-shrink-0 mt-0.5`} />
                      <span className={isPopular ? 'text-white' : 'text-[#94A3B8]'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button clicked for plan:', plan);
                    handlePayment(plan.type, plan.name, plan.price, plan.currency);
                  }}
                  disabled={processingPayment && selectedPlan?.planType === plan.type}
                  style={{
                    borderRadius: '9999px',
                    padding: '16px 32px',
                    background: isPopular
                      ? 'linear-gradient(to right, #F7C94C, #2F6FED)'
                      : '#2F6FED',
                    backgroundColor: isPopular ? undefined : '#2F6FED',
                    fontWeight: '600',
                    boxShadow: isPopular
                      ? '0 10px 30px rgba(247, 201, 76, 0.4)'
                      : '0 10px 30px rgba(47, 111, 237, 0.5)',
                    border: isPopular ? 'none' : '1px solid #2F6FED'
                  }}
                  className="w-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl text-white"
                >
                  {processingPayment && selectedPlan?.planType === plan.type ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Subscribe with Paymob'
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Section */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.4
      }} className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8 text-center">
          <h2 className="mb-6">Trusted by Thousands of Students</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-2 text-[#2F6FED]">98%</div>
              <div className="text-[#94A3B8]">Student Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl mb-2 text-[#A9C7FF]">50k+</div>
              <div className="text-[#94A3B8]">Questions Solved</div>
            </div>
            <div>
              <div className="text-4xl mb-2 text-[#F7C94C]">A*</div>
              <div className="text-[#94A3B8]">Average Grade</div>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.5
      }} className="mt-16">
          <h2 className="text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[{
            q: 'Can I cancel anytime?',
            a: 'Yes! You can cancel your subscription at any time with no cancellation fees.'
          }, {
            q: 'Do you offer refunds?',
            a: 'We offer a 14-day money-back guarantee if you\'re not satisfied with the premium features.'
          }, {
            q: 'What payment methods do you accept?',
            a: 'We accept all major credit cards, debit cards, and local payment methods through Paymob.'
          }, {
            q: 'Is there a student discount?',
            a: 'Yes! Contact our support team with your student ID for a special discount code.'
          }].map((faq, index) => <div key={index} className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-6">
                <h3 className="mb-3 text-[#A9C7FF]">{faq.q}</h3>
                <p className="text-[#94A3B8] text-sm">{faq.a}</p>
              </div>)}
          </div>
        </motion.div>
      </div>

      {/* Payment iframe Modal */}
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

            {/* iframe */}
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

      {/* Payment Setup Modal */}
      {showPaymentNotReadyModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowPaymentNotReadyModal(false)}
        >
          <div
            style={{
              backgroundColor: '#0B1D34',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(47, 111, 237, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <CreditCard style={{ width: '20px', height: '20px', color: '#2F6FED' }} />
                </div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#FFFFFF' }}>Payment Setup</h2>
              </div>
              <button
                onClick={() => setShowPaymentNotReadyModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Warning Section */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: '#0A0E14',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#F7C94C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <AlertCircle style={{ width: '24px', height: '24px', color: '#000000' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#FFFFFF' }}>
                  Payment Gateway Under Setup
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#94A3B8', lineHeight: '1.5' }}>
                  We're currently setting up our payment gateway. The Paymob payment integration is being configured and will be available soon.
                </p>
              </div>
            </div>

            {/* Plan Details */}
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: '#0A0E14',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#94A3B8' }}>Selected Plan</span>
                <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: '500' }}>
                  {selectedPlan?.planName || 'Premium Plan'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#94A3B8' }}>Price</span>
                <span style={{ fontSize: '16px', color: '#F7C94C', fontWeight: '600' }}>
                  EGP {selectedPlan?.amount?.toLocaleString() || '249.99'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#94A3B8' }}>Duration</span>
                <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: '500' }}>
                  {selectedPlan?.planType === 'yearly' ? '12 months' : '1 month'}
                </span>
              </div>
            </div>

            {/* What's Next Section */}
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#0A0E14',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(47, 111, 237, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Clock style={{ width: '20px', height: '20px', color: '#2F6FED' }} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#FFFFFF' }}>
                    What's Next?
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#94A3B8', lineHeight: '1.5' }}>
                    Once the payment gateway is configured, you'll be able to complete your subscription securely through Paymob. We'll notify you as soon as it's ready!
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setShowPaymentNotReadyModal(false)}
              style={{
                width: '100%',
                padding: '14px 24px',
                backgroundColor: '#2F6FED',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2F6FED'}
            >
              Got it, Thanks!
            </button>
          </div>
        </div>
      )}
    </div>;
}