// app/page.js
"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Autocomplete,
  useTheme,
} from "@mui/material";
import {
  AddPhotoAlternate,
  Search as SearchIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import UserForm from "./components/UserForm";
import UserGrid from "./components/UserGrid";
import UserDialogs from "./components/UserDialogs";
import UserDetailDialog from "./components/UserDetailDialog";

export default function UserCrud() {
  const theme = useTheme();
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    imgProfile: null,
    specialty: "",
  });
  const [loading, setLoading] = useState({ global: false, delete: false, submit: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
const [detailOpen, setDetailOpen]       = useState(false);
const [selectedDetailUser, setSelectedDetailUser] = useState(null);
  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchRoles();
    fetchSpecialties();
  }, []);

  async function fetchCurrentUser() {
    try {
      const res = await fetch(
        `${API_URL}/api/users/me`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (err) {}
  }

  async function fetchUsers() {
    setLoading((p) => ({ ...p, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/users?populate[role]=*&populate[user_status]=*&populate[imgProfile]=*&populate[specialty]=*`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const data = await res.json();
      setUsers(data.map((u) => ({ id: u.id, ...u })) || []);
    } finally {
      setLoading((p) => ({ ...p, global: false }));
    }
  }
 function handleShowDetail(user) {
   setSelectedDetailUser(user);
   setDetailOpen(true);
 }
 function handleCloseDetail() {
   setDetailOpen(false);
   setSelectedDetailUser(null);
 }
  async function fetchRoles() {
    const res = await fetch(
      `${API_URL}/api/users-permissions/roles`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    const data = await res.json();
    setRoles(data.roles);
  }

  async function fetchSpecialties() {
    const res = await fetch(
      `${API_URL}/api/specialties`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    const data = await res.json();
    setSpecialties(data.data.map((s) => ({ id: s.id, nom: s.nom })));
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
      setFormData({ username: "", email: "", password: "", role: "", imgProfile: null, specialty: "" });
      setSelectedImage(null);
    }
    setOpen(true);
  }

  async function handleImageUpload(file) {
    const form = new FormData();
    form.append("files", file);
    try {
      const res = await fetch(
        `${API_URL}/api/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: form,
        }
      );
      const uploaded = await res.json();
      return uploaded[0].id;
    } catch {
      showSnackbar("Erreur lors du téléchargement de l'image", "error");
      return null;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading((p) => ({ ...p, submit: true }));
    try {
      let imgId = formData.imgProfile;
      if (selectedImage instanceof File) {
        imgId = await handleImageUpload(selectedImage);
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
        ...(imgId && { imgProfile: imgId }),
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
        const err = await res.json();
        throw new Error(err.error.message);
      }
      await fetchUsers();
      setOpen(false);
      showSnackbar("Opération réussie", "success");
    } catch (err) {
      showSnackbar(err.message, "error");
    } finally {
      setLoading((p) => ({ ...p, submit: false }));
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setFormData((p) => ({ ...p, imgProfile: null }));
    }
  }

  function confirmDelete(id) {
    setUserToDelete(id);
    setOpenConfirm(true);
  }

  async function handleDeleteConfirmed() {
    setLoading((p) => ({ ...p, delete: true }));
    try {
      await fetch(
        `${API_URL}/api/users/${userToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      await fetchUsers();
      showSnackbar("Utilisateur supprimé avec succès", "success");
    } catch {
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
      setOpenConfirm(false);
      setUserToDelete(null);
    }
  }

  function showSnackbar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  const filteredUsers = users.filter((user) => {
    if (currentUser && user.id === currentUser.id) return false;
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      !selectedSpecialtyFilter || user.specialty?.id === selectedSpecialtyFilter.id;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
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

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <TextField
          label="Rechercher"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon /> }}
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
              InputProps={{ ...params.InputProps, startAdornment: <SecurityIcon /> }}
            />
          )}
          sx={{ width: "50%" }}
        />
      </Stack>

      <UserGrid
        filteredUsers={filteredUsers}
        loadingGlobal={loading.global}
        API_URL={API_URL}
        currentUser={currentUser}
        theme={theme}
        handleEdit={handleOpen}
        handleDelete={confirmDelete}
        loadingDelete={loading.delete}
        userToDelete={userToDelete}
        handleShowDetail={handleShowDetail}
      />

      <UserForm
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        editingUser={editingUser}
        loading={loading}
        theme={theme}
        formData={formData}
        setFormData={setFormData}
        selectedImage={selectedImage}
        handleImageChange={handleImageChange}
        roles={roles}
        specialties={specialties}
      />

      <UserDialogs
        openConfirm={openConfirm}
        onCloseConfirm={() => setOpenConfirm(false)}
        handleDeleteConfirmed={handleDeleteConfirmed}
        loadingDelete={loading.delete}
        snackbar={snackbar}
        onCloseSnackbar={() => setSnackbar((s) => ({ ...s, open: false }))}
        theme={theme}
      />
      <UserDetailDialog
        open={detailOpen}
        onClose={handleCloseDetail}
        user={selectedDetailUser}
        API_URL={API_URL}
        theme={theme}
      />
    </Box>
  );
}
