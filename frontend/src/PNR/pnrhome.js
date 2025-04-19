import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faX } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "./pnrstatus.css";

const PNRStatusHome = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [pnr, setPnr] = useState("");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

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

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      setPnr(value);
    }
  };

  const handleSearch = async () => {
    setError("");
    setBooking(null);

    if (pnr.length !== 10) {
      setError("PNR number must be exactly 10 digits");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/pnr-status/${pnr}`);
      const data = await response.json();

      if (response.ok) {
        setBooking(data);
      } else {
        setError(data.message || "No booking found");
      }
    } catch (err) {
      setError("Error fetching data. Please try again.");
    }
  };

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
            <Link to="/pnr" className="navbar-link">PNR Status</Link>
          </li>
          <li>
            <Link to="/timetable" className="navbar-link">Train Schedule</Link>
          </li>
        </ul>
      </nav>

      <div className="pnr-container">
        <h2 className="pnr-heading">PNR Status</h2>
        <input
          type="number"
          placeholder="Enter 10-digit PNR"
          value={pnr}
          onChange={handleInputChange}
          className="pnr-input"
        />
        <button
          onClick={handleSearch}
          className="pnr-button"

        >
          Search
        </button>

        {error && <p className="pnr-error">{error}</p>}

        {booking && (
          <div className="pnr-result-box">
            <h3 className="pnr-sub-heading">Train Details</h3>
            <table>
              <tbody>
                <tr>
                  <td><strong>Train Number:</strong></td>
                  <td>{booking.trainNumber}</td>
                </tr>
                <tr>
                  <td><strong>Train Name:</strong></td>
                  <td>{booking.trainName}</td>
                </tr>
                <tr>
                  <td><strong>Source:</strong></td>
                  <td>{booking.source} {booking.journeyDate} ({booking.sourceDeparture})</td>
                </tr>
                <tr>
                  <td><strong>Destination:</strong></td>
                  <td>{booking.destination} {booking.formattedArrivalDate} ({booking.destinationArrival})</td>
                </tr>
                <tr>
                  <td><strong>Journey Date:</strong></td>
                  <td>{booking.journeyDate}</td>
                </tr>
                <tr>
                  <td><strong>Class:</strong></td>
                  <td>{booking.selectedClass}</td>
                </tr>
                <tr>
                  <td><strong>Quota:</strong></td>
                  <td>{booking.quota}</td>
                </tr>
              </tbody>
            </table>

            <h3 className="pnr-sub-heading">Passengers</h3>
            <table>
              <tbody>
                {booking.passengers.map((_, index) => (
                  <tr key={index}>
                    <td><strong>P{index + 1}:</strong></td>
                    <td>{booking.passengers[index].seatNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p><strong>Status:</strong> {booking.status}</p>
            <p><strong>Total Fare:</strong> {booking.totalFare}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default PNRStatusHome;
