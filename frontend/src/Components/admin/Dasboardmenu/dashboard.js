import React from 'react';
import './dashboard.css';
import Navbar from '../Nav/navbar1';
import { useNavigate } from 'react-router-dom';
import './dashboard.css'
const TrainManagement = () => {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <div className="train-management">
        <button className='manage-btn' onClick={() => navigate('/admin/add-train')}>Train Management</button>
        <button className='manage-btn' onClick={() => navigate('/admin/tte')}>Manage TTE</button>
      </div>
    </>

  );
};

export default TrainManagement;
