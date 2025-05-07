import React from 'react';
import { Card, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { useCatSearch } from '../../contexts/CatSearchContext';
import useEnums from '../../hooks/useEnums';

const CatFilters = ({ type = 'lost' }) => {
  const { t } = useTranslation();
  const { enums, loading: enumsLoading, error: enumsError } = useEnums();
  const {
    filters,
    handleFilterChange,
    useCurrentLocation,
    clearCurrentLocation,
    resetFilters,
    formatValue
  } = useCatSearch();

  // Options pour les filtres avec valeur vide pour "Toutes les options"
  const colorSelectOptions = [
    { value: "", label: t('filters.allColors', 'Toutes les couleurs') },
    ...(enums?.catColor || []).map(opt => ({
      value: opt.value,
      label: opt.label
    }))
  ];
  
  const eyeColorSelectOptions = [
    { value: "", label: t('filters.allEyeColors', "Toutes les couleurs d'yeux") },
    ...(enums?.eyeColor || []).map(opt => ({
      value: opt.value,
      label: opt.label
    }))
  ];
  
  const breedSelectOptions = [
    { value: "", label: t('filters.allBreeds', "Toutes les races") },
    ...(enums?.breed || []).map(opt => ({
      value: opt.value,
      label: opt.label
    }))
  ];

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{t('filters.title', 'Filtres')}</h5>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={resetFilters}
          >
            {t('filters.reset', 'Réinitialiser')}
          </Button>
        </div>
        <Row>
          {/* Filtres par caractéristiques */}
          <Col md={4} className="mb-3">
            <Form.Group>
              <Form.Label>{t('filters.breed', 'Race')}</Form.Label>
              <Select
                options={breedSelectOptions}
                value={breedSelectOptions.find(option => option.value === filters.breed) || breedSelectOptions[0]}
                onChange={(selectedOption) => handleFilterChange('breed', selectedOption.value)}
                isSearchable
                placeholder={t('filters.selectBreed', 'Toutes les races')}
                className="mb-3"
              />
            </Form.Group>
          </Col>
          
          <Col md={4} className="mb-3">
            <Form.Group>
              <Form.Label>{t('filters.color', 'Couleur')}</Form.Label>
              <Select
                options={colorSelectOptions}
                value={colorSelectOptions.find(option => option.value === filters.color) || colorSelectOptions[0]}
                onChange={(selectedOption) => handleFilterChange('color', selectedOption.value)}
                isSearchable
                placeholder={t('filters.selectColor', 'Toutes les couleurs')}
                className="mb-3"
              />
            </Form.Group>
          </Col>
          
          <Col md={4} className="mb-3">
            <Form.Group>
              <Form.Label>{t('filters.eyeColor', 'Couleur des yeux')}</Form.Label>
              <Select
                options={eyeColorSelectOptions}
                value={eyeColorSelectOptions.find(option => option.value === filters.eyeColor) || eyeColorSelectOptions[0]}
                onChange={(selectedOption) => handleFilterChange('eyeColor', selectedOption.value)}
                isSearchable
                placeholder={t('filters.selectEyeColor', 'Toutes les couleurs d\'yeux')}
                className="mb-3"
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Row>
          {/* Filtres par localisation */}
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>{t('filters.postalCode', 'Code postal')}</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder={t('filters.enterPostalCode', 'Entrez un code postal')}
                  value={filters.postalCode}
                  onChange={(e) => handleFilterChange('postalCode', e.target.value)}
                  disabled={filters.location.latitude && filters.location.longitude}
                />
                {filters.postalCode && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => handleFilterChange('postalCode', '')}
                  >
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Form.Group>
          </Col>
          
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>{t('filters.currentLocation', 'Position actuelle')}</Form.Label>
              <div className="d-flex">
                <Button
                  variant={filters.location.latitude ? "success" : "outline-primary"}
                  onClick={useCurrentLocation}
                  disabled={filters.postalCode !== ""}
                  className="flex-grow-1 me-2"
                >
                  <FaMapMarkerAlt className="me-2" />
                  {filters.location.latitude 
                    ? t('filters.locationUsed', 'Position utilisée') 
                    : t('filters.useLocation', 'Utiliser ma position')}
                </Button>
                
                {filters.location.latitude && (
                  <Button 
                    variant="outline-danger"
                    onClick={clearCurrentLocation}
                  >
                    <FaTimes />
                  </Button>
                )}
              </div>
              
              {filters.location.address && (
                <small className="text-muted d-block mt-1">
                  {filters.location.address}, {filters.location.postalCode} {filters.location.city}
                </small>
              )}
            </Form.Group>
          </Col>
        </Row>
        
        {/* Rayon de recherche (uniquement si la position est utilisée) */}
        {(filters.location.latitude || filters.postalCode) && (
          <Row>
            <Col md={12}>
              <Form.Group>
                <Form.Label>
                  {t('filters.searchRadius', 'Rayon de recherche')}: {filters.location.radius} km
                </Form.Label>
                <Form.Range
                  min={1}
                  max={100}
                  value={filters.location.radius}
                  onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                />
              </Form.Group>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default CatFilters; 