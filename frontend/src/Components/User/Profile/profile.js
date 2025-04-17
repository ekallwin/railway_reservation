import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../user.css';
import Flag from '../Image/flag.png'
import Navbar from '../Navbar/navbar';
const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: "", phone: "", email: "" });

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
                .catch((error) => {
                    console.error("Error fetching user:", error);
                    navigate("/login");
                });
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", function () {
            window.location.href = "/login";
        });

        navigate("/login", { replace: true });
        window.location.reload();
    };

    return (
        <>
            <Navbar />

            <div>
                <div className="container">
                    <h2>Profile</h2>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="input-container">
                            <input type="text" value={user.name} readOnly />
                            <label>Name</label>
                        </div>
                        <div className="input-container">
                            <img src={Flag} alt="Indian Flag" style={{ position: 'absolute', top: '20px', left: '8px', width: '28px', height: '20px', pointerEvents: 'none' }} />
                            <input
                                id="phoneno"
                                type="text"
                                inputMode="numeric"
                                name="phone"
                                value={user.phone} readOnly

                                placeholder=" "
                                maxLength="10"
                            />
                            <label style={{ marginLeft: '30px' }}>Phone</label>
                        </div>
                        <div className="input-container">
                            <input type="text" value={user.email} readOnly />
                            <label>Email</label>
                        </div>
                        <button className="password-cng-btn" onClick={() => navigate("/change-password")}>
                            Change Password
                        </button>
                        <button className="password-cng-btn logout-btn" onClick={handleLogout}>
                            Logout
                        </button>

                    </form >
                </div>
            </div>
        </>
    );
};

export default Profile;
