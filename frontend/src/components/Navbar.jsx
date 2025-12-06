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
    { name: "Home", path: "/" },
    { name: "Subjects", path: "/subjects" },
    { name: "Mocks", path: "/mocks" },
    { name: "Pricing", path: "/", sectionId: "pricing" },
    { name: "About", path: "/about" },
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
        className="w-full sticky top-0 z-40 border-b border-white/10 bg-black"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center justify-center py-1"
            >
              <Logo className="w-24 sm:w-28 h-auto" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={(event) => handleNavClick(event, link)}
                  className="text-[14px] text-white/80 hover:text-white transition-colors whitespace-nowrap font-medium"
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-8 py-3 bg-white text-black hover:bg-white/90 transition-colors text-[14px] font-semibold"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
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
              className="fixed top-0 right-0 bottom-0 w-80 bg-black/95 backdrop-blur-lg border-l border-white/20 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <span className="tracking-wide text-white">Menu</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
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
                      className="block px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
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
                          className="flex items-center space-x-2 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors mb-2"
                        >
                          <User className="w-5 h-5" />
                          <span>{user.name}</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-3 rounded-lg bg-white text-black hover:bg-white/90 text-center transition-colors mb-2 font-semibold"
                        >
                          Login
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-3 rounded-lg border-2 border-white text-white hover:bg-white/10 text-center transition-colors"
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
