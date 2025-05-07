import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCatSearch } from '../contexts/CatSearchContext';
import { useAxios } from './useAxios';
import { useCatsContext } from '../contexts/CatsContext';
import useGeolocation from './useGeolocation';
import { reverseGeocode } from '../utils/geocodingService';
import { convertToEnum } from '../utils/enumUtils';

export const useRegisterCat = () => {
  const { formatValue, refreshCatLists } = useCatSearch();
  const axios = useAxios();
  const { fetchCats, userAddress } = useCatsContext();
  const { getCurrentPosition, isLocating, geoError, setGeoError } = useGeolocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Format today's date as YYYY-MM-DD HH:MM:SS.SSS for the database
  const now = new Date();
  const formattedDate = now.getFullYear() + '-' + 
                      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(now.getDate()).padStart(2, '0') + ' ' + 
                      String(now.getHours()).padStart(2, '0') + ':' + 
                      String(now.getMinutes()).padStart(2, '0') + ':' + 
                      String(now.getSeconds()).padStart(2, '0') + '.' +
                      String(now.getMilliseconds()).padStart(3, '0');
  
  // Format today's date as YYYY-MM-DD for the date input display
  const todayForInput = now.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: t('cat.defaultName', 'Mittens'),
    breed: "SIAMESE",
    color: "BLANC",
    dateOfBirth: "",
    imageUrls: [],
    gender: "Femelle",
    chipNumber: "123456789",
    furType: "COURTE",
    eyeColor: "BLEU",
    comment: t('cat.defaultComment', 'Chat très amical et joueur.'),
    vaccinated: false,
    sterilized: false,
    statusCat: "LOST",
    reportDate: todayForInput,
    location: {
      latitude: "", 
      longitude: "",
      address: "",
      city: "",
      postalCode: ""
    }
  });

  const [validationErrors, setValidationErrors] = useState({
    dateOfBirth: "",
    reportDate: "",
    dateComparison: ""
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(Date.now());

  // Préremplir la localisation avec userAddress dès que disponible
  useEffect(() => {
    if (userAddress) {
      setFormData(prev => ({
        ...prev,
        location: {
          latitude: userAddress.latitude || "",
          longitude: userAddress.longitude || "",
          address: userAddress.address || "",
          city: userAddress.city || "",
          postalCode: userAddress.postalCode || ""
        }
      }));
    }
  }, [userAddress]);

  const updateLocationFromCoordinates = async (longitude, latitude) => {
    try {
      const addressInfo = await reverseGeocode(longitude, latitude);
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          longitude,
          latitude,
          address: addressInfo?.address || "",
          city: addressInfo?.city || "",
          postalCode: addressInfo?.postalCode || ""
        }
      }));
    } catch (error) {
      console.error("Erreur lors de la géocodification inverse:", error);
    }
  };

  const handleRequestCurrentLocation = () => {
    getCurrentPosition()
      .then(position => {
        updateLocationFromCoordinates(position.longitude, position.latitude);
      })
      .catch(() => {
        setGeoError(t('cat.geoError', 'Impossible d\'obtenir votre position actuelle'));
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    const newValidationErrors = { ...validationErrors };
    //const updatedFormData = { ...formData, [name]: value };
    const tempFormData = { ...formData, [name]: value };
    
    if (name === "dateOfBirth") {
      if (value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
          newValidationErrors.dateOfBirth = t('cat.errorFutureBirthDate', 'La date de naissance ne peut pas être dans le futur');
        } else {
          newValidationErrors.dateOfBirth = "";
        }
        
        if (tempFormData.reportDate) {
          const reportDate = new Date(tempFormData.reportDate);
          if (selectedDate > reportDate) {
            newValidationErrors.dateComparison = t('cat.errorDateComparison', 'La date de signalement ne peut pas être antérieure à la date de naissance');
          } else {
            newValidationErrors.dateComparison = "";
          }
        }
      } else {
        newValidationErrors.dateOfBirth = "";
        newValidationErrors.dateComparison = "";
      }
    }
    
    if (name === "reportDate") {
      if (value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
          newValidationErrors.reportDate = t('cat.errorFutureReportDate', 'La date de signalement ne peut pas être dans le futur');
        } else {
          newValidationErrors.reportDate = "";
        }
        
        if (tempFormData.dateOfBirth) {
          const birthDate = new Date(tempFormData.dateOfBirth);
          if (birthDate > selectedDate) {
            newValidationErrors.dateComparison = t('cat.errorDateComparison', 'La date de signalement ne peut pas être antérieure à la date de naissance');
          } else {
            newValidationErrors.dateComparison = "";
          }
        }
      } else {
        newValidationErrors.reportDate = "";
      }
    }
    
    setValidationErrors(newValidationErrors);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (selectedOption, action) => {
    setFormData(prev => ({
      ...prev,
      [action.name]: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleImageUploaded = (imageData) => {
    if (Array.isArray(imageData)) {
      setFormData(prev => ({
        ...prev,
        imageUrls: imageData
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        imageUrls: imageData ? [imageData] : []
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validationErrors.dateOfBirth || validationErrors.reportDate || validationErrors.dateComparison) {
      return;
    }
    
    const name = formData.name.trim() === "" ? t('cat.unknown', 'Inconnu') : formData.name;
    setFormData(prev => ({
      ...prev,
      name: name
    }));
    const localisation = {
      latitude: formData.location.latitude,
      longitude: formData.location.longitude,
      address: formData.location.address,
      city: formData.location.city,
      postalCode: formData.location.postalCode
    };

    // Formater la date de naissance au format ISO si elle existe
    const formattedDateOfBirth = formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : null;

    const catStatus = {
      cat: {
        name: name,
        breed: convertToEnum(formData.breed, 'UNKNOWN'),
        color: convertToEnum(formData.color, 'AUTRE'),
        dateOfBirth: formattedDateOfBirth,
        imageUrls: formData.imageUrls,
        gender: formData.gender,
        chipNumber: formData.chipNumber,
        furType: convertToEnum(formData.furType, 'COURTE'),
        eyeColor: convertToEnum(formData.eyeColor, 'AUTRE'),
        vaccinated: formData.vaccinated,
        sterilized: formData.sterilized,
        comment: formData.comment
      },
      statusCat: convertToEnum(formData.statusCat, ''),
      reportDate: formattedDate,
      comment: formData.comment,
      location: localisation
    };

    const formDataWithPayload = new FormData();
    formDataWithPayload.append('catData', new Blob([JSON.stringify(catStatus)], {
      type: 'application/json'
    }));

    try {
      setIsUploading(true);
      const response = await axios.post('/cat/register', formDataWithPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response) {
        setShowSuccessMessage(true);
        setUploaderKey(Date.now());
        await fetchCats();
        await refreshCatLists();
        navigate('/profile');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du chat:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    formData,
    validationErrors,
    showSuccessMessage,
    isUploading,
    uploaderKey,
    isLocating,
    geoError,
    todayForInput,
    handleChange,
    handleSelectChange,
    handleImageUploaded,
    handleSubmit,
    handleRequestCurrentLocation,
    updateLocationFromCoordinates,
    setGeoError,
    setIsUploading,
    setFormData
  };
}; 