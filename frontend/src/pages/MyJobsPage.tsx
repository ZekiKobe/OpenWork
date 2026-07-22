import React from 'react';
import { Navigate } from 'react-router-dom';

// MyJobsPage is just a redirect to MyContractsPage (Active Contracts)
export const MyJobsPage: React.FC = () => {
  return <Navigate to="/my-contracts" replace />;
};
