import React, { useState } from 'react';
import './dashboard.css';
import Navbar from '../Nav/navbar1';
import { useNavigate } from 'react-router-dom';
import AddAdminModal from '../Credentials/register'; // New modal component

const TrainManagement = () => {
  const navigate = useNavigate();
  const [showAdminModal, setShowAdminModal] = useState(false);

  return (
    <>
      <Navbar />
      <div className="train-management">
        <button className='manage-btn' onClick={() => navigate('/admin/add-train')}>Train Management</button>
        <button className='manage-btn' onClick={() => navigate('/admin/tte')}>Manage TTE</button>
        <button className='manage-btn' onClick={() => setShowAdminModal(true)}>Add new admin</button>
        
        {/* Modal for adding new admin */}
        <AddAdminModal 
          show={showAdminModal}
          onClose={() => setShowAdminModal(false)}
        />
      </div>
    </>
  );
};

export default TrainManagement;