import React, { useState, useEffect, useCallback } from "react";
import '../Bookings/bookticket.css';
import Navbar from '../Navbar/navbar';
import { useNavigate, useLocation } from "react-router-dom";
import "react-day-picker/dist/style.css";
import './trains.css';
import moment from 'moment-timezone';

const TrainBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { from, to, date, quota } = location.state || {};
  const [user, setUser] = useState({ name: "", phone: "", email: "" });
  const [trains, setTrains] = useState([]);
  const [seatAvailability, setSeatAvailability] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.phone) {
      fetch("https://railway-reservation.onrender.com/get-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: storedUser.phone }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          } else {
            navigate("/login");
          }
        })
        .catch(() => navigate("/login"));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!from || !to) {
      navigate("/");
      return;
    }
    fetch(`${import.meta.env.API_URL}/search-trains?from=${from}&to=${to}`)
      .then((res) => res.json())
      .then((data) => {
        setTrains(data.trains)
      })
      .catch((error) => console.error("Error fetching trains:", error));

  }, [from, to, navigate]);

  const fetchSeatAvailability = useCallback(async (trainNumber) => {
    try {
      const res = await fetch(`${import.meta.env.API_URL}/train/${trainNumber}/${quota}?date=${date}`);
      const data = await res.json();


      if (data.seatAvailabilityByDate && data.seatAvailabilityByDate[date]) {
        setSeatAvailability((prev) => ({
          ...prev,
          [trainNumber]: data.seatAvailabilityByDate[date],
        }));
      } else {
        console.warn(`No seat data found for ${trainNumber} on ${date}.`);
      }

    } catch (error) {
      console.error("Error fetching seat availability:", error);
    }
  }, [quota, date]);


  useEffect(() => {
    trains.forEach((train) => {
      fetchSeatAvailability(train.trainNumber);
    });
  }, [trains, fetchSeatAvailability]);




  return (
    <>
      <Navbar />
      <div className="container-book">
        <h2 className="title">Available Trains for "{quota}" quota</h2>
        {trains.length > 0 ? (
          <div className="train-list">
            {trains.map((train) => (
              <TrainCard
                key={train.trainNumber}
                train={train}
                from={from}
                to={to}
                date={date}
                quota={quota}
                seatAvailability={seatAvailability}
                navigate={navigate}
                user={user}
              />
            ))}
          </div>
        ) : (
          <p className="no-trains" style={{ textAlign: 'center' }}>No trains available</p>
        )}
      </div>
    </>
  );
};

const TrainCard = ({ train, from, to, date, quota, seatAvailability, navigate }) => {

  const isTrainDeparted = (departureTime) => {
    if (!departureTime) return false;
    const currentISTTime = moment().tz("Asia/Kolkata");

    const formattedDate = moment(date, "DD-MMM-YYYY").format("YYYY-MM-DD");
    if (!formattedDate || formattedDate === "Invalid date") {
      console.error("Invalid date format:", date);
      return false;
    }

    const formattedDepartureTime = moment(departureTime, "HH:mm").format("HH:mm");
    if (!formattedDepartureTime || formattedDepartureTime === "Invalid date") {
      console.error("Invalid departure time format:", departureTime);
      return false;
    }

    const departureDateTime = moment.tz(`${formattedDate} ${formattedDepartureTime}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata");


    return currentISTTime.isAfter(departureDateTime);
  };



  const seatData = seatAvailability[train.trainNumber] || {};
  console.log("seatAvailability:", seatAvailability);


  const formatDate = (date) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj)) return "Invalid Date";
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = dateObj.toLocaleString("en-GB", { month: "short" });
    return `${day}-${month}-${dateObj.getFullYear()}`;
  };

  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return "N/A";
    try {
      const depTime = new Date(`1970-01-01T${departure}:00`);
      const arrTime = new Date(`1970-01-01T${arrival}:00`);
      if (arrTime < depTime) arrTime.setDate(arrTime.getDate() + 1);
      const diffMs = arrTime - depTime;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error("Error calculating duration:", error);
      return "N/A";
    }
  };

  let fromStation = train.source.station === from ? train.source : train.intermediate.find(s => s.station === from);
  let toStation = train.destination.station === to ? train.destination : train.intermediate.find(s => s.station === to);
  const duration = calculateDuration(fromStation?.departure, toStation?.arrival);

  const departureDay = parseInt(fromStation?.day, 10) || 1;
  const arrivalDay = parseInt(toStation?.day, 10) || departureDay;
  const dayOffset = arrivalDay - departureDay;
  const arrivalDate = new Date(new Date(date).setDate(new Date(date).getDate() + dayOffset));
  const formattedArrivalDate = formatDate(arrivalDate);
  const fromDistance = fromStation?.distance ? parseInt(fromStation.distance, 10) : 0;
  const toDistance = toStation?.distance ? parseInt(toStation.distance, 10) : 0;
  const distance = toDistance - fromDistance;

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const runningDays = train.runningDays || {};



  const calculatePrice = (distance, classType, quota) => {
    if (!distance || distance <= 0) return 0;


    let basePrice = Math.ceil(distance / 50) * 26.35;

    if (basePrice < 145) {
      basePrice = 145;
    }

    const classMultipliers = {
      "Second Sitting (2S)": 1 / 1.142857,
      "Sleeper (SL)": 1,
      "AC 3 Tier (3A)": 2.55,
      "AC 3 Economy (3E)": 3.15,
      "AC 2 Tier (2A)": 3.95,
      "AC First Class (1A)": 5.65,
      "AC Chair Car (CC)": 6.25,
    };

    const multiplier = classMultipliers[classType?.trim()] || 1;
    let finalPrice = Math.round(basePrice * multiplier);

    if (quota === "Tatkal") {
      const tatkalCharges = {
        "Sleeper (SL)": 100,
        "AC 3 Tier (3A)": 200,
        "AC 3 Economy (3E)": 200,
        "AC 2 Tier (2A)": 300,
        "AC Chair Car (CC)": 150,
      };

      finalPrice += tatkalCharges[classType?.trim()] || 0;
    }

    return finalPrice;
  };



  return (
    <div className="train-card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="schedule-btn" onClick={() => navigate(`/schedule/${train.trainNumber}`)}>View Schedule</button>
        <p>Runs on:
          {dayLetters.map((letter, index) => (
            <span
              key={index}
              style={{
                color: runningDays.allDays || runningDays[days[index]] ? 'green' : 'red',
                fontWeight: 'bold',
                marginRight: '5px'
              }}
            >
              {letter}
            </span>
          ))}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3>{train.trainName} ({train.trainNumber})</h3>
        <p style={{ fontWeight: 'bold' }}>Duration: {duration}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <p>{from}</p>
          <p><span className="time">{fromStation?.departure} ({formatDate(date)})</span></p>
        </div>
        <div>
          <p>{to}</p>
          <p><span className="time">{toStation?.arrival} ({formattedArrivalDate})</span></p>
        </div>
      </div>

      <div className="seat-availability">
        {Object.keys(seatData).length > 0 ? (
          Object.keys(seatData).map((classKey) => {
            const availableSeats = seatData[classKey]?.available ?? 0;

            const waitlistCount = seatData[classKey]?.waitlist?.count ?? 0;
            const tqwlCount = seatData[classKey]?.tqwl?.count ?? 0;

            const price = calculatePrice(distance, classKey, quota);

            const getTatkalBookingTime = () => {
              let bookingDate = moment.tz(date, "DD-MMM-YYYY", "Asia/Kolkata").subtract(1, 'days');
              let bookingTime = (quota === "Tatkal" && (classKey === "Sleeper (SL)" || classKey === "Second Sitting (2S)"))
                ? bookingDate.set({ hour: 11, minute: 0, second: 0 })
                : bookingDate.set({ hour: 10, minute: 0, second: 0 });
              return moment.tz(bookingTime, "Asia/Kolkata");
            };

            const isTatkalBookingAllowed = () => {
              if (quota !== "Tatkal") return true;
              return moment().tz("Asia/Kolkata").isAfter(getTatkalBookingTime());
            };

            return (
              <div>
                <button
                  key={classKey}
                  className="seat-btn"
                  onClick={() => {
                    if (!isTatkalBookingAllowed()) return;
                    if (isTrainDeparted(fromStation?.departure)) {
                      return;
                    }
                    if (availableSeats > 0 || waitlistCount > 0 || tqwlCount > 0) {
                      navigate("/passenger", {
                        state: {
                          train,
                          selectedClass: classKey,
                          availableSeats,
                          waitlistCount,
                          tqwlCount,
                          from,
                          to,
                          departure: fromStation?.departure,
                          date,
                          arrival: toStation?.arrival,
                          formattedArrivalDate,
                          duration,
                          quota,
                          distance,
                          price,
                        }
                      });
                    }
                  }}
                  disabled={!isTatkalBookingAllowed() || isTrainDeparted(fromStation?.departure)}

                >
                  {!isTatkalBookingAllowed() ? (
                    <span className="availability" style={{ color: "gray", cursor: 'not-allowed' }}>BOOKING UNAVAILABLE</span>
                  ) : isTrainDeparted(fromStation?.departure) ? (
                    <span className="availability" style={{ color: "black", cursor: 'not-allowed' }}>TRAIN DEPARTED</span>
                  ) : (
                    <>
                      <span>{classKey} <b>₹{price}</b></span>
                      {availableSeats > 0 ? (
                        <span className="availability" style={{ color: "green" }}>AVAILABLE - {availableSeats}</span>
                      ) : waitlistCount > 0 ? (
                        <span className="availability" style={{ color: "orange" }}>WL{waitlistCount}</span>
                      ) : tqwlCount > 0 ? (
                        <span className="availability" style={{ color: "orange" }}>TQWL{tqwlCount}</span>
                      ) : (
                        <span className="availability" style={{ color: "red" }}>NOT AVAILABLE</span>
                      )}
                    </>
                  )}

                </button>
              </div>
            );
          })
        ) : (
          <p>Loading availability...</p>
        )}
      </div>

    </div>
  );
};

export default TrainBooking;
