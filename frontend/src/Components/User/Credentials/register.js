import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faCircleExclamation, faX, faBars } from "@fortawesome/free-solid-svg-icons";
import Flag from '../Image/flag.png';
import Loader from '../loader/loader';
import '../user.css';
import { toast } from 'react-toastify';

const Signup = () => {
  const apiurl = "https://railway-reservation.onrender.com";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const phoneRegex = /^(?!([0-9])\1{9})[6-9]\d{9}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|edu\.in|net|co\.in)$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "name") {
      if (!/^[a-zA-Z\s]*$/.test(value)) return;
      formattedValue = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    }

    if (name === "email") {
      formattedValue = value.toLowerCase().replace(/\s/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  let isValid = true;
  const newErrors = {};

  if (!formData.name.trim()) {
    newErrors.name = "Name is required";
    isValid = false;
  }
  if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) {
    newErrors.phone = "Invalid phone number";
    isValid = false;
  }
  if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
    newErrors.email = "Invalid email address";
    isValid = false;
  }
  if (!formData.password.trim() || formData.password.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
    isValid = false;
  }

  setErrors(newErrors);

  if (isValid) {
    setLoading(true); // <--- FIX: Add this line to show the loader

    fetch(apiurl + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 201) {
          toast.success(data.message);
          setFormData({ name: "", phone: "", email: "", password: "" });
          setTimeout(() => navigate("/login"), 1500);
        } else {
          toast.error(data.message);
        }
      })
      .catch(() => {
        toast.error("Network error, please try again.");
      })
      .finally(() => setLoading(false));
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
    {loading && <Loader />}
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
            <Link to="/pnr-status" className="navbar-link">PNR Status</Link>
          </li>
          <li>
            <Link to="/timetable" className="navbar-link">Train Schedule</Link>
          </li>
        </ul>
      </nav>


      <div className="container">
        <form onSubmit={handleSubmit}>
          <h2>Register</h2>

          <div className="input-container">
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder=" " />
            <label>Name</label>
            {errors.name && <div className="error-message"><FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red', }} /> {errors.name}</div>}
          </div>

          <div className="input-container">
            <img src={Flag} alt="Indian Flag" style={{ position: 'absolute', top: '20px', left: '8px', width: '28px', height: '20px', pointerEvents: 'none' }} />
            <input
              id="phoneno"
              type="number"
              inputMode="numeric"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                if (e.target.value.length <= 10) {
                  handleChange(e);
                }
              }}
              placeholder=" "
              maxLength="10"
            />
            <label style={{ marginLeft: '30px' }}>Phone Number</label>
            {errors.phone && <div className="error-message"><FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.phone}</div>}
          </div>

          <div className="input-container">
            <input type="text" name="email" value={formData.email} onChange={handleChange} placeholder=" " />
            <label>Email Address</label>
            {errors.email && <div className="error-message"><FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.email}</div>}
          </div>

          <div className="input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              className="password-input"
            />
            <label>Create a Password</label>
            {errors.password && <div className="error-message"><FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.password}</div>}

            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <button type="submit" className='button' disabled={loading}>
            {loading ? "Signing up..." : 'Sign Up'}
            </button>

          <p style={{ textAlign: 'center' }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </>

  );
};

export default Signup;
