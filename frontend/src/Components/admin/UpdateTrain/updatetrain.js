import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Stations from '../../Stations';
import '../trains.css';
import Navbar from '../Nav/navbar';

const UpdateTrain = () => {
  const [searchTrainNumber, setSearchTrainNumber] = useState('');
  const [trainData, setTrainData] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(false);

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
        setAvailableClasses(
          Object.keys(data.seatAvailability?.general || {}).map(classKey => {
            const match = classKey.match(/\(([^)]+)\)$/);
            const extractedClassCode = match ? match[1] : classKey;

            return {
              classType: extractedClassCode,
              general: data.seatAvailability.general[classKey] || '',
              tatkal: data.seatAvailability.tatkal[classKey] || '',
              totalCoaches: data.seatAvailability.totalCoaches[classKey] || '',
            };
          })
        );
        setRunningDays(data.runningDays || {});
      } else {
        toast.error(data.message || "Train not found!");
        setTrainData(null);
      }
    } catch (error) {
      console.error("Error fetching train details:", error);
      toast.error("Server error: Unable to fetch train details.");
    }
    setLoading(false);
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



  const handleUpdate = async (e) => {
    e.preventDefault();

    const formattedSeatAvailability = {
      general: {},
      tatkal: {},
      totalCoaches: {},
      seatsPerCoach: {}
    };

    availableClasses.forEach(({ classType, general, tatkal, totalCoaches }) => {
      if (!classType) {
        toast.error("Please select a seat class.");
        return;
      }

      const formattedClassType = `${seatClasses.find(cls => cls.code === classType)?.name || ''} (${classType})`;

      formattedSeatAvailability.general[formattedClassType] = parseInt(general, 10) || 0;
      formattedSeatAvailability.tatkal[formattedClassType] = ["1A", "EC"].includes(classType) ? "Not Available" : (parseInt(tatkal, 10) || 0);
      formattedSeatAvailability.totalCoaches[formattedClassType] = parseInt(totalCoaches, 10) || 0;
    });

    try {
      const response = await fetch(`https://railway-reservation-backend-ekallwin.vercel.app/update-train/${trainData.trainNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...trainData, seatAvailability: formattedSeatAvailability, runningDays })
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Train details updated successfully!");

        setSearchTrainNumber('');
        setTrainData(null);
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
        toast.error(result.message || "Update failed.");
      }
    } catch (error) {
      toast.error("Server error: Unable to update train details.");
    }
  };





  const addIntermediateStation = () => {
    setTrainData({ ...trainData, intermediate: [...trainData.intermediate, { name: '', arrival: '', departure: '', distance: '', day: '' }] });
  };

  const removeIntermediateStation = (index) => {
    setTrainData(prevData => ({
      ...prevData,
      intermediate: prevData.intermediate.filter((_, i) => i !== index)
    }));
  };

  return (
    <>
      <Navbar />
      <div className="update-train-form">
        <h2>Update Train</h2>
        <div className="search-bar" style={{ display: 'flex' }}>
          <input
            type="number"
            inputMode='numeric'
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
              <input
                type="text"
                value={trainData.trainNumber}
                onChange={(e) => setTrainData({ ...trainData, trainNumber: e.target.value })}
                readOnly
              />

            </label>
            <label>
              Train Name
              <input type="text" value={trainData.trainName} onChange={(e) => setTrainData({ ...trainData, trainName: e.target.value })} />
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
              <Stations selectedStation={trainData.source.station} setSelectedStation={(value) => setTrainData({ ...trainData, source: { ...trainData.source, station: value } })} />
            </label>
            <label>
              Departure Time
              <input type="time" value={trainData.source.departure} onChange={(e) => setTrainData({ ...trainData, source: { ...trainData.source, departure: e.target.value } })} />
            </label>
            <label>
              Day:
              <input
                type="text"
                value={trainData.source.day || ''}
                onChange={(e) => setTrainData({
                  ...trainData,
                  source: { ...trainData.source, day: e.target.value.replace(/\D/g, '').slice(0, 1) }
                })}
              />
            </label>

            <h3>Add Stations</h3>
            {trainData.intermediate.map((station, index) => (
              <div key={index} className="intermediate-station">
                <h4>Station {index + 2}</h4>
                <label>
                  Station Name
                  <Stations
                    selectedStation={trainData.intermediate[index]?.station || ''}
                    setSelectedStation={(value) => {
                      const updatedStations = [...trainData.intermediate];
                      updatedStations[index] = {
                        ...updatedStations[index],
                        station: value
                      };
                      setTrainData({ ...trainData, intermediate: updatedStations });
                    }}
                  />
                </label>

                <label>
                  Arrival Time
                  <input type="time" value={station.arrival} onChange={(e) => {
                    const updatedStations = [...trainData.intermediate];
                    updatedStations[index].arrival = e.target.value;
                    setTrainData({ ...trainData, intermediate: updatedStations });
                  }} />
                </label>
                <label>
                  Departure Time
                  <input type="time" value={station.departure} onChange={(e) => {
                    const updatedStations = [...trainData.intermediate];
                    updatedStations[index].departure = e.target.value;
                    setTrainData({ ...trainData, intermediate: updatedStations });
                  }} />
                </label>
                <label>
                  Day:
                  <input
                    type="text"
                    value={station.day || ''}
                    onChange={(e) => {
                      const updatedStations = [...trainData.intermediate];
                      updatedStations[index].day = e.target.value.replace(/\D/g, '').slice(0, 1);
                      setTrainData({ ...trainData, intermediate: updatedStations });
                    }}
                  />
                </label>

                <label>
                  Distance (KM)
                  <input type="number" value={station.distance || ''} onChange={(e) => {
                    const updatedStations = [...trainData.intermediate];
                    updatedStations[index].distance = e.target.value;
                    setTrainData({ ...trainData, intermediate: updatedStations });
                  }} />
                </label>
                <button type="button" className='remove-btn' onClick={() => removeIntermediateStation(index)}>Remove</button>

              </div>
            ))}
            <button type="button" className='add' style={{ marginTop: '-1px' }} onClick={addIntermediateStation}>Add Station</button>
            <h3>Destination</h3>
            <label>
              Destination Station
              <Stations selectedStation={trainData.destination.station} setSelectedStation={(value) => setTrainData({ ...trainData, destination: { ...trainData.destination, station: value } })} />
            </label>
            <label>
              Destination Arrival Time
              <input type="time" value={trainData.destination.arrival} onChange={(e) => setTrainData({ ...trainData, destination: { ...trainData.destination, arrival: e.target.value } })} />
            </label>
            <label>
              Destination Day:
              <input
                type="text"
                value={trainData.destination.day || ''}
                onChange={(e) => setTrainData({
                  ...trainData,
                  destination: { ...trainData.destination, day: e.target.value.replace(/\D/g, '').slice(0, 1) }
                })}
              />
            </label>

            <label>
              Distance (KM)

              <input
                type="text"
                value={trainData.destination?.distance || ''}
                onChange={(e) => {
                  setTrainData({
                    ...trainData,
                    destination: {
                      ...trainData.destination,
                      distance: e.target.value
                    }
                  });
                }}
              />
            </label>

            <h3>Seat Availability</h3>
            {availableClasses.map(({ classType, general, tatkal, totalCoaches, seatsPerCoach }, index) => (
              <div key={index} className="seat-row">
                <label>Class</label>
                <select
                  value={classType}
                  onChange={(e) => {
                    const newClassType = e.target.value;
                    setAvailableClasses(prev =>
                      prev.map((cls, i) => (i === index ? { ...cls, classType: newClassType } : cls))
                    );
                  }}
                >
                  <option value="">Select Class</option>
                  {seatClasses.map((cls) => (
                    <option key={cls.code} value={cls.code}>
                      {cls.name} ({cls.code})
                    </option>
                  ))}
                </select>


                <label>General Seats</label>
                <input type="number" placeholder="General" value={general} onChange={(e) => setAvailableClasses((prev) => prev.map((cls, i) => i === index ? { ...cls, general: e.target.value } : cls))} />
                <label>Tatkal Seats</label>
                <input type="text" placeholder="Tatkal" value={tatkal} onChange={(e) => setAvailableClasses((prev) => prev.map((cls, i) => i === index ? { ...cls, tatkal: e.target.value } : cls))} disabled={["1A", "EC"].includes(classType)} />
                <label>Total Coaches</label>
                <input type="number" value={totalCoaches}
                  onChange={(e) => handleSeatInputChange(index, 'totalCoaches', e.target.value)} />




                <button type="button" className='remove-btn' onClick={() => setAvailableClasses((prev) => prev.filter((_, i) => i !== index))}>Remove</button>

              </div>
            ))}
            <button type="button" className='add' onClick={() => setAvailableClasses([...availableClasses, { classType: '', general: '', tatkal: '' }])}>Add Class</button>
            <button type="submit" className='btn-uptrn'>Update Train</button>
          </form>
        )}
      </div>
    </>
  );
};

export default UpdateTrain;
