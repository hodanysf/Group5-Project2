import React from "react";
import "./Footer.css";

const Footer = () => {
  const currentYear = 2024;

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="copyright">
          {currentYear} Data Modeling Project. COMP 309-403.
        </p>
        <p className="additional-text">
          Created by Group 5 - Bicycle Theft Analysis
        </p><p className="contact">
          Contact us at: <a href="mailto:group5@centennialcollege.ca">group5@centennialcollege.ca</a>
        </p>
        <div className="social-links">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a> |
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"> LinkedIn</a> |
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"> GitHub</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
