// BrigadeCrud.js
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
  Skeleton,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion, AnimatePresence } from "framer-motion";
import LoadingIn from "@/app/hooks/LoadingIn";

const MotionTableRow = motion(TableRow);

export default function BrigadeCrud() {
  // حالات الـ state
  const [brigades, setBrigades] = useState([]); // قائمة الأفواج
  const [isLoading, setIsLoading] = useState(true); // حالة التحميل
  const [searchQuery, setSearchQuery] = useState(""); // نص البحث
  const [open, setOpen] = useState(false); // فتح/إغلاق حوار الإضافة/التعديل
  const [editMode, setEditMode] = useState(false); // وضع التعديل
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const [formData, setFormData] = useState({
    // بيانات النموذج
    id: null,
    apiId: null,
    nom: "",
    stage: "",
    effectif_theorique: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // فتح/إغلاق حوار التحقق من الحذف
  const [toDelete, setToDelete] = useState(null); // الفوج المراد حذفه

  // 1) جلب البيانات من Strapi وتعيين id محلي (index+1)
  useEffect(() => {
    fetchBrigades();
    fetchseace();
  }, []);
  async function fetchseace() {
    const res = await fetch(`${API_URL}/api/seances?populate=*`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    console.log("this is seances ", data);
    // Example in Next.js

const req = await fetch("http://localhost:1337/api/historiques?populate[seances][populate][]=user&populate[seances][populate][]=salle&populate[seances][populate][]=cour&populate[seances][populate][]=brigade")
  .then(res => res.json())
  .then(json => console.log(json));
  }
  async function fetchBrigades() {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/brigades?populate=*`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Fetch brigades failed");
      const { data } = await res.json();
      console.log("this is brigades", data);
      setBrigades(
        data.map((item, index) => ({
          apiId: item.documentId,
          id: index + 1,
          nom: item.nom,
          stage: item.stage,
          effectif_theorique: item.effectif_theorique,
        }))
      );
    } catch (err) {
      console.error("Error fetching brigades:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // 2) إرسال النموذج (إضافة أو تعديل)
  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      data: {
        nom: formData.nom,
        stage: formData.stage,
        effectif_theorique: Number(formData.effectif_theorique),
      },
    };
    const token = localStorage.getItem("token");
    const url = editMode
      ? `${API_URL}/api/brigades/${formData.apiId}`
      : `${API_URL}/api/brigades`;
    const method = editMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error saving brigade");

      await fetchBrigades();
      setOpen(false);
      setEditMode(false);
      setFormData({
        id: null,
        apiId: null,
        nom: "",
        stage: "",
        effectif_theorique: "",
      });
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  }

  // 3) تأكيد الحذف وتنفيذه
  async function confirmDelete() {
    setDeleteConfirmOpen(false);
    // حذف فوري من الواجهة
    setBrigades((prev) =>
      prev.filter((b) => b.documentId !== toDelete.documentId)
    );

    try {
      const res = await fetch(`${API_URL}/api/brigades/${toDelete.apiId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Error deleting brigade");
      await fetchBrigades();
    } catch (err) {
      console.error("Error deleting brigade:", err);
      await fetchBrigades();
    }
  }

  // 4) التصفية حسب البحث
  const filteredBrigades = useMemo(
    () =>
      brigades.filter((b) =>
        b.nom.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [brigades, searchQuery]
  );

  // 5) العرض (JSX)
  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px)",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          mb: 4,
          overflow: "hidden",
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* رأس الصفحة + زر إضافة */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Gestion des Brigades
            </Typography>
            <Button
              variant="contained"
              sx={{ borderRadius: "20px", textTransform: "none" }}
              onClick={() => {
                setFormData({
                  id: null,
                  apiId: null,
                  nom: "",
                  stage: "",
                  effectif_theorique: "",
                });
                setEditMode(false);
                setOpen(true);
              }}
            >
              + Ajouter
            </Button>
          </Stack>

          {/* حقل البحث */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher une brigade…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { borderRadius: "20px", bgcolor: "#F2F2F7" },
            }}
            sx={{ mb: 3 }}
          />

        <TableContainer>
  <Table>
   <TableHead>
  <TableRow>
    <TableCell>ID</TableCell>
    <TableCell>Nom</TableCell>
    <TableCell>Stage</TableCell>
    <TableCell>Effectif</TableCell>
    <TableCell align="center">Actions</TableCell>
  </TableRow>
</TableHead>

    <TableBody>
      <AnimatePresence>
        {isLoading ? (
          <MotionTableRow
            key="loading-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
              {/* هنا يظهر التحميل */}
              <LoadingIn overlay={false} size={60} />
            </TableCell>
          </MotionTableRow>
        ) : (
          filteredBrigades.map((b) => (
            <MotionTableRow
              key={b.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              sx={{ "&:hover": { bgcolor: "#f9f9f9" } }}
            >
              <TableCell>
                <Chip label={`BRIG-${b.id}`} size="small" />
              </TableCell>
              <TableCell>{b.nom}</TableCell>
              <TableCell>{b.stage}</TableCell>
              <TableCell>{b.effectif_theorique}</TableCell>
              <TableCell align="center">
                <IconButton
                  onClick={() => {
                    setFormData({ ...b });
                    setEditMode(true);
                    setOpen(true);
                  }}
                  sx={{ mx: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setToDelete(b);
                    setDeleteConfirmOpen(true);
                  }}
                  sx={{ mx: 1 }}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              </TableCell>
            </MotionTableRow>
          ))
        )}
      </AnimatePresence>
    </TableBody>
  </Table>
</TableContainer>

        </Box>
      </Paper>

      {/* حوار الإضافة / التعديل */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Grow}
      >
        <DialogTitle>
          {editMode ? "Modifier Brigade" : "Nouvelle Brigade"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Nom"
              fullWidth
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
            />
            <TextField
              label="Stage"
              fullWidth
              value={formData.stage}
              onChange={(e) =>
                setFormData({ ...formData, stage: e.target.value })
              }
            />
            <TextField
              label="Effectif Théorique"
              type="number"
              fullWidth
              value={formData.effectif_theorique}
              onChange={(e) =>
                setFormData({ ...formData, effectif_theorique: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>إلغاء</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ borderRadius: "20px", textTransform: "none" }}
          >
            {editMode ? "Enregistrer" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار تأكيد الحذف */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          هل أنت متأكد من حذف الفوج "{toDelete?.nom}"؟
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>إلغاء</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
