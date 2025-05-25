import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  FiUsers,
  FiHeart,
  FiShoppingCart,
  FiPackage,
  FiBell,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthProvider";
import { useAxios } from "../../hooks/useAxios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const axios = useAxios();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCats: 0,
    totalOrders: 0,
    totalProducts: 0,
  });
  const [activityData, setActivityData] = useState([]);
  const [catStatusData, setCatStatusData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Récupérer les statistiques générales
      const statsResponse = await axios.get("/admin/stats");
      setStats(statsResponse.data);

      // Récupérer les données d'activité
      const activityResponse = await axios.get("/admin/activity");
      setActivityData(activityResponse.data);

      // Récupérer les statistiques des chats
      const catStatsResponse = await axios.get("/admin/cat-stats");
      setCatStatusData(catStatsResponse.data);

      // Récupérer les activités récentes
      const activitiesResponse = await axios.get("/admin/recent-activities");
      setRecentActivities(activitiesResponse.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t("admin.dashboard.title")}
      </Typography>

      <Grid container spacing={3}>
        {/* Statistiques générales */}
        <Grid item xs={12} md={3}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <FiUsers
                color="primary"
                style={{ marginRight: 8, fontSize: 24 }}
              />
              <Typography component="h2" variant="h6" color="primary">
                {t("admin.dashboard.totalUsers")}
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              {stats.totalUsers}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <FiHeart
                color="primary"
                style={{ marginRight: 8, fontSize: 24 }}
              />
              <Typography component="h2" variant="h6" color="primary">
                {t("admin.dashboard.totalCats")}
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              {stats.totalCats}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <FiShoppingCart
                color="primary"
                style={{ marginRight: 8, fontSize: 24 }}
              />
              <Typography component="h2" variant="h6" color="primary">
                {t("admin.dashboard.totalOrders")}
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              {stats.totalOrders}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <FiPackage
                color="primary"
                style={{ marginRight: 8, fontSize: 24 }}
              />
              <Typography component="h2" variant="h6" color="primary">
                {t("admin.dashboard.totalProducts")}
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              {stats.totalProducts}
            </Typography>
          </Paper>
        </Grid>

        {/* Graphiques */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 400 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              {t("admin.dashboard.activityChart")}
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8884d8"
                  name={t("admin.dashboard.newUsers")}
                />
                <Line
                  type="monotone"
                  dataKey="cats"
                  stroke="#82ca9d"
                  name={t("admin.dashboard.newCats")}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#ffc658"
                  name={t("admin.dashboard.newOrders")}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 400 }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              {t("admin.dashboard.catStatus")}
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {catStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Activités récentes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
            >
              {t("admin.dashboard.recentActivity")}
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemIcon>
                      <FiBell />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={formatDate(activity.date)}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
