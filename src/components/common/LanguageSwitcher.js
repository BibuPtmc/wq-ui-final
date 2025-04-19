import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher = () => {
  // Nous n'utilisons pas directement t ici car nous utilisons le contexte de langue
  const { currentLanguage, languages, changeLanguage } = useLanguage();
  
  // Trouver l'objet langue actuel
  const currentLangObj = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
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
          border: 'none'
        }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{ display: 'inline-flex', alignItems: 'center' }}
        >
          <FaGlobe className="me-1" /> {currentLangObj.flag}
        </motion.div>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {languages.map((language) => (
          <Dropdown.Item 
            key={language.code} 
            onClick={() => changeLanguage(language.code)}
            active={currentLanguage === language.code}
          >
            <span className="me-2">{language.flag}</span>
            {language.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;
