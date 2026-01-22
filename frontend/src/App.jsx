import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Pages (to be created)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobNew from './pages/JobNew';
import JobEdit from './pages/JobEdit';
import JobDetail from './pages/JobDetail';
import CandidateDetail from './pages/CandidateDetail';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

/**
 * React Query configuration
 * Optimized for data fetching and caching
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  const { initialize, isInitializing } = useAuthStore();

  // Initialize auth on app mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading state while initializing auth
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-linkedin-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* Jobs routes */}
            <Route path="jobs" element={<Jobs />} />
            <Route
              path="jobs/new"
              element={
                <ProtectedRoute allowedRoles={['RECRUITER']}>
                  <JobNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="jobs/:jobId/edit"
              element={
                <ProtectedRoute allowedRoles={['RECRUITER']}>
                  <JobEdit />
                </ProtectedRoute>
              }
            />
            <Route path="jobs/:jobId" element={<JobDetail />} />

            {/* Candidate detail */}
            <Route
              path="jobs/:jobId/candidates/:candidateId"
              element={<CandidateDetail />}
            />

            {/* 404 - Redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
