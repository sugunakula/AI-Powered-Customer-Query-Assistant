import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TestAdmin = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    if (userRole !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch('https://product-api-90xc.onrender.com/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          setError('Failed to fetch user data');
        }
      } catch (error) {
        setError('An error occurred while fetching user data');
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <div className="test-admin">
      <h1>Admin Test Page</h1>
      {error && <div className="error-message">{error}</div>}
      {userData && (
        <div className="user-data">
          <h2>User Data</h2>
          <pre>{JSON.stringify(userData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestAdmin; 