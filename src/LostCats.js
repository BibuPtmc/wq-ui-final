import React, { useEffect, useState } from "react";
import { useAxios } from "./hooks/useAxios";
import { Card, Button, Container, Row, Col } from "react-bootstrap";

function LostCats() {
  const [lostCats, setLostCats] = useState([]);
  const axios = useAxios();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Effectuer une requête pour récupérer les chats trouvés
    const fetchLostCats = async () => {
      try {
        const response = await axios.get("cat/findLostCat");
        setLoading(false);
        setLostCats(response);
      } catch (error) {
        console.error("Error fetching lost cats:", error);
      }
    };

    if (loading) {
      fetchLostCats();
    }
  }, [axios]);

  return (
    <Container className="mt-3">
      <h2>Chats Perdus</h2>
      <Row xs={1} md={2} lg={3} xl={4} className="g-4">
        {lostCats.map((cat) => (
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

export default LostCats;
