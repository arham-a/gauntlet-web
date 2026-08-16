import { useState, useEffect } from "react";
import {
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon,
  TrophyIcon,
  PlusCircleIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { isSignedIn, userInfo, stats, logout, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
    toggleSidebar();
  };

  const menuItems = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/explore", label: "Explore", icon: MagnifyingGlassIcon },
    { path: "/competitions", label: "My Competitions", icon: TrophyIcon },
    { path: "/profile", label: "Profile", icon: UserIcon },
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-gray-900 via-black to-gray-900 
                   text-white transform z-50 transition-transform duration-300 ease-in-out
                   ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                   md:translate-x-0 md:static md:w-64 shadow-2xl border-r border-red-900/20
                   font-['Poppins',sans-serif] h-screen overflow-hidden flex-shrink-0`}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-32 h-32 bg-red-600/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-24 h-24 bg-red-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-red-900/20 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  Gauntlet
                </h2>
                <p className="text-xs text-gray-400">Competition Platform</p>
              </div>
              
              <button
                className="md:hidden p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                onClick={toggleSidebar}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {/* Navigation */}
            <div className="p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleSidebar}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 group text-sm ${
                      isActivePath(item.path)
                        ? 'bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30 text-red-300 shadow-lg shadow-red-500/10'
                        : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 transition-colors ${
                      isActivePath(item.path) ? 'text-red-400' : 'text-gray-400 group-hover:text-white'
                    }`} />
                    <span className="font-medium">{item.label}</span>
                    {isActivePath(item.path) && (
                      <div className="ml-auto w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                ))}
              </nav>

              {/* Add Competition Button */}
              <div className="mt-6">
                <Link
                  to="/add-comp"
                  onClick={toggleSidebar}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 
                           bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                           text-white rounded-lg transition-all duration-300 font-medium text-sm
                           transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-red-500/25"
                >
                  <PlusCircleIcon className="w-4 h-4" />
                  <span>Create Competition</span>
                </Link>
              </div>

              {/* Quick Stats */}
              {isSignedIn && (
                <div className="mt-6 p-3 bg-black/30 rounded-lg border border-gray-700/50">
                  <h4 className="text-xs font-semibold text-gray-300 mb-2">Quick Stats</h4>
                  <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Competitions Joined</span>
                        <span className="text-red-400 font-semibold">{stats.competitionsJoined}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Competitions Created</span>
                        <span className="text-blue-400 font-semibold">{stats.competitionsCreated}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Total Points</span>
                        <span className="text-green-400 font-semibold">{stats.totalPoints.toLocaleString()}</span>
                      </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Section - Fixed at bottom */}
          <div className="p-4 border-t border-red-900/20 bg-black/20 flex-shrink-0">
            {isSignedIn ? (
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {userInfo.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate text-sm">{userInfo.username}</h3>
                    <p className="text-gray-400 text-xs truncate">{userInfo.email}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    to="/profile"
                    onClick={toggleSidebar}
                    className="flex items-center justify-center space-x-1 px-2 py-1.5 
                             bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white 
                             rounded-md transition-colors text-xs font-medium"
                  >
                    <Cog6ToothIcon className="w-3 h-3" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-1 px-2 py-1.5 
                             bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 
                             rounded-md transition-colors text-xs font-medium border border-red-500/30"
                  >
                    <ArrowLeftOnRectangleIcon className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate("/login");
                    toggleSidebar();
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                           text-white font-medium rounded-lg transition-all duration-300 text-sm
                           transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-red-500/25"
                >
                  Sign In
                </button>
                <p className="text-center text-gray-400 text-xs">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      navigate("/signup");
                      toggleSidebar();
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
