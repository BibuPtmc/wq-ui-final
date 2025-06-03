import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAxios } from "../../hooks/useAxios";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  BarChart,
  Bar,
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
import {
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
} from "react-icons/fi";

const Dashboard = () => {
  const { t } = useTranslation();
  const { api } = useAxios();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    ordersByStatus: [],
    productsByCategory: [],
    revenueByMonth: [],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <Container className="py-3">
      <h2 className="mb-4">{t("admin.dashboard.title", "Tableau de bord")}</h2>

      {/* Statistiques générales */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FiUsers className="fs-1 text-primary me-3" />
                <div>
                  <h6 className="text-muted mb-1">
                    {t("admin.dashboard.totalUsers", "Utilisateurs")}
                  </h6>
                  <h3 className="mb-0">{stats.totalUsers}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FiShoppingBag className="fs-1 text-success me-3" />
                <div>
                  <h6 className="text-muted mb-1">
                    {t("admin.dashboard.totalOrders", "Commandes")}
                  </h6>
                  <h3 className="mb-0">{stats.totalOrders}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FiPackage className="fs-1 text-warning me-3" />
                <div>
                  <h6 className="text-muted mb-1">
                    {t("admin.dashboard.totalProducts", "Produits")}
                  </h6>
                  <h3 className="mb-0">{stats.totalProducts}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FiDollarSign className="fs-1 text-danger me-3" />
                <div>
                  <h6 className="text-muted mb-1">
                    {t("admin.dashboard.totalRevenue", "Revenus")}
                  </h6>
                  <h3 className="mb-0">
                    {new Intl.NumberFormat("fr-BE", {
                      style: "currency",
                      currency: "EUR",
                    }).format(stats.totalRevenue)}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Graphiques */}
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <h5 className="card-title mb-4">
                {t("admin.dashboard.ordersByStatus", "Commandes par statut")}
              </h5>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={stats.ordersByStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {stats.ordersByStatus.map((entry, index) => (
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
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <h5 className="card-title mb-4">
                {t(
                  "admin.dashboard.productsByCategory",
                  "Produits par catégorie"
                )}
              </h5>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={stats.productsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12}>
          <Card>
            <Card.Body>
              <h5 className="card-title mb-4">
                {t("admin.dashboard.revenueByMonth", "Revenus par mois")}
              </h5>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={stats.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#82ca9d" />
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

export default Dashboard;
