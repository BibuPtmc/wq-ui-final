import React from 'react';
import { Card, Alert, Spinner } from 'react-bootstrap';

const OrderHistory = ({ orders, ordersLoading }) => {
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
        Vous n'avez pas encore passé de commande.
      </Alert>
    );
  }

  return (
    <div className="orders-list">
      {orders.map((order) => (
        <Card key={order.id} className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <strong>Commande #{order.id}</strong>
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
                <strong>Total:</strong>
                <span className="ms-2">
                  {order.orderItems.reduce((total, item) => 
                    total + (item.product.price * item.quantity), 0).toFixed(2)
                  } €
                </span>
              </div>
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
