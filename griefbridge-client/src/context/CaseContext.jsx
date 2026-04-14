import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const CaseContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function CaseProvider({ children }) {
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/cases`);
      setCases(response.data);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCase = useCallback(async (caseData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/cases`, caseData);
      setCases([...cases, response.data]);
      setActiveCase(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create case:', error);
      throw error;
    }
  }, [cases]);

  const updateProcedureStatus = useCallback(async (caseId, procedureId, status) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/cases/${caseId}/procedures/${procedureId}`,
        { status }
      );
      if (activeCase?._id === caseId) {
        setActiveCase(response.data);
      }
      const updatedCases = cases.map(c => c._id === caseId ? response.data : c);
      setCases(updatedCases);
      return response.data;
    } catch (error) {
      console.error('Failed to update procedure status:', error);
      throw error;
    }
  }, [cases, activeCase]);

  const getProcedureGuide = useCallback(async (caseId, procedureId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/cases/${caseId}/procedures/${procedureId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch procedure guide:', error);
      throw error;
    }
  }, []);

  const getCaseWithGuides = useCallback(async (caseId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/cases/${caseId}/with-guides`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch case with guides:', error);
      throw error;
    }
  }, []);

  return (
    <CaseContext.Provider value={{
      cases,
      activeCase,
      loading,
      fetchCases,
      createCase,
      setActiveCase,
      updateProcedureStatus,
      getProcedureGuide,
      getCaseWithGuides
    }}>
      {children}
    </CaseContext.Provider>
  );
}
