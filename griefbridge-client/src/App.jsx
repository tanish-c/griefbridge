import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CaseProvider } from './context/CaseContext';

import Home from './pages/Home';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import { ChatWidget } from './components/ChatWidget';
import './App.css';
import Intro from './components/Intro';

function ProtectedRoute({ children }) {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  const { user, loading } = authContext;

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const authContext = useContext(AuthContext);
  
  // Check if user is authenticated AND loading is complete
  const isAuthenticated = authContext?.user !== null && authContext?.user !== undefined && authContext?.loading === false;

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {isAuthenticated && <ChatWidget />}
    </>
  );
}

function App() {
  const [introDone, setIntroDone] = useState(false);
  return (
    <>
      {!introDone && <Intro onDone={() => setIntroDone(true)} />}
      <Router>
        <AuthProvider>
          <CaseProvider>
            <AppRoutes />
          </CaseProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
