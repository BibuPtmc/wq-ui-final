import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useCatLink } from '../../hooks/useCatLink';
import { FaCheck, FaTimes } from 'react-icons/fa';

const PendingLinkRequests = () => {
  const { t } = useTranslation();
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
            ? t('pendingLinkRequests.acceptedSuccess', 'Demande acceptée avec succès ! Le chat a été marqué comme appartenant à son propriétaire.')
            : t('pendingLinkRequests.rejectedSuccess', 'Demande refusée avec succès.')
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
      setLocalError(t('pendingLinkRequests.error', 'Une erreur est survenue lors du traitement de la demande.'));
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
        <p className="mt-2">{t('pendingLinkRequests.loading', 'Chargement des demandes en attente...')}</p>
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
        <h5 className="mb-0">{t('pendingLinkRequests.title', 'Demandes de liaison en attente')} ({pendingRequests.length})</h5>
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={loading}
        >
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            t('pendingLinkRequests.refresh', 'Rafraîchir')
          )}
        </Button>
      </div>
      
      {pendingRequests.length === 0 ? (
        <Alert variant="info">
          {t('pendingLinkRequests.none', 'Aucune demande de liaison en attente.')}
        </Alert>
      ) : (
        pendingRequests.map((request) => (
          <Card key={request.requestId} className="mb-3 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="mb-1">{t('pendingLinkRequests.requestNumber', 'Demande #')} {request.requestId}</h6>
                  <p className="text-muted small mb-1">
                    {t('pendingLinkRequests.requestDate', 'Date')}: {new Date(request.requestDate).toLocaleDateString()} {new Date(request.requestDate).toLocaleTimeString()}
                  </p>
                  <p className="text-muted small mb-0">
                    {t('pendingLinkRequests.requestFrom', 'De')}: {request.requester.userName || request.requester.email}
                  </p>
                </div>
                <Badge bg="warning" className="px-2 py-1">
                  {t('pendingLinkRequests.pending', 'En attente')}
                </Badge>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <Card className="h-100">
                    <Card.Body className="p-2">
                      <h6 className="mb-1">{t('pendingLinkRequests.lostCat', 'Chat perdu')}</h6>
                      <p className="mb-0 small">
                        <strong>{t('pendingLinkRequests.name', 'Nom')}: </strong> {request.lostCatStatus.cat.name}
                      </p>
                      <p className="mb-0 small">
                        <strong>{t('pendingLinkRequests.id', 'ID')}: </strong> {request.lostCatStatus.catStatusId}
                      </p>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-6">
                  <Card className="h-100">
                    <Card.Body className="p-2">
                      <h6 className="mb-1">{t('pendingLinkRequests.foundCat', 'Chat trouvé')}</h6>
                      <p className="mb-0 small">
                        <strong>{t('pendingLinkRequests.name', 'Nom')}: </strong> {request.foundCatStatus.cat.name}
                      </p>
                      <p className="mb-0 small">
                        <strong>{t('pendingLinkRequests.id', 'ID')}: </strong> {request.foundCatStatus.catStatusId}
                      </p>
                    </Card.Body>
                  </Card>
                </div>
              </div>
              
              {request.comment && (
                <div className="mb-3">
                  <h6 className="mb-1">{t('pendingLinkRequests.comment', 'Commentaire')}:</h6>
                  <p className="small mb-0">{request.comment}</p>
                </div>
              )}
              
              <div className="d-flex gap-2 justify-content-end">
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={() => handleShowResponseModal(request, 'ACCEPTED')}
                >
                  <FaCheck /> {t('pendingLinkRequests.accept', 'Accepter')}
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleShowResponseModal(request, 'REJECTED')}
                >
                  <FaTimes /> {t('pendingLinkRequests.reject', 'Refuser')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
      
      {/* Modal de réponse */}
      <Modal show={showResponseModal} onHide={handleCloseResponseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('pendingLinkRequests.modalTitle', 'Répondre à la demande')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {localError && (
            <Alert variant="danger" className="mb-3">
              {localError}
            </Alert>
          )}
          
          <p>
            {t('pendingLinkRequests.modalText', 'Vous êtes sur le point de')} {responseStatus === 'ACCEPTED' ? t('pendingLinkRequests.accept', 'accepter') : t('pendingLinkRequests.reject', 'refuser')} {t('pendingLinkRequests.modalText2', 'la demande de liaison pour le chat')} <strong>{selectedRequest?.foundCatStatus.cat.name}</strong>.
          </p>
          
          {responseStatus === 'ACCEPTED' && (
            <Alert variant="info">
              {t('pendingLinkRequests.acceptWarning', 'En acceptant cette demande, le chat sera marqué comme appartenant à son propriétaire et ne sera plus listé comme trouvé.')}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>{t('pendingLinkRequests.commentLabel', 'Commentaire (optionnel)')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={responseComment}
              onChange={(e) => setResponseComment(e.target.value)}
              placeholder={t('pendingLinkRequests.commentPlaceholder', 'Ajoutez un commentaire...')}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseResponseModal} disabled={localLoading}>
            {t('pendingLinkRequests.cancel', 'Annuler')}
          </Button>
          <Button 
            variant={responseStatus === 'ACCEPTED' ? 'success' : 'danger'}
            onClick={handleSubmitResponse}
            disabled={localLoading}
          >
            {localLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-1" />
                {t('pendingLinkRequests.processing', 'Traitement...')}
              </>
            ) : (
              responseStatus === 'ACCEPTED' ? t('pendingLinkRequests.confirmAccept', 'Confirmer l\'acceptation') : t('pendingLinkRequests.confirmReject', 'Confirmer le refus')
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PendingLinkRequests;
