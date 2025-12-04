import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import Logo from "./Logo";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/", sectionId: "home" },
    { name: "Subjects", path: "/subjects" },
    { name: "Pricing", path: "/pricing", sectionId: "pricing-plans" },
    { name: "About", path: "/about" },
    { name: "Sample Content", path: "/sample-content" },
    { name: "Refund Policy", path: "/refund-policy" },
    { name: "Contact Us", path: "/contact" },
  ];

  const scrollToSection = (sectionId) => {
    if (typeof window === "undefined") return;
    const target = document.getElementById(sectionId);
    if (target) {
      const offset = 96;
      const y =
        target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: y >= 0 ? y : 0,
        behavior: "smooth",
      });
    }
  };

  const handleNavClick = (event, link) => {
    event.preventDefault();

    if (location.pathname === link.path) {
      if (link.sectionId) {
        scrollToSection(link.sectionId);
      }
    } else {
      navigate(link.path, link.sectionId ? { state: { targetSection: link.sectionId } } : undefined);
    }

    setMobileMenuOpen(false);
  };
  

  return (
    <>
      <nav
        className="sticky top-0 z-40 backdrop-blur-lg border-b border-white/20 shadow-lg shadow-black/10 transition-colors"
        style={{ backgroundColor: "#0B1A2C" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-18">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center justify-center rounded-xl bg-[#163162] px-2 py-1 md:px-3 md:py-2"
            >
              <Logo className="w-18 h-12 md:w-16 md:h-16" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={(event) => handleNavClick(event, link)}
                  className="text-[#94A3B8] hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-[#94A3B8] hover:text-white transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-[#94A3B8] hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2 bg-[#2F6FED] hover:bg-[#2F6FED]/80 rounded-lg transition-colors"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Sliding Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-[#D0E1FF]/95 border-l border-white/10 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <span className="tracking-wide">Menu</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={(event) => handleNavClick(event, link)}
                      className="block px-4 py-3 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}

                  <div className="border-t border-white/10 pt-4 mt-4">
                    {user ? (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-2 px-4 py-3 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors mb-2"
                        >
                          <User className="w-5 h-5" />
                          <span>{user.name}</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-3 rounded-lg bg-[#2F6FED] hover:bg-[#2F6FED]/80 text-center transition-colors mb-2"
                        >
                          Login
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-3 rounded-lg border border-[#2F6FED] hover:bg-[#2F6FED]/10 text-center transition-colors"
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
