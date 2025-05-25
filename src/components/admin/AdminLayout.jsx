import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  FiMenu,
  FiChevronLeft,
  FiLayout,
  FiUsers,
  FiHeart,
  FiShoppingCart,
  FiPackage,
  FiBarChart2,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AdminLayout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    {
      text: t("admin.menu.dashboard"),
      icon: <FiLayout />,
      path: "/admin",
    },
    {
      text: t("admin.menu.users"),
      icon: <FiUsers />,
      path: "/admin/users",
    },
    {
      text: t("admin.menu.cats"),
      icon: <FiHeart />,
      path: "/admin/cats",
    },
    {
      text: t("admin.menu.orders"),
      icon: <FiShoppingCart />,
      path: "/admin/orders",
    },
    {
      text: t("admin.menu.products"),
      icon: <FiPackage />,
      path: "/admin/products",
    },
    {
      text: t("admin.menu.reports"),
      icon: <FiBarChart2 />,
      path: "/admin/reports",
    },
  ];

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <FiMenu />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {t("admin.title")}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar>
          <IconButton onClick={handleDrawerClose}>
            <FiChevronLeft />
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        <Toolbar />
        {children}
      </Main>
    </Box>
  );
};

export default AdminLayout;
