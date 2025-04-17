import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faX, faTrain } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import './Home.css';
import Footer from './Footer';

const HomePage = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  useEffect(() => {
    const closeMenu = (e) => {
      if (isOpen && !e.target.closest(".navbar")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", closeMenu);
    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [isOpen]);


  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">Train Booking</div>
        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? (
            <FontAwesomeIcon icon={faX} className="menu-icon-close" size="2xl" />
          ) : (
            <FontAwesomeIcon icon={faBars} className="menu-icon-bars" size="2xl" />
          )}
        </div>
        <ul className={`navbar-links ${isOpen ? "open" : ""}`}>
          <li>
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          <li>
            <Link to="/login" className="navbar-link">Book Ticket</Link>
          </li>
          <li>
            <Link to="/pnr" className="navbar-link">PNR Status</Link>
          </li>
        </ul>
      </nav>

      <div className="home-container">
        <FontAwesomeIcon icon={faTrain} size="3x" style={{ marginBottom: "10px" }} />
        <h1 className="home-title">Welcome to Railway Reservation</h1>
        <p className="home-text">Book your train tickets easily and conveniently</p>
        <button className="home-button" onClick={() => navigate("/login")}>Book Now</button>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
