import { motion } from 'motion/react';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function ContactUsPage() {
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
              <Mail className="w-10 h-10 text-[#2F6FED]" />
            </div>
            <h1 className="mb-4 text-white">Contact Us</h1>
            <p className="text-gray-800 text-lg max-w-2xl mx-auto">
              For inquiries, support, or partnership requests, feel free to reach us using the details below.
            </p>
          </div>

          {/* Contact Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Address Card */}
            <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8 hover:border-[#2F6FED]/30 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#2F6FED]/10 border border-[#2F6FED]/30 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#2F6FED]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Our Location</h3>
                  <p className="text-gray-800 leading-relaxed">
                    Egypt, Cairo<br />
                    First Settlement
                  </p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8 hover:border-[#2F6FED]/30 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#2F6FED]/10 border border-[#2F6FED]/30 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-[#2F6FED]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Phone Number</h3>
                  <a 
                    href="tel:+201017338655" 
                    className="text-gray-800 hover:text-[#2F6FED] transition-colors text-lg"
                  >
                    01017338655
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-gradient-to-br from-[#2F6FED]/10 to-[#A9C7FF]/10 border border-[#2F6FED]/30 rounded-2xl p-8 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4 text-center">Get in Touch</h2>
            <p className="text-gray-800 text-center leading-relaxed max-w-2xl mx-auto">
              Whether you have questions about our courses, need technical support, 
              or are interested in partnering with us, we're here to help. 
              Our team is committed to providing you with the best educational experience possible.
            </p>
          </div>

          {/* Business Hours */}
          <div className="bg-gradient-to-br from-[#0B1D34] to-[#0B1D34]/50 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Support Hours</h3>
            <div className="space-y-3 text-center">
              <p className="text-gray-800">
                <span className="text-[#A9C7FF] font-semibold">Sunday - Thursday:</span> 9:00 AM - 6:00 PM (EET)
              </p>
              <p className="text-gray-800">
                <span className="text-[#A9C7FF] font-semibold">Friday - Saturday:</span> Closed
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

