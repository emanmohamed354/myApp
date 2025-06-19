// hooks/useAppInitialization.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useAppInitialization = () => {
  const [isReady, setIsReady] = useState(false);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading
    if (!authLoading) {
      // Add a small delay to ensure everything is settled
      setTimeout(() => {
        setIsReady(true);
      }, 100);
    }
  }, [authLoading]);

  return isReady;
};