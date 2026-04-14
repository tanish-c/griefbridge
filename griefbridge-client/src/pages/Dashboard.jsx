import React, { useEffect } from 'react';
import IntakeWizard from '../components/intake/IntakeWizard';
import DependencyGraph from '../components/graph/DependencyGraph';
import { useCase } from '../hooks/useCase';
import { useAuth } from '../hooks/useAuth';
import './Dashboard.css';

export default function Dashboard() {
  const { cases, activeCase, setActiveCase, fetchCases, loading } = useCase();
  const { user } = useAuth();

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  useEffect(() => {
    if (cases.length > 0 && !activeCase) {
      setActiveCase(cases[0]);
    }
  }, [cases, activeCase, setActiveCase]);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (cases.length === 0) {
    return <IntakeWizard />;
  }

  if (activeCase && !activeCase.procedures?.length) {
    return <IntakeWizard />;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <div className="navbar-brand">
          <h2>GriefBridge</h2>
        </div>
        <div className="navbar-right">
          <div className="case-selector">
            <select onChange={(e) => setActiveCase(cases.find(c => c._id === e.target.value))} value={activeCase?._id || ''} className="form-control">
              {cases.map(c => (
                <option key={c._id} value={c._id}>
                  {c.deceased.name} ({c.caseId})
                </option>
              ))}
            </select>
          </div>
          <span className="user-name">{user?.fullName || user?.email}</span>
        </div>
      </header>
      <main className="dashboard-main">
        <DependencyGraph />
      </main>
    </div>
  );
}
