"use client";
import React, { useState, useEffect, forwardRef } from "react";
import {
  Box,
  Paper,
  Stack,
  Skeleton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  IconButton,
  Slide,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Typography,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  useTheme,
  TextField,
  DialogContentText,
  Autocomplete,
} from "@mui/material";
import {
  Edit,
  Delete,
  AddPhotoAlternate,
  CloudUpload,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Add as AddIcon,
  DeleteForever as DeleteForeverIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Circle as CircleIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import LoadingIn from "../../hooks/LoadingIn";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function UserCrud() {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    imgProfile: null,
    specialty: "",
  });
  const [loading, setLoading] = useState({
    global: true,
    delete: false,
    submit: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState(null);
const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchRoles();
    fetchSpecialties();
  }, []);
async function fetchCurrentUser() {
    const res = await fetch(`${API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (res.ok) {
    const me = await res.json();
    setCurrentUser(me);
  }
}

  async function fetchUsers() {
    setLoading((prev) => ({ ...prev, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/users?populate[role]=*&populate[user_status]=*&populate[imgProfile]=*&populate[specialty]=*`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      console.log(data);
      setUsers(data.map((u) => ({ id: u.id, ...u })) || []);
    } finally {
      setLoading((prev) => ({ ...prev, global: false }));
    }
  }

  async function fetchRoles() {
    const res = await fetch(`${API_URL}/api/users-permissions/roles`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setRoles(data.roles);
  }

  async function fetchSpecialties() {
    const res = await fetch(`${API_URL}/api/specialties`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    console.log("specility" , data)
    setSpecialties(data.data.map((item) => ({ id: item.id, nom: item.nom })));
  }

  function handleOpen(user = null) {
    if (user) {
      setEditingUser(user.id);
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        role: user.role?.id || "",
        imgProfile: user.imgProfile?.id || null,
        specialty: user.specialty?.id || "",
      });
      setSelectedImage(user.imgProfile?.formats?.thumbnail?.url || null);
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "",
        imgProfile: null,
        specialty: "",
      });
      setSelectedImage(null);
    }
    setOpen(true);
  }

  async function handleImageUpload(file) {
    const form = new FormData();
    form.append("files", file);
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: form,
      });
      const data = await res.json();
      return data[0].id;
    } catch (error) {
      showSnackbar("Erreur lors du téléchargement de l'image", "error");
      return null;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      let imgProfileId = formData.imgProfile;
      if (selectedImage instanceof File) {
        imgProfileId = await handleImageUpload(selectedImage);
      }
      const url = editingUser
        ? `${API_URL}/api/users/${editingUser}`
        : `${API_URL}/api/users`;
      const method = editingUser ? "PUT" : "POST";
      const body = {
        username: formData.username,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
        role: formData.role,
        ...(imgProfileId && { imgProfile: imgProfileId }),
        specialty: formData.specialty,
      };
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error.message);
      }
      await fetchUsers();
      setOpen(false);
      showSnackbar("Opération réussie", "success");
    } catch (err) {
      showSnackbar(err.message, "error");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setFormData((prev) => ({ ...prev, imgProfile: null }));
    }
  }

  function confirmDelete(userId) {
    setUserToDelete(userId);
    setOpenConfirm(true);
  }

  async function handleDeleteConfirmed() {
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      await fetch(`${API_URL}/api/users/${userToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchUsers();
      showSnackbar("Utilisateur supprimé avec succès", "success");
    } catch (err) {
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
      setOpenConfirm(false);
      setUserToDelete(null);
    }
  }

  function showSnackbar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

const filteredUsers = users
  .filter(user => {
    // استثناء الحساب الحالي
    if (currentUser && user.id === currentUser.id) return false;

    // بقية شروط البحث/التصفية
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      !selectedSpecialtyFilter ||
      user.specialty?.id === selectedSpecialtyFilter.id;
    return matchesSearch && matchesSpecialty;
  });


  return (
    <Box sx={{ p: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" component="h1" color="primary">
          Gestion des Utilisateurs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternate />}
          onClick={() => handleOpen()}
          sx={{ bgcolor: theme.palette.secondary.main }}
        >
          Ajouter un Utilisateur
        </Button>
      </Stack>

      {/* Search and filter */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <TextField
          label="Rechercher"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon />,
          }}
          sx={{ width: "50%" }}
        />

        <Autocomplete
          options={specialties}
          getOptionLabel={(option) => option.nom}
          value={selectedSpecialtyFilter}
          onChange={(e, newValue) => setSelectedSpecialtyFilter(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Filtrer par spécialité"
              placeholder="Sélectionner"
              InputProps={{
                ...params.InputProps,
                startAdornment: <SecurityIcon />,
              }}
            />
          )}
          sx={{ width: "50%" }}
        />
      </Stack>

     {loading.global ? (
  <Box
    sx={{
      width: "100%",
      height: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {/* عرض الأنيميشن بدون overlay */}
    <LoadingIn overlay={false} size={40} />
  </Box>
) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 4,
          }}
        >
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              sx={{
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: theme.shadows[6],
                },
                position: "relative",
              }}
            >
              <CardHeader
                avatar={
                  <Avatar
                    src={
                      user.imgProfile?.formats?.thumbnail?.url
                        ? `${API_URL}${user.imgProfile.formats.thumbnail.url}`
                        : ""
                    }
                    sx={{
                      bgcolor: theme.palette.secondary.light,
                      width: 60,
                      height: 60,
                    }}
                  />
                }
                title={
                  <Typography variant="subtitle1" noWrap>
                    {user.username}
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {user.email}
                  </Typography>
                }
              />
              {/* show role */}
              <CardContent sx={{ pt: 0 }}>
                <Chip
                  label={user.role?.name || "Aucun rôle"}
                  color={
                    user.role?.name === "admin"
                      ? "primary"
                      : user.role?.name === "manger"
                      ? "secondary"
                      : "default"
                  }
                  size="small"
                  icon={<SecurityIcon fontSize="small" />}
                  sx={{ mb: 1 }}
                />
                {/* is en ligne or not */}
                <Typography variant="caption" color="text.secondary">
                  {user.user_status?.isOnline ? (
                    <Chip
                      label="En ligne"
                      color="success"
                      size="small"
                      icon={<CircleIcon sx={{ fontSize: 10 }} />}
                    />
                  ) : (
                    <Chip
                      label="Hors ligne"
                      color="default"
                      size="small"
                      icon={<CircleIcon sx={{ fontSize: 10 }} />}
                    />
                  )}
                </Typography>

                {/* Affichage de la spécialité */}
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    key={user.id}
                    label={user.specialty?.nom || "Aucune spécialité"}
                    size="small"
                    color={
                      user.specialty?.nom === "informatique"
                        ? "success"
                        : "default"
                    }
                  />
                </Stack>
              </CardContent>
              {/* btn edit and delete */}
              <CardActions disableSpacing sx={{ mt: "auto" }}>
                <IconButton
                  aria-label="edit"
                  onClick={() => handleOpen(user)}
                  disabled={loading.delete}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  aria-label="delete"
                  onClick={() => confirmDelete(user.id)}
                  disabled={loading.delete}
                  color="error"
                >
                  {loading.delete && userToDelete === user.id ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Delete />
                  )}
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Dialog Form */}
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            padding: 2,
            maxWidth: 600,
            margin: "auto",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2,
            mb: 3,
          }}
        >
          {editingUser ? (
            <Typography variant="body1" color="primary">
              Modifier l'utilisateur
            </Typography>
          ) : (
            <Typography variant="body1" color="secondary">
              Créer un nouvel utilisateur
            </Typography>
          )}
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
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  sx={{
                    position: "absolute",
                    bottom: -15,
                    right: "50%",
                    transform: "translateX(50%)",
                    bgcolor: "background.paper",
                    border: `2px solid ${theme.palette.secondary.main}`,
                    boxShadow: 3,
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
                  width: 150,
                  height: 150,
                  mx: "auto",
                  border: `3px solid ${theme.palette.secondary.main}`,
                  transition: "all 0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              />
            </Box>
            <TextField
              label="Nom d'utilisateur"
              fullWidth
              value={formData.username}
              onChange={(e) =>
                setFormData((f) => ({ ...f, username: e.target.value }))
              }
              InputProps={{ startAdornment: <PersonIcon /> }}
              required
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) =>
                setFormData((f) => ({ ...f, email: e.target.value }))
              }
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
              onChange={(e) =>
                setFormData((f) => ({ ...f, password: e.target.value }))
              }
              InputProps={{ startAdornment: <LockIcon /> }}
              required={!editingUser}
            />
            <TextField
              select
              label="Rôle"
              fullWidth
              value={formData.role}
              onChange={(e) =>
                setFormData((f) => ({ ...f, role: e.target.value }))
              }
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
              onChange={(e) =>
                setFormData((f) => ({ ...f, specialty: e.target.value }))
              }
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
            onClick={() => setOpen(false)}
            color="secondary"
            variant="outlined"
            startIcon={<CancelIcon />}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
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
            {loading.submit
              ? "En cours..."
              : editingUser
              ? "Enregistrer"
              : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
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
            onClick={() => setOpenConfirm(false)}
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
            disabled={loading.delete}
            startIcon={
              loading.delete ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DeleteForeverIcon />
              )
            }
          >
            {loading.delete ? "Suppression..." : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
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
    </Box>
  );
}
