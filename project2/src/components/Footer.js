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
        </p>
      </div>
    </footer>
  );
};

export default Footer;
