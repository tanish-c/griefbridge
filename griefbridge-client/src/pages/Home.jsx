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

      {/* FAQ Section */}
      <section className="faq">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {[
              {
                question: 'What happens after someone passes away?',
                answer: 'After a death, you need to notify several government agencies and financial institutions. GriefBridge identifies all the procedures specific to your situation and guides you through each one.'
              },
              {
                question: 'How long does the entire process take?',
                answer: 'The time varies depending on the deceased\'s assets and your location. Typically, completing all procedures takes 3-6 months. GriefBridge shows estimated timelines for each task.'
              },
              {
                question: 'Do I need all the documents mentioned?',
                answer: 'Not necessarily. GriefBridge analyzes your situation and tells you exactly which documents are required vs optional. This saves you time and hassle.'
              },
              {
                question: 'What if I don\'t know which department to approach?',
                answer: 'That\'s where GriefBridge helps! Each procedure shows the exact department, office location, contact info, and step-by-step instructions.'
              },
              {
                question: 'Can I track multiple cases at once?',
                answer: 'Yes! You can create separate cases for different family members. GriefBridge tracks each case independently.'
              },
              {
                question: 'Is my information secure?',
                answer: 'Your documents and case information are encrypted and stored securely on our platform. We never share your data with third parties.'
              },
              {
                question: 'What if I miss a deadline?',
                answer: 'GriefBridge sends you timely reminders for important deadlines. You can also check your dashboard anytime to see upcoming tasks.'
              },
              {
                question: 'Do I need to know about legal procedures?',
                answer: 'No expertise needed! GriefBridge explains everything in simple language. Each procedure includes what it is, why it matters, and how to do it.'
              }
            ].map((faq, i) => (
              <motion.div key={i} className="faq-item" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <details className="faq-details">
                  <summary className="faq-question">{faq.question}</summary>
                  <p className="faq-answer">{faq.answer}</p>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Support Links */}
      <section className="government-links">
        <div className="container">
          <h2>Quick Access to Government Services</h2>
          <p className="section-subtitle">Direct links to key government portals and services</p>
          <div className="links-grid">
            {[
              {
                title: 'National Portal of India',
                description: 'Central gateway for all Indian government services',
                url: 'https://www.india.gov.in',
                icon: '🏛️',
                category: 'General'
              },
              {
                title: 'Death Certificate (Municipal)',
                description: 'Get death certificate from your local municipal corporation',
                url: 'https://igrsup.gov.in',
                icon: '📋',
                category: 'Documents'
              },
              {
                title: 'EPFO - EPF Claim',
                description: 'Claim Employee Provident Fund for deceased employee',
                url: 'https://www.epfindia.gov.in',
                icon: '💼',
                category: 'Finance'
              },
              {
                title: 'Income Tax Department',
                description: 'File final return and settle taxes for deceased',
                url: 'https://www.incometaxindia.gov.in',
                icon: '💰',
                category: 'Taxes'
              },
              {
                title: 'RTO - Vehicle Registration',
                description: 'Transfer or cancel vehicle registration',
                url: 'https://sarathi.parivahan.gov.in',
                icon: '🚗',
                category: 'Vehicles'
              },
              {
                title: 'Property Registration',
                description: 'Mutate property or transfer ownership',
                url: 'https://igrsup.gov.in',
                icon: '🏠',
                category: 'Property'
              },
              {
                title: 'LIC - Insurance Claims',
                description: 'Claim life insurance benefits from LIC',
                url: 'https://www.licindia.in',
                icon: '🛡️',
                category: 'Insurance'
              },
              {
                title: 'Banking Ombudsman',
                description: 'Resolve disputes with banks for deceased accounts',
                url: 'https://www.rbi.org.in/Scripts/BankingOmbudsman.aspx',
                icon: '🏦',
                category: 'Banking'
              },
              {
                title: 'Pension Portal',
                description: 'Handle pension claims and survivor benefits',
                url: 'https://pensioners.gov.in',
                icon: '📊',
                category: 'Retirement'
              },
              {
                title: 'GST - HSN Codes',
                description: 'Information on GST for business succession',
                url: 'https://www.gst.gov.in',
                icon: '📱',
                category: 'Business'
              },
              {
                title: 'Passport Verification',
                description: 'Verify and potentially recover passport benefits',
                url: 'https://passportindia.gov.in',
                icon: '✈️',
                category: 'Documents'
              },
              {
                title: 'Voter Registration',
                description: 'Update voter registration records',
                url: 'https://eci.gov.in',
                icon: '🗳️',
                category: 'Civic'
              }
            ].map((link, i) => (
              <motion.a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="gov-link-card"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="link-icon">{link.icon}</div>
                <div className="link-content">
                  <h3>{link.title}</h3>
                  <p>{link.description}</p>
                  <span className="link-category">{link.category}</span>
                </div>
                <span className="link-arrow">→</span>
              </motion.a>
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
