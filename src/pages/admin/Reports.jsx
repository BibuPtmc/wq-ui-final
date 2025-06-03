import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
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
import { useAxios } from "../../hooks/useAxios";
import { FiDownload } from "react-icons/fi";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Reports = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { api } = useAxios();
  const [period, setPeriod] = useState("month");
  const [salesData, setSalesData] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [catStats, setCatStats] = useState([]);
  const [productStats, setProductStats] = useState([]);
  const [reportType, setReportType] = useState("sales");
  const [reportPeriod, setReportPeriod] = useState("week");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    try {
      const [sales, users, cats, products] = await Promise.all([
        api.get(`/admin/reports/sales?period=${period}`),
        api.get(`/admin/reports/users?period=${period}`),
        api.get(`/admin/reports/cats?period=${period}`),
        api.get(`/admin/reports/products?period=${period}`),
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

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/admin/reports/${reportType}?period=${reportPeriod}`
      );
      setReportData(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération du rapport:", error);
      setReportData(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, reportPeriod]); // Re-fetch when type or period changes

  const handleDownload = async () => {
    try {
      const response = await api.get(
        `/admin/reports/${reportType}/export?period=${reportPeriod}`,
        {
          responseType: "blob", // Important for handling binary data like files
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // Suggest a filename based on report type and period
      link.setAttribute(
        "download",
        `${reportType}_report_${reportPeriod}.${
          response.headers["content-type"] === "text/csv" ? "csv" : "xlsx"
        }`
      );
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up
    } catch (error) {
      console.error("Erreur lors du téléchargement du rapport:", error);
    }
  };

  return (
    <Container className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t("admin.reports.title", "Rapports")}</h2>
        <div className="d-flex gap-2">
          <Form.Select
            value={period}
            onChange={handlePeriodChange}
            style={{ minWidth: "120px" }}
          >
            <option value="week">{t("admin.reports.week", "Semaine")}</option>
            <option value="month">{t("admin.reports.month", "Mois")}</option>
            <option value="year">{t("admin.reports.year", "Année")}</option>
          </Form.Select>
          <Button variant="primary" onClick={() => handleExport("all")}>
            <FiDownload className="me-2" />
            {t("admin.reports.export", "Exporter")}
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Group controlId="reportType">
                  <Form.Label>
                    {t("admin.reports.reportType", "Type de rapport")}
                  </Form.Label>
                  <Form.Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="sales">
                      {t("admin.reports.sales", "Ventes")}
                    </option>
                    <option value="users">
                      {t("admin.reports.users", "Utilisateurs")}
                    </option>
                    <option value="cats">
                      {t("admin.reports.cats", "Chats")}
                    </option>
                    <option value="products">
                      {t("admin.reports.products", "Produits")}
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="reportPeriod">
                  <Form.Label>
                    {t("admin.reports.period", "Période")}
                  </Form.Label>
                  <Form.Select
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                  >
                    <option value="week">
                      {t("admin.reports.period.week", "Semaine")}
                    </option>
                    <option value="month">
                      {t("admin.reports.period.month", "Mois")}
                    </option>
                    <option value="year">
                      {t("admin.reports.period.year", "Année")}
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex justify-content-end">
                <Button
                  variant="success"
                  onClick={handleDownload}
                  disabled={!reportData || loading}
                >
                  <FiDownload className="me-2" />
                  {t("admin.reports.export", "Exporter")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading && <p>{t("common.loading", "Chargement...")}</p>}

      {reportData && !loading && (
        <div>
          {reportType === "sales" && (
            <Card className="mb-4">
              <Card.Body>
                <h5 className="card-title mb-4">
                  {t("admin.reports.salesAmount", "Montant des ventes")}
                </h5>
                <p>
                  {t("admin.reports.totalRevenue", "Revenus totaux")}:{" "}
                  {new Intl.NumberFormat("fr-BE", {
                    style: "currency",
                    currency: "EUR",
                  }).format(reportData.totalRevenue)}
                </p>
                <p>
                  {t("admin.reports.orderCount", "Nombre de commandes")}:{" "}
                  {reportData.orderCount}
                </p>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={reportData.revenueByPeriod}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        fill="#8884d8"
                        name={t(
                          "admin.reports.salesAmount",
                          "Montant des ventes"
                        )}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          )}

          {reportType === "users" && (
            <Card className="mb-4">
              <Card.Body>
                <h5 className="card-title mb-4">
                  {t("admin.reports.users", "Utilisateurs")}
                </h5>
                <p>
                  {t("admin.reports.newUsers", "Nouveaux utilisateurs")}:{" "}
                  {reportData.newUsers}
                </p>
                <p>
                  {t("admin.reports.activeUsers", "Utilisateurs actifs")}:{" "}
                  {reportData.activeUsers}
                </p>
                {/* Add more user-related data/charts as needed */}
              </Card.Body>
            </Card>
          )}

          {reportType === "cats" && (
            <Card className="mb-4">
              <Card.Body>
                <h5 className="card-title mb-4">
                  {t("admin.reports.cats", "Chats")}
                </h5>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={reportData.catsByStatus}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {reportData.catsByStatus.map((entry, index) => (
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
                </div>
              </Card.Body>
            </Card>
          )}

          {reportType === "products" && (
            <Card className="mb-4">
              <Card.Body>
                <h5 className="card-title mb-4">
                  {t("admin.reports.products", "Produits")}
                </h5>
                <p>{t("admin.reports.topProducts", "Meilleurs produits")}</p>
                {/* Display top products data, maybe in a table or list */}
              </Card.Body>
            </Card>
          )}
        </div>
      )}

      <Row className="g-3">
        {/* Graphique des ventes */}
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h5 className="mb-3">{t("admin.reports.sales", "Ventes")}</h5>
              <div style={{ height: "400px" }}>
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
                      name={t(
                        "admin.reports.salesAmount",
                        "Montant des ventes"
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#82ca9d"
                      name={t(
                        "admin.reports.orderCount",
                        "Nombre de commandes"
                      )}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Statistiques des chats */}
        <Col xs={12} md={6}>
          <Card>
            <Card.Body>
              <h5 className="mb-3">{t("admin.reports.cats", "Chats")}</h5>
              <div style={{ height: "300px" }}>
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
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Top produits */}
        <Col xs={12}>
          <Card>
            <Card.Body>
              <h5 className="mb-3">
                {t("admin.reports.topProducts", "Meilleurs produits")}
              </h5>
              <div style={{ height: "400px" }}>
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
                      name={t("admin.reports.sales", "Ventes")}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;
