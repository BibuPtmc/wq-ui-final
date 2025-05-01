import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    People as PeopleIcon,
    Pets as PetsIcon,
    ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';

export const AdminStats = ({ stats }) => {
    const { t } = useTranslation();

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <Icon sx={{ color, mr: 1 }} />
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h4" component="div">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Grid container spacing={3}>
            {/* Statistiques utilisateurs */}
            <Grid item xs={12} md={4}>
                <StatCard
                    title={t('admin.stats.users')}
                    value={stats?.userStats?.totalUsers || 0}
                    icon={PeopleIcon}
                    color="primary"
                />
            </Grid>

            {/* Statistiques chats */}
            <Grid item xs={12} md={4}>
                <StatCard
                    title={t('admin.stats.cats')}
                    value={stats?.catStats?.totalCats || 0}
                    icon={PetsIcon}
                    color="secondary"
                />
            </Grid>

            {/* Statistiques commandes */}
            <Grid item xs={12} md={4}>
                <StatCard
                    title={t('admin.stats.orders')}
                    value={stats?.orderStats?.totalOrders || 0}
                    icon={ShoppingCartIcon}
                    color="success"
                />
            </Grid>

            {/* Détails des statistiques */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {t('admin.stats.details')}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle1">
                                    {t('admin.stats.newUsers')}: {stats?.userStats?.newUsersThisMonth || 0}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {t('admin.stats.activeUsers')}: {stats?.userStats?.activeUsers || 0}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle1">
                                    {t('admin.stats.lostCats')}: {stats?.catStats?.lostCats || 0}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {t('admin.stats.foundCats')}: {stats?.catStats?.foundCats || 0}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {t('admin.stats.matches')}: {stats?.catStats?.successfulMatches || 0}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle1">
                                    {t('admin.stats.revenue')}: {stats?.orderStats?.totalRevenue || 0} €
                                </Typography>
                                <Typography variant="subtitle1">
                                    {t('admin.stats.ordersThisMonth')}: {stats?.orderStats?.ordersThisMonth || 0}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}; 