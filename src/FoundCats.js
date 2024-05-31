import React, { useEffect, useState } from "react";
import { useAxios } from "./hooks/useAxios";
import { Card, Button, Container, Row, Col } from "react-bootstrap";

function FoundCats() {
  const [foundCats, setFoundCats] = useState([]);
  const axios = useAxios();

  useEffect(() => {
    // Effectuer une requête pour récupérer les chats trouvés
    const fetchFoundCats = async () => {
      try {
        const response = await axios.get("/api/cat/findFoundCats");
        setFoundCats(response.data);
      } catch (error) {
        console.error("Error fetching found cats:", error);
      }
    };

    fetchFoundCats();
  }, []);

  return (
    <Container className="mt-3">
      <h2>Chats Trouvés</h2>
      <Row xs={1} md={2} lg={3} xl={4} className="g-4">
        {foundCats.map((cat) => (
          <Col key={cat.catId}>
            <Card>
              <Card.Img variant="top" src={cat.photo} />
              <Card.Body>
                <Card.Title>{cat.name}</Card.Title>
                <Card.Text>
                  <strong>Race:</strong> {cat.breed}
                  <br />
                  <strong>Couleur:</strong> {cat.color}
                  <br />
                  <strong>Date de Naissance:</strong> {cat.dateOfBirth}
                  <br />
                  <strong>Genre:</strong> {cat.gender}
                  <br />
                  <strong>Numéro de Puce:</strong> {cat.chipNumber}
                  <br />
                </Card.Text>
                <Button variant="primary">Voir Détails</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default FoundCats;
