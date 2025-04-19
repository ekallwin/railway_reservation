import React, { useState } from "react";
import { toast } from 'react-toastify';
import "./tte.css";

const DeleteTTE = ({ apiUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tteId, setTteId] = useState("");

  const handleDeleteTTE = async (event) => {
    event.preventDefault();

    if (!tteId) {
      toast.error("TTE ID is required for deletion.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/delete-tte/${tteId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("TTE deleted successfully.");
        setTteId("");
        setIsOpen(false);
      } else {
        toast.error(data.message || "Deletion failed.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Error deleting TTE. Try again.");
    }
  };

  return (
    <div className="tte-container">
      <button 
        className="action-button delete-button"
        onClick={() => setIsOpen(true)}
      >
        Delete TTE
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Delete TTE</h2>
            <form onSubmit={handleDeleteTTE}>
              <div className="tte-input">
                <label>TTE ID</label>
                <input
                  type="text"
                  value={tteId}
                  onChange={(e) => setTteId(e.target.value)}
                  placeholder="Enter TTE ID to delete"
                />
                <div className="button-group">
                  <button type="submit" className="submit-button">Delete</button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteTTE;