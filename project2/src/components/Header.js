import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <ul className="navList">
            <li>
              <Link to="/" className="navLink">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="navLink">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/predict" className="navLink">
                Bike Recovery Prediction
              </Link>
            </li>
            <li>
              <Link to="/model-performance" className="navLink">
                Model Performance
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
