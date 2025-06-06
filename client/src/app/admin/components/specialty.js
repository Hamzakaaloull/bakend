"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
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
  InputAdornment,
  LinearProgress,
  Chip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  SearchRounded,
  AddRounded,
  EditRounded,
  DeleteRounded,
  MeetingRoomRounded,
} from "@mui/icons-material";
import LoadingIn from "@/app/hooks/LoadingIn";

const MotionTableRow = motion(TableRow);

export default function Specialty() {
  // ——— حالات الـ State ———
  const [salles, setSalles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    nom: "",
    bloc: "", // تمت الإضافة هنا
  });

  // فلترة القاعات وفق البحث
  const filteredSalles = salles.filter((salle) =>
    salle.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  // ——— جلب البيانات ———
  const fetchSalles = async () => {
    try {
      const res = await fetch(`${API_URL}/api/specialties`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("فشل في جلب البيانات");

      const response = await res.json();
      if (response.data && Array.isArray(response.data)) {
        setSalles(
          response.data.map((item, index) => ({
            idIndex: index + 1,
            id: item.documentId,
            nom: item.nom || "بدون اسم",
          }))
        );
      } else {
        setSalles([]);
      }
    } catch (err) {
      console.error("حدث خطأ:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalles();
  }, []);

  // ——— إضافة / تعديل ———
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom.trim()) return;

    setLoading(true);
    const url = editMode
      ? `${API_URL}/api/specialties/${formData.id}`
      : `${API_URL}/api/specialties`;
    const method = editMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          data: {
            nom: formData.nom,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "فشل في العملية");
      }

      await fetchSalles();
      handleClose();
    } catch (err) {
      console.error("حدث خطأ:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ——— حذف ———
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/specialties/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("فشل الحذف");
      setSalles((prev) => prev.filter((salle) => salle.id !== id));
    } catch (err) {
      console.error("حدث خطأ أثناء الحذف:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ——— إغلاق الديالوج ———
  const handleClose = () => {
    setOpenDialog(false);
    setEditMode(false);
    setFormData({ id: null, nom: "", bloc: "" });
  };

  // ——— تصميم الجدول ———
  const renderTable = () => (
    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: "background.paper" }}>
          <TableRow>
            {["ID", "Nom specialty", "Operation"].map((header, idx) => (
              <TableCell key={idx} align={idx === 3 ? "center" : "left"}>
                <Typography variant="subtitle2" color="textSecondary">
                  {header}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <AnimatePresence>
            {filteredSalles.map((salle) => (
              <MotionTableRow
                key={salle.idIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TableCell>
                  <Chip label={`SPEC-${salle.idIndex}`} size="small" />
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <MeetingRoomRounded color="primary" />
                    {salle.nom}
                  </Stack>
                </TableCell>

                <TableCell align="center">
                  <IconButton
                    onClick={() => {
                      setFormData(salle);
                      setEditMode(true);
                      setOpenDialog(true);
                    }}
                    color="primary"
                  >
                    <EditRounded />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedId(salle.id);
                      setDeleteConfirm(true);
                    }}
                    color="error"
                  >
                    <DeleteRounded />
                  </IconButton>
                </TableCell>
              </MotionTableRow>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 4, bgcolor: "background.default", minHeight: "100vh" }}>
      <Paper
        sx={{
          maxWidth: 1200,
          mx: "auto",
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" mb={4}>
            <Typography variant="h4" fontWeight="bold">
              Gestion specialties
              <Chip
                label={`${
                  salles.length > 2
                    ? `${salles.length} specialties`
                    : `${salles.length} specialty`
                }`}
                color="primary"
                variant="outlined"
                sx={{ ml: 2 }}
              />
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setOpenDialog(true)}
              sx={{ borderRadius: 2 }}
              disabled={loading}
            >
              Add Speciality
            </Button>
          </Stack>

          <TextField
            fullWidth
            placeholder="Search for specialty"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded color="disabled" />
                </InputAdornment>
              ),
            }}
          />

          {loading ? (
  // أثناء التحميل نعرض الأنيميشن بدون overlay
  <Box
    sx={{
      width: "100%",
      height: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <LoadingIn overlay={false} size={80} />
  </Box>
) : (
            renderTable()
          )}
        </Box>
      </Paper>


      <Dialog
        open={openDialog}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Grow}
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          {editMode ? " Edit " : " Noveux"}
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          {/* اسم القاعة */}
          <TextField
            autoFocus
            fullWidth
            label="Nom de Salle"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            error={!formData.nom.trim()}
            helperText={!formData.nom.trim() && "Name Require"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MeetingRoomRounded color="disabled" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </DialogContent>

        <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={handleClose} disabled={loading}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.nom.trim() || loading}
          >
            {loading ? "en Cour " : editMode ? " Enregistrer" : "إنشاء"}
          </Button>
        </DialogActions>
      </Dialog>

      
      <Dialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        maxWidth="xs"
      >
        <DialogTitle>Delete</DialogTitle>
        <DialogContent>
          <Typography>Are u sure to delete this specialty؟</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>Reteur</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              await handleDelete(selectedId);
              setDeleteConfirm(false);
            }}
            disabled={loading}
          >
            {loading ? " En cour" : " donne"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
