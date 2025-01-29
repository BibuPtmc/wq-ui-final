import React from 'react';
import { Card, Alert, Spinner, Badge } from 'react-bootstrap';

const OrderHistory = ({ orders, ordersLoading }) => {
  if (ordersLoading) {
    return (
      <div className="text-center">
        <Spinner animation="border" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Alert variant="info">
        Vous n'avez pas encore passé de commande.
      </Alert>
    );
  }

  return (
    <div className="orders-list">
      {orders.map((order) => (
        <Card key={order.id} className="mb-3">
          <Card.Header>
            <strong>Commande #{order.id}</strong>
            <span className="float-end">
              {new Date(order.orderDate).toLocaleDateString()}
            </span>
          </Card.Header>
          <Card.Body>
            <div className="order-items">
              {order.orderItems.map((item, index) => (
                <div key={index} className="d-flex justify-content-between mb-2">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>{item.product.price.toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <hr />
            <div className="d-flex justify-content-between">
              <strong>Statut:</strong>
              <span className={`badge bg-${order.status === 'COMPLETED' ? 'success' : 'warning'}`}>
                {order.status === 'COMPLETED' ? 'Payée' : 'En attente'}
              </span>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default OrderHistory;
