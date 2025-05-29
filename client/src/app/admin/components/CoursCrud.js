"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grow,
  Chip,
  CircularProgress,
  Link as MuiLink,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import LoadingIn from "@/app/hooks/LoadingIn";

const MotionTableRow = motion(TableRow);
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export default function CoursCrud() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: null, documentId: "", title: "" });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCours();
  }, []);

  async function fetchCours() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/courss?populate=*`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Échec de récupération des cours");
      const { data } = await res.json();
      setCours(
        data.map((item, index) => ({
          indexId: index + 1,
          id: item.id,
          documentId: item.documentId,
          title: item.title,
          cour_contant: Array.isArray(item.cour_contant) ? item.cour_contant : [],
        }))
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredCours = useMemo(
    () =>
      cours.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [cours, searchQuery]
  );

  function resetForm() {
    setFormData({ id: null, documentId: "", title: "" });
    setSelectedFiles([]);
    setExistingFiles([]);
    setEditMode(false);
    setOpenDialog(false);
    setError(null);
  }

  function handleFileChange(e) {
    setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  }

  function removeFile(index) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadFiles(files) {
    const data = new FormData();
    files.forEach((file) => data.append("files", file));

    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: data,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "Échec de l'upload des fichiers");
    }

    const uploadedFiles = await res.json();
    // Strapi upload plugin returns objects with `id`
    return uploadedFiles.map((f) => f.id);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // جمع معرّفات الملفات الحالية والجديدة
      let fileIds = existingFiles.map((file) => file.id);

      if (selectedFiles.length > 0) {
        const newIds = await uploadFiles(selectedFiles);
        fileIds = [...fileIds, ...newIds];
      }

      const url = editMode
        ? `${API_URL}/api/courss/${formData.documentId}`
        : `${API_URL}/api/courss`;
      const method = editMode ? "PUT" : "POST";

      const bodyData = {
        title: formData.title,
        cour_contant: fileIds,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ data: bodyData }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Erreur lors de l'enregistrement");
      }

      await fetchCours();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

 
async function handleDelete(strapiId) {
  if (!window.confirm("Voulez-vous vraiment supprimer ce cours ?")) return;
  setLoading(true);
  setError(null);

  try {
    const res = await fetch(`${API_URL}/api/courss/${strapiId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!res.ok) {
      // نقرأ رسالة الخطأ من body إن وجدت
      const errData = await res.json();
      throw new Error(errData.error?.message || "Échec de suppression du cours");
    }
    // إزالة العنصر محلياً من الواجهة
    setCours((prev) => prev.filter((c) => c.id !== strapiId));
  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
}


  return (
    <Box sx={{ p: 4, bgcolor: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", minHeight: "100vh" }}>
      <Paper elevation={3} sx={{ borderRadius: 4, maxWidth: 1200, mx: "auto", overflow: "hidden", mb: 6 }}>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">Gestion des cours</Typography>
            <Button variant="contained" onClick={() => { resetForm(); setOpenDialog(true); }} disabled={loading} sx={{ borderRadius: 2, textTransform: "none" }}>
              + Ajouter un cours
            </Button>
          </Stack>

          {error && (
            <Box sx={{ bgcolor: "error.light", color: "error.contrastText", p: 2, borderRadius: 2, mb: 3 }}>
              {error}
            </Box>
          )}

          <TextField
            fullWidth placeholder="Rechercher un cours..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>), sx: { borderRadius: 3, bgcolor: "#f5f5f5" } }}
            sx={{ mb: 3 }}
          />

          {loading ? (
            <Box sx={{ width: "100%", height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LoadingIn overlay={false} size={80} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell><strong>ID Doc</strong></TableCell>
                    <TableCell><strong>Titre</strong></TableCell>
                    <TableCell><strong>Fichiers</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredCours.map((c) => (
                      <MotionTableRow key={c.indexId} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3 }} sx={{ "&:hover": { bgcolor: "#fafafa" } }}>
                        <TableCell><Chip label={`COUR-${c.indexId}`} size="small"/></TableCell>
                        <TableCell>{c.title}</TableCell>
                        <TableCell>
                          {c.cour_contant.length > 0 ? (
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              {c.cour_contant.map((file, idx) => (
                                <MuiLink key={idx} href={`${API_URL}${file.url}`} target="_blank" rel="noopener noreferrer" sx={{ textDecoration: "none", bgcolor: "#E3F2FD", px: 2, py: 0.5, borderRadius: 2, display: "inline-block", transform: "translateY(0)", transition: "transform 0.2s ease", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" } }}>
                                  📎 {file.name}
                                </MuiLink>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">Aucun fichier.</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => {
                            setFormData({ id: c.id, documentId: c.documentId, title: c.title });
                            setExistingFiles(c.cour_contant);
                            setSelectedFiles([]);
                            setEditMode(true);
                            setOpenDialog(true);
                          }}><EditIcon/></IconButton>
                          <IconButton onClick={() => handleDelete(c.id)}><DeleteIcon color="error"/></IconButton>
                        </TableCell>
                      </MotionTableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm" TransitionComponent={Grow}>
        <DialogTitle>{editMode ? "Modifier le cours" : "Nouveau cours"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Titre" fullWidth value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} error={!!error} />
            <Box>
              <input id="file-upload" type="file" multiple style={{ display: "none" }} onChange={handleFileChange} />
              <label htmlFor="file-upload">
                <Button variant="outlined" component="span" startIcon={<InsertDriveFileIcon/>}>Ajouter des fichiers</Button>
              </label>
              {(selectedFiles.length > 0 || existingFiles.length > 0) && (
                <List dense sx={{ mt: 2 }}>
                  {existingFiles.map((file, index) => (
                    <ListItem key={`existing-${index}`}>
                      <ListItemIcon><InsertDriveFileIcon/></ListItemIcon>
                      <ListItemText primary={file.name} secondary="Fichier existant" />
                    </ListItem>
                  ))}
                  {selectedFiles.map((file, index) => (
                    <ListItem key={`selected-${index}`} secondaryAction={<IconButton edge="end" onClick={() => removeFile(index)}><CloseIcon/></IconButton>}>
                      <ListItemIcon><InsertDriveFileIcon/></ListItemIcon>
                      <ListItemText primary={file.name} secondary="Nouveau fichier" />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.title.trim() || loading} sx={{ borderRadius: 2, textTransform: "none" }}>
            {loading ? <CircularProgress size={24}/> : editMode ? "Enregistrer" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
