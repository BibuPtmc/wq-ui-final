import React from 'react';
import { Row, Col, Card, Badge, Alert, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaPaw, FaTrash } from 'react-icons/fa';


const OwnedCats = ({ ownedCats, onShowCatDetails, onDeleteCat, successMessage }) => {
  // Fonction pour formater les valeurs avec underscore en format plus lisible
  const formatValue = (value) => {
    if (!value) return "";
    
    // Remplacer les underscores par des espaces et mettre en forme (première lettre en majuscule, reste en minuscule)
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (ownedCats.length === 0) {
    return (
      <Alert variant="info">Vous n'avez pas encore de chats.</Alert>
    );
  }

  return (
    <>
      <Card.Title className="mb-4">
        <FaPaw className="me-2" />
        Mes chats
      </Card.Title>
      
      {successMessage && (
        <Alert variant="success" className="mb-3">
          {successMessage}
        </Alert>
      )}

      <div className="text-center mb-4">
        <Badge bg="primary" className="px-3 py-2">
          {ownedCats.length} chats
        </Badge>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {ownedCats.map((catStatus) => {
          const cat = catStatus.cat;
          return (
            <Col key={cat.catId}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="cat-card shadow-sm h-100">
                  <Card.Img
                    variant="top"
                    src={cat.imageCatData ? 
                      `data:${cat.type};base64,${cat.imageCatData}` : 
                      cat.photoUrl || "/images/noImageCat.png"
                    }
                    alt={cat.name}
                    onError={(e) => {
                      e.target.src = "/images/noImageCat.png";
                      e.target.onerror = null;
                    }}
                    style={{ height: "200px", objectFit: "cover", cursor: "pointer" }}
                    onClick={() => onShowCatDetails(catStatus)}
                  />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="mb-0">{cat.name || "Chat sans nom"}</Card.Title>
                      <Badge
                        bg={formatValue(cat.gender) === "Mâle" ? "primary" : "danger"}
                        className="ms-2"
                      >
                        {formatValue(cat.gender)}
                      </Badge>
                    </div>
                    <Card.Text className="text-muted small">
                      Race: {formatValue(cat.breed) || "Inconnue"}
                    </Card.Text>
                    <div className="d-flex gap-2 mt-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => onShowCatDetails(catStatus)}
                      >
                        Voir les détails
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCat(cat.catId);
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          );
        })}
      </Row>
    </>
  );
};

export default OwnedCats;
