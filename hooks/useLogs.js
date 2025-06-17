// hooks/useLogs.js
import { useState, useEffect, useCallback } from 'react';
import { logsApi } from '../services/logsApi';
import { useAuth } from '../contexts/AuthContext';

export const useLogs = () => {
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isCarPaired } = useAuth();

  const loadDiagnosticLogs = useCallback(async () => {
    if (!isCarPaired) return;
    
    try {
      const logs = await logsApi.getDiagnosticLogs();
      setDiagnosticLogs(logs || []);
    } catch (err) {
      console.error('Error loading diagnostic logs:', err);
      setError('Failed to load diagnostic logs');
    }
  }, [isCarPaired]);

  const loadEventLogs = useCallback(async () => {
    if (!isCarPaired) return;
    
    try {
      const logs = await logsApi.getEventLogs();
      setEventLogs(logs || []);
    } catch (err) {
      console.error('Error loading event logs:', err);
      setError('Failed to load event logs');
    }
  }, [isCarPaired]);

  const loadAllLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([loadDiagnosticLogs(), loadEventLogs()]);
    } finally {
      setIsLoading(false);
    }
  }, [loadDiagnosticLogs, loadEventLogs]);

  const clearDiagnosticCode = useCallback(async (codeId) => {
    try {
      await logsApi.clearDiagnosticCode(codeId);
      await loadDiagnosticLogs(); // Reload after clearing
    } catch (err) {
      console.error('Error clearing diagnostic code:', err);
      throw err;
    }
  }, [loadDiagnosticLogs]);

  useEffect(() => {
    if (isCarPaired) {
      loadAllLogs();
    }
  }, [isCarPaired, loadAllLogs]);

  return {
    diagnosticLogs,
    eventLogs,
    isLoading,
    error,
    loadDiagnosticLogs,
    loadEventLogs,
    loadAllLogs,
    clearDiagnosticCode,
  };
};