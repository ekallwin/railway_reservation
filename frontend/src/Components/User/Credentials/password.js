import React, { useState } from "react";
import '../user.css';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../Navbar/navbar";

const Password = () => {
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!passwordData.currentPassword.trim()) newErrors.currentPassword = "Current password is required";
    if (!passwordData.newPassword.trim() || passwordData.newPassword.length < 6) newErrors.newPassword = "New password must be at least 6 characters";
    if (passwordData.newPassword !== passwordData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || !storedUser.phone) {
      toast.error("User not found. Please log in again.");
      navigate("/login");
      return;
    }

    fetch("https://railway-reservation-backend-ekallwin.vercel.app/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: storedUser.phone,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === "Password updated successfully") {
          toast.success("Password changed successfully!");
          navigate("/profile");
        } else {
          toast.error(data.message);
        }
      })
      .catch(error => {
        console.error("Password Update Error:", error);
        toast.error("Server error, please try again.");
      });
  };


  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handleChange} placeholder=" " />
            <label>Current Password</label>
            {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
          </div>

          <div className="input-container">
            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handleChange} placeholder=" " />
            <label>New Password</label>
            {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
          </div>

          <div className="input-container">
            <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handleChange} placeholder=" " />
            <label>Re-enter New Password</label>
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>

          <button type="submit" className="button">Update Password</button>
        </form>
      </div>
    </>
  );
};

export default Password;
