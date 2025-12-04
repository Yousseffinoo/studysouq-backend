import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollWithOffset = sectionId => {
    if (typeof window === 'undefined') return;
    const target = document.getElementById(sectionId);
    if (target) {
      const offset = 96;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: y >= 0 ? y : 0,
        behavior: 'smooth',
      });
      return true;
    }
    return false;
  };

  const handleNavClick = (event, link) => {
    event.preventDefault();

    if (location.pathname === link.path) {
      if (link.sectionId) {
        const scrolled = scrollWithOffset(link.sectionId);
        if (!scrolled && link.fallbackTop) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (link.fallbackTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate(
        link.path,
        link.sectionId ? { state: { targetSection: link.sectionId } } : undefined,
      );
    }
  };

  return (
    <>
      <style>{`
        .footer-main-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .footer-links-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        
        @media (min-width: 768px) {
          .footer-main-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
          }
          
          .footer-links-container {
            display: contents;
          }
        }
      `}</style>
      <footer className="relative bg-gradient-to-b from-[#101a30] to-[#0c1424] border-t border-white/15 mt-20 text-white/90">
      {/* Subtle math background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,20 50,50 T100,50" stroke="currentColor" fill="none" strokeWidth="0.5" />
          <circle cx="20" cy="30" r="5" stroke="currentColor" fill="none" strokeWidth="0.5" />
          <circle cx="80" cy="70" r="5" stroke="currentColor" fill="none" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="footer-main-container mb-8 text-center">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Logo className="w-22 h-20 mb-4" />
            <p className="text-[#94A3B8] text-sm">
              Learn Edexcel Maths with Clarity & Confidence
            </p>
          </div>

          {/* Quick Links and Legal Container */}
          <div className="footer-links-container">
            {/* Quick Links */}
            <div className="flex flex-col items-center">
              <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/" onClick={(event) => handleNavClick(event, { path: '/', sectionId: 'home', fallbackTop: true })} className="block text-[#94A3B8] hover:text-white text-base transition-colors text-center">
                  Home
                </Link>
                <Link to="/subjects" onClick={(event) => handleNavClick(event, { path: '/subjects', fallbackTop: true })} className="block text-[#94A3B8] hover:text-white text-base transition-colors text-center">
                  Subjects
                </Link>
                <Link to="/pricing" onClick={(event) => handleNavClick(event, { path: '/pricing', sectionId: 'pricing-plans', fallbackTop: true })} className="block text-[#94A3B8] hover:text-white text-base transition-colors text-center">
                  Pricing
                </Link>
                <Link to="/contact" onClick={(event) => handleNavClick(event, { path: '/contact', fallbackTop: true })} className="block text-[#94A3B8] hover:text-white text-base transition-colors text-center">
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div className="flex flex-col items-center">
              <h3 className="mb-4 text-lg font-semibold">Legal</h3>
              <div className="space-y-2">
                <Link to="/privacy-policy" className="block text-[#94A3B8] hover:text-white text-base transition-colors text-center">
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="block text-[#94A3B8] hover:text-white text-base transition-colors text-center">
                  Terms of Service
                </Link>
                <Link to="/support" className="block text-[#94A3B8] hover:text-white text-base transition-colors text-center">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-[#94A3B8] text-base">
          <p>&copy; {new Date().getFullYear()} StudySouq. All rights reserved.</p>
        </div>
      </div>
    </footer>
    </>
  );
}