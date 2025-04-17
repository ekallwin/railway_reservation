import React, { useState, useEffect, useRef } from "react";
import './bookticket.css';
import Stations from "../../Stations";
import Navbar from "../Navbar/navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { DayPicker } from "react-day-picker";
import { useNavigate } from "react-router-dom";
import "react-day-picker/dist/style.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const TrainBooking = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [quota, setQuota] = useState("General");
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", phone: "", email: "" });
  const [isFormComplete, setIsFormComplete] = useState(false);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const bookingData = JSON.parse(localStorage.getItem("bookingData"));
  
    if (storedUser && storedUser.phone) {
      fetch("http://localhost:8000/get-user", {
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
  
          if (bookingData) {
            setFrom(bookingData.from);
            setTo(bookingData.to);
            setQuota(bookingData.quota);
            setSelectedDate(new Date(bookingData.selectedDate));
          }
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);
  

  const calendarRef = useRef(null);

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

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + (quota === "Tatkal" ? 1 : 60));

  const formatDate = (date) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-GB", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const swapLocations = (event) => {
    event.preventDefault();
    setFrom(to);
    setTo(from);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (!from) {
      toast.error("Please select a From station!");
      return;
    }
    if (!to) {
      toast.error("Please select a To station!");
      return;
    }
    if (from === to) {
      toast.error("From and To stations cannot be the same!");
      return;
    }
    localStorage.setItem("bookingData", JSON.stringify({
      from,
      to,
      quota,
      selectedDate,
    }));
    navigate("/train-search", {
      state: { from, to, date: formatDate(selectedDate), quota }
    });
  };
  useEffect(() => {
    setIsFormComplete(from !== "" && to !== "" && from !== to);
  }, [from, to]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && isFormComplete) {
      handleSearch(event);
    }
  };



  return (
    <>
      <Navbar />
      <div className="container book-grp">
        <p className="welcome-text">Welcome, {user.name}</p>
        <form onSubmit={handleSearch} onKeyDown={handleKeyDown}>
          <h2>BOOK TICKET</h2>
          <p className="SandD">From</p>
          <Stations
            className="input-box-book"
            selectedStation={from}
            setSelectedStation={setFrom}
            type="From"
          />

          <div className="icon-container">
            <FontAwesomeIcon
              icon={faArrowsRotate}
              size="xl"
              className="swap-icon"
              onClick={swapLocations}
              title="Swap locations"
            />
          </div>

          <p className="SandD">To</p>
          <Stations
            className="input-box-book"
            selectedStation={to}
            setSelectedStation={setTo}
            type="To"
          />

          <p className="SandD">Quota</p>
          <select
            className="input-box input-box-quota"
            value={quota}
            onChange={(e) => {
              setQuota(e.target.value);
              if (e.target.value === "Tatkal") {
                setSelectedDate(new Date());
              }
            }}
          >
            <option value="General">General</option>
            <option value="Tatkal">Tatkal</option>
          </select>

          <p className="SandD">Date</p>

          <div className="calendar-container">
            <input
              type="text"
              value={formatDate(selectedDate)}
              placeholder="Select a date"
              readOnly
              onClick={() => setIsOpen(!isOpen)}
              className="date-input"
            />

            {isOpen && (
              <div className="calendar-popup" ref={calendarRef}>
                <DayPicker className="datepicker"
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setIsOpen(false);
                  }}
                  fromDate={today}
                  toDate={maxDate}
                  disabled={{ before: today, after: maxDate }}
                />
              </div>
            )}
          </div>




          <button type="submit" className="search-button button" disabled={!isFormComplete}>Search</button>
        </form>
      </div>
    </>
  );
};

export default TrainBooking;
