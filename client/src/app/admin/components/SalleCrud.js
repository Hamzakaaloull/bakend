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

export default function SalleCrud() {
  // ——— حالات الـ State ———
  const [salles, setSalles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const [formData, setFormData] = useState({
    id: null,
    nom: "",
    bloc: "", // تمت الإضافة هنا
  });

  // فلترة القاعات وفق البحث
  const filteredSalles = salles.filter((salle) =>
    salle.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ——— جلب البيانات ———
  const fetchSalles = async () => {
    try {
      const res = await fetch(`${API_URL}/api/salles`, {
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
            bloc: item.bloc || "", // تضمين bloc
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
      ? `${API_URL}/api/salles/${formData.id}`
      : `${API_URL}/api/salles`;
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
            bloc: formData.bloc, // إرسال bloc
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
      const res = await fetch(`http://localhost:1337/api/salles/${id}`, {
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
            {["ID", "Nom de salle", "Bloc", "Action"].map((header, idx) => (
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
                  <Chip label={`SAL-${salle.idIndex}`} size="small" />
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <MeetingRoomRounded color="primary" />
                    {salle.nom}
                  </Stack>
                </TableCell>
                <TableCell>
                  {salle.bloc || "-"} {/* عرض bloc */}
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
              Gestion Des salles
              <Chip
                label={`${salles.length} قاعة`}
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
         Add
            </Button>
          </Stack>

          <TextField
            fullWidth
            placeholder="Recherche"
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
            <LoadingIn overlay={false}  />
          ) : (
            renderTable()
          )}
        </Box>
      </Paper>

      {/* ——— ديالوج الإضافة/التعديل ——— */}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Grow}
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          {editMode ? " Edit" : " nevaux salle"}
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          {/* اسم القاعة */}
          <TextField
            autoFocus
            fullWidth
            label=" nom de salle"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            error={!formData.nom.trim()}
            helperText={!formData.nom.trim() && "!important"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MeetingRoomRounded color="disabled" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* حقل bloc */}
          <TextField
            fullWidth
            label="Bloc"
            value={formData.bloc}
            onChange={(e) => setFormData({ ...formData, bloc: e.target.value })}
            helperText="يمكن تركه فارغًا"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography variant="body2" color="textSecondary">
                    📦
                  </Typography>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>

        <DialogActions sx={{ borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={handleClose} disabled={loading}>
          Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.nom.trim() || loading}
          >
            {loading ? "جاري الحفظ..." : editMode ? "حفظ التغييرات" : "إنشاء"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ——— تأكيد الحذف ——— */}
      <Dialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        maxWidth="xs"
      >
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>هل أنت متأكد من رغبتك في حذف هذه القاعة؟</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>تراجع</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              await handleDelete(selectedId);
              setDeleteConfirm(false);
            }}
            disabled={loading}
          >
            {loading ? "جاري الحذف..." : "تأكيد الحذف"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
