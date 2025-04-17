import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "./allbookings.css";

const TrainBookings = () => {
  const [trainNumber, setTrainNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const calendarRef = useRef(null);

  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() - 5);
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 60);

  const formatDate = (date) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-GB", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!/^\d{5}$/.test(trainNumber)) {
      setError("Train number must be exactly 5 digits.");
      return;
    }

    try {

      const response = await fetch(
        `https://railway-reservation-backend-ekallwin.vercel.app/api/bookings/${trainNumber}?date=${formatDate(selectedDate)}`
      );
      const data = await response.json();


      if (response.ok) {
        setBookings(data.bookings);
        setError("");
      } else {
        setBookings(null);
        setError(data.message || "No bookings found.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Error fetching booking details. Try again.");
    }
  };

  return (
    <>
      <div className="container">
        <h2>Train Booking Details</h2>
        <form onSubmit={handleSubmit}>
          <label>Train Number</label>
          <input
            type="text"
            className="input-box"
            value={trainNumber}
            onChange={(e) => setTrainNumber(e.target.value)}
            placeholder="Enter 5-digit train number"
            maxLength={5}
          />

          <label>Date</label>
          <div className="calendar-container">
            <input
              type="text"
              value={formatDate(selectedDate)}
              readOnly
              onClick={() => setIsOpen(!isOpen)}
              className="date-input"
            />
            {isOpen && (
              <div className="calendar-popup" ref={calendarRef}>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date >= minDate && date <= maxDate) {
                      setSelectedDate(date);
                    }
                    setIsOpen(false);
                  }}
                  fromDate={minDate}
                  toDate={maxDate}
                  disabled={{ before: minDate, after: maxDate }}
                />
              </div>
            )}
          </div>

          <button type="submit" className="search-button">Search</button>
          {error && <p className="error-message">{error}</p>}
        </form>

        {bookings && (
          <div className="booking-results">
            <h3>Booking Details</h3>
            {bookings.map((booking, index) => (
              <div key={index} className="booking-card">
                <table>
                  <tbody>
                    <tr><td><strong>PNR:</strong></td><td>{booking.pnrNumber}</td></tr>
                    <tr><td><strong>Train Name:</strong></td><td>{booking.trainName}</td></tr>
                    <tr><td><strong>Class:</strong></td><td>{booking.selectedClass}</td></tr>
                    <tr><td><strong>Quota:</strong></td><td>{booking.quota}</td></tr>
                    <tr><td><strong>Source:</strong></td><td>{booking.source} {booking.journeyDate} ({booking.sourceDeparture})</td></tr>
                    <tr><td><strong>Destination:</strong></td><td>{booking.destination} {booking.formattedArrivalDate} ({booking.destinationArrival})</td></tr>
                    <tr><td><strong>Duration:</strong></td><td>{booking.duration}</td></tr>
                    <tr><td><strong>Total Fare:</strong></td><td>₹{booking.totalFare}</td></tr>
                  </tbody>
                </table>
                <h4>Passengers:</h4>
                <ul>
                  {booking.passengers.map((passenger, i) => (
                    <li key={i}>
                      {passenger.name} (Age: {passenger.age}, Gender: {passenger.gender}) - Seat: {passenger.seatNumber}
                    </li>
                  ))}
                </ul>
                <hr />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TrainBookings;
