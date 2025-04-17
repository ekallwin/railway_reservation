import React, { useState } from "react";
import "react-day-picker/dist/style.css";
import "./tte.css";
import Navbar from "../Nav/navbar1";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
const TrainBookings = () => {
  const [registerTteId, setRegisterTteId] = useState("");
  const [registerTtePassword, setRegisterTtePassword] = useState("");
  const [deleteTteId, setDeleteTteId] = useState("");
  const handleRegisterTTE = async (event) => {
    event.preventDefault();

    if (!registerTteId || !registerTtePassword) {
      toast.error("TTE ID and Password are required.");
      return;
    }

    try {
      const response = await fetch(`https://railway-reservation.onrender.com/api/register-tte`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tteId: registerTteId, ttePassword: registerTtePassword }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("TTE registered successfully.");
        setRegisterTteId("");
        setRegisterTtePassword("");
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Error registering TTE. Try again.");
    }
  };

  const handleDeleteTTE = async (event) => {
    event.preventDefault();

    if (!deleteTteId) {
      toast.error("TTE ID is required for deletion.");
      return;
    }

    try {
      const response = await fetch(`https://railway-reservation.onrender.com/api/delete-tte/${deleteTteId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("TTE deleted successfully.");
        setDeleteTteId("");
      } else {
        toast.error(data.message || "Deletion failed.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Error deleting TTE. Try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Register TTE</h2>
        <form onSubmit={handleRegisterTTE}>
          <label>TTE ID</label>
          <input
            type="text"
            value={registerTteId}
            onChange={(e) => setRegisterTteId(e.target.value)}
            placeholder="Enter TTE ID"
          />
          <label>Password</label>
          <input
            type="password"
            value={registerTtePassword}
            onChange={(e) => setRegisterTtePassword(e.target.value)}
            placeholder="Enter Password"
          />
          <button type="submit" className="search-button">Register TTE</button>
        </form>

        <h2>Delete TTE</h2>
        <form onSubmit={handleDeleteTTE}>
          <label>TTE ID</label>
          <input
            type="text"
            value={deleteTteId}
            onChange={(e) => setDeleteTteId(e.target.value)}
            placeholder="Enter TTE ID to delete"
          />
          <button type="submit" className="search-button">Delete TTE</button>
        </form>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="colored"
        transition={Bounce}
      />
    </>
  );
};

export default TrainBookings;