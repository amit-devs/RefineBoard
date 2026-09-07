import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Diamond } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-ivory">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-sage rounded-xl flex items-center justify-center shadow-soft animate-pulse">
            <Diamond size={20} className="text-white" />
          </div>
          <p className="text-sm font-medium text-text-secondary">Loading RefineBoard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
