import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faX } from '@fortawesome/free-solid-svg-icons';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);


    const toggleMenu = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
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
                        <Link to="/" className="navbar-link">Home</Link>
                    </li>
                    <li>
                        <Link to="/pnr" className="navbar-link">PNR Status</Link>
                    </li>
                    <li>
                        <Link to="/timetable" className="navbar-link">Train Schedule</Link>
                    </li>
                </ul>
            </nav>
        </>
    );
}

export default Navbar;
