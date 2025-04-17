import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../Navbar/navbar";
import './confirmation.css';
import FareBreakdown from "../Farepopup/farebreakdown";
const Confirmation = () => {
    useEffect(() => {
        setTimeout(() => {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 100);
    }, []);

    const navigate = useNavigate();
    const location = useLocation();
    const [isFareBreakdownOpen, setFareBreakdownOpen] = useState(false);
    const { train, selectedClass, from, to, date, quota, departure, arrival, formattedArrivalDate, duration, passengers, price } = location.state || {};
    if (!train) {
        return <h2 className="error-message-trn">No Train Selected</h2>;
    }


    const totalprice = price;
    const baseFare = price - 20;
    const totalFareAllPassengers = price * (passengers?.length ?? 1);
    const totalFare = totalFareAllPassengers + 11.17;

    const fareDetails = {
        baseFare,
        reservationCharge: 20,
        totalprice,
        totalFare: totalFareAllPassengers,
    };
    const generatePNR = () => {
        let pnr = Math.floor(Math.random() * 1000000000) + 4000000000;
        return pnr.toString();
    };

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userPhone = storedUser?.phone;

    const handleConfirmBooking = async () => {
        const bookingData = {
            userPhone,
            trainNumber: train?.trainNumber,
            trainName: train?.trainName,
            quota,
            class: selectedClass,
            journeyDate: date,
            source: from,
            sourceDeparture: departure,
            destination: to,
            destinationArrival: arrival || "N/A",
            formattedArrivalDate: formattedArrivalDate,
            duration: duration,
            distance: train?.distance,
            passengers,
            totalFare: totalFareAllPassengers,
            pnrNumber: generatePNR(),
        };


        try {
            const response = await fetch("https://railway-reservation-backend-ekallwin.vercel.app/book-ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData),
            });

            const result = await response.json();
            if (response.ok) {
                navigate("/success", {
                    state: {
                        pnrNumber: result.pnrNumber,
                        trainNumber: bookingData.trainNumber,
                        trainName: bookingData.trainName,
                        journeyDate: bookingData.journeyDate,
                        departureStation: bookingData.source,
                        departureTime: bookingData.sourceDeparture,
                        arrivalStation: bookingData.destination,
                        arrivalTime: bookingData.destinationArrival,
                        arrivalDate: bookingData.formattedArrivalDate,
                        duration: bookingData.duration,
                        distance: bookingData.distance,
                        selectedClass: bookingData.class,
                        quota: bookingData.quota,
                        passengers: result.passengers,
                        totalFareAllPassengers: totalFareAllPassengers,
                        totalFare: totalFare,
                    }
                });
            } else {
                alert(`Booking Failed: ${result.message}`);
            }
        } catch (error) {
            console.error("Booking Error:", error);
            alert("Error while booking ticket.");
        }
    };








    return (
        <>
            <Navbar />
            <div className="confirmation-container">
                <div className="train-card-confirm">
                    <div className="train-header-confirm">
                        <h2>{train?.trainName} ({train?.trainNumber})</h2>
                    </div>

                    <div className="train-details">
                        <div className="station-info">
                            <div className="station">
                                <p className="time">{departure}</p>
                                <p className="station-name"><strong>{from}</strong></p>
                                <p className="date">{date}</p>
                            </div>
                            <div className="travel-duration">- {duration} -</div>
                            <div className="station">
                                <p className="time">{arrival || "N/A"}</p>
                                <p className="station-name"><strong>{to}</strong></p>
                                <p className="date">{formattedArrivalDate || "N/A"}</p>
                            </div>
                        </div>

                        <div className="train-status">
                            <p className="status-text"> {quota} | {selectedClass} | Boarding at {from} | Boarding Date: {date} | {departure}</p>
                        </div>

                    </div>
                </div>

                <div className="passenger-section">
                    <h3>Passenger Details</h3>
                    {passengers.map((passenger, index) => (
                        <div key={index} className="passenger-card">
                            <p><strong>{index + 1}. {passenger.name}</strong></p>
                            <p>{passenger.age} yrs | {passenger.gender} | {passenger.nationality}</p>
                        </div>
                    ))}
                </div>

                <div className="price-summary-card">
                    <h3>Fare summary</h3>
                    <div className="fare-details" style={{ marginRight: '20px', textAlign: 'left' }}>
                        <table>
                            <tr>
                                <th colSpan={6} style={{ paddingTop: '30px' }}>Total Fare Amt</th>
                                <td style={{ paddingLeft: '35px', paddingTop: '30px' }}><strong>₹{totalFareAllPassengers}</strong> for {(passengers?.length ?? 1)} passengers(s)</td>
                            </tr>
                            <tr>
                                <th colSpan={6} style={{ paddingTop: '30px' }}></th>
                                <td style={{ paddingLeft: '35px', cursor: 'pointer', color: 'blue', textDecoration: 'underline' }} onClick={() => setFareBreakdownOpen(true)}>
                                    Fare Breakup
                                </td>
                            </tr>
                            <tr>
                                <th colSpan={6}>Convenience Fee (Incl. of GST)</th>
                                <td style={{ paddingLeft: '35px' }}><strong>₹11.70</strong></td>
                            </tr>
                            <tr>
                                <th colSpan={6} style={{ paddingTop: '30px' }}>Total Amount Payable</th>
                                <td style={{ paddingLeft: '35px', paddingTop: '30px' }}><strong>₹{totalFare}</strong></td>
                            </tr>
                        </table>
                    </div>
                </div>

                {/* Buttons */}
                <div className="button-container">
                    <button className="cancel-btn" onClick={() => navigate(-1)}>Back</button>
                    <button className="confirm-btn" onClick={handleConfirmBooking}>Confirm Booking</button>

                </div>
                <FareBreakdown isOpen={isFareBreakdownOpen} onClose={() => setFareBreakdownOpen(false)} fareDetails={fareDetails} />

            </div>
        </>
    );
};

export default Confirmation;
