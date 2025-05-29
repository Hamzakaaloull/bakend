// components/UserDialogs.js
"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Cancel as CancelIcon,
  DeleteForever as DeleteForeverIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

export default function UserDialogs({
  openConfirm,
  onCloseConfirm,
  handleDeleteConfirmed,
  loadingDelete,
  snackbar,
  onCloseSnackbar,
  theme,
}) {
  return (
    <>
      <Dialog
        open={openConfirm}
        onClose={onCloseConfirm}
        PaperProps={{ sx: { borderRadius: 4, maxWidth: 400 } }}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.error.light }}>
          <Typography variant="body1" color="error">
            Confirmation de suppression
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 2 }}>
            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action
            est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={onCloseConfirm}
            color="primary"
            variant="outlined"
            startIcon={<CancelIcon />}
          >
            Annuler
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteConfirmed}
            disabled={loadingDelete}
            startIcon={
              loadingDelete ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DeleteForeverIcon />
              )
            }
          >
            {loadingDelete ? "Suppression..." : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={onCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{
            bgcolor:
              snackbar.severity === "success"
                ? theme.palette.success.dark
                : theme.palette.error.dark,
          }}
          icon={
            snackbar.severity === "success" ? (
              <CheckCircleIcon fontSize="inherit" />
            ) : (
              <ErrorIcon fontSize="inherit" />
            )
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
