import React from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SecuritySettings = ({
  passwordForm,
  setPasswordForm,
  handleSubmit,
  updateSuccess,
  updateError
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showMatchingPassword, setShowMatchingPassword] = React.useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-4">
      {updateSuccess && (
        <Alert variant="success" className="mb-3">
          Votre mot de passe a été mis à jour avec succès !
        </Alert>
      )}
      {updateError && (
        <Alert variant="danger" className="mb-3">
          {updateError}
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Mot de passe actuel</Form.Label>
        <div className="input-group">
          <Form.Control
            type={showCurrentPassword ? "text" : "password"}
            id="currentPassword"
            value={passwordForm.currentPassword}
            onChange={handleChange}
            required
          />
          <Button 
            variant="outline-secondary"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
          </Button>
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Nouveau mot de passe</Form.Label>
        <div className="input-group">
          <Form.Control
            type={showNewPassword ? "text" : "password"}
            id="newPassword"
            value={passwordForm.newPassword}
            onChange={handleChange}
            required
          />
          <Button 
            variant="outline-secondary"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
          </Button>
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
        <div className="input-group">
          <Form.Control
            type={showMatchingPassword ? "text" : "password"}
            id="matchingPassword"
            value={passwordForm.matchingPassword}
            onChange={handleChange}
            required
          />
          <Button 
            variant="outline-secondary"
            onClick={() => setShowMatchingPassword(!showMatchingPassword)}
          >
            {showMatchingPassword ? <FaEyeSlash /> : <FaEye />}
          </Button>
        </div>
      </Form.Group>

      <div className="d-grid">
        <Button
          variant="outline-primary"
          type="submit"
          size="lg"
          className="rounded-pill"
        >
          Mettre à jour le mot de passe
        </Button>
      </div>
    </Form>
  );
};

export default SecuritySettings;
