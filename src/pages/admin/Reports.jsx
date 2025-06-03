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
  ButtonGroup,
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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <h2 className="mb-0">{t("admin.reports.title", "Rapports")}</h2>
        <ButtonGroup className="d-flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => handleExport("sales")}
            disabled={!salesData.length}
            size="sm"
            className="flex-grow-1"
          >
            <FiDownload className="me-2" />
            {t("admin.reports.exportSales", "Exporter les ventes")}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleExport("users")}
            disabled={!userStats.length}
            size="sm"
            className="flex-grow-1"
          >
            <FiDownload className="me-2" />
            {t("admin.reports.exportUsers", "Exporter les utilisateurs")}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleExport("cats")}
            disabled={!catStats.length}
            size="sm"
            className="flex-grow-1"
          >
            <FiDownload className="me-2" />
            {t("admin.reports.exportCats", "Exporter les chats")}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleExport("products")}
            disabled={!productStats.length}
            size="sm"
            className="flex-grow-1"
          >
            <FiDownload className="me-2" />
            {t("admin.reports.exportProducts", "Exporter les produits")}
          </Button>
        </ButtonGroup>
      </div>

      <Row className="g-4">
        {/* Graphique des ventes */}
        {salesData.length > 0 && (
          <Col xs={12}>
            <Card>
              <Card.Body>
                <h5 className="mb-4">{t("admin.reports.sales", "Ventes")}</h5>
                <Row className="g-3 mb-4">
                  <Col xs={12} sm={6}>
                    <Card className="h-100">
                      <Card.Body>
                        <h6 className="mb-2">
                          {t("admin.reports.totalRevenue", "Revenus totaux")}
                        </h6>
                        <p className="h3 mb-0">
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
                  <Col xs={12} sm={6}>
                    <Card className="h-100">
                      <Card.Body>
                        <h6 className="mb-2">
                          {t("admin.reports.orderCount", "Nombre de commandes")}
                        </h6>
                        <p className="h3 mb-0">
                          {salesData.reduce(
                            (sum, item) => sum + item.orders,
                            0
                          )}
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <div style={{ height: "min(400px, 50vh)" }} className="mt-3">
                  <ResponsiveContainer>
                    <LineChart
                      data={salesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={formatCurrency}
                        contentStyle={{ fontSize: "12px" }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "12px" }}
                        verticalAlign="bottom"
                        height={36}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="amount"
                        stroke="#8884d8"
                        name={t(
                          "admin.reports.salesAmount",
                          "Montant des ventes"
                        )}
                        strokeWidth={2}
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
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Statistiques des utilisateurs et chats */}
        <Row className="g-4">
          {userStats.length > 0 && (
            <Col xs={12} md={6}>
              <Card className="h-100">
                <Card.Body>
                  <h5 className="mb-4">
                    {t("admin.reports.users", "Utilisateurs")}
                  </h5>
                  <div style={{ height: "min(300px, 40vh)" }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={userStats}
                          dataKey="count"
                          nameKey="gender"
                          cx="50%"
                          cy="50%"
                          outerRadius="80%"
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {userStats.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} utilisateurs`, ""]}
                          contentStyle={{ fontSize: "12px" }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: "12px" }}
                          verticalAlign="bottom"
                          height={36}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}

          {catStats.length > 0 && (
            <Col xs={12} md={6}>
              <Card className="h-100">
                <Card.Body>
                  <h5 className="mb-4">{t("admin.reports.cats", "Chats")}</h5>
                  <div style={{ height: "min(300px, 40vh)" }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={catStats}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius="80%"
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {catStats.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} chats`, ""]}
                          contentStyle={{ fontSize: "12px" }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: "12px" }}
                          verticalAlign="bottom"
                          height={36}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>

        {/* Statistiques des produits */}
        {productStats.length > 0 && (
          <Col xs={12}>
            <Card>
              <Card.Body>
                <h5 className="mb-4">
                  {t("admin.reports.products", "Produits")}
                </h5>
                <div style={{ height: "min(300px, 40vh)" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={productStats}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {productStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} produits`, ""]}
                        contentStyle={{ fontSize: "12px" }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "12px" }}
                        verticalAlign="bottom"
                        height={36}
                      />
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
