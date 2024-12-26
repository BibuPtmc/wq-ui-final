import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';

const ReportedCats = ({ reportedCats, onDelete }) => {
  const handleDelete = (catStatusId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce chat signalé ?")) {
      onDelete(catStatusId);
    }
  };

  return (
    <div>
      <h2>Chats Signalés</h2>
      {reportedCats.length > 0 ? (
        <Row>
          {reportedCats.map(catStatus => (
            <Col md={4} key={catStatus.catStatusId} className="mb-4">
              <Card className="shadow-sm position-relative">
                <FaTimes 
                  className="position-absolute" 
                  style={{ top: '10px', right: '10px', cursor: 'pointer', color: 'red' }} 
                  onClick={() => handleDelete(catStatus.catStatusId)} 
                />
                <Card.Body>
                  <Card.Title>{catStatus.cat.name || "Nom inconnu"}</Card.Title>
                  <Card.Text>
                    <strong>Status:</strong> {catStatus.statusCat || "Statut inconnu"}
                  </Card.Text>
                  <Card.Text>
                    <strong>Commentaire:</strong> {catStatus.comment || "Aucun commentaire"}
                  </Card.Text>
                  <Card.Text>
                    <strong>Date de signalement:</strong> {new Date(catStatus.reportDate).toLocaleDateString() || "Date inconnue"}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p>Aucun chat signalé.</p>
      )}
    </div>
  );
};

export default ReportedCats;