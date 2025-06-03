import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Table,
} from "react-bootstrap";
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
import { useTranslation } from "react-i18next";
import { useAxios } from "../../hooks/useAxios";
import { useNotification } from "../../contexts/NotificationContext";
import { FiDownload } from "react-icons/fi";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

/**
 * Affiche une notification d'erreur API standardisée.
 */
function notifyApiError(showNotification, contextMsg, error) {
  showNotification(
    `Erreur ${contextMsg} : ` +
      (error?.response?.data?.message || error?.message || "Erreur inconnue"),
    "error"
  );
}

const Reports = () => {
  const { t } = useTranslation();
  const axios = useAxios();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [catStats, setCatStats] = useState([]);
  const [productStats, setProductStats] = useState([]);

  const fetchAllStats = useCallback(async () => {
    if (!axios) {
      notifyApiError(
        showNotification,
        "de connexion à l'API",
        new Error("API non disponible")
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [orders, users, cats, products] = await Promise.all([
        axios.get("/ecommerce/orders"),
        axios.get("/users/"),
        axios.get("/cat/admin/all-current"),
        axios.get("/ecommerce/products"),
      ]);

      // Traitement des données de ventes
      const salesData =
        orders
          ?.reduce((acc, order) => {
            const date = new Date(order.orderDate).toLocaleDateString("fr-FR");
            const existingEntry = acc.find((entry) => entry.date === date);

            if (existingEntry) {
              existingEntry.amount += order.totalAmount || 0;
              existingEntry.orders += 1;
            } else {
              acc.push({
                date,
                amount: order.totalAmount || 0,
                orders: 1,
              });
            }
            return acc;
          }, [])
          .sort((a, b) => new Date(a.date) - new Date(b.date)) || [];

      // Traitement des statistiques utilisateurs
      const userStats =
        users?.reduce((acc, user) => {
          const gender = user.gender || "OTHER";
          const existingEntry = acc.find((entry) => entry.gender === gender);

          if (existingEntry) {
            existingEntry.count += 1;
          } else {
            acc.push({
              gender: t(`common.gender.${gender.toLowerCase()}`, gender),
              count: 1,
            });
          }
          return acc;
        }, []) || [];

      // Traitement des statistiques chats
      const catStats =
        cats?.reduce((acc, catStatus) => {
          const status = catStatus.statusCat;
          const existingEntry = acc.find((entry) => entry.name === status);

          if (existingEntry) {
            existingEntry.value += 1;
          } else {
            acc.push({
              name: t(`common.${status.toLowerCase()}`, status),
              value: 1,
            });
          }
          return acc;
        }, []) || [];

      // Traitement des statistiques produits
      const productStats =
        products?.reduce((acc, product) => {
          const stockStatus =
            product.stockQuantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK";
          const existingEntry = acc.find((entry) => entry.name === stockStatus);

          if (existingEntry) {
            existingEntry.value += 1;
          } else {
            acc.push({
              name: t(
                `admin.products.status.${stockStatus.toLowerCase()}`,
                stockStatus
              ),
              value: 1,
            });
          }
          return acc;
        }, []) || [];

      setSalesData(salesData);
      setUserStats(userStats);
      setCatStats(catStats);
      setProductStats(productStats);
    } catch (error) {
      notifyApiError(
        showNotification,
        "lors de la récupération des statistiques",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [axios, showNotification, t]);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  const handleExport = async (type) => {
    try {
      let dataToExport = [];
      let filename = "";

      switch (type) {
        case "sales":
          dataToExport = salesData;
          filename = "ventes";
          break;
        case "users":
          dataToExport = userStats;
          filename = "utilisateurs";
          break;
        case "cats":
          dataToExport = catStats;
          filename = "chats";
          break;
        case "products":
          dataToExport = productStats;
          filename = "produits";
          break;
        default:
          throw new Error("Type de rapport non supporté");
      }

      const headers = Object.keys(dataToExport[0] || {}).join(",");
      const rows = dataToExport.map((row) => Object.values(row).join(","));
      const csv = [headers, ...rows].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `rapport-${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showNotification("Le rapport a été exporté avec succès !", "success");
    } catch (error) {
      notifyApiError(showNotification, "lors de l'export du rapport", error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value || 0);
  };

  if (loading) {
    return (
      <Container className="py-3">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t("admin.reports.title", "Rapports")}</h2>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={() => handleExport("sales")}
            disabled={!salesData.length}
          >
            <FiDownload className="me-2" />
            {t("admin.reports.exportSales", "Exporter les ventes")}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleExport("users")}
            disabled={!userStats.length}
          >
            <FiDownload className="me-2" />
            {t("admin.reports.exportUsers", "Exporter les utilisateurs")}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleExport("cats")}
            disabled={!catStats.length}
          >
            <FiDownload className="me-2" />
            {t("admin.reports.exportCats", "Exporter les chats")}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleExport("products")}
            disabled={!productStats.length}
          >
            <FiDownload className="me-2" />
            {t("admin.reports.exportProducts", "Exporter les produits")}
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {/* Graphique des ventes */}
        {salesData.length > 0 && (
          <Col xs={12}>
            <Card>
              <Card.Body>
                <h5 className="mb-4">{t("admin.reports.sales", "Ventes")}</h5>
                <Row className="mb-4">
                  <Col md={6}>
                    <Card>
                      <Card.Body>
                        <h6>
                          {t("admin.reports.totalRevenue", "Revenus totaux")}
                        </h6>
                        <p className="h3">
                          {formatCurrency(
                            salesData.reduce(
                              (sum, item) => sum + item.amount,
                              0
                            )
                          )}
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <Card.Body>
                        <h6>
                          {t("admin.reports.orderCount", "Nombre de commandes")}
                        </h6>
                        <p className="h3">
                          {salesData.reduce(
                            (sum, item) => sum + item.orders,
                            0
                          )}
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <div style={{ height: "400px" }}>
                  <ResponsiveContainer>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={formatCurrency} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="amount"
                        stroke="#8884d8"
                        name={t(
                          "admin.reports.salesAmount",
                          "Montant des ventes"
                        )}
                      />
                      <Line
                        yAxisId="right"
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
        )}

        {/* Statistiques des utilisateurs */}
        {userStats.length > 0 && (
          <Col xs={12} md={6}>
            <Card>
              <Card.Body>
                <h5 className="mb-4">
                  {t("admin.reports.users", "Utilisateurs")}
                </h5>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={userStats}
                        dataKey="count"
                        nameKey="gender"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {userStats.map((entry, index) => (
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
        )}

        {/* Statistiques des chats */}
        {catStats.length > 0 && (
          <Col xs={12} md={6}>
            <Card>
              <Card.Body>
                <h5 className="mb-4">{t("admin.reports.cats", "Chats")}</h5>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={catStats}
                        dataKey="value"
                        nameKey="name"
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
        )}

        {/* Statistiques des produits */}
        {productStats.length > 0 && (
          <Col xs={12}>
            <Card>
              <Card.Body>
                <h5 className="mb-4">
                  {t("admin.reports.products", "Produits")}
                </h5>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={productStats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {productStats.map((entry, index) => (
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
        )}
      </Row>
    </Container>
  );
};

export default Reports;
