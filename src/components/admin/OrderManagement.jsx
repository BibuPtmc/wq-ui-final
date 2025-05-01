import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Chip,
  Pagination,
  CircularProgress,
  TextField
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';

const OrderManagement = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery(
    ['orders', page, search],
    () => fetch(`/api/admin/orders?page=${page - 1}&search=${search}`).then(res => res.json())
  );

  const updateOrderStatus = useMutation(
    (data) => fetch(`/api/admin/orders/${data.orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: data.status })
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['orders']);
        handleCloseMenu();
      }
    }
  );

  const handleMenuClick = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleStatusChange = (status) => {
    if (selectedOrder) {
      updateOrderStatus.mutate({ orderId: selectedOrder.id, status });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('admin.orderManagement.title')}
      </Typography>

      <Box mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('admin.orderManagement.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.orderManagement.orderId')}</TableCell>
              <TableCell>{t('admin.orderManagement.customer')}</TableCell>
              <TableCell>{t('admin.orderManagement.date')}</TableCell>
              <TableCell>{t('admin.orderManagement.amount')}</TableCell>
              <TableCell>{t('admin.orderManagement.status')}</TableCell>
              <TableCell>{t('admin.orderManagement.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordersData?.content?.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>{order.userName}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{order.totalAmount.toFixed(2)} €</TableCell>
                <TableCell>
                  <Chip 
                    label={t(`order.status.${order.status.toLowerCase()}`)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuClick(e, order)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={ordersData?.totalPages || 1}
          page={page}
          onChange={(e, value) => setPage(value)}
        />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleStatusChange('PENDING')}>
          {t('admin.orderManagement.markAsPending')}
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('COMPLETED')}>
          {t('admin.orderManagement.markAsCompleted')}
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('CANCELLED')}>
          {t('admin.orderManagement.markAsCancelled')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default OrderManagement; 