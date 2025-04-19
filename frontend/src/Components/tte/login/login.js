import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import Loader from '../../User/loader/loader';

const TTELogin = ({ onLogin }) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [tteId, setTteId] = useState("");
    const [ttePassword, setTtePassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        if (!tteId || !ttePassword) {
            setError("TTE ID and Password are required.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/login-tte`, {
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {loading && <Loader />}
            <h2>TTE Login</h2>
            <form onSubmit={handleLogin}>
                <label>TTE ID</label>
                <input
                    type="text"
                    value={tteId}
                    onChange={(e) => setTteId(e.target.value)}
                    placeholder="Enter TTE ID"
                    disabled={loading}
                />
                <label>Password</label>
                <input
                    type="password"
                    value={ttePassword}
                    onChange={(e) => setTtePassword(e.target.value)}
                    placeholder="Enter Password"
                    disabled={loading}
                />
                <button type="submit" className="button" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default TTELogin;