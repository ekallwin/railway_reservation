import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faX } from '@fortawesome/free-solid-svg-icons';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
    };

    const handleLogout = () => {
        localStorage.clear();
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", function () {
            window.location.href = "/login";
        });

        localStorage.removeItem("user");
        localStorage.removeItem("bookingData");

        navigate("/login", { replace: true });
        window.location.reload();
    };

    useEffect(() => {
        const closeMenu = (e) => {
            if (isOpen && !e.target.closest(".navbar")) {
                setIsOpen(false);
            }
        };

        document.addEventListener("click", closeMenu);
        return () => {
            document.removeEventListener("click", closeMenu);
        };
    }, [isOpen]);

    return (
        <>
            <nav className="navbar">
                <div className="navbar-logo">Train Booking</div>
                <div className="menu-icon" onClick={toggleMenu}>
                    {isOpen ? (
                        <FontAwesomeIcon icon={faX} className="menu-icon-close" size="2xl" />
                    ) : (
                        <FontAwesomeIcon icon={faBars} className="menu-icon-bars" size="2xl" />
                    )}
                </div>
                <ul className={`navbar-links ${isOpen ? "open" : ""}`}>
                    <li>
                        <Link to="/booking" className="navbar-link">Home</Link>
                    </li>
                    <li>
                        <Link to="/profile" className="navbar-link">My Profile</Link>
                    </li>
                    <li>
                        <Link to="/booking-history" className="navbar-link">Booking History</Link>
                    </li>
                    <li>
                        <Link to="/pnr-status" className="navbar-link">PNR Status</Link>
                    </li>
                    <li>
                        <Link to="/timetable" className="navbar-link">Train Schedule</Link>
                    </li>
                    <li>
                        <Link onClick={handleLogout} className="navbar-link logout-button">
                            Logout
                        </Link>
                    </li>
                </ul>
            </nav>
        </>
    );
}

export default Navbar;
