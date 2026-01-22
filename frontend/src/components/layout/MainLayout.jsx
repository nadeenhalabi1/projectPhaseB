import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Toast from '../ui/Toast';

/**
 * Main layout component
 * Two-column layout with sidebar and content area
 */
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area - Always has left padding on desktop for sidebar */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <TopBar />

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}
