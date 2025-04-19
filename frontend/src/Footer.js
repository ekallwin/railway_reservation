import React from "react";
import { Link } from "react-router-dom";
import './Home.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Railway Reservation</p>
        <p className="footer-credit">
          Created, Developed, and Maintained by{" "}
          <a
            href="https://www.linkedin.com/in/ekallwin/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Allwin E K
          </a>
        </p>
        <div style={{ display: 'flex', gap: '20px' }} className="other-link">
          <Link to="/tte">TTE Portal</Link> 
          <Link to="/admin">Admin Portal</Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
