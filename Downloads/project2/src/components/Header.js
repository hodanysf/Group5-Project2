import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="container">
      <div className="logo">
          <Link to="/">
            <img src="/images/logo.jpg" alt="Bike Theft Analysis Logo" className="logoImage" />
          </Link>
        </div>
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
        <div className="searchBar">
          <input type="text" placeholder="Search..." className="searchInput" />
          <button className="searchButton">Go</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
