// src/app/admin/page.js
"use client";
import { useEffect, useState } from "react";
import { Box, useTheme, Typography, Button } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/navigation";
import SideMenuAdmin from "./components/SideMenuAdmin";
import UserCrud from "./components/UserCrud/page";
import BrigadeCrud from "./components/BrigadeCrud";
import SalleCrud from "./components/SalleCrud";
import CoursCrud from "./components/CoursCrud";
import Settings from "./components/Settings/page";
import LoadingIn from "../hooks/LoadingIn";
import CreerProgression from "./components/CreerProgression";
import Historique from "./components/Historique";
import Specialty from "./components/specialty";

export default function AdminPage() {
  const [menuOption, setMenuOption] = useState("users");
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [sidebarPosition, setSidebarPosition] = useState("left"); // "left" or "right"
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // التحقق من التوكن وتحميل الـ Loading
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else setLoading(false);
  }, [router]);

  if (loading) return <LoadingIn />;
  if (isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", textAlign: "center", p: 4 }}>
        <Typography variant="h4" gutterBottom>Mobile Not Supported</Typography>
        <Typography variant="body1">The admin panel is currently only available on desktop devices.</Typography>
        <Button variant="contained" color="primary" onClick={() => router.back()} sx={{ mt: 4 }}>Go Back</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", overflow: "hidden", height: "100vh" }}>
      {/* شريط جانبي على اليسار */}
      {sidebarPosition === "left" && (
        <SideMenuAdmin
          menuOption={menuOption}
          setMenuOption={setMenuOption}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          width={sidebarWidth}
          setWidth={setSidebarWidth}
          position={sidebarPosition}
          setPosition={setSidebarPosition}
        />
      )}

      {/* المحتوى الرئيسي */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: "margin 0.4s ease",
          ml: sidebarPosition === "left" ? (collapsed ? 0 : `${sidebarWidth}px`) : 0,
          mr: sidebarPosition === "right" ? (collapsed ? 0 : `${sidebarWidth}px`) : 0,
          p: 4,
          width: "100%",
          overflowY: "auto",
        }}
      >
        {menuOption === "users" && <UserCrud />}
        {menuOption === "specialty" && <Specialty />}
        {menuOption === "brigades" && <BrigadeCrud />}
        {menuOption === "salles" && <SalleCrud />}
        {menuOption === "cours" && <CoursCrud />}
        {menuOption === "settings" && <Settings />}
        {menuOption === "progression" && <CreerProgression />}
        {menuOption === "historique" && <Historique />}
      </Box>

      {/* شريط جانبي على اليمين */}
      {sidebarPosition === "right" && (
        <SideMenuAdmin
          menuOption={menuOption}
          setMenuOption={setMenuOption}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          width={sidebarWidth}
          setWidth={setSidebarWidth}
          position={sidebarPosition}
          setPosition={setSidebarPosition}
        />
      )}
    </Box>
  );
}
