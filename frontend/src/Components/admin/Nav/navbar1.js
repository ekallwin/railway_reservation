import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faX } from '@fortawesome/free-solid-svg-icons';
function Navbar() {
    const navigate = useNavigate();
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
    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        navigate("/admin", { replace: true });
        window.location.reload();
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-logo">Railway Admin</div>
                <div className="menu-icon" onClick={toggleMenu}>
                    {isOpen ? (
                        <FontAwesomeIcon icon={faX} className="menu-icon-close" size="2xl" />
                    ) : (
                        <FontAwesomeIcon icon={faBars} className="menu-icon-bars" size="2xl" />
                    )}
                </div>
                <ul className={`navbar-links ${isOpen ? "open" : ""}`}>
                    <li>
                        <Link to="/admin/dashboard" className="navbar-link">Home</Link>
                    </li>
                    
                    <li>
                        <Link onClick={handleLogout} className="navbar-link logout-button">
                            Logout
                        </Link>
                    </li>
                </ul>
            </nav>
        </>
    )
}
export default Navbar;