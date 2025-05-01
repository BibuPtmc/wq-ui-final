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
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Button,
  Collapse
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';

const CatManagement = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    breed: '',
    status: '',
    minReports: '',
    dateFrom: '',
    dateTo: ''
  });
  const queryClient = useQueryClient();

  const { data: catsData, isLoading } = useQuery(
    ['reportedCats', page, filters],
    () => {
      const params = new URLSearchParams({
        page: page - 1,
        ...filters
      });
      return fetch(`/api/admin/cats/reported?${params}`).then(res => res.json());
    }
  );

  const updateCatStatus = useMutation(
    (data) => fetch(`/api/admin/cats/${data.catId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: data.status })
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reportedCats']);
        handleCloseMenu();
      }
    }
  );

  const handleMenuClick = (event, cat) => {
    setAnchorEl(event.currentTarget);
    setSelectedCat(cat);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCat(null);
  };

  const handleStatusChange = (status) => {
    if (selectedCat) {
      updateCatStatus.mutate({ catId: selectedCat.id, status });
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      name: '',
      breed: '',
      status: '',
      minReports: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'LOST': return 'error';
      case 'FOUND': return 'success';
      case 'MATCHED': return 'info';
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {t('admin.catManagement.title')}
        </Typography>
        <Button
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
        >
          {t('common.filters')}
        </Button>
      </Box>

      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={t('admin.catManagement.name')}
                value={filters.name}
                onChange={handleFilterChange('name')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label={t('admin.catManagement.breed')}
                value={filters.breed}
                onChange={handleFilterChange('breed')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('admin.catManagement.status')}</InputLabel>
                <Select
                  value={filters.status}
                  onChange={handleFilterChange('status')}
                  label={t('admin.catManagement.status')}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="LOST">{t('cat.status.lost')}</MenuItem>
                  <MenuItem value="FOUND">{t('cat.status.found')}</MenuItem>
                  <MenuItem value="MATCHED">{t('cat.status.matched')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label={t('admin.catManagement.minReports')}
                value={filters.minReports}
                onChange={handleFilterChange('minReports')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="date"
                label={t('admin.catManagement.dateFrom')}
                value={filters.dateFrom}
                onChange={handleFilterChange('dateFrom')}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="date"
                label={t('admin.catManagement.dateTo')}
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
        </Paper>
      </Collapse>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.catManagement.name')}</TableCell>
              <TableCell>{t('admin.catManagement.breed')}</TableCell>
              <TableCell>{t('admin.catManagement.status')}</TableCell>
              <TableCell>{t('admin.catManagement.reports')}</TableCell>
              <TableCell>{t('admin.catManagement.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {catsData?.content?.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.breed}</TableCell>
                <TableCell>
                  <Chip 
                    label={t(`cat.status.${cat.status.toLowerCase()}`)}
                    color={getStatusColor(cat.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{cat.reportCount}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuClick(e, cat)}>
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
          count={catsData?.totalPages || 1}
          page={page}
          onChange={(e, value) => setPage(value)}
        />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleStatusChange('LOST')}>
          {t('admin.catManagement.markAsLost')}
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('FOUND')}>
          {t('admin.catManagement.markAsFound')}
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('MATCHED')}>
          {t('admin.catManagement.markAsMatched')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CatManagement; 