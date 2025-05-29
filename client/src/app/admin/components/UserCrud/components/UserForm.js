"use client";
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Stack, Avatar, IconButton, TextField,
  MenuItem, CircularProgress, Button
} from "@mui/material";
import {
  CloudUpload, Person as PersonIcon, Email as EmailIcon,
  Lock as LockIcon, Security as SecurityIcon,
  Cancel as CancelIcon, Save as SaveIcon, Add as AddIcon
} from "@mui/icons-material";

export default function UserForm({
  open, onClose, onSubmit, editingUser, loading, theme,
  formData, setFormData, selectedImage, handleImageChange,
  roles, specialties
}) {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  return (
    <Dialog
      open={open}
      keepMounted
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: 4, padding: 2, maxWidth: 600, margin: "auto" } }}
    >
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2, mb: 3 }}>
        <Typography variant="body1" color={editingUser ? "primary" : "secondary"}>
          {editingUser ? "Modifier l'utilisateur" : "Créer un nouvel utilisateur"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box sx={{ position: "relative", textAlign: "center" }}>
            <input
              accept="image/*"
              id="image-upload"
              type="file"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload">
              <IconButton
                component="span"
                sx={{
                  position: "absolute", bottom: -15, right: "50%",
                  transform: "translateX(50%)", bgcolor: "background.paper",
                  border: `2px solid ${theme.palette.secondary.main}`, boxShadow: 3,
                  "&:hover": { bgcolor: theme.palette.secondary.light },
                }}
              >
                <CloudUpload fontSize="large" />
              </IconButton>
            </label>
            <Avatar
              src={
                selectedImage instanceof File
                  ? URL.createObjectURL(selectedImage)
                  : selectedImage
                  ? `${API_URL}${selectedImage}`
                  : ""
              }
              sx={{
                width: 150, height: 150, mx: "auto",
                border: `3px solid ${theme.palette.secondary.main}`,
                "&:hover": { transform: "scale(1.05)" },
              }}
            />
          </Box>

          <TextField
            label="Nom d'utilisateur"
            fullWidth
            value={formData.username}
            onChange={(e) => setFormData((f) => ({ ...f, username: e.target.value }))}
            InputProps={{ startAdornment: <PersonIcon /> }}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
            InputProps={{ startAdornment: <EmailIcon /> }}
            required
          />
          <TextField
            label="Mot de passe"
            type="password"
            fullWidth
            helperText={
              editingUser
                ? "Laissez vide pour garder le mot de passe actuel"
                : "Minimum 8 caractères"
            }
            value={formData.password}
            onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
            InputProps={{ startAdornment: <LockIcon /> }}
            required={!editingUser}
          />
          <TextField
            select
            label="Rôle"
            fullWidth
            value={formData.role}
            onChange={(e) => setFormData((f) => ({ ...f, role: e.target.value }))}
            InputProps={{ startAdornment: <SecurityIcon /> }}
            required
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Spécialité"
            fullWidth
            value={formData.specialty}
            onChange={(e) => setFormData((f) => ({ ...f, specialty: e.target.value }))}
            InputProps={{ startAdornment: <SecurityIcon /> }}
            required
          >
            {specialties.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.nom}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          color="secondary"
          variant="outlined"
          startIcon={<CancelIcon />}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading.submit}
          startIcon={
            loading.submit ? (
              <CircularProgress size={20} color="inherit" />
            ) : editingUser ? (
              <SaveIcon />
            ) : (
              <AddIcon />
            )
          }
          sx={{
            bgcolor: theme.palette.secondary.main,
            "&:hover": { bgcolor: theme.palette.secondary.dark },
          }}
        >
          {loading.submit ? "En cours..." : editingUser ? "Enregistrer" : "Créer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
