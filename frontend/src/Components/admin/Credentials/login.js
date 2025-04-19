import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye, faCircleExclamation, faBars, faX } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import '../admin.css';
import Flag from '../Image/flag.png';
import Loader from '../../User/loader/loader';

const Signin = () => {
  const apiUrl = "https://railway-reservation.onrender.com";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    adminPhone: '',
    adminPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    const newErrors = {};

    if (!formData.adminPhone.trim()) {
      newErrors.adminPhone = "Phone number is required";
      isValid = false;
    }

    if (!formData.adminPassword.trim()) {
      newErrors.adminPassword = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    try {
      setLoading(true);
      const response = await fetch(apiUrl + "/login-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      sessionStorage.setItem("adminId", data.admin._id);
      sessionStorage.setItem("adminName", data.admin.adminName);
      sessionStorage.setItem("adminPhone", data.admin.adminPhone);

      setFormData({ adminPhone: '', adminPassword: '' });

      toast.success("Login successful");

      navigate('/admin/dashboard', { replace: true });

    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false)
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
          <h2>Login</h2>

          <div className="input-container">
            <img src={Flag} alt="Indian Flag" style={{ position: 'absolute', top: '20px', left: '8px', width: '28px', height: '20px', pointerEvents: 'none' }} />
            <input
              id="phoneno"
              type="number"
              inputMode="numeric"
              name="adminPhone"
              value={formData.adminPhone}
              onChange={(e) => {
                if (e.target.value.length <= 10) {
                  handleChange(e);
                }
              }}
              placeholder=" "
              maxLength="10"
            />
            <label style={{ marginLeft: '30px' }}>Phone Number</label>
            {errors.adminPhone && <div className="error-message"><FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.adminPhone}</div>}
          </div>

          <div className="input-container">
            <input type={showPassword ? "text" : "password"} name="adminPassword" value={formData.adminPassword} onChange={handleChange} placeholder=" " />
            <label>Password</label>
            <FontAwesomeIcon style={{ top: '20px' }} icon={showPassword ? faEye : faEyeSlash} className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)} />
            {errors.adminPassword && <div className="error-message"><FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.adminPassword}</div>}
          </div>

          <button type="submit" className='button' disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {/* <p style={{ textAlign: 'center' }}>Don't have an account? <Link to="/admin/register">Register</Link></p> */}
        </form>
      </div>
    </>
  );
};

export default Signin;
