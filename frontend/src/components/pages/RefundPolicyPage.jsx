import { motion } from 'motion/react';
import { DollarSign } from 'lucide-react';

export default function RefundPolicyPage() {
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
              <DollarSign className="w-10 h-10 text-[#2F6FED]" />
            </div>
            <h1 className="mb-4">Refund and Cancellation Policy</h1>
            <p className="text-[#94A3B8]">Last Updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto p-6 space-y-4">
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">At StudySouq, we want you to be completely satisfied with your subscription.</h2>
              <p className="text-[#94A3B8] leading-relaxed">
                This policy outlines our refund and cancellation terms.
              </p>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">1. CANCELLATION POLICY</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">1.1 How to Cancel:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Log into your account</li>
                    <li>Go to Settings → Subscription</li>
                    <li>Click "Cancel Subscription"</li>
                    <li>Confirm cancellation</li>
                    <li>OR email studysouq@gmail.com</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">1.2 When Cancellation Takes Effect:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Cancellation is effective at the end of your current billing period</li>
                    <li>You retain full access until subscription expires</li>
                    <li>Auto-renewal will be turned off</li>
                    <li>No charges after current period ends</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">1.3 No Partial Refunds:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>If you cancel mid-period, you will not receive a partial refund</li>
                    <li>You keep access for the time you paid for</li>
                    <li>Example: Cancel on Day 15 of monthly plan → Access until Day 30</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">1.4 Reactivation:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You can reactivate anytime before subscription expires</li>
                    <li>After expiration, reactivate by subscribing again</li>
                    <li>Previous progress and data retained for 90 days</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">2. REFUND POLICY</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">2.1 7-Day Money-Back Guarantee:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Full refund available within 7 days of initial purchase</li>
                    <li>Applies to first-time subscriptions only</li>
                    <li>No questions asked</li>
                    <li>Refund to original payment method</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">2.2 How to Request Refund:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Email: studysouq@gmail.com or studysouq@gmail.com</li>
                    <li>Include: Order ID, email address, reason for refund (optional)</li>
                    <li>Response within 24 hours</li>
                    <li>Refund processed within 7-14 business days</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">2.3 After 7 Days:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>No refunds after 7-day period</li>
                    <li>You may cancel to prevent future charges</li>
                    <li>Access continues until end of paid period</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">2.4 Renewal Refunds:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Auto-renewal charges: Refund available within 48 hours of charge</li>
                    <li>After 48 hours: No refund, but you can cancel future renewals</li>
                    <li>Contact studysouq@gmail.com immediately if charged in error</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">3. SPECIAL CIRCUMSTANCES</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">3.1 Technical Issues:</h3>
                  <p className="mb-2">If our platform is unavailable for extended periods:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>We will extend your subscription by the downtime period</li>
                    <li>If downtime exceeds 7 days in a month: Partial refund available</li>
                    <li>Contact support to report persistent technical issues</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">3.2 Duplicate Charges:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>If you are charged twice for the same subscription: Full refund of duplicate</li>
                    <li>Report immediately to studysouq@gmail.com</li>
                    <li>Include transaction IDs</li>
                    <li>Refund processed within 48 hours</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">3.3 Unauthorized Charges:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>If you see charges you did not authorize: Report immediately</li>
                    <li>We will investigate and refund if confirmed unauthorized</li>
                    <li>Change your password immediately</li>
                    <li>Contact: studysouq@gmail.com</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">3.4 Account Issues:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>If technical problems prevent you from accessing your account</li>
                    <li>Contact support first for resolution</li>
                    <li>Refund considered if issue cannot be resolved within 7 days</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">4. FREE TRIAL CANCELLATION</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">4.1 With Free Questions:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Cancel anytime during 6 free questions per topic</li>
                    <li>No charge if canceled before trial ends</li>
                    <li>Must cancel at least 24 hours before trial expiration</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">4.2 After Free Access Ends:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Automatic charge for chosen subscription plan</li>
                    <li>Refund available within 7 days applies to this first charge</li>
                    <li>Cancel subscription to avoid future charges</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">4.3 Free Access Reminders:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Email reminder sent 2 days before trial ends</li>
                    <li>Notification in platform dashboard</li>
                    <li>Your responsibility to cancel if you don't want to continue</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">5. REFUND PROCESSING</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.1 Timeline:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Refund approved: Within 48 hours of request (if eligible)</li>
                    <li>Refund appears in account: 7-14 business days</li>
                    <li>Time depends on your bank/payment provider</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.2 Refund Method:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Refund issued to original payment method</li>
                    <li>If original method unavailable: Bank transfer to your account</li>
                    <li>Cannot refund to different card/account</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.3 Currency:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Refunded in Egyptian Pounds (EGP)</li>
                    <li>Same amount originally charged</li>
                    <li>No currency conversion fees applied</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">6. NON-REFUNDABLE SITUATIONS</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">We cannot provide refunds in these cases:</p>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.1 Outside Refund Window:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>More than 7 days since purchase (unless special circumstances)</li>
                    <li>More than 48 hours since auto-renewal charge</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.2 Subscription Used:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>If you completed significant coursework (&gt;50% of available content)</li>
                    <li>If you extensively used AI tutor (&gt;100 conversations)</li>
                    <li>Discretion of StudySouq management</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.3 Violation of Terms:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Account terminated for Terms violation</li>
                    <li>Abuse of refund policy (multiple refund requests)</li>
                    <li>Fraudulent activity</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.4 Changed Mind:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>After 7-day period, "changed mind" is not eligible for refund</li>
                    <li>You may cancel to prevent future charges</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">7. SUBSCRIPTION CHANGES</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">7.1 Upgrade (Monthly to Yearly):</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Pay difference immediately</li>
                    <li>New period starts from upgrade date</li>
                    <li>Previous period credits applied</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">7.2 Downgrade (Yearly to Monthly):</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Takes effect at end of current yearly period</li>
                    <li>No refund for remaining yearly subscription</li>
                    <li>Will be charged monthly rate after yearly expires</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">7.3 Plan Modifications:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Price changes: Notified 30 days in advance</li>
                    <li>You can cancel before price change takes effect</li>
                    <li>Continuing subscription = acceptance of new price</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">8. PAYMENT FAILURES</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">8.1 Failed Auto-Renewal:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Email notification sent immediately</li>
                    <li>Grace period: 7 days to update payment method</li>
                    <li>After 7 days: Subscription suspended</li>
                    <li>Reactivate by updating payment and paying</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">8.2 Suspended Access:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>No refund for time subscription was suspended</li>
                    <li>Full access restored upon successful payment</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">9. CHARGEBACKS AND DISPUTES</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">9.1 Chargebacks:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>If you file chargeback without contacting us: Account terminated</li>
                    <li>Contact us first for legitimate disputes</li>
                    <li>Chargeback fees may be charged to you</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">9.2 Dispute Resolution:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>First step: Email studysouq@gmail.com</li>
                    <li>We respond within 48 hours</li>
                    <li>Most disputes resolved within 7 days</li>
                    <li>If unresolved: Mediation or arbitration per Terms & Conditions</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">10. ACCOUNT DELETION VS. CANCELLATION</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">10.1 Cancellation:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Subscription ends but account remains</li>
                    <li>Can reactivate anytime</li>
                    <li>Data retained for 90 days</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">10.2 Deletion:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Account and data permanently deleted</li>
                    <li>Cannot be reactivated</li>
                    <li>No refund upon account deletion</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">11. PROMOTIONAL DISCOUNTS</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">11.1 Promotional Rates:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Refunds calculated on amount actually paid</li>
                    <li>Not on original price before discount</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">11.2 Coupon Codes:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Once used, cannot be refunded separately</li>
                    <li>Refund is for total amount paid after discount</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">12. BUSINESS/BULK SUBSCRIPTIONS</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-2">For schools or bulk subscriptions:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>Custom refund terms may apply</li>
                <li>Contact: studysouq@gmail.com</li>
                <li>Refund policy outlined in separate agreement</li>
              </ul>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">13. CONTACT FOR REFUNDS</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">To request a refund or for questions:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>Email: studysouq@gmail.com or studysouq@gmail.com</li>
                <li>Subject: "Refund Request - [Your Order ID]"</li>
                <li>Include: Full name, email, order ID, reason (optional)</li>
                <li>Response within 24 hours</li>
              </ul>
              <p className="text-[#94A3B8] leading-relaxed mt-4 mb-2">For urgent refund issues:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>WhatsApp: Contact via email</li>
                <li>Phone: Contact via email</li>
                <li>Hours: Sunday-Thursday, 9 AM - 5 PM Cairo time</li>
              </ul>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">14. EXCEPTIONS AND MODIFICATIONS</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-2">StudySouq reserves the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>Make exceptions to this policy on case-by-case basis</li>
                <li>Modify this policy with 30 days notice</li>
                <li>Process refunds outside standard windows for goodwill</li>
              </ul>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">15. EGYPTIAN CONSUMER PROTECTION</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">
                This policy complies with Egyptian Consumer Protection Law. You have additional rights under Egyptian law that cannot be excluded by this policy.
              </p>
              <p className="text-[#94A3B8] leading-relaxed mb-2">For consumer protection complaints:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>Egyptian Consumer Protection Agency</li>
                <li>Website: cpa.gov.eg</li>
                <li>Hotline: 19588</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-br from-[#2F6FED]/10 to-[#A9C7FF]/10 border border-[#2F6FED]/30 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Need Help with Refunds?</h2>
              <p className="text-[#94A3B8] mb-6">
                Last Updated: January 2025<br />
                StudySouq - Fair refunds, happy students
              </p>
              <a
                href="mailto:studysouq@gmail.com"
                className="inline-block px-8 py-3 bg-[#2F6FED] hover:bg-[#2F6FED]/80 transition-all duration-300"
                style={{
                  borderRadius: '9999px',
                  fontWeight: '600',
                  boxShadow: '0 10px 30px rgba(47, 111, 237, 0.5)'
                }}
              >
                Contact Support
              </a>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

