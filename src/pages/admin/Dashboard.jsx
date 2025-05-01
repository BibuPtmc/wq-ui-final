import React from 'react';
import { useQuery } from 'react-query';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Card,
    CardContent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AdminStats, UserManagement, CatManagement, OrderManagement } from '../../components/admin';

export const AdminDashboard = () => {
    const { t } = useTranslation();
    const { data: stats, isLoading } = useQuery('adminStats', () =>
        fetch('/api/admin/dashboard/stats').then(res => res.json())
    );

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                {t('admin.dashboard.title')}
            </Typography>

            <Grid container spacing={3}>
                {/* Statistiques générales */}
                <Grid item xs={12}>
                    <AdminStats stats={stats} />
                </Grid>

                {/* Gestion des utilisateurs */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {t('admin.users.title')}
                        </Typography>
                        <UserManagement />
                    </Paper>
                </Grid>

                {/* Gestion des chats */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {t('admin.cats.title')}
                        </Typography>
                        <CatManagement />
                    </Paper>
                </Grid>

                {/* Gestion des commandes */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {t('admin.orders.title')}
                        </Typography>
                        <OrderManagement />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}; 