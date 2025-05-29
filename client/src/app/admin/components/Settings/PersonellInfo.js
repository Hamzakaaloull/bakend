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
  DeleteForever as DeleteIcon,
  CloudUpload as UploadIcon,
  Lock as LockIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Done as DoneIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

// Transition fluide depuis le bas
 const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function PersonellInfo() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const [currentUser, setCurrentUser] = useState(null);
  const [sectionsOpen, setSectionsOpen] = useState({ personal: false });
  const [editingField, setEditingField] = useState(null);
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    photo: null,
  });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState({
    global: false,
    submit: false,
    delete: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Récupère les infos de l'utilisateur
  async function fetchCurrentUser() {
    setLoading((p) => ({ ...p, global: true }));
    try {
      const res = await fetch(`${API_URL}/api/users/me?populate=imgProfile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const me = await res.json();
        setCurrentUser(me);
        setFormValues({
          username: me.username || "",
          email: me.email || "",
          password: "",
          photo: me.imgProfile?.url || null,
        });
      }
    } catch {
      showSnackbar("Erreur lors du chargement", "error");
    } finally {
      setLoading((p) => ({ ...p, global: false }));
    }
  }

  function toggleSection(name) {
    setSectionsOpen((p) => ({ ...p, [name]: !p[name] }));
    setEditingField(null);
  }

  function openEditor(field) {
    setEditingField(field);
  }

  function closeEditor() {
    setEditingField(null);
    setConfirmPassword("");
  }

  function showSnackbar(msg, sev = "success") {
    setSnackbar({ open: true, message: msg, severity: sev });
  }

  async function handleImageUpload(file) {
    const data = new FormData();
    data.append("files", file);
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: data,
      });
      const uploaded = await res.json();
      return uploaded[0].id;
    } catch {
      showSnackbar("Échec de l’upload", "error");
      return null;
    }
  }

  function handleFieldChange(field, value) {
    setFormValues((p) => ({ ...p, [field]: value }));
  }

  function requestConfirm(action) {
    setConfirmDialog({ open: true, action });
  }

  async function confirmAction() {
    setLoading((p) => ({ ...p, submit: true }));
    try {
      const action = confirmDialog.action;
      let body = {};
      if (action.startsWith("edit-")) {
        const field = action.split("-")[1];
        if (field === "photo" && formValues.photo instanceof File) {
          const id = await handleImageUpload(formValues.photo);
          body.imgProfile = id;
        } else if (field === "password") {
          body.password = formValues.password;
        } else {
          body[field] = formValues[field];
        }
        body.currentPassword = confirmPassword;
        const res = await fetch(`${API_URL}/api/users/${currentUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Échec de la mise à jour");
        await fetchCurrentUser();
        showSnackbar("Mis à jour avec succès");
      } else if (action === "delete-account") {
        const res = await fetch(`${API_URL}/api/users/${currentUser.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify({ password: confirmPassword }),
        });
        if (!res.ok) throw new Error("Échec de la suppression");
        showSnackbar("Compte supprimé", "success");
        localStorage.removeItem("token");
        router.push("/login");
      }
    } catch (err) {
      showSnackbar(err.message, "error");
    } finally {
      setLoading((p) => ({ ...p, submit: false, delete: false }));
      setConfirmDialog({ open: false, action: null });
      closeEditor();
    }
  }

  if (loading.global || !currentUser) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        fontFamily: "San Francisco, Arial",
        color: "#1C1C1E",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: "#007AFF",
          textAlign: "center",
        }}
      >
        Paramètres
      </Typography>

      <Paper
        elevation={3}
        sx={{
          borderRadius: 4,
          p: 3,
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255,255,255,0.8)",
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              onClick={() => toggleSection("personal")}
              sx={{ cursor: "pointer" }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Informations personnelles
              </Typography>
              <IconButton>
                <EditIcon />
              </IconButton>
            </Stack>

            <Collapse in={sectionsOpen.personal} timeout="auto" unmountOnExit>
              <Stack spacing={3} sx={{ mt: 2 }}>
                {/* Photo de profil */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    src={
                      formValues.photo instanceof File
                        ? URL.createObjectURL(formValues.photo)
                        : formValues.photo
                        ? `${API_URL}${formValues.photo}`
                        : undefined
                    }
                    sx={{
                      width: 90,
                      height: 90,
                      border: "2px solid #E0E0E0",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                  />

                  {editingField === "photo" && (
                    <Button
                      size="small"
                      component="label"
                      startIcon={<UploadIcon />}
                      sx={{ textTransform: "none", borderRadius: 3 }}
                    >
                      Choisir une photo
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleFieldChange("photo", e.target.files[0])}
                      />
                    </Button>
                  )}

                  <IconButton
                    onClick={() =>
                      editingField === "photo" ? closeEditor() : openEditor("photo")
                    }
                  >
                    {editingField === "photo" ? <CancelIcon /> : <EditIcon />}
                  </IconButton>
                </Stack>

                {/* Confirmation pour la photo */}
                {editingField === "photo" && (
                  <Button
                    variant="contained"
                    onClick={() => requestConfirm("edit-photo")}
                    disabled={loading.submit}
                    sx={{
                      borderRadius: 3,
                      alignSelf: "flex-start",
                      textTransform: "none",
                      mt: 1,
                    }}
                  >
                    Confirmer la photo
                  </Button>
                )}

                {/* Lignes des champs */}
                <FieldRow
                  icon={<PersonIcon />}
                  fieldKey="username"
                  label={`Nom d'utilisateur: ${currentUser.username}`}
                  editing={editingField === "username"}
                  value={formValues.username}
                  onChange={(v) => handleFieldChange("username", v)}
                  onEdit={() => openEditor("username")}
                  onCancel={closeEditor}
                  onConfirm={() => requestConfirm("edit-username")}
                  loading={loading.submit}
                />

                <FieldRow
                  icon={<EmailIcon />}
                  fieldKey="email"
                  label={`Email: ${currentUser.email}`}
                  editing={editingField === "email"}
                  value={formValues.email}
                  onChange={(v) => handleFieldChange("email", v)}
                  onEdit={() => openEditor("email")}
                  onCancel={closeEditor}
                  onConfirm={() => requestConfirm("edit-email")}
                  loading={loading.submit}
                />

                <FieldRow
                  icon={<LockIcon />}
                  fieldKey="password"
                  label="Mot de passe: ••••••••"
                  editing={editingField === "password"}
                  type="password"
                  value={formValues.password}
                  onChange={(v) => handleFieldChange("password", v)}
                  onEdit={() => openEditor("password")}
                  onCancel={closeEditor}
                  onConfirm={() => requestConfirm("edit-password")}
                  loading={loading.submit}
                />

                {/* Suppression de compte */}
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => requestConfirm("delete-account")} 
                    disabled={loading.delete}
                    sx={{ borderRadius: 3, textTransform: "none" }}
                  >
                    Supprimer le compte
                  </Button>
                </Box>
              </Stack>
            </Collapse>
          </Box>
        </Stack>
      </Paper>

      {/* Boîte de confirmation */}
      <Dialog
        open={confirmDialog.open}
        TransitionComponent={Transition}
        keepMounted
        onClose={closeEditor}
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 500 }}>Confirmer l’action</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Veuillez entrer votre mot de passe actuel pour confirmer.
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
            onClick={confirmAction}
            disabled={loading.submit}
            sx={{ textTransform: "none", borderRadius: 3 }}
          >
            {loading.submit ? <CircularProgress size={20} /> : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Composant pour chaque ligne de champ
function FieldRow({
  icon,
  label,
  editing,
  value,
  type = "text",
  onChange,
  onEdit,
  onCancel,
  onConfirm,
  loading,
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {icon}
      {editing ? (
        <>
          <TextField
            size="small"
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onConfirm();
            }}
            sx={{ minWidth: 250, borderRadius: 3 }}
          />
          <IconButton onClick={onConfirm} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : <DoneIcon />}
          </IconButton>
          <IconButton onClick={onCancel}>
            <CancelIcon />
          </IconButton>
        </>
      ) : (
        <>
          <Typography sx={{ flex: 1, fontWeight: 400 }}>{label}</Typography>
          <IconButton onClick={onEdit}>
            <EditIcon />
          </IconButton>
        </>
      )}
    </Stack>
  );
}
