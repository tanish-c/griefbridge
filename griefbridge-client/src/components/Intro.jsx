import React, { useEffect, useState } from 'react';
import './Intro.css';

const Intro = ({ onDone }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const key = 'griefbridge_intro_shown_v1';
    const shown = localStorage.getItem(key);
    if (shown) {
      onDone && onDone();
      return;
    }

    // show intro
    setVisible(true);

    // total visible time before starting fade-out (ms)
    const showDuration = 2200;
    const fadeDuration = 400;

    const timer = setTimeout(() => {
      setVisible(false);
      localStorage.setItem(key, '1');
      // call onDone after fade completes
      setTimeout(() => {
        onDone && onDone();
      }, fadeDuration);
    }, showDuration);

    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="intro-overlay">
      <div className="intro-content">
        <div className="intro-brand">
          <img src="/logo.png" alt="GriefBridge" className="intro-logo-img" />
          <div className="intro-title">GriefBridge</div>
        </div>
        <div className="intro-tag">Guidance through difficult times</div>
        <div className="intro-loader">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Intro;
