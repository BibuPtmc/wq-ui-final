import React from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";

const SecuritySettings = ({
  passwordForm,
  setPasswordForm,
  handleSubmit,
  updateSuccess,
  updateError,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showMatchingPassword, setShowMatchingPassword] = React.useState(false);
  const [passwordComplexityError, setPasswordComplexityError] =
    React.useState(false);
  const [passwordsMatch, setPasswordsMatch] = React.useState(true);

  // Réutilisation du même regex que dans RegistrationForm
  const passwordRegex =
    /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

  // Validation en temps réel des critères du mot de passe
  const passwordRequirements = {
    length: passwordForm.newPassword?.length >= 8,
    uppercase: /[A-Z]/.test(passwordForm.newPassword),
    lowercase: /[a-z]/.test(passwordForm.newPassword),
    number: /[0-9]/.test(passwordForm.newPassword),
    special: /[^A-Za-z0-9]/.test(passwordForm.newPassword),
    matching:
      passwordForm.newPassword === passwordForm.matchingPassword &&
      passwordForm.newPassword !== "",
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Réinitialiser les erreurs
    setPasswordComplexityError(false);
    setPasswordsMatch(true);

    // Validation en temps réel
    if (id === "newPassword") {
      setPasswordComplexityError(!passwordRegex.test(value));
    } else if (id === "matchingPassword") {
      setPasswordsMatch(value === passwordForm.newPassword);
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className="d-flex align-items-center mb-1">
      {met ? (
        <FaCheck className="text-success me-2" />
      ) : (
        <FaTimes className="text-danger me-2" />
      )}
      <small className={met ? "text-success" : "text-danger"}>{text}</small>
    </div>
  );

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
            isInvalid={passwordComplexityError}
          />
          <Button
            variant="outline-secondary"
            onClick={() => setShowNewPassword(!showNewPassword)}
            style={{ borderColor: passwordComplexityError ? "#dc3545" : "" }}
          >
            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
          </Button>
          {passwordComplexityError && (
            <Form.Control.Feedback type="invalid">
              Le mot de passe ne respecte pas les critères de sécurité
            </Form.Control.Feedback>
          )}
        </div>
        {passwordForm.newPassword && (
          <div className="mt-2 p-2 border rounded">
            <small className="d-block mb-2">
              Le mot de passe doit contenir :
            </small>
            <PasswordRequirement
              met={passwordRequirements.length}
              text="Au moins 8 caractères"
            />
            <PasswordRequirement
              met={passwordRequirements.uppercase}
              text="Une lettre majuscule"
            />
            <PasswordRequirement
              met={passwordRequirements.lowercase}
              text="Une lettre minuscule"
            />
            <PasswordRequirement
              met={passwordRequirements.number}
              text="Un chiffre"
            />
            <PasswordRequirement
              met={passwordRequirements.special}
              text="Un caractère spécial"
            />
          </div>
        )}
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
            isInvalid={!passwordsMatch}
          />
          <Button
            variant="outline-secondary"
            onClick={() => setShowMatchingPassword(!showMatchingPassword)}
            style={{ borderColor: !passwordsMatch ? "#dc3545" : "" }}
          >
            {showMatchingPassword ? <FaEyeSlash /> : <FaEye />}
          </Button>
          {!passwordsMatch && (
            <Form.Control.Feedback type="invalid">
              Les mots de passe ne correspondent pas
            </Form.Control.Feedback>
          )}
        </div>
      </Form.Group>

      <div className="d-grid">
        <Button
          variant="outline-primary"
          type="submit"
          size="lg"
          className="rounded-pill"
          disabled={!Object.values(passwordRequirements).every(Boolean)}
        >
          Mettre à jour le mot de passe
        </Button>
      </div>
    </Form>
  );
};

export default SecuritySettings;
