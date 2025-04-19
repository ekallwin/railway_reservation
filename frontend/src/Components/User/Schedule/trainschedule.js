import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './trainschedule.css';
import { toast } from "react-toastify";

const TrainSchedule = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { trainNumber } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.phone) {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }
    const fetchSchedule = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/schedule/${trainNumber}`);
        const data = await response.json();
        setSchedule(data);
      } catch (error) {
        console.error("Error fetching train schedule:", error);
      }
    };

    fetchSchedule();
  }, [trainNumber, apiUrl, navigate]);

  if (!schedule) return <p className="loading">Loading schedule...</p>;

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
    <div className="container-table">
      <button onClick={() => navigate(-1)} className="back-button">Go Back</button>
      <h2>Train Schedule: {schedule?.trainName} ({schedule?.trainNumber})</h2>
      <p>From: {schedule?.source?.station} To: {schedule?.destination?.station}</p>

      <table className="schedule-table">
        <thead>
          <tr>
            <th>Sl. No.</th>
            <th>Station</th>
            <th>Arrival</th>
            <th>Departure</th>
            <th>Halt Time (Min)</th>
            <th>Distance (Km)</th>
            <th>Day</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>{schedule?.source?.station || "-"}</td>
            <td>-</td>
            <td>{schedule?.source?.departure || "-"}</td>
            <td>-</td>
            <td>{schedule?.source?.distance || "-"} km</td>
            <td>{schedule?.source?.day || "-"}</td>
          </tr>
          {schedule?.intermediate?.map((stop, index) => (
            <tr key={index}>
              <td>{index + 2}</td>
              <td>{stop.station}</td>
              <td>{stop.arrival}</td>
              <td>{stop.departure}</td>
              <td>{calculateHaltTime(stop.arrival, stop.departure)}</td>
              <td>{stop.distance} km</td>
              <td>{stop.day}</td>
            </tr>
          ))}
          <tr>
            <td>{(schedule?.intermediate?.length || 0) + 2}</td>
            <td>{schedule?.destination?.station || "-"}</td>
            <td>{schedule?.destination?.arrival || "-"}</td>
            <td>-</td>
            <td>-</td>
            <td>{schedule?.destination?.distance || "-"} km</td>
            <td>{schedule?.destination?.day || "-"}</td>
          </tr>
        </tbody>
      </table>
      <br />

    </div>
  );
};

export default TrainSchedule;
