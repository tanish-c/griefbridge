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
  const [showHelp, setShowHelp] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedNode(null);
        setShowHelp(false);
        setShowTutorial(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        <div className="header-left">
          <h1>Workflow Dashboard</h1>
          <button 
            className="help-button"
            onClick={() => setShowHelp(true)}
            aria-label="Show help and instructions"
            title="How to use the workflow dashboard"
          >
            ?
          </button>
        </div>
        <div className="completion-badge">
          <div className="completion-percent">{completionPercent}%</div>
          <p>{tasksCompleted} of {nodes.length} tasks complete</p>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <motion.div 
          className="modal-overlay"
          onClick={() => setShowHelp(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="help-modal"
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="modal-header">
              <h2>How to Use the Workflow Dashboard</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowHelp(false)}
                aria-label="Close help"
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="help-section">
                <h3>Visual Guide</h3>
                <p>The diagram shows your tasks as connected circles (nodes). The lines show which tasks need to be done before others.</p>
                <ul className="help-list">
                  <li><span className="node-color pending"></span> <strong>Gray</strong> - Task you can't start yet (dependencies pending)</li>
                  <li><span className="node-color ready"></span> <strong>Blue</strong> - Ready to start now</li>
                  <li><span className="node-color in-progress"></span> <strong>Orange</strong> - Currently working on it</li>
                  <li><span className="node-color completed"></span> <strong>Green</strong> - All done</li>
                </ul>
              </div>

              <div className="help-section">
                <h3>How to Interact</h3>
                <ol className="help-steps">
                  <li><strong>Click any task</strong> to see its details and step-by-step instructions</li>
                  <li><strong>Mark Complete</strong> button shows once a task is ready (dependencies done)</li>
                  <li><strong>View Instructions</strong> - Each task has specific guidance and required documents</li>
                  <li><strong>Contact Info</strong> - Government department phone numbers and websites included</li>
                </ol>
              </div>

              <div className="help-section">
                <h3>Keyboard Shortcuts</h3>
                <ul className="shortcut-list">
                  <li><kbd>Esc</kbd> - Close task details panel</li>
                  <li><kbd>Tab</kbd> - Navigate through all elements</li>
                  <li><kbd>Enter</kbd> - Open task or trigger button</li>
                </ul>
              </div>

              <div className="help-section">
                <h3>Tips for Success</h3>
                <ul className="tips-list">
                  <li>Start with tasks that don't have dependencies</li>
                  <li>Read the "Tips & Advice" section - it often saves time</li>
                  <li>Keep required documents ready before you start</li>
                  <li>Check the processing times to plan ahead</li>
                  <li>Use the government links on the home page for official portals</li>
                </ul>
              </div>

              <div className="help-section">
                <h3>Need More Help?</h3>
                <p>Each task has complete instructions tailored to your specific situation. If you're unsure about anything, click the task to read the detailed guide.</p>
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => setShowHelp(false)}
              >
                I Understand - Let's Go!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Tutorial for First-Time Users */}
      {showTutorial && !showHelp && (
        <motion.div 
          className="modal-overlay"
          onClick={() => setShowTutorial(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="tutorial-modal"
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="tutorial-content">
              <h2>Welcome to Your Task Dashboard!</h2>
              <p className="tutorial-intro">
                This visual map shows all the government procedures you need to complete. Below are some quick tips to get started:
              </p>
              <div className="tutorial-steps">
                <div className="tutorial-step">
                  <span className="step-number">1</span>
                  <div>
                    <h4>Click on any circle</h4>
                    <p>See what it is and get step-by-step instructions</p>
                  </div>
                </div>
                <div className="tutorial-step">
                  <span className="step-number">2</span>
                  <div>
                    <h4>Follow the connections</h4>
                    <p>Lines show which tasks must be completed first</p>
                  </div>
                </div>
                <div className="tutorial-step">
                  <span className="step-number">3</span>
                  <div>
                    <h4>Mark tasks complete</h4>
                    <p>Green circles mean you're done, blue means you're ready to start</p>
                  </div>
                </div>
              </div>
              <div className="tutorial-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowTutorial(false)}
                >
                  Start Exploring
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowTutorial(false);
                    setShowHelp(true);
                  }}
                >
                  More Details
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Graph with Better Accessibility */}
        <div className="graph-container">
          <div className="graph-wrapper" style={{ height: '600px' }} ref={containerRef} />
          <div className="graph-legend" role="region" aria-label="Task status color legend">
            <h3>Task Status Legend</h3>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-color pending"></span>
                <span>Can't Start Yet</span>
              </div>
              <div className="legend-item">
                <span className="legend-color ready"></span>
                <span>Ready to Start</span>
              </div>
              <div className="legend-item">
                <span className="legend-color in-progress"></span>
                <span>In Progress</span>
              </div>
              <div className="legend-item">
                <span className="legend-color completed"></span>
                <span>Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Text Alternative for Screen Readers */}
        <div className="sr-only" role="region" aria-label="Task list">
          <h3>All Tasks Overview</h3>
          {nodes.length > 0 ? (
            <ul>
              {nodes.map(node => (
                <li key={node.id}>
                  {node.title} - {node.status} - {node.department}
                </li>
              ))}
            </ul>
          ) : (
            <p>No tasks available</p>
          )}
        </div>

        {/* Side Panel */}
        {selectedNode && (
          <motion.div
            className="side-panel"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="region"
            aria-label={`Details for ${selectedNode.title}`}
          >
            <div className="side-panel-content">
              {/* Header */}
              <div className="panel-header">
                <h3>{selectedNode.title}</h3>
                <button 
                  className="close-btn" 
                  onClick={() => setSelectedNode(null)}
                  aria-label="Close task details"
                  title="Press Escape to close"
                >
                  ×
                </button>
              </div>

              {/* Basic Info */}
              <div className="panel-section">
                <p className="dept-label"><strong>Department:</strong> {selectedNode.department}</p>
                <p className="status-label">
                  <strong>Status:</strong> <span className={`status-${selectedNode.status.toLowerCase()}`}>{selectedNode.status}</span>
                </p>
              </div>

              {/* Mark as Complete Button */}
              <div className="action-buttons">
                {selectedNode.status !== 'COMPLETED' && (
                  <button 
                    onClick={handleCompleteTask} 
                    className="btn btn-success"
                    aria-label={`Mark ${selectedNode.title} as complete`}
                  >
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
                        <a href={procedureGuide.website} target="_blank" rel="noopener noreferrer" aria-label={`Visit the official website for ${selectedNode.title}`}>
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
