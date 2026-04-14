import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGraph } from '../../hooks/useGraph';
import { useCase } from '../../hooks/useCase';
import '../../pages/Dashboard.css';

export default function DependencyGraph() {
  const containerRef = useRef(null);
  const { activeCase, updateProcedureStatus, getProcedureGuide } = useCase();
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeStates, setNodeStates] = useState({});
  const [procedureGuide, setProcedureGuide] = useState(null);
  const [loadingGuide, setLoadingGuide] = useState(false);

  useEffect(() => {
    if (activeCase?.procedures) {
      const states = {};
      activeCase.procedures.forEach(p => {
        states[p.procedureId] = { status: p.status, title: p.title, department: p.department };
      });
      setNodeStates(states);
    }
  }, [activeCase]);

  useEffect(() => {
    if (selectedNode && activeCase) {
      loadProcedureGuide();
    }
  }, [selectedNode, activeCase]);

  const loadProcedureGuide = async () => {
    if (!selectedNode || !activeCase) return;
    
    setLoadingGuide(true);
    try {
      const data = await getProcedureGuide(activeCase._id, selectedNode.id);
      setProcedureGuide(data.guide);
    } catch (error) {
      console.error('Error loading procedure guide:', error);
    } finally {
      setLoadingGuide(false);
    }
  };

  const nodes = activeCase?.procedures.map(p => ({
    id: p.procedureId,
    title: p.title,
    status: p.status,
    department: p.department
  })) || [];

  const edges = activeCase?.procedures
    .flatMap(p => p.dependencies?.map(dep => ({ source: dep, target: p.procedureId })) || []) || [];

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleCompleteTask = async () => {
    if (selectedNode && activeCase) {
      await updateProcedureStatus(activeCase._id, selectedNode.id, 'COMPLETED');
      setSelectedNode(null);
    }
  };

  const tasksCompleted = nodes.filter(n => nodeStates[n.id]?.status === 'COMPLETED').length;
  const completionPercent = nodes.length > 0 ? Math.round((tasksCompleted / nodes.length) * 100) : 0;

  useGraph(containerRef, nodes, edges, handleNodeClick);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Workflow Dashboard</h1>
        <div className="completion-badge">
          <div className="completion-percent">{completionPercent}%</div>
          <p>{tasksCompleted} of {nodes.length} tasks complete</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Graph */}
        <div className="graph-wrapper" style={{ height: '600px' }} ref={containerRef} />

        {/* Side Panel */}
        {selectedNode && (
          <motion.div
            className="side-panel"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="side-panel-content">
              {/* Header */}
              <div className="panel-header">
                <h3>{selectedNode.title}</h3>
                <button 
                  className="close-btn" 
                  onClick={() => setSelectedNode(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Basic Info */}
              <div className="panel-section">
                <p className="dept-label">{selectedNode.department}</p>
                <p className="status-label">
                  Status: <span className={`status-${selectedNode.status.toLowerCase()}`}>{selectedNode.status}</span>
                </p>
              </div>

              {/* Mark as Complete Button */}
              <div className="action-buttons">
                {selectedNode.status !== 'COMPLETED' && (
                  <button onClick={handleCompleteTask} className="btn btn-success">
                    Mark Complete
                  </button>
                )}
              </div>

              {/* Detailed Guide Section */}
              {loadingGuide && (
                <div className="panel-section loading">
                  <p>Loading procedure details...</p>
                </div>
              )}

              {procedureGuide && !loadingGuide && (
                <div className="guide-section">
                  {/* Summary */}
                  {procedureGuide.summary && (
                    <div className="guide-card">
                      <h4>Overview</h4>
                      <p>{procedureGuide.summary}</p>
                    </div>
                  )}

                  {/* What is it */}
                  {procedureGuide.what && (
                    <div className="guide-card">
                      <h4>What is it?</h4>
                      <p>{procedureGuide.what}</p>
                    </div>
                  )}

                  {/* Where to get it done */}
                  {procedureGuide.where && (
                    <div className="guide-card">
                      <h4>Where?</h4>
                      <p>{procedureGuide.where}</p>
                    </div>
                  )}

                  {/* How to do it */}
                  {procedureGuide.how && (
                    <div className="guide-card">
                      <h4>How?</h4>
                      <ol className="steps-list">
                        {procedureGuide.how.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Processing Time and Cost */}
                  {(procedureGuide.processingTime || procedureGuide.cost) && (
                    <div className="guide-card">
                      <h4>Details</h4>
                      <div className="details-grid">
                        {procedureGuide.processingTime && (
                          <div className="detail-item">
                            <span className="label">Processing Time:</span>
                            <span className="value">{procedureGuide.processingTime}</span>
                          </div>
                        )}
                        {procedureGuide.cost && (
                          <div className="detail-item">
                            <span className="label">Cost:</span>
                            <span className="value">{procedureGuide.cost}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Required Documents */}
                  {procedureGuide.documents && (
                    <div className="guide-card">
                      <h4>Required Documents</h4>
                      {procedureGuide.documents.always && (
                        <div>
                          <p className="doc-category">Always Required:</p>
                          <ul className="doc-list">
                            {procedureGuide.documents.always.map((doc, index) => (
                              <li key={index}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {procedureGuide.documents.sometimes && (
                        <div className="mt-3">
                          <p className="doc-category">Sometimes Required:</p>
                          <ul className="doc-list">
                            {procedureGuide.documents.sometimes.map((doc, index) => (
                              <li key={index}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legal Importance */}
                  {procedureGuide.legalImportance && (
                    <div className="guide-card legal-importance">
                      <h4>Legal Importance</h4>
                      <p>{procedureGuide.legalImportance}</p>
                    </div>
                  )}

                  {/* Challenges */}
                  {procedureGuide.challenges && (
                    <div className="guide-card challenges">
                      <h4>Common Challenges</h4>
                      <p>{procedureGuide.challenges}</p>
                    </div>
                  )}

                  {/* Tips */}
                  {procedureGuide.tips && (
                    <div className="guide-card tips">
                      <h4>Tips & Advice</h4>
                      <p>{procedureGuide.tips}</p>
                    </div>
                  )}

                  {/* References */}
                  <div className="guide-card references">
                    <h4>References</h4>
                    {procedureGuide.website && (
                      <p>
                        <strong>Official Website:</strong>{' '}
                        <a href={procedureGuide.website} target="_blank" rel="noopener noreferrer">
                          {procedureGuide.website}
                        </a>
                      </p>
                    )}
                    {procedureGuide.contacts && procedureGuide.contacts.length > 0 && (
                      <div>
                        <strong>Contact Information:</strong>
                        <ul className="contacts-list">
                          {procedureGuide.contacts.map((contact, index) => (
                            <li key={index}>{contact}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
