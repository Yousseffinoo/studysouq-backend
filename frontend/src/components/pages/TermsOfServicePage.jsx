import { motion } from 'motion/react';
import { FileText } from 'lucide-react';

export default function TermsOfServicePage() {
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
            <h1 className="mb-4">Terms and Conditions</h1>
            <p className="text-[#94A3B8]">Last Updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto p-6 space-y-4">
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">Welcome to StudySouq!</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">
                These Terms and Conditions ("Terms") govern your use of the StudySouq platform located at studysouq.com ("Website", "Service", "Platform"). By accessing or using StudySouq, you agree to be bound by these Terms.
              </p>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">1. ABOUT STUDYSOUQ</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">
                StudySouq is an online educational platform providing adaptive learning resources and AI-powered tutoring for IGCSE, AS Level, and A2 Level Edexcel Mathematics students in Egypt. We offer study materials, practice questions, progress tracking, and personalized learning recommendations.
              </p>
              <p className="text-[#94A3B8] leading-relaxed mb-2">Business Name: StudySouq</p>
              <p className="text-[#94A3B8] leading-relaxed mb-2">Service Type: Online Educational Platform</p>
              <p className="text-[#94A3B8] leading-relaxed mb-2">Location: Cairo, Egypt</p>
              <p className="text-[#94A3B8] leading-relaxed">Contact: studysouq@gmail.com</p>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">2. ACCEPTANCE OF TERMS</h2>
              <p className="text-[#94A3B8] leading-relaxed">
                By creating an account, accessing our content, or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, please discontinue use immediately.
              </p>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">3. ELIGIBILITY</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">3.1 Age Requirements:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Users must be at least 13 years old to create an account</li>
                    <li>Users under 18 require parental or guardian consent</li>
                    <li>Parents/guardians are responsible for monitoring minors' use</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">3.2 Account Creation:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You must provide accurate, complete, and current information</li>
                    <li>You are responsible for maintaining account security</li>
                    <li>One person per account (no sharing credentials)</li>
                    <li>You must notify us immediately of any unauthorized use</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">4. SUBSCRIPTION PLANS AND PRICING</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">4.1 Available Plans:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Monthly Subscription: 249.99 EGP/month</li>
                    <li>Yearly Subscription: 1499.99 EGP/year</li>
                    <li>Free Questions: 6 free questions per topic</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">4.2 Payment Terms:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All prices are in Egyptian Pounds (EGP)</li>
                    <li>Prices include applicable VAT</li>
                    <li>Payment processed securely through Paymob</li>
                    <li>Accepted payment methods: Credit/Debit cards, mobile wallets</li>
                    <li>Subscription begins immediately upon payment confirmation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">4.3 Auto-Renewal:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Subscriptions automatically renew unless canceled</li>
                    <li>You will be charged at the beginning of each billing cycle</li>
                    <li>Price changes will be communicated 30 days in advance</li>
                    <li>Continued use after price change constitutes acceptance</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">5. FREE QUESTIONS</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.1 Free Access Terms:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>New users receive 6 free questions per topic</li>
                    <li>Available without subscription or payment</li>
                    <li>One set of free questions per user account</li>
                    <li>After using free questions, subscription required for full access</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.2 Free Access Limitations:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Limited to 6 questions per topic</li>
                    <li>AI tutor access may be limited during free usage</li>
                    <li>Full features available with paid subscription</li>
                    <li>Free access abuse (multiple accounts) may result in termination</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">6. CANCELLATION AND REFUNDS</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.1 Cancellation:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Cancel anytime through your account settings</li>
                    <li>Cancellation takes effect at end of current billing period</li>
                    <li>You retain access until subscription period ends</li>
                    <li>No partial refunds for unused portions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.2 Refund Policy:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Refunds available within 7 days of initial purchase</li>
                    <li>No refunds after 7-day period</li>
                    <li>Refunds processed within 14 business days</li>
                    <li>Refund issued to original payment method</li>
                    <li>Abuse of refund policy may result in account termination</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.3 Special Circumstances:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Technical issues preventing access: Contact support for resolution</li>
                    <li>Duplicate charges: Full refund of duplicate transaction</li>
                    <li>Unauthorized charges: Report immediately for investigation</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">7. USER RESPONSIBILITIES</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">You agree to:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Use the platform for personal, non-commercial educational purposes</li>
                    <li>Not share your account credentials with others</li>
                    <li>Not copy, reproduce, or distribute our content without permission</li>
                    <li>Not use automated tools to access or scrape our platform</li>
                    <li>Not reverse engineer or attempt to access our source code</li>
                    <li>Not upload malicious code or attempt to compromise security</li>
                    <li>Respect intellectual property rights</li>
                    <li>Provide honest feedback and answer attempts</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">You agree NOT to:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Use the platform to cheat on official exams</li>
                    <li>Share answers with other students for commercial purposes</li>
                    <li>Resell, redistribute, or sublicense our content</li>
                    <li>Impersonate others or create fake accounts</li>
                    <li>Harass or abuse our staff or AI tutor system</li>
                    <li>Use the platform for any illegal purpose</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">8. INTELLECTUAL PROPERTY</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">8.1 Our Content:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All content, including notes, questions, answers, and software, is owned by StudySouq or licensed to us</li>
                    <li>Content is protected by Egyptian and international copyright laws</li>
                    <li>"StudySouq" name and logo are our trademarks</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">8.2 Limited License:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>We grant you a limited, non-exclusive, non-transferable license to access and use our content for personal educational purposes</li>
                    <li>This license terminates when your subscription ends</li>
                    <li>You may not download, copy, or distribute content except as specifically allowed (e.g., printing for personal study)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">8.3 User Content:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You retain ownership of any content you submit (questions, feedback)</li>
                    <li>By submitting content, you grant us license to use it for improving our service</li>
                    <li>We may use anonymized user data for research and development</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">9. AI TUTOR DISCLAIMER</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">9.1 Educational Tool:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Our AI tutor is an educational assistance tool, not a replacement for teachers</li>
                    <li>AI responses are generated automatically and may occasionally contain errors</li>
                    <li>We strive for accuracy but cannot guarantee 100% correctness</li>
                    <li>Always verify important information with official sources</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">9.2 Limitations:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>AI tutor provides guidance, not complete solutions (Socratic method)</li>
                    <li>Not designed to complete homework or assignments for you</li>
                    <li>Results and learning outcomes depend on your effort and engagement</li>
                    <li>We are not responsible for exam results or grades</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">10. CONTENT ACCURACY</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">10.1 Educational Standards:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Content aligns with Pearson Edexcel International A Level syllabus</li>
                    <li>We regularly review and update materials</li>
                    <li>However, official exam boards may change requirements</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">10.2 Disclaimer:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>While we strive for accuracy, errors may occur</li>
                    <li>Content is supplementary to official textbooks and teachers</li>
                    <li>We recommend using multiple study resources</li>
                    <li>Report any errors to studysouq@gmail.com</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">11. PRIVACY AND DATA PROTECTION</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">
                Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using StudySouq, you consent to our data practices as described in the Privacy Policy.
              </p>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Key Points:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                  <li>We collect information necessary to provide our service</li>
                  <li>We protect your data with industry-standard security measures</li>
                  <li>We do not sell your personal information to third parties</li>
                  <li>You can request your data or account deletion at any time</li>
                </ul>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">12. SERVICE AVAILABILITY</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">12.1 Uptime:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>We strive for 99.5% uptime but cannot guarantee uninterrupted service</li>
                    <li>Scheduled maintenance will be announced in advance when possible</li>
                    <li>Emergency maintenance may occur without notice</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">12.2 Service Changes:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>We may modify, suspend, or discontinue features at any time</li>
                    <li>Significant changes will be communicated to users</li>
                    <li>We may add or remove content from the curriculum</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">12.3 Technical Requirements:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Requires internet connection</li>
                    <li>Compatible with modern browsers (Chrome, Safari, Firefox, Edge)</li>
                    <li>Works on desktop, tablet, and mobile devices</li>
                    <li>Minimum recommended internet speed: 2 Mbps</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">13. LIMITATION OF LIABILITY</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">13.1 No Warranties:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Service provided "as is" without warranties of any kind</li>
                    <li>We do not guarantee specific exam results or grade improvements</li>
                    <li>We are not responsible for decisions made based on our content</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">13.2 Liability Limits:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Our liability is limited to the amount you paid in the last 12 months</li>
                    <li>We are not liable for indirect, incidental, or consequential damages</li>
                    <li>This includes loss of data, profits, or academic opportunities</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">13.3 Force Majeure:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>We are not liable for failures due to circumstances beyond our control</li>
                    <li>This includes internet outages, natural disasters, government actions, etc.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">14. INDEMNIFICATION</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-2">
                You agree to indemnify and hold harmless StudySouq, its owners, employees, and partners from any claims, damages, losses, or expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>Your violation of these Terms</li>
                <li>Your misuse of the platform</li>
                <li>Your violation of any rights of another party</li>
                <li>Any content you submit to the platform</li>
              </ul>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">15. ACCOUNT TERMINATION</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">15.1 Termination by You:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Cancel subscription anytime through account settings</li>
                    <li>Request account deletion by contacting support</li>
                    <li>Deletion is permanent and irreversible</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">15.2 Termination by Us:</h3>
                  <p className="mb-2">We may suspend or terminate your account if you:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Violate these Terms</li>
                    <li>Engage in fraudulent activity</li>
                    <li>Abuse our refund policy</li>
                    <li>Harass staff or other users</li>
                    <li>Use automated tools or bots</li>
                    <li>Share accounts or credentials</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">15.3 Effect of Termination:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access to content immediately revoked</li>
                    <li>No refund for remaining subscription period (except as required by law)</li>
                    <li>We may retain certain data as required by law or for business purposes</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">16. DISPUTE RESOLUTION</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">16.1 Governing Law:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>These Terms are governed by the laws of Egypt</li>
                    <li>Any disputes will be resolved in Egyptian courts</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">16.2 Contact First:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Before pursuing legal action, contact us at studysouq@gmail.com</li>
                    <li>We commit to good faith efforts to resolve disputes amicably</li>
                    <li>Most issues can be resolved through direct communication</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">16.3 Arbitration:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>If informal resolution fails, disputes may be submitted to arbitration</li>
                    <li>Arbitration conducted in Cairo, Egypt</li>
                    <li>Egyptian arbitration law applies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">17. MODIFICATIONS TO TERMS</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">17.1 Changes:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>We may update these Terms at any time</li>
                    <li>Material changes will be notified via email or platform notice</li>
                    <li>Continued use after changes constitutes acceptance</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">17.2 Notification:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Check Terms regularly for updates</li>
                    <li>"Last Updated" date shown at top of document</li>
                    <li>Significant changes highlighted in notifications</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">18. CONTACT INFORMATION</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">For questions, concerns, or support:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>Email: studysouq@gmail.com</li>
                <li>Website: www.studysouq.com</li>
                <li>Response time: Within 48 hours</li>
              </ul>
              <p className="text-[#94A3B8] leading-relaxed mt-4 mb-2">For legal notices:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>Email: studysouq@gmail.com</li>
              </ul>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">19. SEVERABILITY</h2>
              <p className="text-[#94A3B8] leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
              </p>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">20. ENTIRE AGREEMENT</h2>
              <p className="text-[#94A3B8] leading-relaxed">
                These Terms, together with our Privacy Policy and Refund Policy, constitute the entire agreement between you and StudySouq regarding use of our service, superseding any prior agreements.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-br from-[#2F6FED]/10 to-[#A9C7FF]/10 border border-[#2F6FED]/30 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Questions About These Terms?</h2>
              <p className="text-[#94A3B8] mb-6">
                By using StudySouq, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
              <p className="text-[#94A3B8] mb-6">
                Last Updated: January 2025<br />
                StudySouq - Your Personal AI Mathematics Tutor
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
                Contact Us
              </a>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
