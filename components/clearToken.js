import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

 const SomeComponent = () => {
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
    };

    performLogout();
  }, []);

  return null;
};
export default SomeComponent;
