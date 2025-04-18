import React, { useState, useEffect, useRef } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import { FaMapMarkerAlt } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';


// Utiliser la variable d'environnement
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const AddressAutofill = ({ 
  value, 
  onChange, 
  onLocationSelect,
  placeholder = "Entrez une adresse"
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  // Handle clicks outside the suggestions list to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch address suggestions from Mapbox
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
      const params = new URLSearchParams({
        access_token: process.env.REACT_APP_MAPBOX_TOKEN,
        types: 'address,place',
        limit: 5,
        language: 'fr',
        country: 'be'
      });

      const response = await fetch(`${endpoint}?${params}`);
      const data = await response.json();
      
      if (data.features) {
        setSuggestions(data.features);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the input to avoid too many API calls
  const handleInputChange = (e) => {
    const value = e.target.value;
    onChange(value);
    
    // Clear any existing timeout
    if (window.addressTimeout) {
      clearTimeout(window.addressTimeout);
    }
    
    // Set a new timeout
    window.addressTimeout = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle selection of a suggestion
  const handleSuggestionClick = (suggestion) => {
    const { place_name, center } = suggestion;
    const [longitude, latitude] = center;
    
    // Extract components for address, city, postal code
    let address = place_name;
    let city = '';
    let postalCode = '';
    
    // Try to extract postal code and city from context
    if (suggestion.context) {
      const postalCodeObj = suggestion.context.find(c => c.id.startsWith('postcode'));
      const cityObj = suggestion.context.find(c => c.id.startsWith('place'));
      
      postalCode = postalCodeObj ? postalCodeObj.text : '';
      city = cityObj ? cityObj.text : '';
    }
    
    // Update the input field
    onChange(place_name);
    
    // Pass the full location data to the parent component
    if (onLocationSelect) {
      onLocationSelect({
        address,
        city,
        postalCode,
        latitude,
        longitude
      });
    }
    
    setShowSuggestions(false);
  };

  return (
    <div className="position-relative">
      <div className="input-group">
        <span className="input-group-text">
          <FaMapMarkerAlt />
        </span>
        <Form.Control
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => value && suggestions.length > 0 && setShowSuggestions(true)}
          autoComplete="off"
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <ListGroup 
          ref={suggestionsRef}
          className="position-absolute w-100 shadow-sm"
          style={{ maxHeight: '250px', overflowY: 'auto', zIndex: 1000 }}
        >
          {suggestions.map((suggestion) => (
            <ListGroup.Item 
              key={suggestion.id}
              action
              onClick={() => handleSuggestionClick(suggestion)}
              className="py-2"
            >
              <div className="d-flex align-items-center">
                <FaMapMarkerAlt className="me-2 text-primary" />
                <div>
                  <div>{suggestion.place_name}</div>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      
      {isLoading && (
        <div className="position-absolute end-0 top-0 mt-2 me-2">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressAutofill;