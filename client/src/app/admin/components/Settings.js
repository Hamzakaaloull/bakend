// app/admin/components/Settings.js
"use client";
import { useState } from "react";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";

export default function Settings() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords don't match" });
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:1337/api/users/me/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            password: passwordData.newPassword,
          }),
        }
      );

      if (res.ok) {
        setMessage({ type: "success", text: "Password updated successfully" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({ type: "error", text: "Error updating password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    }
  };

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        Change Password
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <form onSubmit={handlePasswordChange}>
        <TextField
          fullWidth
          margin="normal"
          label="Current Password"
          type="password"
          value={passwordData.currentPassword}
          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              currentPassword: e.target.value,
            })
          }
        />
        <TextField
          fullWidth
          margin="normal"
          label="New Password"
          type="password"
          value={passwordData.newPassword}
          onChange={(e) =>
            setPasswordData({ ...passwordData, newPassword: e.target.value })
          }
        />
        <TextField
          fullWidth
          margin="normal"
          label="Confirm New Password"
          type="password"
          value={passwordData.confirmPassword}
          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              confirmPassword: e.target.value,
            })
          }
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Change Password
        </Button>
      </form>
    </Box>
  );
}
