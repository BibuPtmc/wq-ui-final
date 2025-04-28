import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useAxios } from '../../hooks/useAxios';
import { motion } from 'framer-motion';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../contexts/authProvider';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [matchingPassword, setMatchingPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showMatchingPassword, setShowMatchingPassword] = useState(false);
    const navigate = useNavigate();
    const axios = useAxios();
    const { setIsLoggedIn, setUserData } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== matchingPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        try {
            const response = await axios.post('auth/reset-password', {
                token,
                newPassword,
                matchingPassword
            });
            setMessage(response.data);
            setError('');
            
            // Déconnecter l'utilisateur
            setIsLoggedIn(false);
            setUserData(null);
            sessionStorage.removeItem('token');
            localStorage.removeItem('userEmail');
            
            // Rediriger vers la page de connexion après 3 secondes
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data || 'Une erreur est survenue');
            setMessage('');
        }
    };

    // ... rest of the component code ...
};

export default ResetPassword;