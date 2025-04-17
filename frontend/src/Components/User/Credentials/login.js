import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye, faCircleExclamation, faBars, faX } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import '../user.css';
import Flag from '../Image/flag.png';

const Signin = () => {
  const apiUrl = "https://railway-reservation-backend-ekallwin.vercel.app";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let isValid = true;
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      fetch(apiUrl + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then(res => res.json())
        .then(data => {
          if (data.message === "No user found") {
            toast.error("No user found");
          } else if (data.message === "Invalid credentials") {
            toast.error("Invalid credentials");
          } else {
            toast.success("Login success");

            localStorage.setItem("user", JSON.stringify(data.user));

            setTimeout(() => navigate("/booking"), 100);
          }
        })
        .catch(error => {
          console.error("Login Error:", error);
          toast.error("Network error, please try again");
        });
    }
  };




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
        </ul>
      </nav>

      <div className="container">
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>

          <div className="input-container">
            <img src={Flag} alt="Indian Flag" style={{ position: 'absolute', top: '20px', left: '8px', width: '28px', height: '20px', pointerEvents: 'none' }} />
            <input
              id="phoneno"
              type="text"
              inputMode="numeric"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                const { value } = e.target;
                const onlyDigits = value.replace(/\D/g, '');
                if (onlyDigits.length <= 10) {
                  setFormData({ ...formData, phone: onlyDigits });
                  setErrors({ ...errors, phone: '' });
                }
              }}
              placeholder=" "
              maxLength="10"
            />
            <label style={{ marginLeft: '30px' }}>Phone Number</label>
            {errors.phone && <div className="error-message"><FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.phone}</div>}
          </div>

          <div className="input-container">
            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder=" " />
            <label>Password</label>
            <FontAwesomeIcon style={{ top: '20px' }}
              icon={showPassword ? faEye : faEyeSlash}
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
            {errors.password && <div className="error-message"><FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.password}</div>}
          </div>

          <button type="submit" className='button'>Login</button>
          <p style={{ textAlign: 'center' }}>Don't have an account? <Link to="/register">Register</Link></p>
        </form>
      </div>
    </>
  );
};

export default Signin;