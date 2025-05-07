import React from "react";
import { Form, Button, Container, Alert, Card, Row, Col } from "react-bootstrap";
import Select from "react-select";
import { motion } from "framer-motion";
import { FaPaw, FaMapMarkerAlt } from "react-icons/fa";
import { buttonStyles } from "../../styles/styles";
import { useCatSearch } from "../../contexts/CatSearchContext";
import MapLocation from "../map/MapLocation";
import ImageUploader from "../common/ImageUploader";
import { useTranslation } from 'react-i18next';
import { useRegisterCat } from "../../hooks/useRegisterCat";
import useEnums from '../../hooks/useEnums';


function RegisterCat() {
  const { formatValue } = useCatSearch();
  const { enums, loading: enumsLoading, error: enumsError } = useEnums();
  const { t } = useTranslation();
  const {
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
  } = useRegisterCat();

  return (
    <Container className="py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-sm">
          <Card.Header style={{ backgroundColor: 'var(--primary-color)' }} className="text-white text-center py-3">
            <FaPaw className="me-2" size={24} />
            <h2 className="mb-0">{t('cat.register', 'Signaler un chat')}</h2>
          </Card.Header>
          <Card.Body className="p-4">
            {showSuccessMessage && (
              <Alert variant="success" className="mb-4" dismissible onClose={() => setShowSuccessMessage(false)}>
                {t('cat.registerSuccess', 'Le chat a été enregistré avec succès !')}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">{t('cat.mainInfo', 'Informations principales')}</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.status', 'Statut')}*</Form.Label>
                        <Form.Select
                          name="statusCat"
                          value={formData.statusCat}
                          onChange={handleChange}
                          required
                          disabled={enumsLoading || enumsError}
                        >
                          <option value="">{t('cat.selectStatus', '-- Sélectionnez le statut --')}</option>
                          {enums && enums.statusCat.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                        {enumsError && <div className="text-danger">Erreur lors du chargement des statuts</div>}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.name', 'Nom du chat')}</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={t('cat.enterName', 'Entrez le nom')}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.breed', 'Race')}</Form.Label>
                        <Select
                          name="breed"
                          value={formData.breed ? enums && enums.breed.find(opt => opt.value === formData.breed) : null}
                          onChange={(selectedOption) => handleSelectChange(selectedOption, { name: 'breed' })}
                          options={enums ? enums.breed : []}
                          placeholder={t('cat.selectBreed', 'Sélectionnez la race')}
                          isClearable
                          className="basic-select"
                          classNamePrefix="select"
                          isDisabled={enumsLoading || enumsError}
                          menuPlacement="auto"
                          menuPortalTarget={document.body} // <-- Ajoute ceci
                          styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }) // <-- Pour être sûr que le menu est au-dessus de tout
                          }}
                        />
                        {enumsError && <div className="text-danger">Erreur lors du chargement des races</div>}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.gender', 'Genre')}*</Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                          disabled={enumsLoading || enumsError}
                        >
                          <option value="">{t('cat.selectGender', '-- Sélectionnez le genre --')}</option>
                          {enums && enums.catGender.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                        {enumsError && <div className="text-danger">Erreur lors du chargement des genres</div>}
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  <Card>
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">{t('cat.dates', 'Dates')}</h5>
                    </Card.Header>
                    <Card.Body>
                      {validationErrors.dateComparison && (
                        <Alert variant="danger" className="mb-3">
                          {validationErrors.dateComparison}
                        </Alert>
                      )}
                      <Row>
                        <Col sm={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('cat.birthDate', 'Date de naissance')}</Form.Label>
                            <Form.Control
                              type="date"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleChange}
                              max={todayForInput}
                              isInvalid={!!validationErrors.dateOfBirth}
                              placeholder={t('cat.selectBirthDate', 'Sélectionnez la date de naissance')}
                            />
                            {validationErrors.dateOfBirth && (
                              <Form.Control.Feedback type="invalid">
                                {validationErrors.dateOfBirth}
                              </Form.Control.Feedback>
                            )}
                            <Form.Text className="text-muted">
                              {t('cat.birthDateHelp', 'Format: JJ/MM/AAAA')}
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col sm={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('cat.reportDate', 'Date de signalement')}*</Form.Label>
                            <Form.Control
                              type="date"
                              name="reportDate"
                              value={formData.reportDate}
                              onChange={handleChange}
                              max={todayForInput}
                              isInvalid={!!validationErrors.reportDate}
                              required
                            />
                            {validationErrors.reportDate && (
                              <Form.Control.Feedback type="invalid">
                                {validationErrors.reportDate}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">{t('cat.characteristics', 'Caractéristiques')}</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.color', 'Couleur')}</Form.Label>
                        <Form.Select
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          required
                          disabled={enumsLoading || enumsError}
                        >
                          <option value="">{t('cat.selectColor', '-- Sélectionnez la couleur --')}</option>
                          {enums && enums.catColor.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                        {enumsError && <div className="text-danger">Erreur lors du chargement des couleurs</div>}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.eyeColor', 'Couleur des yeux')}</Form.Label>
                        <Form.Select
                          name="eyeColor"
                          value={formData.eyeColor}
                          onChange={handleChange}
                          required
                          disabled={enumsLoading || enumsError}
                        >
                          <option value="">{t('cat.selectEyeColor', '-- Sélectionnez la couleur des yeux --')}</option>
                          {enums && enums.eyeColor.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                        {enumsError && <div className="text-danger">Erreur lors du chargement des couleurs d'yeux</div>}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.furType', 'Type de fourrure')}</Form.Label>
                        <Form.Select
                          name="furType"
                          value={formData.furType}
                          onChange={handleChange}
                          disabled={enumsLoading || enumsError}
                        >
                          <option value="">{t('cat.selectFurType', '-- Sélectionnez le type de fourrure --')}</option>
                          {enums && enums.furType.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                        {enumsError && <div className="text-danger">Erreur lors du chargement des types de fourrure</div>}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.chipNumber', 'Numéro de puce')}</Form.Label>
                        <Form.Control
                          type="text"
                          name="chipNumber"
                          value={formData.chipNumber}
                          onChange={handleChange}
                          placeholder={t('cat.enterChipNumber', 'Entrez le numéro de puce')}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.vaccinated', 'Vacciné')}</Form.Label>
                        <Form.Select
                          name="vaccinated"
                          value={formData.vaccinated === null ? '' : formData.vaccinated ? 'true' : 'false'}
                          onChange={e => handleChange({
                            target: {
                              name: 'vaccinated',
                              value: e.target.value === '' ? null : e.target.value === 'true'
                            }
                          })}
                        >
                          <option value="">{t('cat.notSpecified', 'Non spécifié')}</option>
                          <option value="true">{t('cat.yes', 'Oui')}</option>
                          <option value="false">{t('cat.no', 'Non')}</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.sterilized', 'Stérilisé')}</Form.Label>
                        <Form.Select
                          name="sterilized"
                          value={formData.sterilized === null ? '' : formData.sterilized ? 'true' : 'false'}
                          onChange={e => handleChange({
                            target: {
                              name: 'sterilized',
                              value: e.target.value === '' ? null : e.target.value === 'true'
                            }
                          })}
                        >
                          <option value="">{t('cat.notSpecified', 'Non spécifié')}</option>
                          <option value="true">{t('cat.yes', 'Oui')}</option>
                          <option value="false">{t('cat.no', 'Non')}</option>
                        </Form.Select>
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  <Card className="mb-4">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">{t('cat.image', 'Image')}</h5>
                    </Card.Header>
                    <Card.Body>
                      <p className="text-muted">{t('cat.imageHint', 'Ajoutez une photo du chat pour faciliter son identification.')}</p>
                      <Form.Group className="mb-3">
                        <ImageUploader
                          key={uploaderKey}
                          onImageUploaded={handleImageUploaded}
                          initialImage={formData.imageUrls}
                          onUploadStatusChange={setIsUploading}
                        />
                        {isUploading && (
                          <div className="mt-2 text-info">
                            <small>
                              <i className="fas fa-spinner fa-spin me-1"></i>
                              {t('cat.uploadingImages', 'Images en cours de chargement... Veuillez patienter avant d\'enregistrer.')}
                            </small>
                          </div>
                        )}
                      </Form.Group>

                      <Form.Group>
                        <Form.Label>{t('cat.description', 'Commentaire')}</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="comment"
                          value={formData.comment}
                          onChange={handleChange}
                          placeholder={t('cat.descriptionPlaceholder', 'Entrez une description du chat (signes distinctifs, comportement, etc.)')}
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="mb-4">
                <Card.Header className="bg-light d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2" />
                  <h5 className="mb-0">{t('cat.location', 'Localisation du chat')}</h5>
                </Card.Header>
                <Card.Body>
                  {formData.statusCat === "OWN" ? (
                    <>
                      <p className="text-muted mb-2">{t('cat.locationUserOnly', 'L\'adresse de votre profil sera utilisée comme localisation du chat.')}</p>
                      <div className="border rounded bg-light p-3">
                        <strong>{t('cat.address', 'Adresse')} :</strong> {formData.location.address || "-"}<br />
                        <strong>{t('cat.city', 'Ville')} :</strong> {formData.location.city || "-"}<br />
                        <strong>{t('cat.postalCode', 'Code postal')} :</strong> {formData.location.postalCode || "-"}<br />
                        <strong>{t('cat.latitude', 'Latitude')} :</strong> {formData.location.latitude || "-"}<br />
                        <strong>{t('cat.longitude', 'Longitude')} :</strong> {formData.location.longitude || "-"}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-muted">{t('cat.locationHint', 'Indiquez l\'endroit où le chat a été vu pour la dernière fois.')}</p>
                      <Row>
                        <Col xs={12}>
                          <MapLocation 
                            location={formData.location}
                            onLocationChange={(longitude, latitude) => updateLocationFromCoordinates(longitude, latitude)}
                            onAddressChange={(addressData) => {
                              setFormData(prev => ({
                                ...prev,
                                location: {
                                  ...prev.location,
                                  ...addressData
                                }
                              }));
                            }}
                            isLocating={isLocating}
                            geoError={geoError}
                            onGeoErrorDismiss={() => setGeoError(null)}
                            onRequestCurrentLocation={handleRequestCurrentLocation}
                            mapHeight="300px"
                            disableMapClick={formData.statusCat === 'OWN'}
                          />
                          <Button variant="outline-secondary" onClick={handleRequestCurrentLocation} className="mt-3">
                            <FaMapMarkerAlt className="me-2" />
                            {t('cat.useCurrentLocation', 'Utiliser ma position actuelle')}
                          </Button>
                        </Col>
                      </Row>
                    </>
                  )}
                </Card.Body>
              </Card>

              <div className="text-center mt-4">
                <p className="text-muted mb-4">* {t('common.required', 'Champs obligatoires')}</p>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="px-5"
                  style={{ ...buttonStyles, minWidth: "200px" }}
                  disabled={isUploading}
                  title={isUploading ? t('cat.waitForImages', 'Veuillez attendre que les images soient chargées') : ""}
                >
                  {isUploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {t('cat.loadingImages', 'Chargement des images...')}
                    </>
                  ) : (
                    t('cat.register', 'Signaler un chat')
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
}

export default RegisterCat;