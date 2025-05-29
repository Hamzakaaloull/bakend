"use client";
import {
  BottomNavigation,
  BottomNavigationAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import {
  Home as HomeIcon,
  EventNote as EventNoteIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useState } from "react";

export default function MobileBottomNav({
  value,
  onChange,
  handleLogout,
  avatarUrl,
  username,
}) {
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmLogout = () => {
    handleLogout();
    handleCloseDialog();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: "1px solid rgba(0, 0, 0, 0.1)",
        bgcolor: "#E3F2FD", // نفس اللون القديم
        boxShadow: "0px -4px 15px rgba(0, 0, 0, 0.1)", // ظل أكثر دقة
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => onChange(newValue)}
        sx={{
          bgcolor: "transparent",
          "& .Mui-selected": {
            color: "#2196F3 !important", // نفس اللون القديم عند التحديد
            "& .MuiSvgIcon-root": {
              transform: "scale(1.2)", // تأثير تكبير أيقونة عند التحديد
              transition: "transform 0.3s ease-in-out", // انتقال ناعم
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.8rem", // حجم خط مناسب
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px", // تباعد بين الحروف لإضافة أناقة
              transition: "color 0.3s ease-in-out", // انتقال لوني ناعم
            },
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "0.75rem",
            fontWeight: "normal",
            color: "#2E3B55", // نفس اللون القديم للنص
            transition: "color 0.3s ease-in-out", // انتقال لوني ناعم
          },
        }}
      >
        {/* زر الصفحة الرئيسية */}
        <BottomNavigationAction
          label="Accueil"
          value="home"
          icon={<HomeIcon />}
          sx={{
            color: "#2E3B55", // نفس اللون القديم
            "&:hover": {
              color: "#2196F3", // تغيير اللون عند التحويم
              transition: "color 0.3s ease-in-out", // انتقال ناعم
            },
          }}
        />

        {/* زر الجلسات */}
        <BottomNavigationAction
          label="Séances"
          value="seance"
          icon={<EventNoteIcon />}
          sx={{
            color: "#2E3B55", // نفس اللون القديم
            "&:hover": {
              color: "#2196F3", // تغيير اللون عند التحويم
              transition: "color 0.3s ease-in-out", // انتقال ناعم
            },
          }}
        />

        {/* زر تسجيل الخروج */}
        <BottomNavigationAction
          label="Déconnexion"
          icon={<LogoutIcon />}
          onClick={handleOpenDialog}
          sx={{
            color: "#2E3B55", // نفس اللون القديم
            "&:hover": {
              color: "#f44336", // تغيير اللون عند التحويم
              transition: "color 0.3s ease-in-out", // انتقال ناعم
            },
          }}
        />
      </BottomNavigation>

      {/* نافذة التأكيد */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: "12px", // حواف مستديرة
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.15)", // ظل مميز
          },
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            textAlign: "center",
            fontSize: "1.1rem",
            fontWeight: "bold",
            color: "#2E3B55", // نفس اللون القديم
          }}
        >
          {"تأكيد تسجيل الخروج"}
        </DialogTitle>
        <DialogContent
          sx={{
            textAlign: "center",
            color: "#2E3B55", // نفس اللون القديم
            fontSize: "0.9rem",
          }}
        >
          Are you absolutely sure you want to sign out?
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: "#2196F3", // نفس اللون القديم
              border: "1px solid #2196F3", // حدود بسيطة
              borderRadius: "8px",
              transition: "background-color 0.3s ease-in-out", // انتقال ناعم
              "&:hover": {
                bgcolor: "#2196F3", // تغيير خلفية عند التحويم
                color: "#FFFFFF", // نص أبيض عند التحويم
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLogout}
            autoFocus
            sx={{
              color: "#f44336", // نفس اللون القديم
              border: "1px solid #f44336", // حدود بسيطة
              borderRadius: "8px",
              transition: "background-color 0.3s ease-in-out", // انتقال ناعم
              "&:hover": {
                bgcolor: "#f44336", // تغيير خلفية عند التحويم
                color: "#FFFFFF", // نص أبيض عند التحويم
              },
            }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
