import React, { useState } from 'react';
import { Dropdown, Toast, ToastContainer } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaGlobe } from 'react-icons/fa';
import CountryFlag from 'react-country-flag';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { currentLanguage, languages, changeLanguage } = useLanguage();
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Trouver l'objet langue actuel
  const currentLangObj = languages.find(lang => lang.code === currentLanguage) || languages[0];

  // Mapping des codes langue vers codes pays ISO pour react-country-flag
  const flagMap = {
    fr: 'FR',
    en: 'GB', // ou 'US' selon préférence
    nl: 'NL',
  };

  const handleChangeLanguage = (code) => {
    const langObj = languages.find(l => l.code === code);
    changeLanguage(code);
    setToastMsg(`${langObj.name} sélectionné(e)`);
    setShowToast(true);
  };

  return (
    <>
      <Dropdown align="end">
        <Dropdown.Toggle
          variant="link"
          id="dropdown-language"
          style={{
            color: '#666',
            fontSize: '0.95rem',
            fontWeight: '500',
            padding: '0.5rem 1rem',
            textDecoration: 'none',
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <CountryFlag
              countryCode={flagMap[currentLangObj.code]}
              svg
              style={{ width: '1.3em', height: '1.3em', marginRight: 6, borderRadius: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
              aria-label={currentLangObj.name}
            />
            <span style={{ marginLeft: 2 }}>{currentLangObj.name}</span>
          </motion.div>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {languages.map((language) => (
            <Dropdown.Item
              key={language.code}
              onClick={() => handleChangeLanguage(language.code)}
              active={currentLanguage === language.code}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <CountryFlag
                countryCode={flagMap[language.code]}
                svg
                style={{ width: '1.2em', height: '1.2em', borderRadius: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
                aria-label={language.name}
              />
              <span>{language.name}</span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={1200}
          autohide
          bg="info"
        >
          <Toast.Body style={{ color: '#fff', fontWeight: 500 }}>{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default LanguageSwitcher;
