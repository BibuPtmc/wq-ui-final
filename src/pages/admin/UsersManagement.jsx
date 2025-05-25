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
} from "@mui/material";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthProvider";
import { useAxios } from "../../hooks/useAxios";

const UsersManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const api = useAxios();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "USER",
    enabled: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/list", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        userName: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        enabled: user.enabled,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        userName: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "USER",
        enabled: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser.userId}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
      } else {
        await api.post("/users", formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
      }
      fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm(t("admin.users.confirmDelete"))) {
      try {
        await api.delete(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        fetchUsers();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">{t("admin.users.title")}</Typography>
        <Button
          variant="contained"
          startIcon={<FiPlus />}
          onClick={() => handleOpenDialog()}
        >
          {t("admin.users.create")}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("admin.users.userName")}</TableCell>
              <TableCell>{t("admin.users.email")}</TableCell>
              <TableCell>{t("admin.users.name")}</TableCell>
              <TableCell>{t("admin.users.role")}</TableCell>
              <TableCell>{t("admin.users.status")}</TableCell>
              <TableCell>{t("admin.users.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.userName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === "ADMIN" ? "secondary" : "primary"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        user.enabled ? t("common.active") : t("common.inactive")
                      }
                      color={user.enabled ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(user)}>
                      <FiEdit2 />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user.userId)}>
                      <FiTrash2 />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedUser ? t("admin.users.edit") : t("admin.users.create")}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              name="userName"
              label={t("admin.users.userName")}
              value={formData.userName}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="email"
              label={t("admin.users.email")}
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="firstName"
              label={t("admin.users.firstName")}
              value={formData.firstName}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="lastName"
              label={t("admin.users.lastName")}
              value={formData.lastName}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="role"
              label={t("admin.users.role")}
              select
              value={formData.role}
              onChange={handleInputChange}
              fullWidth
            >
              <MenuItem value="USER">USER</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
            </TextField>
          </Box>
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

export default UsersManagement;
