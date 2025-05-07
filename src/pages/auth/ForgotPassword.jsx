import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useAxios } from '../../hooks/useAxios';
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const axios = useAxios();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');
        
        try {
            const response = await axios.post('auth/forgot-password', { email });
            setMessage('Un email de réinitialisation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception.');
            setEmail(''); // Réinitialiser le champ email
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de l\'email de réinitialisation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="shadow-sm">
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <h2>Mot de passe oublié</h2>
                                    <p className="text-muted">Entrez votre email pour réinitialiser votre mot de passe</p>
                                </div>

                                {message && (
                                    <Alert variant="success" className="mb-4">
                                        {message}
                                    </Alert>
                                )}
                                {error && (
                                    <Alert variant="danger" className="mb-4">
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <Form.Label>
                                            <FaEnvelope className="me-2" />
                                            Email
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Entrez votre email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button 
                                            variant="primary" 
                                            type="submit" 
                                            size="lg"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Envoi en cours...
                                                </>
                                            ) : (
                                                'Envoyer le lien de réinitialisation'
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        <Card className="mt-4 shadow-sm">
                            <Card.Body className="p-4 text-center">
                                <Button
                                    as={Link}
                                    to="/login"
                                    variant="outline-primary"
                                    size="lg"
                                    className="px-5"
                                    disabled={isLoading}
                                >
                                    <FaArrowLeft className="me-2" />
                                    Retour à la connexion
                                </Button>
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPassword; 