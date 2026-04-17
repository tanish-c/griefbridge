import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <motion.div className="hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <img src="/logo.png" alt="GriefBridge" className="hero-logo" />
          <h1>GriefBridge</h1>
          <p className="subtitle">Intelligent Post-Bereavement Workflow & Document Management</p>
          <p className="description">
            Navigate the bureaucratic maze following a death with a single, personalized platform. From death certificates to EPF claims to property mutation - all in one place.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Start Your Case Free
          </button>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="problem">
        <div className="container">
          <h2>The Problem: A Bureaucratic Maze</h2>
          <div className="problem-grid">
            {[
              { title: 'Death Certificate', dept: 'Municipal Corporation' },
              { title: 'Bank Accounts', dept: 'Every bank you used' },
              { title: 'EPF Claim', dept: 'EPFO' },
              { title: 'Insurance', dept: 'Insurance Company' },
              { title: 'Property', dept: 'Revenue Department' },
              { title: 'Pension', dept: 'Treasury' },
              { title: 'IT Return', dept: 'Income Tax Dept' },
              { title: 'Utilities', dept: 'LPG, Water, Electricity' },
              { title: 'Vehicle RC', dept: 'RTO' },
              { title: 'Mutual Funds', dept: 'Fund House' }
            ].map((item, i) => (
              <motion.div key={i} className="problem-card" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="problem-card-title">{item.title}</div>
                <div className="problem-card-dept">{item.dept}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How GriefBridge Works</h2>
          <div className="steps">
            {[
              { num: 1, title: 'Answer Questions', desc: 'Tell us about the deceased' },
              { num: 2, title: 'Get Your Workflow', desc: 'Personalized procedure list generated' },
              { num: 3, title: 'Upload Documents', desc: 'Central vault for all your files' },
              { num: 4, title: 'Track Progress', desc: 'Visual graph shows dependencies' }
            ].map((step) => (
              <motion.div key={step.num} className="step" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}>
                <div className="step-number">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2>From Families Who've Been Through It</h2>
          <div className="testimonials-grid">
            {[
              { text: 'This platform saved us months of confusion. We knew exactly what to do next.', author: 'Priya K., Delhi', hospital: 'Used for: Loss of spouse' },
              { text: 'The document vault alone was worth its weight in gold. Never lost track of anything.', author: 'Rajesh M., Mumbai', hospital: 'Used for: Loss of parent' },
              { text: 'Went from feeling helpless to completing 8 procedures in 3 months with this guidance.', author: 'Ananya S., Bangalore', hospital: 'Used for: Loss of parent' }
            ].map((testi, i) => (
              <motion.div key={i} className="testimonial-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
                <p className="testimonial-text">"{testi.text}"</p>
                <div className="testimonial-author">{testi.author}</div>
                <div className="testimonial-use">{testi.hospital}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to Take Control?</h2>
        <p>Start a free case today. No credit card required.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
          Create Your Case
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 GriefBridge. A project for ITTC 601 - Web Technology.</p>
        </div>
      </footer>
    </div>
  );
}
