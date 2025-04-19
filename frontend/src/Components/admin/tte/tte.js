import React from "react";
import "react-day-picker/dist/style.css";
import "./tte.css";
import Navbar from "../Nav/navbar1";
import RegisterTTE from "./RegisterTTE";
import DeleteTTE from "./DeleteTTE";

const TrainBookings = () => {
  const apiUrl = process.env.REACT_APP_API_URL;

  return (
    <>
      <Navbar />
      <div className="tte-actions-container">
        <RegisterTTE apiUrl={apiUrl} />
        <DeleteTTE apiUrl={apiUrl} />
      </div>
    </>
  );
};

export default TrainBookings;