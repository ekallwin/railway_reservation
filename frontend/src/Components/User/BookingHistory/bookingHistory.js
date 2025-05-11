import React, { useState, useEffect, useCallback } from "react";
import './bookinghistory.css';
import Navbar from "../Navbar/navbar";
import moment from "moment-timezone";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Print from '../printTemplate';
import html2pdf from "html2pdf.js";
import { useNavigate } from "react-router-dom";

const BookingHistory = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const getISTTime = () => {
        return moment().tz("Asia/Kolkata").toDate();
    };

    const fetchBookings = useCallback(async () => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userPhone = storedUser?.phone;

        if (!userPhone) {
            navigate("/")
            toast.error("Unauthorized access");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/user-bookings`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "user-phone": userPhone
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to fetch bookings");
            setBookings((data.bookings || []).reverse());
        } catch (err) {
            setError("No Bookings");
        } finally {
            setLoading(false);
        }
    }, [apiUrl, navigate]);


    const updateBookingStatus = useCallback(() => {
        setBookings(prevBookings => {
            const now = getISTTime();
            return prevBookings.map(booking => {
                const departureDateStr = booking.formattedArrivalDate;
                const departureTimeStr = booking.destinationArrival;
                const [hours, minutes] = departureTimeStr.split(":").map(Number);
                const arrivalDateTime = new Date(departureDateStr);
                arrivalDateTime.setHours(hours, minutes, 0, 0);

                let updatedStatus = booking.status;
                if (booking.status !== "Cancelled") {
                    updatedStatus = now >= arrivalDateTime ? "Completed" : "Booked";
                }

                return { ...booking, status: updatedStatus };
            });
        });
    }, []);

    useEffect(() => {
        updateBookingStatus();

        const intervalId = setInterval(updateBookingStatus, 1 * 100);

        return () => clearInterval(intervalId);
    }, [updateBookingStatus]);


    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleCancelBooking = async (pnr) => {
        confirmAlert({
            title: "Confirm Cancellation",
            message: "Are you sure you want to cancel this booking?",
            buttons: [
                {
                    label: "Yes",
                    onClick: async () => {
                        try {
                            const response = await fetch(`${apiUrl}/cancel-ticket`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ pnrNumber: pnr })
                            });

                            const data = await response.json();
                            if (!response.ok) throw new Error(data.message || "Cancellation failed");

                            toast.success("Ticket cancelled successfully!");
                            fetchBookings();
                        } catch (err) {
                            toast.error("Error cancelling booking. Please try again.");
                        }
                    }
                },
                {
                    label: "No",
                }
            ]
        });
    };

    const printTicket = (booking) => {
        const printWindow = window.open("", "_blank");
        const printContent = Print(booking);
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
    };
    const downloadTicket = (booking) => {
        const ticketHTML = Print(booking);

        const opt = {
            margin: 0.5,
            filename: `Ticket_${booking.pnrNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        const container = document.createElement("div");
        container.innerHTML = ticketHTML;
        document.body.appendChild(container); // Add to DOM temporarily for rendering

        html2pdf().set(opt).from(container).save().then(() => {
            document.body.removeChild(container); // Clean up
        });
    };




    return (
        <>
            <Navbar />
            <div className="container-history">
                <h2 className="title">Your Booking History </h2>
                {loading ? (
                    <p className="loading">Loading...</p>
                ) : error ? (
                    <p className="error-book">{error}</p>
                ) : (
                    <div className="bookings-grid">
                        {bookings.map((booking, index) => (
                            <div className="booking-card" key={booking.pnrNumber} style={{ animationDelay: `${index * 0.2}s` }}>
                                <p style={{ color: booking.status === "Cancelled" ? "red" : "green", fontWeight: "bold" }}>
                                    {booking.status}
                                </p>
                                <p><strong>PNR:</strong> {booking.pnrNumber}</p>
                                <p><strong>Train:</strong> {booking.trainName} ({booking.trainNumber})</p>
                                <p><strong>Journey Date:</strong> {booking.journeyDate}</p>
                                <p><strong>From:</strong> {booking.source} | {booking.journeyDate} {booking.sourceDeparture}</p>
                                <p><strong>To:</strong> {booking.destination} | {booking.formattedArrivalDate} {booking.destinationArrival}</p>
                                <p><strong>Class:</strong> {booking.selectedClass} Quota: {booking.quota}</p>


                                <p><strong>Passengers:</strong></p>
                                <ul>
                                    {booking.passengers.map((passenger, i) => (
                                        <li key={i}>
                                            {passenger.name} ({passenger.age} yrs, {passenger.gender}) - Berth {passenger.seatNumber}
                                        </li>
                                    ))}
                                </ul>

                                {booking.status === "Booked" && (
                                    <button
                                        className="cancel-btn"
                                        onClick={() => handleCancelBooking(booking.pnrNumber)}
                                    >
                                        Cancel Ticket
                                    </button>
                                )}
                                {booking.status !== "Cancelled" && booking.status !== "Completed" && (
                                    <div>
                                        <button
                                            className="print-btn"
                                            onClick={() => printTicket(booking)}
                                        >
                                            Print Ticket
                                        </button>
                                        <button
                                            className="print-btn"
                                            onClick={() => downloadTicket(booking)}
                                        >
                                            Download Ticket
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default BookingHistory;
