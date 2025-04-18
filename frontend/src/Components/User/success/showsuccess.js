import { useLocation, useNavigate } from "react-router-dom";
import "./success.css";
import Navbar from "../Navbar/navbar";
import { useEffect } from "react";
import Print from '../printTemplate';
import html2pdf from "html2pdf.js";
const Success = () => {

    const location = useLocation();
    const navigate = useNavigate();


    useEffect(() => {
        // Scroll to top and clear localStorage
        setTimeout(() => {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 100);
        localStorage.removeItem("passengerData");

        // Push a new history state to trap the back button
        window.history.pushState(null, "", window.location.href);

        const handlePopState = () => {
            navigate("/Booking", { replace: true });
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [navigate]);



    const {
        pnrNumber,
        trainNumber = "Train Number Unavailable",
        trainName = "Train Name Unavailable",
        journeyDate = "Date Not Provided",
        departureStation = "N/A",
        departureTime = "N/A",
        arrivalStation = "N/A",
        arrivalTime = "N/A",
        arrivalDate = "N/A",
        selectedClass = "N/A",
        duration = "N/A",
        distance = "N/A",
        quota = "N/A",
        totalFareAllPassengers = "N/A",
        totalFare = "N/A",
        passengers = []
    } = location.state || {};

    if (!pnrNumber) {
        return <h2 className="error-message">No Booking Details Available</h2>;
    }

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
            margin:       0.5,
            filename:     `Ticket_${booking.pnrNumber}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
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
            <div className="success-container">
                <h2>Booking Confirmed!</h2>
                <div className="success-details">
                    <h3>PNR: {pnrNumber}</h3>
                    <h4>{trainName} ({trainNumber})</h4>
                    <div style={{ display: 'flex' }}>
                        <div>
                            <p><strong>Departure:</strong> {departureStation}</p><p>{journeyDate} | {departureTime}</p>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                            <p><strong>Arrival:</strong> {arrivalStation}</p><p>{arrivalDate} | {arrivalTime}</p>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex' }}>
                            <p><strong>Duration:</strong> {duration}</p>
                            <p style={{ marginLeft: 'auto' }}><strong>Distance:</strong> {distance} KM</p>
                        </div>
                    </div>
                    <p><strong>Journey Date:</strong> {journeyDate}</p>

                    <p><strong>Class:</strong> {selectedClass} | <strong>Quota:</strong> {quota}</p>

                    <div className="passenger-list">
                        <h3>Passenger Details</h3>
                        <table style={{ width: '70%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr>
                                    <th>Passenger</th>
                                    <th>Berth</th>
                                </tr>
                            </thead>
                            <tbody>
                                {passengers.map((passenger, index) => (
                                    <tr key={index}>
                                        <td>{index + 1} {passenger.name} - {passenger.age} yrs {passenger.gender}</td>
                                        <td>{passenger.seatNumber}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>

                    <div className="passenger-list">
                        <h3>Payment Details</h3>
                        <table style={{ textAlign: 'left' }}>
                            <tr>
                                <th colSpan={6} style={{ paddingTop: '30px' }}>Total Fare Amt</th>
                                <td style={{ paddingLeft: '35px', paddingTop: '30px' }}><strong>₹ {totalFareAllPassengers}</strong></td>
                            </tr>

                            <tr>
                                <th colSpan={6}>Convenience Fee (Incl. of GST)</th>
                                <td style={{ paddingLeft: '35px' }}><strong>₹ 11.70</strong></td>
                            </tr>
                            <tr>
                                <th colSpan={6} style={{ paddingTop: '30px' }}>Total Amount Payable</th>
                                <td style={{ paddingLeft: '35px', paddingTop: '30px' }}><strong>₹ {totalFare}</strong></td>
                            </tr>
                        </table>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', color: 'red' }} className="warning-text">
                        <h4 style={{ textAlign: 'center' }}>Note: This Ticket is not authorized for Travel. Not Booked through PRS system of Indian Railways.</h4>
                    </div>
                </div>
                <button className="success-btn" onClick={() => navigate("/Booking")}>Home</button>
                <button className="success-btn" onClick={() => printTicket({
                    pnrNumber,
                    trainNumber,
                    trainName,
                    journeyDate,
                    source: departureStation,
                    sourceDeparture: departureTime,
                    destination: arrivalStation,
                    destinationArrival: arrivalTime,
                    formattedArrivalDate: arrivalDate,
                    selectedClass,
                    duration,
                    distance,
                    quota,
                    totalFare: parseFloat(totalFare),
                    passengers
                })}>
                    Print
                </button>
                <button className="success-btn" onClick={() => downloadTicket({
                    pnrNumber,
                    trainNumber,
                    trainName,
                    journeyDate,
                    source: departureStation,
                    sourceDeparture: departureTime,
                    destination: arrivalStation,
                    destinationArrival: arrivalTime,
                    formattedArrivalDate: arrivalDate,
                    selectedClass,
                    duration,
                    distance,
                    quota,
                    totalFare: parseFloat(totalFare),
                    passengers
                })}>
                    Download Ticket
                </button>

            </div>
        </>
    );
};

export default Success;
