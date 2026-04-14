import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCase } from '../../hooks/useCase';
import '../../pages/Dashboard.css';

export default function IntakeWizard() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { createCase } = useCase();
  const [deceased, setDeceased] = useState({
    name: '',
    dateOfDeath: '',
    state: 'Delhi'
  });
  const [intakeAnswers, setIntakeAnswers] = useState({
    is_govt_employee: false,
    has_epf: false,
    has_property: false,
    has_insurance: false,
    has_pension: false,
    has_post_office: false,
    has_vehicle: false,
    is_taxpayer: false,
    has_mutual_funds: false,
    has_loans: false
  });

  const questions = [
    { key: 'name', label: 'Full name of the deceased', type: 'text', required: true },
    { key: 'dateOfDeath', label: 'Date of death', type: 'date', required: true },
    { key: 'state', label: 'State of residence', type: 'select', required: true, options: ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh'] },
    { key: 'is_govt_employee', label: 'Was the deceased a government employee?', type: 'radio' },
    { key: 'has_epf', label: 'Did they have an active EPF account?', type: 'radio' },
    { key: 'has_property', label: 'Did they own immovable property?', type: 'radio' },
    { key: 'has_insurance', label: 'Did they have a life insurance policy?', type: 'radio' },
    { key: 'has_pension', label: 'Were they receiving a pension?', type: 'radio' },
    { key: 'has_post_office', label: 'Did they have Post Office savings (NSC/KVP)?', type: 'radio' },
    { key: 'has_vehicle', label: 'Did they own a vehicle?', type: 'radio' },
    { key: 'is_taxpayer', label: 'Were they an income taxpayer?', type: 'radio' },
    { key: 'has_mutual_funds', label: 'Did they have mutual fund investments?', type: 'radio' },
    { key: 'has_loans', label: 'Did they have outstanding loans or credit cards?', type: 'radio' }
  ];

  const currentQuestion = questions[step];
  const isPersonalInfo = step < 3;

  const handleNext = () => {
    if (isPersonalInfo && !deceased[currentQuestion.key]) {
      alert('This field is required');
      return;
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(Math.max(0, step - 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createCase({
        deceased,
        intakeAnswers
      });
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to create case: ' + error.message);
      setLoading(false);
    }
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setDeceased({ ...deceased, [name]: value });
  };

  const handleQuestionChange = (e) => {
    const { checked } = e.target;
    setIntakeAnswers({ ...intakeAnswers, [currentQuestion.key]: checked });
  };

  return (
    <div className="intake-wizard">
      <div className="intake-container">
        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / questions.length) * 100}%` }}></div>
          </div>
          <p className="progress-text">Step {step + 1} of {questions.length}</p>
        </div>

        {/* Question */}
        <motion.div className="question-wrapper" key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <h2>{currentQuestion.label}</h2>

          {currentQuestion.type === 'text' && (
            <input
              type="text"
              name={currentQuestion.key}
              value={deceased.name || ''}
              onChange={handlePersonalInfoChange}
              placeholder="Enter name"
              className="form-control"
              autoFocus
            />
          )}

          {currentQuestion.type === 'date' && (
            <input
              type="date"
              name={currentQuestion.key}
              value={deceased.dateOfDeath || ''}
              onChange={handlePersonalInfoChange}
              className="form-control"
              autoFocus
            />
          )}

          {currentQuestion.type === 'select' && (
            <select
              name={currentQuestion.key}
              value={deceased.state || 'Delhi'}
              onChange={handlePersonalInfoChange}
              className="form-control"
            >
              {currentQuestion.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {currentQuestion.type === 'radio' && (
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="checkbox"
                  checked={intakeAnswers[currentQuestion.key] || false}
                  onChange={handleQuestionChange}
                />
                <span>Yes</span>
              </label>
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="intake-nav">
          <button onClick={handlePrev} disabled={step === 0} className="btn btn-secondary">
            Previous
          </button>
          {step < questions.length - 1 && (
            <button onClick={handleNext} className="btn btn-primary">
              Next
            </button>
          )}
          {step === questions.length - 1 && (
            <button onClick={handleSubmit} disabled={loading} className="btn btn-success">
              {loading ? 'Creating case...' : 'Create Case'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
