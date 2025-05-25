import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
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
  BarChart,
  Bar,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthProvider";
import { api } from "../../utils/api";
import { Download as DownloadIcon } from "@mui/icons-material";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Reports = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [period, setPeriod] = useState("month");
  const [salesData, setSalesData] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [catStats, setCatStats] = useState([]);
  const [productStats, setProductStats] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    try {
      const [sales, users, cats, products] = await Promise.all([
        api.get(`/admin/reports/sales?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/admin/reports/users?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/admin/reports/cats?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/admin/reports/products?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSalesData(sales.data);
      setUserStats(users.data);
      setCatStats(cats.data);
      setProductStats(products.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des rapports:", error);
    }
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  const handleExport = async (type) => {
    try {
      const response = await api.get(
        `/admin/reports/export/${type}?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}-report-${period}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">{t("admin.reports.title")}</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>{t("admin.reports.period")}</InputLabel>
            <Select
              value={period}
              onChange={handlePeriodChange}
              label={t("admin.reports.period")}
            >
              <MenuItem value="week">{t("admin.reports.week")}</MenuItem>
              <MenuItem value="month">{t("admin.reports.month")}</MenuItem>
              <MenuItem value="year">{t("admin.reports.year")}</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport("all")}
          >
            {t("admin.reports.export")}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Graphique des ventes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t("admin.reports.sales")}
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={formatCurrency} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    name={t("admin.reports.salesAmount")}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#82ca9d"
                    name={t("admin.reports.orderCount")}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Statistiques des utilisateurs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t("admin.reports.users")}
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="newUsers"
                    fill="#8884d8"
                    name={t("admin.reports.newUsers")}
                  />
                  <Bar
                    dataKey="activeUsers"
                    fill="#82ca9d"
                    name={t("admin.reports.activeUsers")}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Statistiques des chats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t("admin.reports.cats")}
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catStats}
                    dataKey="value"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {catStats.map((entry, index) => (
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
            </Box>
          </Paper>
        </Grid>

        {/* Top produits */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t("admin.reports.topProducts")}
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={formatCurrency} />
                  <Legend />
                  <Bar
                    dataKey="sales"
                    fill="#8884d8"
                    name={t("admin.reports.sales")}
                  />
                  <Bar
                    dataKey="quantity"
                    fill="#82ca9d"
                    name={t("admin.reports.quantity")}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
