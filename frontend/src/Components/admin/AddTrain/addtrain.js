import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Stations from '../../Stations';
import '../trains.css';
import Navbar from '../Nav/navbar'

const AddTrain = () => {
  const [trainNumber, setTrainNumber] = useState('');
  const [trainName, setTrainName] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [distance, setDistance] = useState('0');
  const [day, setDay] = useState('');
  const [sourceStation, setSourceStation] = useState('');
  const [destinationStation, setDestinationStation] = useState('');
  const [destinationDistance, setDestinationDistance] = useState('');
  const [destinationArrival, setDestinationArrival] = useState('');
  const [destinationDay, setDestinationDay] = useState('');
  const [intermediateStations, setIntermediateStations] = useState([]);

  const seatClasses = [
    // { code: 'EA', name: 'Anubhuti Class' },
    { code: '1A', name: 'AC First Class' },
    // { code: 'EV', name: 'Vistadome AC' },
    // { code: 'EC', name: 'Exec. Chair Car' },
    { code: '2A', name: 'AC 2 Tier' },
    // { code: 'FC', name: 'First Class' },
    { code: '3A', name: 'AC 3 Tier' },
    { code: '3E', name: 'AC 3 Economy' },
    // { code: 'VC', name: 'Vistadome Chair Car' },
    { code: 'CC', name: 'AC Chair car' },
    { code: 'SL', name: 'Sleeper' },
    // { code: 'VS', name: 'Vistadome Non AC' },
    { code: '2S', name: 'Second Sitting' }
  ];

  const [availableClasses, setAvailableClasses] = useState([]);

  const [runningDays, setRunningDays] = useState({
    allDays: false,
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  });


  const handleAddClass = () => {
    setAvailableClasses([...availableClasses, { classType: '', general: '', tatkal: '' }]);
  };

  const handleClassChange = (index, value) => {
    const newClasses = [...availableClasses];
    newClasses[index].classType = value;
    setAvailableClasses(newClasses);
  };

  const handleSeatInputChange = (index, type, value) => {
    const newClasses = [...availableClasses];
    const parsedValue = parseInt(value, 10) || 0;

    if (type === "totalCoaches") {
      if (parsedValue <= 0) {
        toast.error("Total coaches must be at least 1.");
        return;
      }
      newClasses[index].totalCoaches = parsedValue;
    } else if (type === "tatkal") {
      const noTatkalClasses = ["1A", "EC"];
      newClasses[index].tatkal = noTatkalClasses.includes(newClasses[index].classType) ? "Not Available" : parsedValue;
    } else {
      newClasses[index][type] = parsedValue;
    }

    setAvailableClasses(newClasses);
  };

  const handleRemoveClass = (index) => {
    setAvailableClasses(availableClasses.filter((_, i) => i !== index));
  };



  const handleAddStation = () => {
    setIntermediateStations([...intermediateStations, { name: '', arrival: '', departure: '', distance: '', day: '' }]);
  };

  const handleStationChange = (index, value) => {
    const newStations = [...intermediateStations];
    newStations[index].name = value;
    setIntermediateStations(newStations);
  };

  const handleIntermediateDayChange = (index, value) => {
    const newStations = [...intermediateStations];
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 1) {
      newStations[index].day = numericValue;
      setIntermediateStations(newStations);
    }
  };

  const handleArrivalChange = (index, value) => {
    const newStations = [...intermediateStations];
    newStations[index].arrival = value;
    setIntermediateStations(newStations);
  };

  const handleDepartureChange = (index, value) => {
    const newStations = [...intermediateStations];
    newStations[index].departure = value;
    setIntermediateStations(newStations);
  };

  const handleDistanceChange = (index, value) => {
    const newStations = [...intermediateStations];
    newStations[index].distance = value;
    setIntermediateStations(newStations);
  };


  const handleRemoveStation = (index) => {
    const newStations = intermediateStations.filter((_, i) => i !== index);
    setIntermediateStations(newStations);
  };

  const handleDestinationDayChange = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 1) {
      setDestinationDay(numericValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!trainNumber || trainNumber.length !== 5) {
      toast.error("Train Number must be exactly 5 digits!");
      return;
    }
    if (!trainName.trim()) {
      toast.error("Train Name is required!");
      return;
    }
    if (!departureTime) {
      toast.error("Departure Time is required!");
      return;
    }
    if (!sourceStation) {
      toast.error("Source Station is required!");
      return;
    }
    if (!destinationStation) {
      toast.error("Destination Station is required!");
      return;
    }
    if (!destinationDistance) {
      toast.error("Destination Distance is required!");
      return;
    }
    if (!destinationDay.match(/^\d$/)) {
      toast.error("Destination Day must be a single-digit number!");
      return;
    }

    const seatAvailability = {
      general: {},
      tatkal: {},
      totalCoaches: {},
      seatsPerCoach: {}
    };

    availableClasses.forEach((seat) => {
      if (!seat.classType) {
        toast.error("Please select a seat class.");
        return;
      }
      const selectedClass = seatClasses.find(cls => cls.code === seat.classType);
      if (selectedClass) {
        const classKey = `${selectedClass.name} (${selectedClass.code})`;

        seatAvailability.general[classKey] = seat.general || "0";
        seatAvailability.tatkal[classKey] = ["1A", "EC"].includes(seat.classType) ? "Not Available" : seat.tatkal || "0";
        seatAvailability.totalCoaches[classKey] = seat.totalCoaches || "0";
      }

    });


    const trainData = {
      trainNumber,
      trainName,
      source: {
        station: sourceStation,
        departure: departureTime,
        distance,
        day,
      },
      intermediate: intermediateStations.map((station) => ({
        station: station.name,
        arrival: station.arrival,
        departure: station.departure,
        distance: station.distance,
        day: station.day,
      })),
      destination: {
        station: destinationStation,
        distance: destinationDistance,
        arrival: destinationArrival,
        day: destinationDay,
      },
      seatAvailability,
      runningDays,
    };

    try {
      const response = await fetch("https://railway-reservation-backend-ekallwin.vercel.app/add-train", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trainData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Train added successfully!");
        setTrainNumber('');
        setTrainName('');
        setDepartureTime('');
        setDistance('0');
        setDay('');
        setSourceStation('');
        setDestinationStation('');
        setDestinationDistance('');
        setDestinationArrival('');
        setDestinationDay('');
        setIntermediateStations([]);
        setAvailableClasses([]);
        setRunningDays({
          allDays: false,
          sunday: false,
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
        });
      } else {
        toast.error(result.message || "Failed to add train. Please try again.");
      }
    } catch (error) {
      toast.error("Server error: Unable to connect to the backend.");
    }
  };


  const handleDayChange = (day) => {
    if (day === 'allDays') {
      const newValue = !runningDays.allDays;
      setRunningDays({
        allDays: newValue,
        sunday: newValue,
        monday: newValue,
        tuesday: newValue,
        wednesday: newValue,
        thursday: newValue,
        friday: newValue,
        saturday: newValue,
      });
    } else {
      const updatedDays = { ...runningDays, [day]: !runningDays[day] };
      updatedDays.allDays = Object.keys(updatedDays).slice(1).every((d) => updatedDays[d]);
      setRunningDays(updatedDays);
    }
  };

  return (
    <>
      <Navbar />
      <div className="add-train-form">
        <h2>Add Train</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Train Number (5 digits)
            <input
              type="text"
              value={trainNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 5) {
                  setTrainNumber(value);
                }
              }}
            />
          </label>
          <label>
            Train Name
            <input type="text" value={trainName} onChange={(e) => setTrainName(e.target.value)} />
          </label>

          <label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required style={{ display: 'none' }}
            />
          </label>

          <div>
            <h3>Runs on:</h3>
            <div className='options'>
              <div>
                <label>
                  <input type="checkbox" checked={runningDays.allDays} onChange={() => handleDayChange('allDays')} /> All Days
                </label>
                <label>
                  <input type="checkbox" checked={runningDays.sunday} onChange={() => handleDayChange('sunday')} /> Sunday
                </label>
                <label>
                  <input type="checkbox" checked={runningDays.monday} onChange={() => handleDayChange('monday')} /> Monday
                </label>
              </div>
              <div>
                <label>
                  <input type="checkbox" checked={runningDays.tuesday} onChange={() => handleDayChange('tuesday')} /> Tuesday
                </label>
                <label>
                  <input type="checkbox" checked={runningDays.wednesday} onChange={() => handleDayChange('wednesday')} /> Wednesday
                </label>
                <label>
                  <input type="checkbox" checked={runningDays.thursday} onChange={() => handleDayChange('thursday')} /> Thursday
                </label>
              </div>
              <div>


                <label>
                  <input type="checkbox" checked={runningDays.friday} onChange={() => handleDayChange('friday')} /> Friday
                </label>
                <label>
                  <input type="checkbox" checked={runningDays.saturday} onChange={() => handleDayChange('saturday')} /> Saturday
                </label>
              </div>
            </div>
          </div>

          <label>
            Source Station
            <Stations selectedStation={sourceStation} setSelectedStation={setSourceStation} />
          </label>
          <label>
            Departure Time
            <input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
          </label>
          <label>
            Day:
            <input
              type="text"
              value={day}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 1) {
                  setDay(value);
                }
              }}
            />
          </label>


          <h3>Add Stations</h3>
          {intermediateStations.map((station, index) => (
            <div key={index} className="intermediate-station">
              <h4>Station {index + 2}</h4>
              <label>
                Station Name
                <Stations selectedStation={station.name} setSelectedStation={(value) => handleStationChange(index, value)} />
              </label>
              <label>
                Arrival Time
                <input type="time" value={station.arrival} onChange={(e) => handleArrivalChange(index, e.target.value)} />
              </label>
              <label>
                Departure Time
                <input type="time" value={station.departure} onChange={(e) => handleDepartureChange(index, e.target.value)} />
              </label>
              <label>
                Day
                <input type="text" value={station.day} onChange={(e) => handleIntermediateDayChange(index, e.target.value)} />
              </label>
              <label>
                Distance (KM)
                <input type="number" value={station.distance} onChange={(e) => handleDistanceChange(index, e.target.value)} />
              </label>
              <div key={index} className="intermediate-station">

              </div>
              <button type="button" className='remove-btn' onClick={() => handleRemoveStation(index)}>Remove</button>
            </div>
          ))}
          <button type="button" className='add' style={{ marginTop: '-1px' }} onClick={handleAddStation}>Add Station</button>
          <label>
            Destination Station
            <Stations selectedStation={destinationStation} setSelectedStation={setDestinationStation} />
          </label>

          <label>
            Destination Arrival Time
            <input type="time" value={destinationArrival} onChange={(e) => setDestinationArrival(e.target.value)} />
          </label>
          <label>
            Destination Day
            <input type="text" value={destinationDay} onChange={(e) => handleDestinationDayChange(e.target.value)} />
          </label>
          <label>
            Destination Distance (KM)
            <input type="number" value={destinationDistance} onChange={(e) => setDestinationDistance(e.target.value)} />
          </label>

          <h3>Seat Availability</h3>
          {availableClasses.map((seat, index) => (
            <div key={index} className="seat-row">
              <label>Class</label>
              <select value={seat.classType} onChange={(e) => handleClassChange(index, e.target.value)}>
                <option value="">Select Class</option>
                {seatClasses.map((cls) => (
                  <option key={cls.code} value={cls.code}>
                    {cls.name} ({cls.code})
                  </option>
                ))}
              </select>

              <label>General Seats</label>
              <input
                type="number"
                placeholder="General Seats"
                value={seat.general}
                onChange={(e) => handleSeatInputChange(index, 'general', e.target.value)}
              />

              <label>Tatkal Seats</label>
              <input
                type="text"
                placeholder="Tatkal Seats"
                value={seat.classType === "1A" || seat.classType === "EC" ? "Not Available" : seat.tatkal}
                onChange={(e) => handleSeatInputChange(index, "tatkal", e.target.value)}
                disabled={seat.classType === "1A" || seat.classType === "EC"}
              />


              <label>Total Coaches</label>
              <input
                type="number"
                placeholder="Enter total coaches"
                value={seat.totalCoaches || ""}
                onChange={(e) => handleSeatInputChange(index, 'totalCoaches', e.target.value)}
              />


              <button type="button" className='remove-btn' onClick={() => handleRemoveClass(index)}>Remove</button>
            </div>
          ))}

          <button type="button" className='add' onClick={handleAddClass}>Add Seats</button>




          <button type="submit" className='btn-addtrn'>Submit</button>
        </form>
      </div>
    </>
  );
};

export default AddTrain;
