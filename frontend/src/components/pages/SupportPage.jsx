import { motion } from 'motion/react';
import { HelpCircle, Mail, MessageCircle, Phone, Instagram } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2F6FED]/20 to-[#A9C7FF]/20 rounded-2xl mb-6">
              <HelpCircle className="w-10 h-10 text-[#2F6FED]" />
            </div>
            <h1 className="mb-4">GET IN TOUCH WITH STUDYSOUQ</h1>
            <p className="text-[#94A3B8] text-lg">We're here to help! Whether you have questions about our platform, need technical support, or want to provide feedback, we'd love to hear from you.</p>
          </div>

          <div className="max-w-4xl mx-auto p-6 space-y-4">
            {/* Support Email */}
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#2F6FED]/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[#2F6FED]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">SUPPORT EMAIL</h2>
                  <p className="text-[#94A3B8] text-sm">Response time: Within 48 hours</p>
                </div>
              </div>
              <a
                href="mailto:studysouq@gmail.com"
                className="text-[#2F6FED] hover:text-[#A9C7FF] transition-colors text-lg"
              >
                studysouq@gmail.com
              </a>
            </section>

            {/* Contact Categories */}
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-6 text-[#A9C7FF]">CONTACT INFORMATION</h2>
              <div className="space-y-4 text-[#94A3B8]">
                <div className="flex items-start gap-3">
                  <span className="text-[#2F6FED] mt-1">•</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">GENERAL INQUIRIES</h3>
                    <a href="mailto:studysouq@gmail.com" className="text-[#2F6FED] hover:text-[#A9C7FF] transition-colors">
                      studysouq@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#2F6FED] mt-1">•</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">REFUNDS & BILLING</h3>
                    <a href="mailto:studysouq@gmail.com" className="text-[#2F6FED] hover:text-[#A9C7FF] transition-colors">
                      studysouq@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#2F6FED] mt-1">•</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">PRIVACY CONCERNS</h3>
                    <a href="mailto:studysouq@gmail.com" className="text-[#2F6FED] hover:text-[#A9C7FF] transition-colors">
                      studysouq@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#2F6FED] mt-1">•</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">TECHNICAL ISSUES</h3>
                    <a href="mailto:studysouq@gmail.com" className="text-[#2F6FED] hover:text-[#A9C7FF] transition-colors">
                      studysouq@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#2F6FED] mt-1">•</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">BUSINESS & PARTNERSHIPS</h3>
                    <a href="mailto:studysouq@gmail.com" className="text-[#2F6FED] hover:text-[#A9C7FF] transition-colors">
                      studysouq@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Social Media */}
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">SOCIAL MEDIA</h2>
              <div className="space-y-3 text-[#94A3B8]">
                <div className="flex items-center gap-3">
                  <Instagram className="w-6 h-6 text-[#2F6FED]" />
                  <span>Instagram: @studysouq</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-[#2F6FED]" />
                  <a href="mailto:studysouq@gmail.com" className="text-[#2F6FED] hover:text-[#A9C7FF] transition-colors">
                    studysouq@gmail.com
                  </a>
                </div>
              </div>
            </section>

            {/* Feedback & Suggestions */}
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-6 h-6 text-[#2F6FED]" />
                <h2 className="text-2xl font-semibold text-[#A9C7FF]">FEEDBACK & SUGGESTIONS</h2>
              </div>
              <p className="text-[#94A3B8] leading-relaxed mb-4">
                We value your input! Help us improve StudySouq:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>Email: <a href="mailto:studysouq@gmail.com" className="text-[#2F6FED] hover:text-[#A9C7FF] transition-colors">studysouq@gmail.com</a></li>
                <li>In-app feedback form</li>
                <li>User surveys (sent periodically)</li>
              </ul>
            </section>

            {/* Report a Bug */}
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">REPORT A BUG</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">
                Found a technical issue?
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[#94A3B8]">
                <li>Email: <a href="mailto:studysouq@gmail.com" className="text-[#2F6FED] hover:text-[#A9C7FF] transition-colors">studysouq@gmail.com</a></li>
                <li>Include: Browser, device, screenshot, steps to reproduce</li>
              </ul>
            </section>

            {/* Media & Press */}
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">MEDIA & PRESS</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">
                For media inquiries, interviews, or press releases:
              </p>
              <a href="mailto:studysouq@gmail.com" className="text-[#2F6FED] hover:text-[#A9C7FF] transition-colors">
                studysouq@gmail.com
              </a>
            </section>

            {/* Careers */}
            <section className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-[#A9C7FF]">CAREERS</h2>
              <p className="text-[#94A3B8] leading-relaxed mb-4">
                Interested in joining our team?
              </p>
              <a href="mailto:studysouq@gmail.com" className="text-[#2F6FED] hover:text-[#A9C7FF] transition-colors">
                studysouq@gmail.com
              </a>
            </section>

            {/* Thank You Message */}
            <section className="bg-gradient-to-br from-[#2F6FED]/10 to-[#A9C7FF]/10 border border-[#2F6FED]/30 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">We're Here to Help!</h2>
              <p className="text-[#94A3B8] mb-6">
                We aim to respond to all inquiries within 48 hours. Thank you for choosing StudySouq!
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
