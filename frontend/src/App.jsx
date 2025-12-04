import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import SubjectsPage from './components/pages/SubjectsPage';
import SectionsPage from './components/pages/SectionsPage';
import LessonsListPage from './components/pages/LessonsListPage';
import LessonPage from './components/pages/LessonPage';
import QuestionPage from './components/pages/QuestionPage';
import PricingPage from './components/pages/PricingPage';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignupPage';
import ProfilePage from './components/pages/ProfilePage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';
import SupportPage from './components/pages/SupportPage';
import AboutPage from './components/pages/AboutPage';
import SampleContentPage from './components/pages/SampleContentPage';
import RefundPolicyPage from './components/pages/RefundPolicyPage';
import ContactUsPage from './components/pages/ContactUsPage';
import AdminRoute from './components/admin/AdminRoute';
import AdminDashboard from './components/pages/admin/AdminDashboard';
import UsersPage from './components/pages/admin/UsersPage';
import LessonsPage from './components/pages/admin/LessonsPage';
import NotesPage from './components/pages/admin/NotesPage';
import QuestionsPage from './components/pages/admin/QuestionsPage';
import ImagesPage from './components/pages/admin/ImagesPage';
import PricingPageAdmin from './components/pages/admin/PricingPage';
import AIConfigPage from './components/pages/admin/AIConfigPage';
import SettingsPage from './components/pages/admin/SettingsPage';
export default function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <AuthProvider>
      <Router>
        <AppShell />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </Router>
    </AuthProvider>
  );
}

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  // Admin routes have their own layout, so don't wrap them
  if (isAdminRoute) {
    return (
      <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/subjects/:subjectId" element={<SectionsPage />} />
            <Route path="/subjects/:subjectId/:sectionId" element={<LessonsListPage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/lesson/:lessonId/questions" element={<QuestionPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sample-content" element={<SampleContentPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            
            {/* Protected Admin Routes - No separate login, use main /login */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
            <Route path="/admin/lessons" element={<AdminRoute><LessonsPage /></AdminRoute>} />
            <Route path="/admin/notes" element={<AdminRoute><NotesPage /></AdminRoute>} />
            <Route path="/admin/questions" element={<AdminRoute><QuestionsPage /></AdminRoute>} />
            <Route path="/admin/images" element={<AdminRoute><ImagesPage /></AdminRoute>} />
            <Route path="/admin/pricing" element={<AdminRoute><PricingPageAdmin /></AdminRoute>} />
            <Route path="/admin/ai-config" element={<AdminRoute><AIConfigPage /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
            
            {/* Redirect /admin to dashboard or login based on auth */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/*" element={<Navigate to="/login" replace />} />
          </Routes>
    );
  }

  // Regular routes with Navbar and Footer
  return (
    <div
      className="min-h-screen text-white flex flex-col"
      style={{
        background: "linear-gradient(180deg, #020914 0%, #0B1A2C 45%, #020914 100%)",
      }}
    >
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          className="flex-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/subjects/:subjectId" element={<SectionsPage />} />
            <Route path="/subjects/:subjectId/:sectionId" element={<LessonsListPage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/lesson/:lessonId/questions" element={<QuestionPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sample-content" element={<SampleContentPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}