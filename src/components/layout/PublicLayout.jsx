import React from "react";
import NavBar from "./Navbar";
import Footer from "./Footer";
import { Box } from "@mui/material";

const PublicLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box sx={{ flex: 1 }}>
        <NavBar />
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default PublicLayout;
