import { Menu } from '@headlessui/react';
import { Menu as MenuIcon, LogOut, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import clsx from 'clsx';

/**
 * Top bar component
 * Header with user menu and mobile hamburger
 */
export default function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Hamburger menu (mobile only) */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-linkedin-500"
        >
          <MenuIcon className="h-6 w-6" />
        </button>

        {/* Spacer for desktop to push user menu to right */}
        <div className="hidden lg:block"></div>

        {/* Right side - User menu */}
        <div className="flex items-center">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-linkedin-500">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-linkedin-500 text-white font-medium text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.toLowerCase()}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="p-1">

                <div className="my-1 border-t border-gray-100" />

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={clsx(
                        'flex items-center w-full px-4 py-2 text-sm rounded-md',
                        active
                          ? 'bg-red-50 text-red-700'
                          : 'text-gray-700'
                      )}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        </div>
      </div>
    </header>
  );
}
