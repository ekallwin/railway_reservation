import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../Nav/navbar';
import '../trains.css'

const DeleteTrain = () => {
  const [searchTrainNumber, setSearchTrainNumber] = useState('');
  const [trainData, setTrainData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTrainDetails = async () => {
    if (!searchTrainNumber) {
      toast.error("Please enter a train number!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://railway-reservation-backend-ekallwin.vercel.app/train/${searchTrainNumber}`);
      const data = await response.json();
      if (response.ok) {
        setTrainData(data);
      } else {
        toast.error("Train not found!");
        setTrainData(null);
      }
    } catch (error) {
      toast.error("Server error: Unable to fetch train details.");
    }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://railway-reservation-backend-ekallwin.vercel.app/update-train/${trainData.trainNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainData)
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Train details updated successfully!");
      } else {
        toast.error(result.message || "Update failed. Please try again.");
      }
    } catch (error) {
      toast.error("Server error: Unable to update train details.");
    }
  };

  const handleDelete = async () => {
    if (!trainData) {
      toast.error("No train selected to delete!");
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete Train ${trainData.trainNumber}?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`https://railway-reservation-backend-ekallwin.vercel.app/delete-train/${trainData.trainNumber}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Train deleted successfully!");
        setTrainData(null);
        setSearchTrainNumber('');
      } else {
        toast.error("Failed to delete train. Please try again.");
      }
    } catch (error) {
      toast.error("Server error: Unable to delete train.");
    }
  };

  return (
    <>
    <Navbar />
    <div className="update-train-form">
      <h2>Delete Train</h2>
      <div className="search-bar" style={{display: 'flex'}}>
        <input
          type="number"
          placeholder="Enter Train Number"
          value={searchTrainNumber}
          onChange={(e) => setSearchTrainNumber(e.target.value.replace(/\D/g, '').slice(0, 5))}
          maxLength={5}
        />
        <button onClick={fetchTrainDetails} className='search-btn' disabled={loading}>Search</button>
      </div>

      {trainData && (
        <form onSubmit={handleUpdate}>
          <label>
            Train Number
            <input type="text" value={trainData.trainNumber} disabled />
          </label>
          <label>
            Train Name
            <input type="text" value={trainData.trainName} disabled/>
          </label>

          <button type="button" className='remove-btn' onClick={handleDelete}>Delete Train</button>
        </form>
      )}
    </div>
    </>
  );
};

export default DeleteTrain;
