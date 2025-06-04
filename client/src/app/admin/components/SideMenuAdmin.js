// components/SideMenuAdmin.js
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  { key: "cours", icon: <MenuBook />, label: "Coures" },
  { key: "progression", icon: <TrendingUpIcon />, label: "Créer Progression" },
  { key: "historique", icon: <HistoryIcon />, label: "Historique" },
  { key: "settings", icon: <SettingsIcon />, label: "Settings" },
];

export default function SideMenuAdmin({ menuOption, setMenuOption }) {
  const theme = useTheme();
  const router = useRouter();
  const { myData, setMyData, loading } = useUser(); // ← استخرجنا setMyData
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const [isLoading, setIsLoading] = useState(false);

  const authHeader = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const [collapsed, setCollapsed] = useState(false);
  const [appInfo, setAppInfo] = useState({ name: "Portail CIT", logo: null });

  // جلب بيانات التطبيق
  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        const res = await fetch(`${API_URL}/api/info-apps?populate=logo`, {
          headers: authHeader,
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
      }
    };
    fetchAppInfo();
  }, [API_URL]);

  // تأكد من وجود التوكن
  useEffect(() => {
    if (!localStorage.getItem("token")) router.push("/login");
  }, [router]);
  // عند تغيير myData

  // عند التحميل لأول مرة: إنشاء user_status إذا لم يكن موجوداً
  useEffect(() => {
    // لا نعمل شيء قبل ما تنتهي التحميل وتتوفر البيانات
    if (loading || !myData) return;

    const syncStatus = async () => {
      try {
        const status = myData.user_status; // إما undefined أو object
        const payload = {
          data: {
            isOnline: true,
            lastSeen: new Date().toISOString(),
            user: myData.id,
          },
        };

        if (!status) {
          // لم يكن موجوداً فـ نُنشئه
          const res = await fetch(`${API_URL}/api/user-statuses`, {
            method: "POST",
            headers: {
              ...authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const newStatus = await res.json();
          setMyData((prev) => ({
            ...prev,
            user_status: newStatus.data || newStatus,
          }));
        } else if (status.isOnline === false) {
          // موجود لكن Offline فـ نحدّثه ليصير Online
          const id = status.documentId;
          const res = await fetch(`${API_URL}/api/user-statuses/${id}`, {
            method: "PUT",
            headers: {
              ...authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const updated = await res.json();
          setMyData((prev) => ({
            ...prev,
            user_status: updated.data || updated,
          }));
        }
        // إذا كان isOnline=true فلا نفعل شيئاً
      } catch (err) {
        console.error("Error syncing user_status:", err);
      }
    };

    syncStatus();
  }, [loading, myData, API_URL]);

  useEffect(() => {
    console.log("🔄 myData in SideMenuAdmin:", myData);
  }, [myData]);
  // عند الخروج: تحديث الحالة إلى offline
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const statuId = myData?.user_status?.documentId;
      if (statuId) {
        const res = await fetch(`${API_URL}/api/user-statuses/${statuId}`, {
          method: "PUT",
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              isOnline: false,
              lastSeen: new Date().toISOString(),
              user: myData.documentId,
            },
          }),
        });
        const updated = await res.json();
        setMyData((prev) => ({
          ...prev,
          user_status: updated,
        }));
      }
    } catch (err) {
      console.error("Failed to update user status on logout:", err);
    } finally {
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        left: 16,
        height: "calc(100vh - 32px)",
        width: collapsed ? 85 : 270,
        background: theme.palette.background.paper,
        borderRadius: 2,
        transition: "all 0.4s ease",
        color: theme.palette.text.primary,
        overflowY: "auto",
        zIndex: 1300,
      }}
    >
      {/* Header */}
      {isLoading && <LoadingIn />}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 2.5,
        }}
      >
        {!collapsed && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 180,
              height: 70,
            }}
          >
            {/* Logo Only */}
            <Box
              component="img"
              src={
                appInfo.logo
                  ? `${API_URL}${appInfo.logo.startsWith("/") ? "" : "/"}${
                      appInfo.logo
                    }`
                  : undefined
              }
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
            ml: collapsed ? "auto" : 0,
            border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            "&:hover": { background: theme.palette.grey[200] },
          }}
        >
          {collapsed ? <MenuIcon /> : <ChevronLeft />}
        </IconButton>
      </Box>

      {/* Menu */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              onClick={() => setMenuOption(item.key)}
              sx={{
                borderRadius: 2,
                px: 2,
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

      <Divider sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.2) }} />

      {/* User Card */}
      <Box
        sx={{
          mx: 2,
          mb: 2,
          p: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderRadius: 3,
          background: alpha(theme.palette.grey[100], 0.6),
        }}
      >
        {loading || !myData ? (
          <Avatar sx={{ width: 40, height: 40 }} />
        ) : (
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={
                myData.imgProfile?.url
                  ? `${API_URL}${myData.imgProfile.url}`
                  : undefined
              }
              sx={{
                width: 40,
                height: 40,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
              }}
            >
              {!myData.imgProfile?.url && myData.username.charAt(0)}
            </Avatar>
            <Box
              sx={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 10,
                height: 10,
                backgroundColor: myData.user_status?.isOnline
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                border: `2px solid ${theme.palette.background.paper}`,
                borderRadius: "50%",
              }}
            />
          </Box>
        )}

        {!collapsed && !loading && myData && (
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            <Typography noWrap sx={{ fontWeight: 600 }}>
              {myData.username}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {myData.role?.name}
            </Typography>
          </Box>
        )}

        {!collapsed && (
          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              sx={{
                background: alpha(theme.palette.error.main, 0.1),
                "&:hover": { background: alpha(theme.palette.error.main, 0.2) },
              }}
            >
              <LogoutIcon sx={{ color: "error.main" }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}