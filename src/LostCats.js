import React, { useEffect, useState } from "react";
import { useAxios } from "./hooks/useAxios";
import { Card, Button, Container, Row, Col, Spinner, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import "./styles/global.css";

function LostCats() {
  const [lostCats, setLostCats] = useState([]);
  const axios = useAxios();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLostCats = async () => {
      try {
        const response = await axios.get("cat/findLostCat");
        setLoading(false);
        setLostCats(response);
        console.log("loading:"+loading);
        console.log("cat found:"+response);
      } catch (error) {
        console.error("Error fetching lost cats:", error);
        setLoading(false);
      }
    };
    if(loading){
      fetchLostCats();
    }
  }, [axios]);

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
            {lostCats.map((cat) => (
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
                        e.target.src = "https://via.placeholder.com/300x200?text=Image+non+disponible";
                      }}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="mb-0">{cat.name}</Card.Title>
                        <Badge 
                          bg={cat.gender === "Mâle" ? "primary" : "danger"}
                          className="ms-2"
                        >
                          {cat.gender}
                        </Badge>
                      </div>
                      <Card.Text className="text-muted small mb-2">
                        Race: {cat.breed}
                      </Card.Text>
                      <Card.Text className="mb-3">
                        {cat.description && cat.description.length > 100
                          ? `${cat.description.substring(0, 100)}...`
                          : cat.description}
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          Perdu le: {new Date(cat.dateOfBirth).toLocaleDateString()}
                        </small>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          href={`/cat/${cat.catId}`}
                          className="rounded-pill"
                        >
                          Plus d'infos
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
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
    </Container>
  );
}

export default LostCats;
