// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
      &copy; {new Date().getFullYear()} Chuyện nhảm nhí của tui.
    </footer>
  );
};

export default Footer;