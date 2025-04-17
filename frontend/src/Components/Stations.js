import React, { useState, useEffect, useRef } from 'react';

const Stations = ({ selectedStation, setSelectedStation, type }) => {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch('https://api-allwin.github.io/Indian_Railway_Stations/Railway_stations.json')
      .then((response) => response.json())
      .then((data) => setStations(data))
      .catch((error) => console.error('Error fetching stations:', error));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = stations.filter(station =>
        station.STATION_NAME && station.CODE && station.RAILWAY_ZONE &&
        (station.STATION_NAME.toLowerCase().includes(search.toLowerCase()) ||
          station.CODE.toLowerCase().includes(search.toLowerCase()) ||
          station.RAILWAY_ZONE.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredStations(filtered);
      setShowDropdown(true);
      setSelectedIndex(-1);
    } else {
      setShowDropdown(false);
    }
  }, [search, stations]);

  const handleSelect = (station) => {
    setSelectedStation(`${station.STATION_NAME} - ${station.CODE}`);
    setSearch('');
    setShowDropdown(false);
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, filteredStations.length - 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      handleSelect(filteredStations[selectedIndex]);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setSelectedStation('');
  };

  return (
    <div className="station-dropdown" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search station..."
        value={selectedStation || search}
        onChange={handleSearchChange}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        className='stn-inp'
      />
      {showDropdown && filteredStations.length > 0 ? (
        <ul className="dropdown-menu">
          {filteredStations.map((station, index) => (
            <li
              key={station.CODE}
              onClick={() => handleSelect(station)}
              style={{ backgroundColor: selectedIndex === index ? '#2692ffe6' : 'transparent' }}
            >
              {station.STATION_NAME} - {station.CODE}
            </li>
          ))}
        </ul>
      ) : (search && !showDropdown) ? (
        <p className="no-results">No stations found</p>
      ) : null}
    </div>
  );
};

export default Stations;