import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoadingScreen from './components/common/LoadingScreen'
import { PlatformProvider } from "./contexts/PlatformContext";

// Layout
import Layout from "./components/layout/Layout";

// Lazy-Loaded Pages
const Home = lazy(() => import('./pages/Home'));
const Quiz = lazy(() => import('./pages/Quiz'));
const DietPlans = lazy(() => import('./pages/DietPlans'));
const DietPlanDetails = lazy(() => import('./pages/DietPlanDetails'));
const WeightLoss = lazy(() => import('./pages/WeightLoss'));
const ExerciseDetails = lazy(() => import('./pages/ExerciseDetails'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Profile = lazy(() => import('./pages/Profile'));
const QuizHistory = lazy(() => import('./pages/QuizHistory'));
const QuizResult = lazy(() => import('./pages/QuizResult'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ProgressPhotos = lazy(() => import('./pages/ProgressPhotos'));
const CommunityPhotos = lazy(() => import('./pages/CommunityPhotos'));
const Challenges = lazy(() => import('./pages/Challenges'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <AuthProvider>
      <PlatformProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Auth callback route outside of layout */}
              <Route path="/auth/callback" element={<AuthCallback />} />

              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="quiz" element={<Quiz />} />
                <Route path="diet-plans" element={<DietPlans />} />
                <Route path="diet-plans/:id" element={<DietPlanDetails />} />
                <Route path="weight-loss" element={<WeightLoss />} />
                <Route path="weight-loss/:id" element={<ExerciseDetails />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="faq" element={<FAQ />} />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="quiz-history"
                  element={
                    <ProtectedRoute>
                      <QuizHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="quiz-result/:id"
                  element={
                    <ProtectedRoute>
                      <QuizResult />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="progress-photos"
                  element={
                    <ProtectedRoute>
                      <ProgressPhotos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="community"
                  element={
                    <ProtectedRoute>
                      <CommunityPhotos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="challenges"
                  element={
                    <ProtectedRoute>
                      <Challenges />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </AnimatePresence>
          </Suspense>
        </Router>
      </PlatformProvider>
    </AuthProvider>
  );
}

export default App;