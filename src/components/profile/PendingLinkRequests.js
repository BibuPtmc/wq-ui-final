import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { useCatLink } from '../../hooks/useCatLink';
import { FaCheck, FaTimes } from 'react-icons/fa';

const PendingLinkRequests = () => {
  const { 
    pendingRequests, 
    loading, 
    error, 
    successMessage, 
    fetchPendingRequests, 
    respondToLinkRequest 
  } = useCatLink();
  
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseComment, setResponseComment] = useState('');
  const [responseStatus, setResponseStatus] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');
  const [isInitialFetch, setIsInitialFetch] = useState(true);

  useEffect(() => {
    // Only fetch on initial component mount
    if (isInitialFetch) {
      fetchPendingRequests();
      setIsInitialFetch(false);
    }
  }, [fetchPendingRequests, isInitialFetch]);

  const handleShowResponseModal = (request, status) => {
    setSelectedRequest(request);
    setResponseStatus(status);
    setResponseComment('');
    setShowResponseModal(true);
  };

  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
    setSelectedRequest(null);
    setResponseStatus('');
    setResponseComment('');
  };

  const handleSubmitResponse = async () => {
    if (!selectedRequest || !responseStatus) return;
    
    setLocalLoading(true);
    setLocalError('');
    
    try {
      const success = await respondToLinkRequest(
        selectedRequest.requestId,
        responseStatus,
        responseComment
      );
      
      if (success) {
        setLocalSuccess(
          responseStatus === 'ACCEPTED' 
            ? 'Demande acceptée avec succès ! Le chat a été marqué comme appartenant à son propriétaire.'
            : 'Demande refusée avec succès.'
        );
        
        // Rafraîchir la liste après un court délai
        setTimeout(() => {
          fetchPendingRequests();
          handleCloseResponseModal();
          
          // Si la demande est acceptée, recharger la page pour mettre à jour tous les états
          if (responseStatus === 'ACCEPTED') {
            window.location.reload();
          }
        }, 1500);
      }
    } catch (error) {
      setLocalError('Une erreur est survenue lors du traitement de la demande.');
      console.error('Error responding to request:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Ajouter un bouton pour rafraîchir manuellement
  const handleManualRefresh = () => {
    fetchPendingRequests();
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Chargement des demandes en attente...</p>
      </div>
    );
  }

  return (
    <div>
      {successMessage && (
        <Alert variant="success" className="mb-3">
          {successMessage}
        </Alert>
      )}
      
      {localSuccess && (
        <Alert variant="success" className="mb-3">
          {localSuccess}
        </Alert>
      )}

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Demandes de liaison en attente ({pendingRequests.length})</h5>
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={loading}
        >
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Rafraîchir"
          )}
        </Button>
      </div>
      
      {pendingRequests.length === 0 ? (
        <Alert variant="info">
          Vous n'avez aucune demande de liaison en attente.
        </Alert>
      ) : (
        pendingRequests.map((request) => (
          <Card key={request.requestId} className="mb-3 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="mb-1">Demande #{request.requestId}</h6>
                  <p className="text-muted small mb-1">
                    Date: {new Date(request.requestDate).toLocaleDateString()} {new Date(request.requestDate).toLocaleTimeString()}
                  </p>
                  <p className="text-muted small mb-0">
                    De: {request.requester.userName || request.requester.email}
                  </p>
                </div>
                <Badge bg="warning" className="px-2 py-1">
                  En attente
                </Badge>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <Card className="h-100">
                    <Card.Body className="p-2">
                      <h6 className="mb-1">Chat perdu</h6>
                      <p className="mb-0 small">
                        <strong>Nom:</strong> {request.lostCatStatus.cat.name}
                      </p>
                      <p className="mb-0 small">
                        <strong>ID:</strong> {request.lostCatStatus.catStatusId}
                      </p>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-6">
                  <Card className="h-100">
                    <Card.Body className="p-2">
                      <h6 className="mb-1">Chat trouvé</h6>
                      <p className="mb-0 small">
                        <strong>Nom:</strong> {request.foundCatStatus.cat.name}
                      </p>
                      <p className="mb-0 small">
                        <strong>ID:</strong> {request.foundCatStatus.catStatusId}
                      </p>
                    </Card.Body>
                  </Card>
                </div>
              </div>
              
              {request.comment && (
                <div className="mb-3">
                  <h6 className="mb-1">Commentaire:</h6>
                  <p className="small mb-0">{request.comment}</p>
                </div>
              )}
              
              <div className="d-flex gap-2 justify-content-end">
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleShowResponseModal(request, 'REJECTED')}
                >
                  <FaTimes className="me-1" /> Refuser
                </Button>
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={() => handleShowResponseModal(request, 'ACCEPTED')}
                >
                  <FaCheck className="me-1" /> Accepter
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
      
      {/* Modal de réponse */}
      <Modal show={showResponseModal} onHide={handleCloseResponseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {responseStatus === 'ACCEPTED' ? 'Accepter' : 'Refuser'} la demande de liaison
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {localError && (
            <Alert variant="danger" className="mb-3">
              {localError}
            </Alert>
          )}
          
          <p>
            Vous êtes sur le point de {responseStatus === 'ACCEPTED' ? 'accepter' : 'refuser'} la demande 
            de liaison pour le chat <strong>{selectedRequest?.foundCatStatus.cat.name}</strong>.
          </p>
          
          {responseStatus === 'ACCEPTED' && (
            <Alert variant="info">
              En acceptant cette demande, le chat sera marqué comme appartenant à son propriétaire 
              et ne sera plus listé comme trouvé.
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Commentaire (optionnel)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={responseComment}
              onChange={(e) => setResponseComment(e.target.value)}
              placeholder="Ajoutez un commentaire à votre réponse..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseResponseModal} disabled={localLoading}>
            Annuler
          </Button>
          <Button 
            variant={responseStatus === 'ACCEPTED' ? 'success' : 'danger'}
            onClick={handleSubmitResponse}
            disabled={localLoading}
          >
            {localLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-1" />
                Traitement...
              </>
            ) : (
              responseStatus === 'ACCEPTED' ? 'Confirmer l\'acceptation' : 'Confirmer le refus'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PendingLinkRequests;
