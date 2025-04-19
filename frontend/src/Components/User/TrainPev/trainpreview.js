import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./trainpreview.css";
import Navbar from "../Navbar/navbar";
import { toast } from "react-toastify";

const TrainPreview = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser.phone) {
            toast.error("Unauthorized access");
            navigate("/");
            return;
        }
        setTimeout(() => {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 100);
    }, [navigate]);

    const location = useLocation();
    const { train, selectedClass, availableSeats, from, to, date, quota, departure, arrival, formattedArrivalDate, duration, price } = location.state || {};

    const [passengers, setPassengers] = useState([{ name: "", age: "", gender: "", nationality: "India" }]);
    const [infants, setInfants] = useState([]);
    const [errors, setErrors] = useState([]);
   

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        const newPassengers = [...passengers];
        newPassengers[index] = { ...newPassengers[index], [name]: value };
        setPassengers(newPassengers);

        setErrors((prevErrors) => {
            if (prevErrors[index]) {
                const updatedErrors = { ...prevErrors };
                delete updatedErrors[index][name];
                if (Object.keys(updatedErrors[index]).length === 0) {
                    delete updatedErrors[index];
                }
                return updatedErrors;
            }
            return prevErrors;
        });
    };

    const handleInfantChange = (index, e) => {
        const { name, value } = e.target;
        const newInfants = [...infants];
        newInfants[index] = { ...newInfants[index], [name]: value };
        setInfants(newInfants);
    };


    const validateForm = () => {
        let newErrors = [];
        passengers.forEach((passenger, index) => {
            let passengerErrors = {};
            if (!passenger.name || passenger.name.length < 3 || passenger.name.length > 16) {
                passengerErrors.name = "Please enter a valid name between 3 and 16 characters";
            }
            if (!passenger.age || isNaN(passenger.age) || passenger.age < 5 || passenger.age > 125) {
                passengerErrors.age = "Please enter a valid age between 5 and 125";
            }
            if (!passenger.gender) {
                passengerErrors.gender = "Please select a gender";
            }
            if (Object.keys(passengerErrors).length > 0) {
                newErrors[index] = passengerErrors;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        localStorage.setItem("passengerData", JSON.stringify(passengers));

        navigate("/confirmation", {
            state: {
                train,
                selectedClass,
                availableSeats,
                from,
                to,
                date,
                quota,
                departure,
                arrival,
                formattedArrivalDate,
                duration,
                passengers,
                price
            }
        });
    };

    useEffect(() => {
        setTimeout(() => {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 100);

        const storedPassengers = JSON.parse(localStorage.getItem("passengerData"));
        if (storedPassengers && Array.isArray(storedPassengers)) {
            setPassengers(storedPassengers);
        }
    }, []);


    const addPassenger = () => {
        const maxPassengers = quota === "Tatkal" ? 4 : 6;
        if (passengers.length < maxPassengers) {
            setPassengers([...passengers, { name: "", age: "", gender: "", nationality: "India" }]);
        }
    };

    const addInfant = () => {
        // Limit infants to maximum 2
        if (infants.length < 2 && infants.length < passengers.length) {
            setInfants([...infants, { name: "", age: "Below One year", gender: "" }]);
        }
    };

    const handleRemove = (index) => {
        setPassengers(passengers.filter((_, i) => i !== index));
    };

    const handleRemoveInfant = (index) => {
        setInfants(infants.filter((_, i) => i !== index));
    };


    if (!train) {
        return toast.error("Unauthorized access") && navigate("/");
    }

    return (
        <>
            <Navbar />
            <div className="container-preview">


                <div className="train-card">
                    <div className="train-header">
                        <h2>{train.trainName} ({train.trainNumber})</h2>
                    </div>

                    <div className="train-details">
                        <div className="station-info">
                            <div className="station">
                                <p className="time">{departure}</p>
                                <p className="station-name"><strong>{from}</strong></p>
                                <p className="date">{date}</p>
                            </div>
                            <div className="travel-duration">Duration: {duration}</div>
                            <div className="station">
                                <p className="time">{arrival || "N/A"}</p>
                                <p className="station-name"><strong>{to}</strong></p>
                                <p className="date">{formattedArrivalDate || "N/A"}</p>
                            </div>
                        </div>
                        <div className="class-info">
                            <span className="class-badge">{selectedClass}</span>
                            <span className="class-badge">{quota}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <form onSubmit={handleSubmit} className="passenger-form">
                        <h3>Passenger Details</h3>
                        {passengers.map((passenger, index) => (
                            <>
                                <div key={index} className="passenger-entry" style={{ margin: '0 auto' }}>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Name"
                                        value={passenger.name}
                                        onChange={(e) => {
                                            const { name, value } = e.target;
                                            const newValue = value.toUpperCase();
                                            handleChange(index, { target: { name, value: newValue } });
                                        }}
                                        className={errors[index]?.name ? "input-error" : ""}
                                    />
                                    <div className="demographic">
                                        <input
                                            type="number"
                                            name="age"
                                            placeholder="Age"
                                            value={passenger.age}
                                            onChange={(e) => handleChange(index, e)}
                                            className={errors[index]?.age ? "input-error" : ""}
                                            style={{ width: '80px' }}
                                        />

                                        <select
                                            name="gender"
                                            value={passenger.gender}
                                            onChange={(e) => handleChange(index, e)}
                                            className={errors[index]?.gender ? "input-error" : ""}
                                        >
                                            <option value="">Gender</option>
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                            <option value="O">Other</option>
                                        </select>

                                        <select name="nationality" value={passenger.nationality} onChange={(e) => handleChange(index, e)}>
                                            <option value="India">India</option>
                                        </select>

                                    </div>
                                    <select className="berth-preference">
                                        <option value="NOPC">No Preference</option>
                                        <option value="LB">Lower</option>
                                        <option value="MB">Middle</option>
                                        <option value="UB">Upper</option>
                                        <option value="Sl">Side Lower</option>
                                        <option value="SU">Side Upper</option>
                                    </select>


                                    {passengers.length > 1 && (
                                        <button className="remove-button" onClick={() => handleRemove(index)}>
                                            Remove
                                        </button>
                                    )}

                                    <div className="error-container">
                                        {errors[index] && (
                                            <>
                                                {errors[index].name && <p className="error-text">{errors[index].name}</p>}
                                                {errors[index].age && <p className="error-text">{errors[index].age}</p>}
                                                {errors[index].gender && <p className="error-text">{errors[index].gender}</p>}
                                            </>
                                        )}
                                    </div>


                                </div>

                            </>
                        ))}

                        {infants.map((infant, index) => (
                            <>
                                <div key={`infant-${index}`} className="passenger-entry infant-entry" style={{ paddingBottom: "1px" }}>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Infant Name"
                                        value={infant.name}
                                        onChange={(e) => handleInfantChange(index, e)}
                                        className="infant-input"
                                    />
                                    <div className="demographic">
                                        <select
                                            name="age"
                                            value={infant.age}
                                            onChange={(e) => handleInfantChange(index, e)} style={{ width: '100px' }}
                                        >
                                            <option value="Below One year">Below One year</option>
                                            <option value="1">1 year</option>
                                            <option value="2">2 years</option>
                                            <option value="3">3 years</option>
                                            <option value="4">4 years</option>
                                        </select>

                                        <select
                                            name="gender"
                                            value={infant.gender}
                                            onChange={(e) => handleInfantChange(index, e)}
                                        >
                                            <option value="">Gender</option>
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                        </select>
                                    </div>

                                    <button
                                        className="remove-button"
                                        onClick={() => handleRemoveInfant(index)} style={{ marginLeft: 'auto' }}
                                    >
                                        Remove Infant
                                    </button>
                                    <div>
                                        <p><mark>Tickets is not to be issued</mark></p>
                                    </div>
                                </div>


                            </>
                        ))}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {passengers.length < 6 && <button type="button" onClick={addPassenger} className="add-button">Add Passenger</button>}
                            {infants.length < 2 && infants.length < passengers.length && (
                                <button type="button" onClick={addInfant} className="add-button" style={{ marginLeft: 'auto' }}>
                                    Add Infant
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
                            <button type="submit" className="submit-btn">Continue</button>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
};

export default TrainPreview;
