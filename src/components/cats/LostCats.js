import React, { useEffect, useState } from "react";
import { useAxios } from "../../hooks/useAxios";
import { Card, Button, Container, Row, Col, Spinner, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaPaw } from "react-icons/fa";
import "../../styles/global.css";
import CatDetails from "../profile/CatDetails";
import { useCats } from "../../hooks/useCats";
import MatchingResults from "./MatchingResults";

function LostCats() {
  const [lostCats, setLostCats] = useState([]);
  const axios = useAxios();
  const { findPotentialFoundCats } = useCats();
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [selectedCatStatus, setSelectedCatStatus] = useState(null);
  const [matchCounts, setMatchCounts] = useState({});
  const [loadingMatches, setLoadingMatches] = useState({});
  const [showMatches, setShowMatches] = useState(false);
  const [matches, setMatches] = useState([]);

  const handleClose = () => setShow(false);
  const handleShow = (catStatus) => {
    setSelectedCatStatus(catStatus);
    setShow(true);
  };

  const handleShowMatches = async (cat) => {
    const matchResults = await findPotentialFoundCats(cat.catId);
    setMatches(matchResults);
    setShowMatches(true);
  };

  const handleCloseMatches = () => {
    setShowMatches(false);
  };

  useEffect(() => {
    const fetchLostCats = async () => {
      try {
        const response = await axios.get("cat/findLostCat");
        setLoading(false);
        setLostCats(response);
      } catch (error) {
        console.error("Error fetching lost cats:", error);
        setLoading(false);
      }
    };
    if (loading) {
      fetchLostCats();
    }
  }, [axios, loading]);

  useEffect(() => {
    const fetchMatchCounts = async () => {
      const counts = {};
      const loading = {};
      for (const catStatus of lostCats) {
        loading[catStatus.cat.catId] = true;
        const matchResults = await findPotentialFoundCats(catStatus.cat.catId);
        counts[catStatus.cat.catId] = matchResults.length;
        loading[catStatus.cat.catId] = false;
      }
      setMatchCounts(counts);
      setLoadingMatches(loading);
    };
    if (lostCats.length > 0) {
      fetchMatchCounts();
    }
  }, [lostCats]);

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
      <h1 className="text-center mb-4">Chats Perdus</h1>
      {lostCats.length > 0 ? (
        <>
          <div className="text-center mb-4">
            <Badge bg="info" className="px-3 py-2">
              {lostCats.length} chats perdus
            </Badge>
          </div>
          <Row xs={1} md={2} lg={3} className="g-4">
            {lostCats.map((catStatus) => {
              const cat = catStatus.cat;
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
                          e.target.onerror = null;
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
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              Perdu le: {new Date(catStatus.reportDate).toLocaleDateString()}
                            </small>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShow(catStatus)}
                              className="rounded-pill"
                            >
                              Plus d'infos
                            </Button>
                          </div>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="w-100"
                            onClick={() => handleShowMatches(cat)}
                            disabled={loadingMatches[cat.catId]}
                          >
                            <FaPaw className="me-2" />
                            {loadingMatches[cat.catId] ? 'Chargement...' : 
                              matchCounts[cat.catId] ? 
                              `${matchCounts[cat.catId]} correspondance${matchCounts[cat.catId] > 1 ? 's' : ''} trouvée${matchCounts[cat.catId] > 1 ? 's' : ''}` : 
                              'Aucune correspondance'}
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
          <h3>Aucun chat perdu pour le moment</h3>
          <p className="text-muted">
            Revenez plus tard ou signalez un chat perdu.
          </p>
        </div>
      )}

      {/* CatDetails Modal */}
      <CatDetails 
        selectedCatStatus={selectedCatStatus} 
        handleClose={handleClose} 
        show={show}
      />

      <MatchingResults
        matches={matches}
        show={showMatches}
        handleClose={handleCloseMatches}
        onViewDetails={(catStatus) => {
          handleCloseMatches();
          handleShow(catStatus);
        }}
      />
    </Container>
  );
}

export default LostCats;
