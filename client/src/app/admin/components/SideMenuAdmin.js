// src/app/admin/components/SideMenuAdmin.js
"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  People,
  School,
  MeetingRoom,
  MenuBook,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  BrandingWatermark,
  ChevronLeft,
  Menu as MenuIcon,
  SwapHoriz,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import "@fontsource/great-vibes";
import useUser from "../../hooks/useUser";
import LoadingIn from "../../hooks/LoadingIn";

const menuItems = [
  { key: "users", icon: <People />, label: "Utilisateurs" },
  { key: "specialty", icon: <BrandingWatermark />, label: "Spécialités" },
  { key: "brigades", icon: <School />, label: "Brigades" },
  { key: "salles", icon: <MeetingRoom />, label: "Salles" },
  { key: "cours", icon: <MenuBook />, label: "Cours" },
  { key: "progression", icon: <TrendingUpIcon />, label: "Créer Progression" },
  { key: "historique", icon: <HistoryIcon />, label: "Historique" },
  { key: "settings", icon: <SettingsIcon />, label: "Settings" },
];

export default function SideMenuAdmin({
  menuOption,
  setMenuOption,
  collapsed,
  setCollapsed,
  width,
  setWidth,
  position,
  setPosition,
}) {
  const theme = useTheme();
  const router = useRouter();
  const { myData, setMyData, loading } = useUser();
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const [isLoading, setIsLoading] = useState(false);

  // حالة الشعار واسم التطبيق
  const [appInfo, setAppInfo] = useState({ name: "Portail CIT", logo: null });
  const authHeader = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  // جلب شعار واسم التطبيق من API
  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        const res = await fetch(`${API_URL}/api/info-apps?populate=logo`, {
          headers: authHeader,
        });
        const { data } = await res.json();
        if (data?.length) {
          const item = data[0];
          setAppInfo({
            name: item.appName,
            logo: item.logo?.[0]?.url || null,
          });
        }
      } catch (err) {
        console.error("Failed to fetch app info:", err);
      }
    };
    fetchAppInfo();
  }, [API_URL]);

  // مقبض السحب لتغيير الحجم
  const resizerRef = useRef(null);
  const dragging = useRef(false);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging.current) return;
      const newX = position === "left" ? e.clientX : window.innerWidth - e.clientX;
      setWidth(Math.max(80, Math.min(newX, 500)));
    };
    const handleMouseUp = () => { dragging.current = false; };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [position]);

  // تسجيل الخروج وتحديث الحالة offline
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const statuId = myData?.user_status?.documentId;
      if (statuId) {
        await fetch(`${API_URL}/api/user-statuses/${statuId}`, {
          method: "PUT",
          headers: { ...authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              isOnline: false,
              lastSeen: new Date().toISOString(),
              user: myData.documentId,
            },
          }),
        });
      }
    } catch (err) {
      console.error("Failed to update user status on logout:", err);
    } finally {
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  // تبديل موقع الشريط الجانبي
  const togglePosition = () => {
    setPosition(position === "left" ? "right" : "left");
  };

  // عرض أيقونة الإظهار عند الإخفاء الكامل
  if (collapsed) {
    return (
      <IconButton
        onClick={() => setCollapsed(false)}
        sx={{
          position: "fixed",
          top: 16,
          [position]: 16,
          zIndex: 1400,
          background: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        }}
      >
        <MenuIcon />
      </IconButton>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        [position]: 16,
        height: `calc(100vh - 32px)`,
        width: `${width}px`,
        background: theme.palette.background.paper,
        borderRadius: 2,
        transition: "all 0.4s ease",
        color: theme.palette.text.primary,
        zIndex: 1300,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {isLoading && <LoadingIn />}

      {/* Header: شعار التطبيق + أزرار التحكم */}
      <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1 }}>
        <IconButton onClick={togglePosition} sx={{ mr: 1 }}>
          <SwapHoriz />
        </IconButton>

        {/* عرض الشعار عند التوسيع */}
        {!collapsed && appInfo.logo && (
          <Box
            component="img"
            src={`${API_URL}${appInfo.logo.startsWith("/") ? "" : "/"}${appInfo.logo}`}
            alt="App Logo"
            sx={{
              height: 50,
              objectFit: "contain",
              flexGrow: 1,
            }}
          />
        )}

        <IconButton onClick={() => setCollapsed(true)} sx={{ ml: "auto" }}>
          <ChevronLeft />
        </IconButton>
      </Box>

      <Divider />

      {/* قائمة الخيارات */}
      <List sx={{ flexGrow: 1, overflowY: "auto", px: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.key}
            onClick={() => setMenuOption(item.key)}
            sx={{
              borderRadius: 2,
              mb: 1,
              backgroundColor:
                menuOption === item.key
                  ? alpha(theme.palette.primary.main, 0.15)
                  : "transparent",
              color:
                menuOption === item.key
                  ? theme.palette.primary.main
                  : theme.palette.text.primary,
              transition: "0.3s",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 0, mr: 2, justifyContent: "center" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      {/* بطاقة المستخدم مع حالة الاتصال وزر الخروج */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        {loading || !myData ? (
          <Avatar sx={{ width: 40, height: 40 }} />
        ) : (
          <Avatar
            src={myData.imgProfile?.url ? `${API_URL}${myData.imgProfile.url}` : undefined}
            sx={{
              width: 40,
              height: 40,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            {!myData.imgProfile?.url && myData.username.charAt(0)}
          </Avatar>
        )}

        {!loading && myData && (
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            <Typography noWrap sx={{ fontWeight: 600 }}>{myData.username}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>{myData.role?.name}</Typography>
          </Box>
        )}

        <Tooltip title="Logout">
          <IconButton onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* مقبض السحب لتغيير العرض */}
      <Box
        ref={resizerRef}
        onMouseDown={() => (dragging.current = true)}
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          [position === "left" ? "right" : "left"]: 0,
          width: 6,
          cursor: "ew-resize",
          zIndex: 1400,
        }}
      />
    </Box>
  );
}
