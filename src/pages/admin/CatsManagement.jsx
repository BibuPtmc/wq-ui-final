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
  TextField,
  MenuItem,
  Typography,
  Chip,
  Grid,
} from "@mui/material";
import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthProvider";
import { useAxios } from "../../hooks/useAxios";

const CatsManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const api = useAxios();
  const [cats, setCats] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "LOST",
    breed: "",
    color: "",
    gender: "",
    age: "",
    location: {
      address: "",
      city: "",
      postalCode: "",
    },
  });

  useEffect(() => {
    fetchCats();
  }, []);

  const fetchCats = async () => {
    try {
      const response = await api.get("/cat/list", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCats(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des chats:", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (cat = null) => {
    if (cat) {
      setSelectedCat(cat);
      setFormData({
        name: cat.name,
        description: cat.description,
        status: cat.status,
        breed: cat.breed,
        color: cat.color,
        gender: cat.gender,
        age: cat.age,
        location: cat.location || {
          address: "",
          city: "",
          postalCode: "",
        },
      });
    } else {
      setSelectedCat(null);
      setFormData({
        name: "",
        description: "",
        status: "LOST",
        breed: "",
        color: "",
        gender: "",
        age: "",
        location: {
          address: "",
          city: "",
          postalCode: "",
        },
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCat(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedCat) {
        await api.put(`/cat/${selectedCat.catId}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
      } else {
        await api.post("/cat", formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
      }
      fetchCats();
      handleCloseDialog();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleDelete = async (catId) => {
    if (window.confirm(t("admin.cats.confirmDelete"))) {
      try {
        await api.delete(`/cat/${catId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        fetchCats();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "LOST":
        return "error";
      case "FOUND":
        return "success";
      case "REUNITED":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">{t("admin.cats.title")}</Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("admin.cats.name")}</TableCell>
              <TableCell>{t("admin.cats.breed")}</TableCell>
              <TableCell>{t("admin.cats.status")}</TableCell>
              <TableCell>{t("admin.cats.location")}</TableCell>
              <TableCell>{t("admin.cats.owner")}</TableCell>
              <TableCell>{t("admin.cats.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cats
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((cat) => (
                <TableRow key={cat.catId}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.breed}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`cat.status.${cat.status.toLowerCase()}`)}
                      color={getStatusColor(cat.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {cat.location
                      ? `${cat.location.city}, ${cat.location.postalCode}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {cat.owner
                      ? `${cat.owner.firstName} ${cat.owner.lastName}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(cat)}>
                      <FiEdit2 />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(cat.catId)}>
                      <FiTrash2 />
                    </IconButton>
                    <IconButton>
                      <FiEye />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={cats.length}
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
        <DialogTitle>
          {selectedCat ? t("admin.cats.edit") : t("admin.cats.create")}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label={t("admin.cats.name")}
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="breed"
                label={t("admin.cats.breed")}
                value={formData.breed}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="status"
                label={t("admin.cats.status")}
                select
                value={formData.status}
                onChange={handleInputChange}
                fullWidth
              >
                <MenuItem value="LOST">{t("cat.status.lost")}</MenuItem>
                <MenuItem value="FOUND">{t("cat.status.found")}</MenuItem>
                <MenuItem value="REUNITED">{t("cat.status.reunited")}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="gender"
                label={t("admin.cats.gender")}
                select
                value={formData.gender}
                onChange={handleInputChange}
                fullWidth
              >
                <MenuItem value="MALE">{t("common.male")}</MenuItem>
                <MenuItem value="FEMALE">{t("common.female")}</MenuItem>
                <MenuItem value="UNKNOWN">{t("common.unknown")}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label={t("admin.cats.description")}
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t("admin.cats.location")}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="location.address"
                label={t("admin.cats.address")}
                value={formData.location.address}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="location.city"
                label={t("admin.cats.city")}
                value={formData.location.city}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="location.postalCode"
                label={t("admin.cats.postalCode")}
                value={formData.location.postalCode}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("common.cancel")}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CatsManagement;
