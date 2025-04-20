const getPrintHtml = (booking) => `
<html>

<head>
    <title>E-ticket ${booking.pnrNumber}</title>
    <style>
        @page {
            margin: 0;
            size: auto;
        }
        p {
        font-size: 18px;
        }
        h4 {
        font-size: 24px;
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }

        .success-details {
            padding: 20px;
            margin-bottom: 20px;
        }

        .passenger-list {
            margin-top: 20px;
        }

        table {
            border-collapse: collapse;
            width: 70%;
            border: none;
            border-spacing: 0;
        }

        th,
        td {
            border: none;
            padding: 8px;
            text-align: left;
        }

        .warning-text {
            color: red;
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="success-details">
        <h2 style="text-align: center;">PNR: ${booking.pnrNumber}</h2>
        <h4>${booking.trainName} (${booking.trainNumber})</h4>
        <div style="display: flex;">
            <div>
                <p><strong>Departure:</strong> ${booking.source}</p>
                <p>${booking.journeyDate} | ${booking.sourceDeparture}</p>
            </div>
            <div style="margin-left: auto;">
                <p><strong>Arrival:</strong> ${booking.destination}</p>
                <p>${booking.formattedArrivalDate} | ${booking.destinationArrival}</p>
            </div>
        </div>
        <div>
            <div style="display: flex;">
                <p><strong>Duration:</strong> ${booking.duration}</p>
                <p style="margin-left: auto;"><strong>Distance:</strong> ${booking.distance} KM</p>
            </div>
        </div>
        <p style="text-align: center"><strong>Journey Date:</strong> ${booking.journeyDate}</p>
        <div style="display: flex;">
             <p><strong>Class:</strong> ${booking.selectedClass}</p>\
             <p style="margin-left: auto;"><strong>Quota:</strong> ${booking.quota}</p>
        </div>
        <div class="passenger-list">
            <h3 style="text-align: left;">Passenger Details</h3>
            <table style="width: 30%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 8px; padding-right: 120px">Passenger</th>
                        <th style="text-align: left; padding: 8px; padding-right: 120px">Berth</th>
                    </tr>
                </thead>
                <tbody>
                    ${booking.passengers.map((p, i) => `
                    <tr>
                        <td style="padding: 8px; padding-right: 120px">${i + 1}. ${p.name} ${p.age}${p.gender}</td>
                        <td style="padding: 8px; padding-right: 120px">${p.seatNumber}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>

        </div>
        <div class="passenger-list">
            <h3 style="text-align: left;">Payment Details</h3>
            <table>
                <tr>
                    <th>Total Fare Amt</th>
                    <td>₹ ${booking.totalFare}</td>
                </tr>
                <tr>
                    <th>Convenience Fee</th>
                    <td>₹ 11.70</td>
                </tr>
                <tr>
                    <th>Total Amount Payable</th>
                    <td>₹ ${(booking.totalFare + 11.70).toFixed(2)}</td>
                </tr>
            </table>
        </div>
        <div class="warning-text">
            <h3>Note: This Ticket is not authorized for Travel. Not Booked through PRS system of Indian Railways.</h3>
        </div>
    </div>
    <script>
        window.print();
        window.close();
    </script>
</body>

</html>
`;

export default getPrintHtml;
