import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthProvider";
import { api } from "../../utils/api";

const OrdersManagement = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/ecommerce/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "PAID":
        return "success";
      case "SHIPPED":
        return "info";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">{t("admin.orders.title")}</Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>{t("admin.orders.customer")}</TableCell>
              <TableCell>{t("admin.orders.date")}</TableCell>
              <TableCell>{t("admin.orders.status")}</TableCell>
              <TableCell>{t("admin.orders.total")}</TableCell>
              <TableCell>{t("admin.orders.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell>#{order.orderId}</TableCell>
                  <TableCell>
                    {order.user
                      ? `${order.user.firstName} ${order.user.lastName}`
                      : "-"}
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`order.status.${order.status.toLowerCase()}`)}
                      color={getStatusColor(order.status)}
                    />
                  </TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewOrder(order)}>
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={orders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              {t("admin.orders.details")} #{selectedOrder.orderId}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {t("admin.orders.customer")}
                  </Typography>
                  <Typography>
                    {selectedOrder.user
                      ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}`
                      : "-"}
                  </Typography>
                  <Typography>{selectedOrder.user?.email}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {t("admin.orders.status")}
                  </Typography>
                  <Chip
                    label={t(
                      `order.status.${selectedOrder.status.toLowerCase()}`
                    )}
                    color={getStatusColor(selectedOrder.status)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {t("admin.orders.items")}
                  </Typography>
                  <List>
                    {selectedOrder.items?.map((item, index) => (
                      <React.Fragment key={item.orderItemId}>
                        <ListItem>
                          <ListItemText
                            primary={item.product.name}
                            secondary={`${item.quantity} x ${formatPrice(
                              item.price
                            )}`}
                          />
                          <Typography>
                            {formatPrice(item.quantity * item.price)}
                          </Typography>
                        </ListItem>
                        {index < selectedOrder.items.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Typography variant="h6">
                      {t("admin.orders.total")}
                    </Typography>
                    <Typography variant="h6">
                      {formatPrice(selectedOrder.total)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>{t("common.close")}</Button>
              {selectedOrder.status === "PAID" && (
                <Button
                  variant="contained"
                  startIcon={<ShippingIcon />}
                  color="primary"
                >
                  {t("admin.orders.markAsShipped")}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default OrdersManagement;
