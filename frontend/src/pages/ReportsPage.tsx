import React from 'react';
import { Navigate } from 'react-router-dom';

// ReportsPage redirects to EarningsPage for now
// In the future, this could be a dedicated analytics/reports page
export const ReportsPage: React.FC = () => {
  return <Navigate to="/dashboard/earnings" replace />;
};
