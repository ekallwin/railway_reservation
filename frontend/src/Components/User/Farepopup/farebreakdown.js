import React from "react";
import './farebreakdown.css'

const FareBreakdown = ({ isOpen, onClose, fareDetails }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}>✖</button>
                <h3>Fare Breakdown</h3>
                <table>
                    <tr>
                        <th>Base Fare</th>
                        <td style={{ paddingLeft: '35px' }}>₹{fareDetails.baseFare}</td>
                    </tr>
                    <tr>
                        <th>Reservation Charge</th>
                        <td style={{ paddingLeft: '35px' }}>₹{fareDetails.reservationCharge}</td>
                    </tr>
                    <tr>
                        <th>Total Fare per passenger</th>
                        <td style={{ paddingLeft: '35px' }}>₹{fareDetails.totalprice}</td>
                    </tr>
                </table>
                {fareDetails.tatkalCharge > 0 && (
                    <p><b>Tatkal Charge:</b> ₹{fareDetails.tatkalCharge}</p>
                )}
                <hr />
                <h4>Total Fare: ₹{fareDetails.totalFare}</h4>
                <p className="note">*Final fare includes applicable charges.</p>
            </div>
        </div>
    );
};

export default FareBreakdown;
