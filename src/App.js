import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginPage from "./components/LoginPage";
import ChatInterface from "./components/ChatInterface";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import TestAdmin from "./components/auth/TestAdmin";
import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  console.log("ProtectedRoute check:");
  console.log("- isAuthenticated:", isAuthenticated);
  console.log("- userRole:", userRole);
  console.log("- requiredRole:", requiredRole);

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/" />;
  }

  if (requiredRole === 'admin' && userRole !== 'admin') {
    console.log("Admin role required but user is not admin, redirecting to login");
    return <Navigate to="/" />;
  }

  console.log("Access granted");
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatInterface />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* Add a redirect from /admin to /admin/dashboard */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            {/* Test admin route */}
            <Route
              path="/test-admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <TestAdmin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
