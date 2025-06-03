import React, { useState, useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
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
  Tooltip,
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
  FiHome,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const drawerWidth = 240;
const drawerWidthMobile = 280;

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "$isMobile",
})(({ theme, open, $isMobile }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: $isMobile ? 0 : `-${drawerWidth}px`,
  ...(open &&
    !$isMobile && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "$isMobile",
})(({ theme, $isMobile }) => ({
  width: $isMobile ? drawerWidthMobile : drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: $isMobile ? drawerWidthMobile : drawerWidth,
    boxSizing: "border-box",
    backgroundColor: theme.palette.background.default,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "$isMobile",
})(({ theme, open, $isMobile }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: "transparent",
  boxShadow: "none",
  ...(open &&
    !$isMobile && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
}));

const AdminLayout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("admin");

  // Fermer le drawer sur mobile lors du changement de route
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Ajuster l'état initial du drawer selon la taille de l'écran
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const menuItems = [
    {
      text: t("admin.menu.dashboard", "Tableau de bord"),
      icon: <FiLayout />,
      path: "/admin",
    },
    {
      text: t("admin.menu.users", "Utilisateurs"),
      icon: <FiUsers />,
      path: "/admin/users",
    },
    {
      text: t("admin.menu.cats", "Chats"),
      icon: <FiHeart />,
      path: "/admin/cats",
    },
    {
      text: t("admin.menu.orders", "Commandes"),
      icon: <FiShoppingCart />,
      path: "/admin/orders",
    },
    {
      text: t("admin.menu.products", "Produits"),
      icon: <FiPackage />,
      path: "/admin/products",
    },
    {
      text: t("admin.menu.reports", "Rapports"),
      icon: <FiBarChart2 />,
      path: "/admin/reports",
    },
    {
      text: t("admin.menu.backToSite", "Retour au site"),
      icon: <FiHome />,
      path: "/",
    },
  ];

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StyledAppBar
        position="fixed"
        open={open}
        $isMobile={isMobile}
        elevation={0}
      >
        <Toolbar sx={{ minHeight: { xs: 48, sm: 56, md: 64 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2, color: "text.primary" }}
            >
              <FiMenu />
            </IconButton>
          )}
        </Toolbar>
      </StyledAppBar>

      <StyledDrawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        $isMobile={isMobile}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <Tooltip
                title={!open && !isMobile ? item.text : ""}
                placement="right"
              >
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) handleDrawerToggle();
                  }}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </StyledDrawer>

      <Main open={open} $isMobile={isMobile}>
        <Toolbar sx={{ minHeight: { xs: 48, sm: 56, md: 64 } }} />
        <Box
          sx={{
            p: { xs: 1, sm: 2 },
            mt: { xs: 1, sm: 2 },
            backgroundColor: "background.paper",
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          {children}
        </Box>
      </Main>
    </Box>
  );
};

export default AdminLayout;
