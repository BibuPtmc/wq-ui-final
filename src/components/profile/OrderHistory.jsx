import React, { useState, useMemo } from 'react';
import { Card, Alert, Spinner, Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'PAID':
      return 'info';
    case 'SHIPPED':
      return 'primary';
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status, t) => {
  switch (status) {
    case 'PENDING':
      return t('orderHistory.status.pending', 'En attente');
    case 'PAID':
      return t('orderHistory.status.paid', 'Payée');
    case 'SHIPPED':
      return t('orderHistory.status.shipped', 'Expédiée');
    case 'DELIVERED':
      return t('orderHistory.status.delivered', 'Livrée');
    case 'CANCELLED':
      return t('orderHistory.status.cancelled', 'Annulée');
    default:
      return status;
  }
};

const OrderHistory = ({ orders, ordersLoading }) => {
  const { t } = useTranslation();
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [orders, sortOrder, statusFilter]);

  if (ordersLoading) {
    return (
      <div className="text-center">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Alert variant="info">
        {t('orderHistory.noOrders', "Vous n'avez pas encore passé de commande.")}
      </Alert>
    );
  }

  return (
    <div className="orders-list">
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>{t('orderHistory.sortByDate', 'Trier par date')}</Form.Label>
                <Form.Select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">{t('orderHistory.mostRecentFirst', "Plus récent d'abord")}</option>
                  <option value="asc">{t('orderHistory.oldestFirst', "Plus ancien d'abord")}</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>{t('orderHistory.filterByStatus', 'Filtrer par statut')}</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">{t('orderHistory.allStatuses', 'Tous les statuts')}</option>
                  <option value="PENDING">{t('orderHistory.status.pending', 'En attente')}</option>
                  <option value="PAID">{t('orderHistory.status.paid', 'Payée')}</option>
                  <option value="SHIPPED">{t('orderHistory.status.shipped', 'Expédiée')}</option>
                  <option value="DELIVERED">{t('orderHistory.status.delivered', 'Livrée')}</option>
                  <option value="CANCELLED">{t('orderHistory.status.cancelled', 'Annulée')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredOrders.length === 0 ? (
        <Alert variant="info">
          {t('orderHistory.noMatchingOrders', 'Aucune commande ne correspond à vos critères de recherche.')}
        </Alert>
      ) : (
        filteredOrders.map((order) => (
          <Card key={order.id} className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>{t('orderHistory.order', 'Commande')} #{order.id}</strong>
              <span>
                {new Date(order.orderDate).toLocaleDateString('fr-BE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </Card.Header>
            <Card.Body>
              <div className="order-items">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span className="fw-bold">{item.product.name}</span>
                      <span className="text-muted ms-2">x{item.quantity}</span>
                    </div>
                    <span>{(item.product.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{t('orderHistory.total', 'Total:')}</strong>
                  <span className="ms-2">
                    {order.orderItems.reduce((total, item) => 
                      total + (item.product.price * item.quantity), 0).toFixed(2)
                    } €
                  </span>
                </div>
                <span className={`badge bg-${getStatusBadgeVariant(order.status)}`}>
                  {getStatusLabel(order.status, t)}
                </span>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
};

export default OrderHistory;
