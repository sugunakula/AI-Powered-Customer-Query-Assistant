import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

// Icons and Illustrations

const DarkModeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3ZM12 19C8.14 19 5 15.86 5 12C5 8.14 8.14 5 12 5C15.86 5 19 8.14 19 12C19 15.86 15.86 19 12 19Z" fill="currentColor"/>
    <path d="M12 7V17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7Z" fill="currentColor"/>
  </svg>
);

const LightModeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 15C10.35 15 9 13.65 9 12C9 10.35 10.35 9 12 9C13.65 9 15 10.35 15 12C15 13.65 13.65 15 12 15Z" fill="currentColor"/>
    <path d="M12 2L14.39 5.42L18.5 3.82L17.24 8.05L21 10.5L17.24 12.95L18.5 17.18L14.39 15.58L12 19L9.61 15.58L5.5 17.18L6.76 12.95L3 10.5L6.76 8.05L5.5 3.82L9.61 5.42L12 2Z" fill="currentColor"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor" fillOpacity="0.3"/>
    <path d="M12 2V4C16.41 4 20 7.59 20 12H22C22 6.48 17.52 2 12 2Z" fill="currentColor"/>
  </svg>
);

const AIAssistantIllustration = () => (
  <svg
    className="ai-assistant"
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Gradients */}
    <defs>
      <radialGradient
        id="gradientOuter"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(100 100) rotate(90) scale(100)"
      >
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
      </radialGradient>
      <linearGradient
        id="gradientMiddle"
        x1="50"
        y1="100"
        x2="150"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="gradientInner"
        x1="70"
        y1="100"
        x2="130"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="faceGradient"
        x1="80"
        y1="80"
        x2="120"
        y2="80"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="antennaGradient"
        x1="100"
        y1="55"
        x2="100"
        y2="40"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="dotGradient1"
        x1="135"
        y1="100"
        x2="145"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="dotGradient2"
        x1="55"
        y1="100"
        x2="65"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="dotGradient3"
        x1="95"
        y1="140"
        x2="105"
        y2="140"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="pulseGradient"
        x1="60"
        y1="100"
        x2="140"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>

    {/* Layers */}
    <g>
      {/* Outer Glow */}
      <circle cx="100" cy="100" r="90" fill="url(#gradientOuter)" fillOpacity="0.15" />
      {/* Middle Ring */}
      <circle
        cx="100"
        cy="100"
        r="60"
        stroke="url(#gradientMiddle)"
        strokeWidth="3"
        strokeDasharray="5 5"
      />
      {/* Inner Core */}
      <circle cx="100" cy="100" r="40" fill="url(#gradientInner)" fillOpacity="0.3" />
    </g>

    {/* Bot Face */}
    <g className="bot-face">
      <circle cx="100" cy="80" r="25" fill="url(#faceGradient)" />
      <circle cx="90" cy="73" r="4" fill="#fff" />
      <circle cx="110" cy="73" r="4" fill="#fff" />
      <path
        d="M90 90 Q100 100 110 90"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </g>

    {/* Antenna */}
    <g className="antenna">
      <line x1="100" y1="55" x2="100" y2="40" stroke="url(#antennaGradient)" strokeWidth="3" />
      <circle cx="100" cy="35" r="6" fill="url(#antennaGradient)" />
    </g>

    {/* Orbiting Elements */}
    <g className="orbiting-elements">
      <circle cx="140" cy="100" r="6" fill="url(#dotGradient1)" />
      <circle cx="60" cy="100" r="6" fill="url(#dotGradient2)" />
      <circle cx="100" cy="140" r="6" fill="url(#dotGradient3)" />
    </g>

    {/* Pulse Effect */}
    <circle
      className="pulse"
      cx="100"
      cy="100"
      r="50"
      stroke="url(#pulseGradient)"
      strokeWidth="2"
      strokeDasharray="4 4"
      fill="none"
    />

    {/* Animation Styles */}
    <style>{`
      .orbiting-elements {
        animation: orbit 12s linear infinite;
        transform-origin: 100px 100px;
      }
      .pulse {
        animation: pulse 2.5s ease-in-out infinite;
        transform-origin: 100px 100px;
      }
      @keyframes orbit {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0% { opacity: 0.3; transform: scale(0.9); }
        50% { opacity: 1; transform: scale(1.1); }
        100% { opacity: 0.3; transform: scale(0.9); }
      }
    `}</style>
  </svg>
);



const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  // Set initial theme
  useEffect(() => {
    // Clear any existing authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    
    // Apply the theme
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://product-api-90xc.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        
        // Check if user is admin by email since isAdmin might not be in the response
        const isAdmin = data.user.email === 'admin@gmail.com';
        console.log("Is admin:", isAdmin);
        
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userId', data.user.id || data.user._id);
        localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
        
        console.log("Stored user role:", localStorage.getItem('userRole'));
        
        // Redirect based on user role
        if (isAdmin) {
          console.log("Redirecting to admin dashboard");
          navigate('/admin/dashboard');
        } else {
          console.log("Redirecting to chat");
          navigate('/chat');
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </button>
      
      <div className="auth-card">
        <div className="auth-card-header">
          <h2>Sign In</h2>
          <p className="auth-tagline">
            Your Smart Assistant for Customer Queries, Powered by AI.
          </p>
        </div>
        
        <AIAssistantIllustration />
        
        <div className="auth-card-body">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>
            
            
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <SpinnerIcon /> Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="sample-credentials">
            <p>Sample Credentials for Testing:</p>
            <div><strong>User:</strong> sugun@gmail.com / 123456</div>
            <div><strong>Admin:</strong> admin@gmail.com / admin</div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 