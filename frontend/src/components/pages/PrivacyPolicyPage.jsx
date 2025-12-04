import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
              <Shield className="w-10 h-10 text-[#2F6FED]" />
            </div>
            <h1 className="mb-4">Privacy Policy</h1>
            <p className="text-[#94A3B8]">Last Updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto p-6 space-y-4">
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">At StudySouq, we respect your privacy and are committed to protecting your personal information.</h2>
              <p className="text-[#94A3B8] leading-relaxed">
                This Privacy Policy explains how we collect, use, store, and protect your data when you use our platform.
              </p>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">1. INFORMATION WE COLLECT</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">1.1 Account Information:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Password (encrypted)</li>
                    <li>Date of birth</li>
                    <li>Grade level (IGCSE, AS, A2)</li>
                    <li>Profile picture (optional)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">1.2 Payment Information:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Payment transactions processed through Paymob (PCI-DSS compliant)</li>
                    <li>We do NOT store credit card numbers</li>
                    <li>We store transaction IDs and payment status</li>
                    <li>Billing name and email</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">1.3 Usage Information:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Questions attempted and answers submitted</li>
                    <li>Topics studied and time spent</li>
                    <li>Progress and performance metrics</li>
                    <li>AI tutor conversation history</li>
                    <li>Bookmarked content</li>
                    <li>Login dates and times</li>
                    <li>Device information (browser, OS, device type)</li>
                    <li>IP address and location (country/city level)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">1.4 Communications:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Support tickets and correspondence</li>
                    <li>Feedback and survey responses</li>
                    <li>Email interaction data (opens, clicks)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">2. HOW WE USE YOUR INFORMATION</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">2.1 To Provide Our Service:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Create and manage your account</li>
                    <li>Process subscription payments</li>
                    <li>Deliver educational content</li>
                    <li>Provide AI tutor functionality</li>
                    <li>Track your learning progress</li>
                    <li>Generate personalized recommendations</li>
                    <li>Send subscription confirmations and receipts</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">2.2 To Improve Our Service:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Analyze usage patterns to enhance features</li>
                    <li>Identify and fix technical issues</li>
                    <li>Develop new content and features</li>
                    <li>Improve AI tutor responses</li>
                    <li>Optimize platform performance</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">2.3 To Communicate With You:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Send important account notifications</li>
                    <li>Provide customer support</li>
                    <li>Send educational tips and study recommendations (opt-out available)</li>
                    <li>Request feedback</li>
                    <li>Inform you of new features or content</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">2.4 To Ensure Security:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Prevent fraud and abuse</li>
                    <li>Protect against security threats</li>
                    <li>Enforce our Terms and Conditions</li>
                    <li>Verify identity for support requests</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">3. LEGAL BASIS FOR PROCESSING (GDPR Compliance)</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">We process your data based on:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>Contract Performance: To provide the service you subscribed to</li>
                <li>Legitimate Interest: To improve our service and prevent fraud</li>
                <li>Consent: For marketing communications (you can withdraw anytime)</li>
                <li>Legal Obligation: To comply with Egyptian law and tax requirements</li>
              </ul>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">4. HOW WE SHARE YOUR INFORMATION</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">4.1 We DO Share With:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Paymob: For payment processing (they have their own privacy policy)</li>
                    <li>Anthropic (Claude AI): For AI tutor functionality (anonymized when possible)</li>
                    <li>Email Service Provider: For sending notifications (e.g., SendGrid, Mailchimp)</li>
                    <li>Analytics Tools: For usage analysis (anonymized data)</li>
                    <li>Cloud Hosting Provider: For data storage (AWS, Vercel, Supabase)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">4.2 We DO NOT:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Sell your personal information to third parties</li>
                    <li>Share your data with advertisers</li>
                    <li>Rent or trade your information</li>
                    <li>Share your learning data with schools or parents (unless you explicitly consent)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">4.3 Legal Requirements:</h3>
                  <p className="mb-2">We may disclose information if required by:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Egyptian law or legal process</li>
                    <li>Court orders or government requests</li>
                    <li>To protect our rights, property, or safety</li>
                    <li>To prevent fraud or abuse</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">5. DATA STORAGE AND SECURITY</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.1 Where We Store Data:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Servers located in secure data centers (EU/US)</li>
                    <li>Database backups stored encrypted</li>
                    <li>Payment data stored by Paymob (PCI-DSS compliant)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.2 Security Measures:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Encryption in transit (SSL/TLS)</li>
                    <li>Encryption at rest for sensitive data</li>
                    <li>Secure password hashing (bcrypt)</li>
                    <li>Regular security audits</li>
                    <li>Access controls and authentication</li>
                    <li>Monitoring for suspicious activity</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">5.3 Data Retention:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Active accounts: Data retained while subscription active</li>
                    <li>Canceled accounts: Data retained for 90 days, then deleted</li>
                    <li>Legal requirements: Some data retained for 5 years (tax/financial)</li>
                    <li>Backups: Automatically deleted after 30 days</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">6. YOUR RIGHTS</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">Under Egyptian Data Protection Law and GDPR (for EU users), you have the right to:</p>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.1 Access:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Request a copy of your personal data</li>
                    <li>Receive data in readable format</li>
                    <li>Response within 30 days</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.2 Correction:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Update incorrect information</li>
                    <li>Complete incomplete data</li>
                    <li>Edit profile information directly</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.3 Deletion ("Right to be Forgotten"):</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Request account and data deletion</li>
                    <li>We will delete within 30 days</li>
                    <li>Some data may be retained for legal compliance</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.4 Portability:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Receive your data in machine-readable format</li>
                    <li>Transfer to another service</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.5 Object:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Object to processing for marketing purposes</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">6.6 Restriction:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Request we stop processing certain data</li>
                    <li>Temporary restriction while disputes resolved</li>
                  </ul>
                </div>
                <p className="mt-4">To exercise these rights, email: studysouq@gmail.com</p>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">7. CHILDREN'S PRIVACY</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">7.1 Age Requirements:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Minimum age: 13 years old</li>
                    <li>Users 13-17 require parental consent</li>
                    <li>Parents responsible for monitoring minors' use</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">7.2 Parental Controls:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Parents can request access to child's account</li>
                    <li>Parents can request data deletion</li>
                    <li>Parents can opt child out of communications</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">7.3 Protection Measures:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>No targeted advertising to children</li>
                    <li>Extra security for minor accounts</li>
                    <li>Compliance with children's privacy laws</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">8. COOKIES AND TRACKING</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">8.1 What We Use:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Essential Cookies: Required for platform to function (login, session)</li>
                    <li>Analytics Cookies: To understand usage patterns (anonymized)</li>
                    <li>Preference Cookies: To remember your settings</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">8.2 Third-Party Cookies:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Payment provider (Paymob)</li>
                    <li>Analytics tools (if used)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">8.3 Your Choices:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Disable non-essential cookies in browser settings</li>
                    <li>Essential cookies cannot be disabled (platform won't work)</li>
                    <li>Cookie settings available in account preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">9. THIRD-PARTY LINKS</h2>
              <p className="text-[#94A3B8] leading-relaxed">
                Our platform may contain links to external websites (e.g., Edexcel official resources). We are not responsible for the privacy practices of these sites. We encourage you to read their privacy policies.
              </p>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">10. INTERNATIONAL DATA TRANSFERS</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">If you access StudySouq from outside Egypt:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>Your data may be transferred to Egypt for processing</li>
                <li>We ensure adequate protection measures</li>
                <li>EU users: We comply with GDPR requirements</li>
                <li>Data processing agreements with third parties</li>
              </ul>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">11. MARKETING COMMUNICATIONS</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">11.1 What We Send:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Study tips and educational content</li>
                    <li>New feature announcements</li>
                    <li>Special offers (rarely)</li>
                    <li>Platform updates</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">11.2 Opt-Out:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Unsubscribe link in every email</li>
                    <li>Update preferences in account settings</li>
                    <li>Email: studysouq@gmail.com</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">11.3 Transactional Emails:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Cannot opt-out of essential emails (payment confirmations, password resets, etc.)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">12. DATA BREACH NOTIFICATION</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">In the unlikely event of a data breach:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>We will notify affected users within 72 hours</li>
                <li>Notification via email to registered address</li>
                <li>Describe nature of breach and mitigation steps</li>
                <li>Report to Egyptian Data Protection Authority (if applicable)</li>
              </ul>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">13. CHANGES TO THIS PRIVACY POLICY</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">13.1 Updates:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>We may update this policy to reflect changes in practices or law</li>
                    <li>Material changes will be notified via email and platform notice</li>
                    <li>"Last Updated" date shown at top</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">13.2 Your Acceptance:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Continued use after changes constitutes acceptance</li>
                    <li>Review policy regularly for updates</li>
                    <li>You can always request previous versions</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">14. CONTACT US</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">For privacy questions, concerns, or to exercise your rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>Email: studysouq@gmail.com</li>
                <li>Support: studysouq@gmail.com</li>
                <li>Response time: Within 72 hours</li>
              </ul>
              <p className="text-[#94A3B8] leading-relaxed mt-4 mb-2">For complaints:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>First contact us directly</li>
                <li>If unsatisfied, you may complain to Egyptian Data Protection Authority</li>
                <li>EU users: Contact your local data protection authority</li>
              </ul>
            </section>

            {/* Contact Us */}
            <section className="bg-gradient-to-br from-[#2F6FED]/10 to-[#A9C7FF]/10 border border-[#2F6FED]/30 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Questions About Privacy?</h2>
              <p className="text-[#94A3B8] mb-6">
                Last Updated: January 2025<br />
                StudySouq - We respect your privacy
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
                Contact Privacy Team
              </a>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
