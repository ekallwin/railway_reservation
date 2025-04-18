import React from "react";
import './Home.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Train Booking. All Rights Reserved.</p>
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
          <a href="/tte">TTE Portal</a>
          <a href="/admin">Admin Portal</a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
