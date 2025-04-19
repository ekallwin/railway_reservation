import React, { useState } from "react";
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./tte.css";

const RegisterTTE = ({ apiUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tteId, setTteId] = useState("");
  const [ttePassword, setTtePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegisterTTE = async (event) => {
    event.preventDefault();

    if (!tteId || !ttePassword) {
      toast.error("TTE ID and Password are required.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/register-tte`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tteId, ttePassword }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("TTE registered successfully.");
        setTteId("");
        setTtePassword("");
        setIsOpen(false);
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Error registering TTE. Try again.");
    }
  };

  return (
    <div className="tte-container">
      <button 
        className="action-button register-button"
        onClick={() => setIsOpen(true)}
      >
        Register TTE
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Register TTE</h2>
            <form onSubmit={handleRegisterTTE}>
              <div className="tte-input">
                <label>TTE ID</label>
                <input
                  type="text"
                  value={tteId}
                  onChange={(e) => setTteId(e.target.value)}
                  placeholder="Enter TTE ID"
                />
                <label>Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={ttePassword}
                    onChange={(e) => setTtePassword(e.target.value)}
                    placeholder="Enter Password"
                  />
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
                <div className="button-group">
                  <button type="submit" className="submit-button">Register</button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterTTE;