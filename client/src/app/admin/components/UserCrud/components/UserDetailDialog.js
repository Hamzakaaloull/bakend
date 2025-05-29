// components/UserDetailDialog.js
"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Avatar,
  Stack,
  Chip,
  Divider
} from "@mui/material";
import { Close as CloseIcon, CheckCircle, Cancel as CancelIcon } from "@mui/icons-material";

export default function UserDetailDialog({ open, onClose, user, API_URL, theme }) {
  if (!user) return null;

  const {
    username,
    email,
    provider,
    confirmed,
    blocked,
    createdAt,
    updatedAt,
    publishedAt,
    isActive,
    imgProfile,
    role,
    user_status
  } = user;

  const imageUrl = imgProfile?.formats?.large?.url
    ? `${API_URL}${imgProfile.formats.large.url}`
    : null;

  // Helper pour formater la date en français
  const fmt = (iso) => new Date(iso).toLocaleString("fr-FR");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Titre principal : une seule balise h2 */}
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Typography>
          Détails de l’utilisateur
        </Typography>
        <CloseIcon
          onClick={onClose}
          sx={{ cursor: "pointer", color: theme.palette.text.secondary }}
        />
      </DialogTitle>

      {/* Contenu */}
      <DialogContent dividers sx={{ py: 3 }}>
        <Stack spacing={3} alignItems="center">
          {imageUrl ? (
            <Avatar
              src={imageUrl}
              sx={{
                width: 120,
                height: 120,
                border: `3px solid ${theme.palette.secondary.main}`,
                boxShadow: theme.shadows[3]
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: theme.palette.secondary.light,
                fontSize: 40
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>
          )}
          {/* Nom d’utilisateur en style titre visuel mais pas <h*> */}
          <Typography variant="h5" component="div">
            {username}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1.5}>
          {/* Tous les textes sont body1/div pour éviter les titres imbriqués */}
          <Typography variant="body1" component="div">
            <strong>Email :</strong> {email}
          </Typography>
          <Typography variant="body1" component="div">
            <strong>Fournisseur :</strong> {provider}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1" component="div"><strong>Confirmé :</strong></Typography>
            <Chip
              icon={confirmed ? <CheckCircle /> : <CancelIcon />}
              label={confirmed ? "Oui" : "Non"}
              color={confirmed ? "success" : "default"}
              size="small"
            />
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1" component="div"><strong>Bloqué :</strong></Typography>
            <Chip
              icon={blocked ? <CancelIcon /> : <CheckCircle />}
              label={blocked ? "Oui" : "Non"}
              color={blocked ? "error" : "success"}
              size="small"
            />
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1" component="div"><strong>En ligne :</strong></Typography>
            <Chip
              label={user_status?.isOnline ? "Oui" : "Non"}
              color={user_status?.isOnline ? "success" : "default"}
              size="small"
            />
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1" component="div"><strong>Actif :</strong></Typography>
            <Chip
              label={isActive ? "Oui" : "Non"}
              color={isActive ? "success" : "default"}
              size="small"
            />
          </Stack>

          <Typography variant="body1" component="div">
            <strong>Rôle :</strong> {role?.name}
          </Typography>
          <Typography variant="body1" component="div">
            <strong>Créé le :</strong> {fmt(createdAt)}
          </Typography>
          <Typography variant="body1" component="div">
            <strong>Dernière modif. :</strong> {fmt(updatedAt)}
          </Typography>
          <Typography variant="body1" component="div">
            <strong>Publié le :</strong> {publishedAt ? fmt(publishedAt) : "—"}
          </Typography>
          <Typography variant="body1" component="div">
            <strong>Dernière connexion :</strong>{" "}
            {user_status?.lastSeen ? fmt(user_status.lastSeen) : "—"}
          </Typography>
        </Stack>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ pb: 2, px: 3 }}>
        <Button onClick={onClose} variant="outlined" startIcon={<CancelIcon />}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
