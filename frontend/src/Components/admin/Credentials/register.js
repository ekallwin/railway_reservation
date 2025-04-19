import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faCircleExclamation, faX, faBars } from "@fortawesome/free-solid-svg-icons";
import Flag from '../Image/flag.png';
import '../admin.css';
import { toast } from 'react-toastify';
import Loader from '../../User/loader/loader';

const Signup = () => {
  const apiurl = "https://railway-reservation.onrender.com";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    adminName: "",
    adminPhone: "",
    adminEmail: "",
    adminPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const phoneRegex = /^(?!([0-9])\1{9})[6-9]\d{9}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|edu\.in|net|co\.in)$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "adminName") {
      if (!/^[a-zA-Z\s]*$/.test(value)) return;
      formattedValue = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    }

    if (name === "adminEmail") {
      formattedValue = value.toLowerCase().replace(/\s/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let isValid = true;
    const newErrors = {};

    if (!formData.adminName.trim()) {
      newErrors.adminName = "Name is required";
      isValid = false;
    }
    if (!formData.adminPhone.trim() || !phoneRegex.test(formData.adminPhone.trim())) {
      newErrors.adminPhone = "Invalid phone number";
      isValid = false;
    }
    if (!formData.adminEmail.trim() || !emailRegex.test(formData.adminEmail.trim())) {
      newErrors.adminEmail = "Invalid email address";
      isValid = false;
    }
    if (!formData.adminPassword.trim() || formData.adminPassword.length < 6) {
      newErrors.adminPassword = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setLoading(true);
      fetch(apiurl + "/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.status === 201) {
            toast.success(data.message);
            setFormData({ adminName: "", adminPhone: "", adminEmail: "", adminPassword: "" });
            setTimeout(() => navigate("/login"), 1500);
          } else {
            toast.error(data.message);
          }
        })
        .catch(() => toast.error("Network error, please try again."))
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

        </ul>
      </nav>

      <div className="container">
        <form onSubmit={handleSubmit}>
          <h2>Register</h2>

          <div className="input-container">
            <input type="text" name="adminName" value={formData.adminName} onChange={handleChange} placeholder=" " />
            <label>Name</label>
            {errors.adminName && <div className="error-message"><FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.adminName}</div>}
          </div>

          <div className="input-container">
            <img src={Flag} alt="Indian Flag" style={{ position: 'absolute', top: '20px', left: '8px', width: '28px', height: '20px', pointerEvents: 'none' }} />
            <input type="number" inputMode='numeric' id='phoneno' name="adminPhone" value={formData.adminPhone} onChange={handleChange} placeholder=" " maxLength="10" onKeyPress={(e) => e.target.value.length >= 10 && e.preventDefault()} />
            <label style={{ marginLeft: '30px' }}>Phone Number</label>
            {errors.adminPhone && <div className="error-message"><FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.adminPhone}</div>}
          </div>

          <div className="input-container">
            <input type="text" name="adminEmail" value={formData.adminEmail} onChange={handleChange} placeholder=" " />
            <label>Email Address</label>
            {errors.adminEmail && <div className="error-message"><FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.adminEmail}</div>}
          </div>

          <div className="input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              name="adminPassword"
              value={formData.adminPassword}
              onChange={handleChange}
              placeholder=" "
              className="password-input"
            />
            <label>Create admin Password</label>
            {errors.adminPassword && <div className="error-message"><FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.adminPassword}</div>}

            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <button type="submit" className='button'>Sign Up</button>
          <p style={{ textAlign: 'center' }}>Already have an account? <Link to="/admin">Login</Link></p>
        </form>
      </div>
    </>

  );
};

export default Signup;
