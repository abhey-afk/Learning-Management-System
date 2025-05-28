import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  ShoppingCart, Heart, Bell, Menu, ChevronDown, X,
  GraduationCap, BookOpen, PenTool, User, BarChart
} from 'lucide-react';

// Create a custom event for auth state changes
export const authEvents = {
  login: new Event('user:login'),
  logout: new Event('user:logout'),
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  // Function to check and update auth state
  const checkAuthState = () => {
    const hasAuthToken = !!Cookies.get('authToken');
    setLoggedIn(hasAuthToken);
    
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    } else {
      setUserInfo(null);
    }
  };

  useEffect(() => {
    // Check auth state on component mount
    checkAuthState();
    
    // Set up listeners for auth events
    const handleLogin = () => checkAuthState();
    const handleLogout = () => checkAuthState();
    
    // Add event listeners for auth events
    window.addEventListener('user:login', handleLogin);
    window.addEventListener('user:logout', handleLogout);
    
    // Set up a listener for local storage changes (helps with multi-tab scenarios)
    const handleStorageChange = (e) => {
      if (e.key === 'userInfo' || e.key === null) {
        checkAuthState();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('user:login', handleLogin);
      window.removeEventListener('user:logout', handleLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggle = (key) => setIsOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const logout = () => {
    Cookies.remove('authToken');
    localStorage.removeItem('userInfo');
    setLoggedIn(false);
    setUserInfo(null);
    setIsOpen({});
    
    // Dispatch logout event
    window.dispatchEvent(authEvents.logout);
    
    navigate('/');
  };

  // Define dropdown menu items based on user role
  const getMenuItems = () => {
    const isInstructor = userInfo?.role === 'instructor';
    
    // Common items for all users
    const commonItems = [
      ['/profile', 'Edit Profile', User]
    ];
    
    // Student-specific items
    const studentItems = [
      ['/MyLearning', 'My Learning', BookOpen]
    ];
    
    // Instructor-specific items
    const instructorItems = [
      ['/admin/dashboard', 'Dashboard', BarChart],
      ['/admin/courses', 'My Courses', PenTool]
    ];
    
    return [
      ...commonItems,
      ...(isInstructor ? instructorItems : studentItems)
    ];
  };

  const link = "text-gray-700 hover:text-blue-600";
  const dropdown = "bg-white shadow-lg rounded-md border border-gray-100 z-10";
  const dropItem = "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center";

  return (
    <nav className="bg-white border-b fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center">
          {loggedIn && (
            <button className={`lg:hidden mr-2 ${link}`} onClick={() => toggle('mobile')}>
              {isOpen.mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
          <Link to="/" className="font-bold text-xl text-blue-600 ml-2">
            TrainTool
          </Link>
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-3">
          {loggedIn ? (
            <>
              {[['/wishlist', Heart], ['/cart', ShoppingCart], ['/notifications', Bell]].map(
                ([url, Icon], i) => (
                  <Link key={i} to={url} className={`${link} ${url === '/notifications' ? 'hidden sm:block' : ''}`}>
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              )}
              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => toggle('user')} 
                  className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium"
                  title={userInfo?.role === 'instructor' ? 'Instructor Account' : 'Student Account'}
                >
                  {userInfo?.firstName?.charAt(0) || userInfo?.name?.charAt(0) || 'U'}
                </button>
                {isOpen.user && (
                  <div className={`absolute right-0 mt-2 w-56 ${dropdown}`}>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800">
                        {(userInfo?.firstName && userInfo?.lastName) 
                          ? `${userInfo.firstName} ${userInfo.lastName}` 
                          : userInfo?.name || 'User'}
                      </p>
                      <div className="flex items-center text-xs text-gray-600">
                        <span className="truncate">{userInfo?.email || ''}</span>
                        <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                          {userInfo?.role || 'user'}
                        </span>
                      </div>
                    </div>
                    <div className="p-2">
                      {getMenuItems().map(([url, label, Icon], i) => (
                        <Link key={i} to={url} className={dropItem}>
                          {Icon && <Icon size={16} className="mr-2" />}
                          {label}
                        </Link>
                      ))}
                      <button onClick={logout} className={`w-full text-left ${dropItem}`}>
                        <X size={16} className="mr-2" /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex gap-2 items-center">
              <Link 
                to="/login" 
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-blue-700"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-green-700"
              >
                Signup
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {loggedIn && isOpen.mobile && (
        <div className="lg:hidden bg-white border-t">
          <div className="p-2">
            <div className="border-t pt-2">
              {getMenuItems().map(([url, label, Icon], i) => (
                <Link 
                  key={i} 
                  to={url} 
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsOpen({})}
                >
                  {Icon && <Icon size={16} className="mr-2" />}
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}