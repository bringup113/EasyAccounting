import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';

const PrivateRoute = ({ isAuthenticated, loading, children }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute; 