import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Loader from '../../User/loader/loader';
import Navbar from '../Nav/navbar1';

const AdminChangePassword = () => {
    const apiurl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        phone: localStorage.getItem("adminPhone") || "",
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (!formData.currentPassword.trim()) {
            newErrors.currentPassword = "Current password is required";
            isValid = false;
        }

        if (!formData.newPassword.trim()) {
            newErrors.newPassword = "New password is required";
            isValid = false;
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters";
            isValid = false;
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Confirm password is required";
            isValid = false;
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            const response = await fetch(`${apiurl}/change-admin-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adminPhone: formData.phone,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });


            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Password change failed");
            }

            toast.success("Password changed successfully");
            navigate('/admin/dashboard');
        } catch (error) {
            console.error("Password Change Error:", error);
            toast.error(error.message || "Password change failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword({ ...showPassword, [field]: !showPassword[field] });
    };


    return (
        <>
            {loading && <Loader />}
            <Navbar />
            <div className="container">
                <form onSubmit={handleSubmit}>
                    <h2>Change Password</h2>

                    <div className="input-container">
                        <input
                            type={showPassword.currentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            placeholder=" "
                        />
                        <label>Current Password</label>
                        <FontAwesomeIcon
                            style={{ top: '20px' }}
                            icon={showPassword.currentPassword ? faEye : faEyeSlash}
                            className="password-toggle-icon"
                            onClick={() => togglePasswordVisibility('currentPassword')}
                        />
                        {errors.currentPassword && (
                            <div className="error-message">
                                <FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.currentPassword}
                            </div>
                        )}
                    </div>

                    <div className="input-container">
                        <input
                            type={showPassword.newPassword ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder=" "
                        />
                        <label>New Password</label>
                        <FontAwesomeIcon
                            style={{ top: '20px' }}
                            icon={showPassword.newPassword ? faEye : faEyeSlash}
                            className="password-toggle-icon"
                            onClick={() => togglePasswordVisibility('newPassword')}
                        />
                        {errors.newPassword && (
                            <div className="error-message">
                                <FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.newPassword}
                            </div>
                        )}
                    </div>

                    <div className="input-container">
                        <input
                            type={showPassword.confirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder=" "
                        />
                        <label>Confirm Password</label>
                        <FontAwesomeIcon
                            style={{ top: '20px' }}
                            icon={showPassword.confirmPassword ? faEye : faEyeSlash}
                            className="password-toggle-icon"
                            onClick={() => togglePasswordVisibility('confirmPassword')}
                        />
                        {errors.confirmPassword && (
                            <div className="error-message">
                                <FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'red' }} /> {errors.confirmPassword}
                            </div>
                        )}
                    </div>

                    <button type="submit" className='button' disabled={loading}>
                        {loading ? 'Changing Password...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default AdminChangePassword;