import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';

const AdminCharts = ({ stats }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main
  ];

  const monthlyData = [
    { name: t('months.jan'), users: 0, cats: 0, orders: 0 },
    { name: t('months.feb'), users: 0, cats: 0, orders: 0 },
    { name: t('months.mar'), users: 0, cats: 0, orders: 0 },
    { name: t('months.apr'), users: 0, cats: 0, orders: 0 },
    { name: t('months.may'), users: 0, cats: 0, orders: 0 },
    { name: t('months.jun'), users: 0, cats: 0, orders: 0 }
  ];

  const catStatusData = [
    { name: t('cat.status.lost'), value: stats?.catStats?.lostCats || 0 },
    { name: t('cat.status.found'), value: stats?.catStats?.foundCats || 0 },
    { name: t('cat.status.matched'), value: stats?.catStats?.matchedCats || 0 }
  ];

  const orderStatusData = [
    { name: t('order.status.pending'), value: stats?.orderStats?.pendingOrders || 0 },
    { name: t('order.status.completed'), value: stats?.orderStats?.completedOrders || 0 },
    { name: t('order.status.cancelled'), value: stats?.orderStats?.cancelledOrders || 0 }
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('admin.charts.monthlyTrends')}
          </Typography>
          <Box height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke={COLORS[0]} name={t('admin.stats.users')} />
                <Line type="monotone" dataKey="cats" stroke={COLORS[1]} name={t('admin.stats.cats')} />
                <Line type="monotone" dataKey="orders" stroke={COLORS[2]} name={t('admin.stats.orders')} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('admin.charts.catStatus')}
          </Typography>
          <Box height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {catStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('admin.charts.orderStatus')}
          </Typography>
          <Box height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={COLORS[0]} name={t('admin.stats.orders')} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdminCharts; 