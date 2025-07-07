import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Calendar, User, BookOpen, Clock, Settings } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">I Studio 予約システム</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-700">
                <span className="hidden md:inline">ようこそ、</span> 
                <span className="text-blue-600">{user?.name}</span> 
                <span className="hidden md:inline">さん</span>
                {user?.role === 'admin' && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    管理者
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content area with sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <nav className="w-20 md:w-64 bg-white border-r border-gray-200 pt-5 pb-4 flex flex-col">
          <div className="flex-shrink-0 px-4">
            <h2 className="text-lg font-medium text-gray-900 hidden md:block">メニュー</h2>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <div className="space-y-1">
              {user?.role === 'student' ? (
                <>
                  <button
                    onClick={() => navigate('/student')}
                    className="group flex items-center px-4 py-4 md:py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Calendar className="h-6 w-6 md:h-5 md:w-5 md:mr-3 mx-auto md:mx-0 text-gray-500 group-hover:text-gray-500" />
                    <span className="hidden md:inline">予約一覧</span>
                  </button>
                  <button
                    onClick={() => navigate('/student/reserve')}
                    className="group flex items-center px-4 py-4 md:py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    <BookOpen className="h-6 w-6 md:h-5 md:w-5 md:mr-3 mx-auto md:mx-0 text-gray-500 group-hover:text-gray-500" />
                    <span className="hidden md:inline">新規予約</span>
                  </button>
                </>
              ) : user?.role === 'teacher' ? (
                <>
                  <button
                    onClick={() => navigate('/teacher')}
                    className="group flex items-center px-4 py-4 md:py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    <User className="h-6 w-6 md:h-5 md:w-5 md:mr-3 mx-auto md:mx-0 text-gray-500 group-hover:text-gray-500" />
                    <span className="hidden md:inline">予約一覧</span>
                  </button>
                  <button
                    onClick={() => navigate('/teacher/shifts')}
                    className="group flex items-center px-4 py-4 md:py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Clock className="h-6 w-6 md:h-5 md:w-5 md:mr-3 mx-auto md:mx-0 text-gray-500 group-hover:text-gray-500" />
                    <span className="hidden md:inline">シフト管理</span>
                  </button>
                </>
              ) : user?.role === 'admin' ? (
                <>
                  <button
                    onClick={() => navigate('/admin')}
                    className="group flex items-center px-4 py-4 md:py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Settings className="h-6 w-6 md:h-5 md:w-5 md:mr-3 mx-auto md:mx-0 text-gray-500 group-hover:text-gray-500" />
                    <span className="hidden md:inline">管理者画面</span>
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </nav>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;