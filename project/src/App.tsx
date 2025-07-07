import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import StudentReservation from './pages/student/Reservation';
import TeacherShift from './pages/teacher/Shift';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole: string }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    } else {
      return <Navigate to="/student" replace />;
    }
  }
  
  return <>{children}</>;
}

function App() {
  const { user, loading } = useAuth();
  
  // Auto-redirect based on user role when they're logged in
  React.useEffect(() => {
    if (!loading && user) {
      const currentPath = window.location.pathname;
      
      // If user is on login page or root, redirect to their dashboard
      if (currentPath === '/login' || currentPath === '/') {
        if (user.role === 'admin') {
          window.location.href = '/admin';
        } else if (user.role === 'teacher') {
          window.location.href = '/teacher';
        } else {
          window.location.href = '/student';
        }
      }
    }
  }, [user, loading]);
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/student" element={
        <ProtectedRoute requiredRole="student">
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<StudentDashboard />} />
        <Route path="reserve" element={<StudentReservation />} />
      </Route>
      
      <Route path="/teacher" element={
        <ProtectedRoute requiredRole="teacher">
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<TeacherDashboard />} />
        <Route path="shifts" element={<TeacherShift />} />
      </Route>
      
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
      </Route>
      
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;