import React, { useEffect, useState } from "react";
import { useAxios } from "../../hooks/useAxios";
import { Card, Button, Container, Row, Col, Spinner, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import "../../styles/global.css";
import CatDetails from "../profile/CatDetails";

function FoundCats() {
  const [foundCats, setFoundCats] = useState([]);
  const axios = useAxios();
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [selectedCatStatus, setSelectedCatStatus] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = (catStatus) => {
    setSelectedCatStatus(catStatus);
    setShow(true);
  }

  useEffect(() => {
    const fetchFoundCats = async () => {
      try {
        const response = await axios.get("cat/findFoundCat");
        setLoading(false);
        setFoundCats(response);
      } catch (error) {
        console.error("Error fetching found cats:", error);
        setLoading(false);
      }
    };
    if (loading) {
      fetchFoundCats();
    }
  }, [axios, loading]);

  if (loading) {
    return (
      <Container className="loading-container">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="main-container">
      <h1 className="text-center mb-4">Chats Trouvés</h1>
      {foundCats.length > 0 ? (
        <>
          <div className="text-center mb-4">
            <Badge bg="success" className="px-3 py-2">
              {foundCats.length} chats trouvés
            </Badge>
          </div>
          <Row xs={1} md={2} lg={3} className="g-4">
            {foundCats.map((catStatus) => {
              const cat = catStatus.cat; // Extract cat from catStatus
              return (
                <Col key={cat.catId}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="cat-card shadow-sm">
                      <Card.Img
                        variant="top"
                        src={`data:${cat.type};base64,${cat.imageCatData}`}
                        alt={cat.name}
                        onError={(e) => {
                          e.target.src = "/images/noImageCat.png";
                          e.target.onerror = null; // Empêche les erreurs en boucle
                        }}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title className="mb-0">{cat.name || "Chat sans nom"}</Card.Title>
                          <Badge
                            bg={cat.gender === "Mâle" ? "primary" : "danger"}
                            className="ms-2"
                          >
                            {cat.gender}
                          </Badge>
                        </div>
                        <Card.Text className="text-muted small mb-2">
                          Race: {cat.breed || "Inconnue"}
                        </Card.Text>
                        <Card.Text className="text-muted small mb-2">
                          Date de naissance: {cat.dateOfBirth ? new Date(cat.dateOfBirth).toLocaleDateString() : "Inconnue"}
                        </Card.Text>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            Trouvé le: {new Date(catStatus.reportDate).toLocaleDateString()}
                          </small>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleShow(catStatus)}
                            className="rounded-pill"
                          >
                            Plus d'infos
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
      ) : (
        <div className="text-center py-5">
          <h3>Aucun chat trouvé pour le moment</h3>
          <p className="text-muted">
            Revenez plus tard ou signalez un chat trouvé.
          </p>
        </div>
      )}
      
      {/* Move CatDetails outside the map function */}
      <CatDetails 
        selectedCatStatus={selectedCatStatus} 
        handleClose={handleClose} 
        show={show}
      />
    </Container>
  );
}

export default FoundCats;
