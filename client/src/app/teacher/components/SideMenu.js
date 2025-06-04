"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/navigation";
import useUser from "../../hooks/useUser";

import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  ListItemButton,
} from "@mui/material";
import {
  Home as HomeIcon,
  EventNote as EventNoteIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  ChevronLeft,
  Menu as MenuIcon,
} from "@mui/icons-material";
import MobileBottomNav from "./MobileBottomNav";
import LoadingIn from "../../hooks/LoadingIn"; // استيراد مكون التحميل

export default function SideMenu({
  menuOption,
  setMenuOption,
  teacherInfo,
  handleLogout,
  handleSettingsOpen,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const [collapsed, setCollapsed] = useState(false);
  
  // إضافة حالة لتخزين بيانات التطبيق والشعار
  const [appInfo, setAppInfo] = useState({ name: "Portail CIT", logo: null });
  const [loadingAppInfo, setLoadingAppInfo] = useState(true);
  
  // جلب بيانات التطبيق والشعار
  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const res = await fetch(`${API_URL}/api/info-apps?populate=logo`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const { data } = await res.json();
        if (data?.length) {
          setAppInfo({
            name: data[0].appName,
            logo: data[0].logo?.[0]?.url,
          });
        }
      } catch (err) {
        console.error("فشل جلب بيانات التطبيق:", err);
      } finally {
        setLoadingAppInfo(false);
      }
    };
    
    fetchAppInfo();
  }, [API_URL]);

  if (isMobile) {
    return (
      <MobileBottomNav
        value={menuOption}
        onChange={setMenuOption}
        handleLogout={handleLogout}
        handleSettingsOpen={handleSettingsOpen}
        avatarUrl={
          teacherInfo?.imgProfile?.url
            ? `${API_URL}${teacherInfo.imgProfile.url}`
            : null
        }
        username={teacherInfo?.username}
      />
    );
  }

  const menuItems = [
    { key: "home", icon: <HomeIcon />, label: "Accueil" },
    { key: "seance", icon: <EventNoteIcon />, label: "Séances" },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        left: 16,
        width: collapsed ? 85 : 270,
        height: "calc(100vh - 32px)",
        background: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme.shadows[1],
        transition: "all 0.4s ease",
        color: theme.palette.text.primary,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        zIndex: 1200,
      }}
    >
      {loadingAppInfo && <LoadingIn />}
      
      {/* Header مع الشعار */}
      <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 2 }}>
        {!collapsed && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 70,
              flexGrow: 1,
            }}
          >
            {appInfo.logo ? (
              <Box
                component="img"
                src={`${API_URL}${appInfo.logo.startsWith("/") ? "" : "/"}${appInfo.logo}`}
                sx={{
                  width: "auto",
                  height: "80%",
                  objectFit: "contain",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  mr: 15,
                  display: "block",
                }}
                alt="App Logo"
              />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {appInfo.name}
              </Typography>
            )}
          </Box>
        )}
        
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            background: theme.palette.grey[100],
            color: theme.palette.text.primary,
            width: 35,
            height: 35,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            ml: collapsed ? "auto" : 0,
            "&:hover": { background: theme.palette.grey[200] },
          }}
        >
          {collapsed ? <MenuIcon /> : <ChevronLeft />}
        </IconButton>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.key}
              disablePadding
              sx={{
                borderRadius: 2,
                mb: 1,
                backgroundColor: "transparent",
              }}
            >
              <ListItemButton
                selected={menuOption === item.key}
                onClick={() => setMenuOption(item.key)}
                sx={{
                  px: 2,
                  transition: "0.3s",
                  backgroundColor:
                    menuOption === item.key
                      ? theme.palette.action.selected
                      : "transparent",
                  color:
                    menuOption === item.key
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.primary.main,
                  },
                  borderRadius: 2,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "inherit",
                    minWidth: 0,
                    mr: collapsed ? 0 : 2,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ borderColor: theme.palette.divider }} />

      {/* User Card at bottom */}
      <Box
        sx={{
          mt: 2,
          mb: 2,
          mx: 2,
          pb: 2,
          p: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderRadius: 3,
          background: theme.palette.grey[50],
          transition: "0.3s",
          "&:hover": { boxShadow: theme.shadows[4] },
        }}
      >
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <Avatar
            src={
              teacherInfo?.imgProfile?.url
                ? `${API_URL}${teacherInfo.imgProfile.url}`
                : undefined
            }
            sx={{ width: 40, height: 40 }}
          >
            {!teacherInfo?.imgProfile?.url && <AccountCircleIcon />}
          </Avatar>

          <Box
            sx={(theme) => ({
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 10,
              height: 10,
              bgcolor: teacherInfo?.user_status?.isOnline
                ? theme.palette.success.main
                : theme.palette.error.main,
              border: `2px solid ${theme.palette.background.paper}`,
              borderRadius: "50%",
            })}
          />
        </Box>

        {!collapsed && (
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            <Typography noWrap sx={{ fontWeight: 600 }}>
              {teacherInfo?.username}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {teacherInfo?.user_status?.isOnline ? "En ligne" : "Hors ligne"}
            </Typography>
          </Box>
        )}

        {!collapsed && (
          <Tooltip title="Déconnexion">
            <IconButton onClick={handleLogout} sx={{ ml: "auto" }}>
              <LogoutIcon sx={{ color: theme.palette.error.main }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}