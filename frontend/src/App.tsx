import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/common/Navbar';
import { ToastProvider } from './contexts/ToastContext';
import { scrollToTop } from './utils/smoothScroll';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { CreateJobPage } from './pages/CreateJobPage';
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { RulesPage } from './pages/RulesPage';
import MarketplacePage from './pages/MarketplacePage';
import CreateGigPage from './pages/CreateGigPage';
import JobsPage from './pages/JobsPage';
import MessagesPage from './pages/MessagesPage';
import TalentPage from './pages/TalentPage';
import MyPostedJobsPage from './pages/MyPostedJobsPage';
import MyContractsPage from './pages/MyContractsPage';
import FreelancerGigsPage from './pages/FreelancerGigsPage';
import UserGigsPage from './pages/UserGigsPage';
import ProposalsPage from './pages/ProposalsPage';
import OffersPage from './pages/OffersPage';
import PortfolioPage from './pages/PortfolioPage';
import AchievementsPage from './pages/AchievementsPage';
import EarningsPage from './pages/EarningsPage';
import SettingsPage from './pages/SettingsPage';
import ReviewsPage from './pages/ReviewsPage';
import PostsPage from './pages/PostsPage';
import JobDetailPage from './pages/JobDetailPage';
import JobProposalsPage from './pages/JobProposalsPage';
import ClientProposalsPage from './pages/ClientProposalsPage';
import { WalletPage } from './pages/WalletPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { BrowseGigsPage } from './pages/BrowseGigsPage';
import { BrowseJobsPage } from './pages/BrowseJobsPage';
import { TrendingPage } from './pages/TrendingPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SearchPage } from './pages/SearchPage';
import { MentorsPage } from './pages/MentorsPage';
import { SavedPostsPage } from './pages/SavedPostsPage';
import { LikedPostsPage } from './pages/LikedPostsPage';
import { MyJobsPage } from './pages/MyJobsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AllPostsPage } from './pages/AllPostsPage';
import { GigDetailPage } from './pages/GigDetailPage';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAuth?: boolean }> = ({
  children,
  requireAuth = true
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && user) {
    // Redirect authenticated users to their role-based page
    if (user.role === 'admin' || user.role === 'moderator') {
      // For admin/moderator, redirect to admin dashboard
      // But allow admin login page to handle its own navigation during login process
      const isAdminLoginPage = window.location.pathname === '/admin/login';
      if (isAdminLoginPage) {
        // If already logged in as admin and on login page, redirect to dashboard
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'freelancer') {
      return <Navigate to="/browse-jobs" replace />;
    } else if (user.role === 'client') {
      return <Navigate to="/browse-gigs" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const location = useLocation();
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/admin/login'];
  const isAuthPage = authPages.some(path => location.pathname.startsWith(path));
  const isAdminPage = location.pathname.startsWith('/admin') && !location.pathname.startsWith('/admin/login');

  // Scroll to top on route change
  useEffect(() => {
    scrollToTop('smooth');
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      {!isAuthPage && !isAdminPage && <Navbar />}
      <main className="page-transition">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute requireAuth={false}>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/posts" element={<AllPostsPage />} />
          <Route path="/users/:username" element={<ProfilePage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/mentors" element={<MentorsPage />} />

          {/* Auth routes (redirect if authenticated) */}
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute requireAuth={false}>
                <RoleSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register/:role"
            element={
              <ProtectedRoute requireAuth={false}>
                <RegisterPage />
              </ProtectedRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <AdminLoginPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/create-gig"
            element={
              <ProtectedRoute>
                <CreateGigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/create"
            element={
              <ProtectedRoute>
                <CreateJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:jobId"
            element={
              <ProtectedRoute>
                <JobDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:jobId/proposals"
            element={
              <ProtectedRoute>
                <JobProposalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/talent"
            element={
              <ProtectedRoute>
                <BrowseGigsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse-gigs"
            element={
              <ProtectedRoute>
                <BrowseGigsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse-jobs"
            element={
              <ProtectedRoute>
                <BrowseJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-posted-jobs"
            element={
              <ProtectedRoute>
                <MyPostedJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-contracts"
            element={
              <ProtectedRoute>
                <MyContractsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/my-gigs"
            element={
              <ProtectedRoute>
                <FreelancerGigsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/gigs/:gigId"
            element={<GigDetailPage />}
          />
          <Route
            path="/users/:username/gigs"
            element={<UserGigsPage />}
          />
          <Route
            path="/users/:username/portfolio"
            element={<PortfolioPage />}
          />
          <Route
            path="/users/:username/achievements"
            element={<AchievementsPage />}
          />
          <Route
            path="/users/:username/reviews"
            element={<ReviewsPage />}
          />
          <Route
            path="/users/:username/posts"
            element={<PostsPage />}
          />
          <Route
            path="/dashboard/earnings"
            element={
              <ProtectedRoute>
                <EarningsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proposals"
            element={
              <ProtectedRoute>
                <ProposalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-proposals"
            element={
              <ProtectedRoute>
                <ClientProposalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers"
            element={
              <ProtectedRoute>
                <OffersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-jobs"
            element={
              <ProtectedRoute>
                <MyJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedPostsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/liked"
            element={
              <ProtectedRoute>
                <LikedPostsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-email"
            element={<EmailVerificationPage />}
          />
          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />

          {/* 404 route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
