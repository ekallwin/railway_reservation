import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from '../Navbar/navbar';
import "./timetablesearch.css";
const TimetableSearch = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [trainNumber, setTrainNumber] = useState("");
  const [trainList, setTrainList] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.phone) {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }
    const fetchTrains = async () => {
      try {
        const response = await fetch(`${apiUrl}/search-trains`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setTrainList(data);
        } else {
          console.error("Unexpected API response:", data);
          setTrainList([]);
        }
      } catch (err) {
        console.error("Error fetching train list:", err);
        setTrainList([]);
      }
    };

    fetchTrains();
  }, [apiUrl, navigate]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setTrainNumber(value);

    if (value === "") {
      setFilteredTrains([]);
      setShowDropdown(false);
      return;
    }

    const filtered = trainList.filter(
      (train) =>
        train.trainNumber.includes(value) ||
        train.trainName.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredTrains(filtered);
    setShowDropdown(filtered.length > 0);
  };

  const handleSelectTrain = (train) => {
    setTrainNumber(`${train.trainNumber} - ${train.trainName}`);
    setShowDropdown(false);
    fetchSchedule(train.trainNumber);
  };

  const fetchSchedule = async (trainNum = trainNumber.split(" - ")[0]) => {
    if (!trainNum) {
      setError("Please enter a train number");
      return;
    }

    setError("");

    try {
      const response = await fetch(`https://railway-reservation.onrender.com/api/schedule/${trainNum}`);
      const data = await response.json();

      if (response.ok) {
        setSchedule(data);
      } else {
        setError(data.error || "Train not found");
        setSchedule(null);
      }
    } catch (err) {
      setError("Error fetching train schedule");
      setSchedule(null);
    }
  };

  const calculateHaltTime = (arrival, departure) => {
    if (!arrival || !departure) return "-";
    const [arrH, arrM] = arrival.split(":").map(Number);
    const [depH, depM] = departure.split(":").map(Number);
    let totalSeconds = (depH * 60 + depM - arrH * 60 - arrM) * 60;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <>
      <Navbar />
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h2>Search Train Schedule</h2>

        <div style={{ position: "relative", display: "inline-block" }}>
          <div className="search-input">
            <input
              type="number"
              value={trainNumber}
              placeholder="Enter Train Number"
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,5}$/.test(value)) {
                  handleInputChange(e);
                }
              }}
              style={{ padding: "8px", width: "250px" }}
            />
          </div>

          {showDropdown && filteredTrains.length > 0 && (
            <ul style={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "300px",
              background: "white",
              border: "1px solid #ccc",
              listStyle: "none",
              padding: 0,
              margin: 0,
              maxHeight: "150px",
              overflowY: "auto",
              zIndex: 1000
            }}>
              {filteredTrains.map((train) => (
                <li
                  key={train.trainNumber}
                  onClick={() => handleSelectTrain(train)}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {train.trainNumber} - {train.trainName}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="search-timetable" onClick={() => fetchSchedule()} style={{ padding: "8px 12px", marginLeft: "10px" }}>
          Search
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {schedule && (
          <div style={{ marginTop: "20px", textAlign: "left", maxWidth: "600px", margin: "auto" }}>
            <h3>{schedule.trainName} ({schedule.trainNumber})</h3>

            <table border="1" cellPadding="8" style={{ marginBottom: '20px' }} className="schedule-table">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Arrival</th>
                  <th>Departure</th>
                  <th>Halt Time (Min)</th>
                  <th>Distance (km)</th>
                  <th>Day</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{schedule.source.station} (Source)</td>
                  <td>-</td>
                  <td>{schedule.source.departure}</td>
                  <td>-</td>
                  <td>{schedule.source.distance}</td>
                  <td>{schedule.source.day}</td>
                </tr>

                {schedule.intermediate.map((stop, index) => (
                  <tr key={index}>
                    <td>{stop.station}</td>
                    <td>{stop.arrival}</td>
                    <td>{stop.departure}</td>
                    <td>{calculateHaltTime(stop.arrival, stop.departure)}</td>
                    <td>{stop.distance}</td>
                    <td>{stop.day}</td>
                  </tr>
                ))}

                <tr>
                  <td>{schedule.destination.station} (Destination)</td>
                  <td>{schedule.destination.arrival}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>{schedule.destination.distance}</td>
                  <td>{schedule.destination.day}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default TimetableSearch;
