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
  Typography,
  Pagination,
  CircularProgress,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';

const AdminLogs = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    username: '',
    action: '',
    dateFrom: '',
    dateTo: ''
  });

  const { data: logsData, isLoading } = useQuery(
    ['adminLogs', page, filters],
    () => {
      const params = new URLSearchParams({
        page: page - 1,
        ...filters
      });
      return fetch(`/api/admin/logs?${params}`).then(res => res.json());
    }
  );

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      username: '',
      action: '',
      dateFrom: '',
      dateTo: ''
    });
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
        {t('admin.logs.title')}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label={t('admin.logs.username')}
            value={filters.username}
            onChange={handleFilterChange('username')}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('admin.logs.action')}</InputLabel>
            <Select
              value={filters.action}
              onChange={handleFilterChange('action')}
              label={t('admin.logs.action')}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              <MenuItem value="USER_ROLE_CHANGE">{t('admin.logs.actions.userRoleChange')}</MenuItem>
              <MenuItem value="CAT_STATUS_CHANGE">{t('admin.logs.actions.catStatusChange')}</MenuItem>
              <MenuItem value="ORDER_STATUS_CHANGE">{t('admin.logs.actions.orderStatusChange')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            type="date"
            label={t('admin.logs.dateFrom')}
            value={filters.dateFrom}
            onChange={handleFilterChange('dateFrom')}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            type="date"
            label={t('admin.logs.dateTo')}
            value={filters.dateTo}
            onChange={handleFilterChange('dateTo')}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button onClick={handleResetFilters}>
              {t('common.resetFilters')}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.logs.timestamp')}</TableCell>
              <TableCell>{t('admin.logs.username')}</TableCell>
              <TableCell>{t('admin.logs.action')}</TableCell>
              <TableCell>{t('admin.logs.details')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logsData?.content?.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>{log.username}</TableCell>
                <TableCell>{t(`admin.logs.actions.${log.action.toLowerCase()}`)}</TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={logsData?.totalPages || 1}
          page={page}
          onChange={(e, value) => setPage(value)}
        />
      </Box>
    </Box>
  );
};

export default AdminLogs; 