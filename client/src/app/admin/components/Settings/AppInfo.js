"use client";
import React, { useState, useEffect, forwardRef } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Avatar,
  TextField,
  Button,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  CloudUpload as UploadIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
} from "@mui/icons-material";

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

export default function AppInfo() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const [info, setInfo] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [form, setForm] = useState({ name: "", logo: null });
  const [loading, setLoading] = useState({ global: false, submit: false });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, field: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sectionsOpen, setSectionsOpen] = useState({ appInfo: false });

  useEffect(() => {
    fetchInfo();
  }, []);

  async function fetchInfo() {
    setLoading(p => ({ ...p, global: true }));
    try {
      const res = await fetch(`${API_URL}/api/info-apps?populate=logo`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const json = await res.json();
      console.log("this is app info",json)
      const item = json.data?.[0];
      if (!item) {
        setInfo(null);
      } else {
        setInfo(item);
        setForm({
          name: item.name || "",
          logo: item.logo?.[0]?.url || null,
        });
      }
    } catch (err) {
      showSnackbar("Échec du chargement des données", "error");
    } finally {
      setLoading(p => ({ ...p, global: false }));
    }
  }

  function showSnackbar(msg, sev = "success") {
    setSnackbar({ open: true, message: msg, severity: sev });
  }

  function toggleSection(name) {
    setSectionsOpen(p => ({ ...p, [name]: !p[name] }));
    setEditingField(null);
  }

  function openEditor(field) {
    setEditingField(field);
  }

  function closeEditor() {
    setEditingField(null);
    setConfirmPassword("");
  }

  function handleChange(field, value) {
    setForm(p => ({ ...p, [field]: value }));
  }

  async function handleImageUpload(file) {
    const data = new FormData();
    data.append("files", file);
    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: data,
    });
    const uploaded = await res.json();
    return uploaded[0].id;
  }

  function requestConfirm(field) {
    setConfirmDialog({ open: true, field });
  }

  async function applyEdit() {
    const field = confirmDialog.field;
    setLoading(p => ({ ...p, submit: true }));
    try {
      let payload = {};
      if (field === "logo" && form.logo instanceof File) {
        const id = await handleImageUpload(form.logo);
        payload.logo = [id];
      } else {
        payload[field] = form[field];
      }

      const res = await fetch(`${API_URL}/api/info-apps/${info.documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          data: payload,
          currentPassword: confirmPassword 
        }),
      });
      if (!res.ok) throw new Error();
      await fetchInfo();
      showSnackbar("Mise à jour réussie");
    } catch {
      showSnackbar("Échec de la mise à jour", "error");
    } finally {
      setLoading(p => ({ global: p.global, submit: false }));
      setConfirmDialog({ open: false, field: null });
      closeEditor();
    }
  }

  if (loading.global) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!info) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="textSecondary">Aucune donnée disponible</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 600,
      mx: "auto",
      my : 2 ,
      fontFamily: "San Francisco, Arial",
      color: "#1C1C1E",
    }}>
      

      <Paper elevation={3} sx={{
        borderRadius: 4,
        p: 3,
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255,255,255,0.8)",
      }}>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center"
              onClick={() => toggleSection("appInfo")} sx={{ cursor: "pointer" }}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Informations de l'application
              </Typography>
              <IconButton>
                <EditIcon />
              </IconButton>
            </Stack>

            <Collapse in={sectionsOpen.appInfo} timeout="auto" unmountOnExit>
              <Stack spacing={3} sx={{ mt: 2 }}>
                {/* Logo */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    src={
                      form.logo instanceof File
                        ? URL.createObjectURL(form.logo)
                        : form.logo
                        ? `${API_URL}${form.logo}`
                        : undefined
                    }
                    sx={{ 
                      width: 90,
                      height: 90,
                      border: "2px solid #E0E0E0",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                    }}
                  />
                  {editingField === "logo" ? (
                    <>
                      <Button
                        component="label"
                        startIcon={<UploadIcon />}
                        sx={{ textTransform: "none", borderRadius: 3 }}
                      >
                        Choisir un logo
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={e => handleChange("logo", e.target.files[0])}
                        />
                      </Button>
                      <IconButton onClick={closeEditor}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton onClick={() => openEditor("logo")}>
                      <EditIcon />
                    </IconButton>
                  )}
                </Stack>

                {/* Nom de l'application */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <LockIcon />
                  {editingField === "name" ? (
                    <TextField
                      size="small"
                      value={form.name}
                      onChange={e => handleChange("name", e.target.value)}
                      sx={{ minWidth: 250, borderRadius: 3 }}
                    />
                  ) : (
                    <Typography sx={{ flex: 1, fontWeight: 400 }}>
                      Nom de l'application: {info.name}
                    </Typography>
                  )}
                  {editingField === "name" ? (
                    <IconButton onClick={closeEditor}>
                      <CancelIcon />
                    </IconButton>
                  ) : (
                    <IconButton onClick={() => openEditor("name")}>
                      <EditIcon />
                    </IconButton>
                  )}
                </Stack>

                {/* Bouton de confirmation */}
                {editingField && (
                  <Button
                    variant="contained"
                    onClick={() => requestConfirm(editingField)}
                    disabled={loading.submit}
                    sx={{
                      borderRadius: 3,
                      alignSelf: "flex-start",
                      textTransform: "none",
                      mt: 1,
                    }}
                  >
                    Confirmer les modifications
                  </Button>
                )}
              </Stack>
            </Collapse>
          </Box>
        </Stack>
      </Paper>

      {/* Dialogue de confirmation */}
      <Dialog
        open={confirmDialog.open}
        TransitionComponent={Transition}
        keepMounted
        onClose={closeEditor}
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 500 }}>Confirmer la modification</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Veuillez entrer votre mot de passe actuel pour confirmer
          </Typography>
          <TextField
            margin="dense"
            label="Mot de passe actuel"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            onClick={closeEditor}
            startIcon={<CancelIcon />}
            sx={{ textTransform: "none" }}
          >
            Annuler
          </Button>
          <Button
            onClick={applyEdit}
            disabled={loading.submit}
            sx={{ textTransform: "none", borderRadius: 3 }}
          >
            {loading.submit ? <CircularProgress size={20} /> : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}