import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
const TTELogin = ({ onLogin }) => {
    const [tteId, setTteId] = useState("");
    const [ttePassword, setTtePassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");

        if (!tteId || !ttePassword) {
            setError("TTE ID and Password are required.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/login-tte`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tteId, ttePassword }),
            });
            const data = await response.json();

            if (response.ok) {
                console.log("Login successful, redirecting...");
                onLogin(); 
                navigate('/tte/view-tickets');
            } else {
                setError(data.message || "Login failed.");
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Error logging in. Try again.");
        }
    };

    return (
        <div className="login-container">
            <h2>TTE Login</h2>
            <form onSubmit={handleLogin}>
                <label>TTE ID</label>
                <input
                    type="text"
                    value={tteId}
                    onChange={(e) => setTteId(e.target.value)}
                    placeholder="Enter TTE ID"
                />
                <label>Password</label>
                <input
                    type="password"
                    value={ttePassword}
                    onChange={(e) => setTtePassword(e.target.value)}
                    placeholder="Enter Password"
                />
                <button type="submit" className="button">Login</button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default TTELogin;