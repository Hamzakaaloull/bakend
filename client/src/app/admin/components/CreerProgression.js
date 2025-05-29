"use client";
import React, { useState, useEffect, useMemo } from "react";
import useUser from "../../hooks/useUser";
import {
  Box,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  TextField,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const MotionTableRow = motion(TableRow);

function SlotHeader({ slot }) {
  return (
    <TableCell align="center">
      {slot.start}–{slot.end}
    </TableCell>
  );
}

function BrigadeRow({
  brigade,
  stageRowSpan,
  customSlots,
  viewMode,
  selection,
  handleChange,
  rowErrors,
  seances,
  editedSeances,
  handleEditChange,
  courseList,
  salleList,
  userList,
}) {
  return (
    <MotionTableRow
      key={brigade.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {stageRowSpan > 0 && (
        <TableCell rowSpan={stageRowSpan} align="center">
          {brigade.stage}
        </TableCell>
      )}
      <TableCell>{brigade.nom}</TableCell>
      {customSlots.map((slot, idx) => {
        const cellShow = seances.find(
          (s) =>
            s.brigadeId === brigade.id && s.start_time === slot.start
        );
        const editIdx = editedSeances.findIndex(
          (s) => s.brigadeId === brigade.id && s.start_time === slot.start
        );
        return (
          <TableCell key={idx}>
            {viewMode === "create" && (
              <Stack spacing={1}>
                <FormControl
                  size="small"
                  fullWidth
                  error={!!rowErrors[`${brigade.id}-${idx}-course`]}
                >
                  <InputLabel>Matiere</InputLabel>
                  <Select
                    label="Matiere"
                    value={selection[brigade.id]?.[idx]?.course || ""}
                    onChange={(e) =>
                      handleChange(brigade.id, idx, "course", e.target.value)
                    }
                  >
                    <MenuItem value="">—</MenuItem>
                    {courseList.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  size="small"
                  fullWidth
                  error={!!rowErrors[`${brigade.id}-${idx}-salle`]}
                >
                  <InputLabel>Salle</InputLabel>
                  <Select
                    label="salle"
                    value={selection[brigade.id]?.[idx]?.salle || ""}
                    onChange={(e) =>
                      handleChange(brigade.id, idx, "salle", e.target.value)
                    }
                  >
                    <MenuItem value="">—</MenuItem>
                    {salleList.map((sal) => (
                      <MenuItem key={sal.id} value={sal.id}>
                        {sal.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  size="small"
                  fullWidth
                  error={!!rowErrors[`${brigade.id}-${idx}-user`]}
                >
                  <InputLabel>Instructeur</InputLabel>
                  <Select
                    label="instructeur"
                    value={selection[brigade.id]?.[idx]?.user || ""}
                    onChange={(e) =>
                      handleChange(brigade.id, idx, "user", e.target.value)
                    }
                  >
                    <MenuItem value="">—</MenuItem>
                    {userList.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.username || u.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            )}
            {viewMode === "show" && cellShow && (
              <Stack spacing={0.5}>
                <Typography variant="caption">
                  {cellShow.courseTitle}
                </Typography>
                <Typography variant="caption">
                  {cellShow.salleName}
                </Typography>
                <Typography variant="caption">
                  {cellShow.userName}
                </Typography>
              </Stack>
            )}
            {viewMode === "edit" && editIdx > -1 && (
              <Stack spacing={1}>
                <TextField
                  type="time"
                  fullWidth
                  size="small"
                  value={editedSeances[editIdx].start_time}
                  onChange={(e) =>
                    handleEditChange(editIdx, "start_time", e.target.value)
                  }
                />
                <TextField
                  type="time"
                  fullWidth
                  size="small"
                  value={editedSeances[editIdx].end_time}
                  onChange={(e) =>
                    handleEditChange(editIdx, "end_time", e.target.value)
                  }
                />
                <FormControl size="small" fullWidth>
                  <InputLabel>salle</InputLabel>
                  <Select
                    label="القاعة"
                    value={editedSeances[editIdx].salleId || ""}
                    onChange={(e) =>
                      handleEditChange(editIdx, "salleId", e.target.value)
                    }
                  >
                    <MenuItem value="">—</MenuItem>
                    {salleList.map((sal) => (
                      <MenuItem key={sal.id} value={sal.id}>
                        {sal.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel>mateire</InputLabel>
                  <Select
                    label="المادة"
                    value={editedSeances[editIdx].courseId || ""}
                    onChange={(e) =>
                      handleEditChange(editIdx, "courseId", e.target.value)
                    }
                  >
                    <MenuItem value="">—</MenuItem>
                    {courseList.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel>الأستاذ</InputLabel>
                  <Select
                    label="الأستاذ"
                    value={editedSeances[editIdx].userId || ""}
                    onChange={(e) =>
                      handleEditChange(editIdx, "userId", e.target.value)
                    }
                  >
                    <MenuItem value="">—</MenuItem>
                    {userList.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.username || u.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            )}
          </TableCell>
        );
      })}
    </MotionTableRow>
  );
}

export default function CreerProgression() {
  const { brigades, salles, userData, courses, loading, error } = useUser();
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  const brigadeList = Array.isArray(brigades?.data) ? brigades.data : [];
  const salleList = Array.isArray(salles?.data) ? salles.data : [];
  const userList = Array.isArray(userData) ? userData : [];
  const courseList = Array.isArray(courses?.data) ? courses.data : [];
 const handleChange = (brId, slotIdx, field, value) => {
    setSelection((prev) => ({
      ...prev,
      [brId]: {
        ...(prev[brId] || {}),
        [slotIdx]: {
          ...(prev[brId]?.[slotIdx] || {}),
          [field]: value,
        },
      },
    }));
    setRowErrors((errs) => {
      const key = `${brId}-${slotIdx}-${field}`;
      if (errs[key]) {
        const c = { ...errs };
        delete c[key];
        return c;
      }
      return errs;
    });
  };
  const handleEditChange = (index, field, value) =>
    setEditedSeances((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [customSlots, setCustomSlots] = useState([
    { start: "08:00", end: "09:45" },
    { start: "10:00", end: "12:00" },
    { start: "13:00", end: "14:30" },
    { start: "14:40", end: "16:00" },
  ]);
  const [viewMode, setViewMode] = useState("create");
  const [selection, setSelection] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [seances, setSeances] = useState([]);
  const [editedSeances, setEditedSeances] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [existsDialog, setExistsDialog] = useState(false);
  const [currentHistorique, setCurrentHistorique] = useState(null);

  const storageKey = `progression_${selectedDate}`;

  // جلب الـ historique الحالي لليوم (إن وجد) عند تغيير viewMode إلى show أو edit
  useEffect(() => {
    if (viewMode !== "create") {
      (async () => {
        try {
          const token = localStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const res = await fetch(
            `${API_URL}/api/historiques?filters[date][$eq]=${selectedDate}&populate=seances`,
            { headers }
          );
          const json = await res.json();
          const data = json.data;
          if (data.length) {
            setCurrentHistorique(data[0]);
          } else {
            setCurrentHistorique(null);
          }
        } catch (err) {
          console.error("خطأ في جلب الـ historique:", err);
        }
      })();
    }
  }, [viewMode, selectedDate]);

  // عند التحميل: إذا وجدنا جدول لليوم الحالي ننتقل تلقائياً للعرض
  useEffect(() => {
    const lp = sessionStorage.getItem("lastProgression");
    if (lp) {
      try {
        const prog = JSON.parse(lp);
        if (prog.date === selectedDate) {
          setViewMode("show");
        }
      } catch {}
    }
  }, [selectedDate]);

  // استعادة وحفظ حالة الإنشاء
  useEffect(() => {
    if (viewMode === "create") {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const { selection: sel, customSlots: cs } = JSON.parse(stored);
        setSelection(sel || {});
        setCustomSlots(cs || customSlots);
      }
    }
  }, [viewMode, selectedDate]);

  useEffect(() => {
    if (viewMode === "create") {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ selection, customSlots })
      );
    }
  }, [selection, customSlots, selectedDate]);

  // جلب الحصص للعرض/التعديل
  useEffect(() => {
    if (viewMode !== "create") {
      (async () => {
        try {
          const token = localStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const res = await fetch(
            `${API_URL}/api/seances?filters[date][$eq]=${selectedDate}&populate[brigade]=true&populate[salle]=true&populate[user]=true&populate[cour]=true`,
            { headers }
          );
          const json = await res.json();
          const items = json.data.map((item) => ({
            id: item.id,
            documentId: item.documentId,
            brigadeId: item.brigade.id,
            brigadeName: item.brigade.nom,
            salleId: item.salle?.id,
            salleName: item.salle?.nom,
            userId: item.user.id,
            userName: item.user.username || item.user.email,
            courseId: item.cour.id,
            courseTitle: item.cour.title,
            start_time: item.start_time.slice(0, 5),
            end_time: item.end_time.slice(0, 5),
          }));
          setSeances(items);
          if (viewMode === "edit") {
            setEditedSeances(items.map((i) => ({ ...i })));
          }
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [viewMode, selectedDate]);

  // إعداد الحالات عند الدخول لوضعية edit
  useEffect(() => {
    if (viewMode === "edit") {
      setEditedSeances(seances.map((s) => ({ ...s })));
    }
  }, [viewMode, seances]);

  // إنشاء الحصص + historique جديد
  const handleCreate = async () => {
    // التحقق من وجود جدول مسبقاً
    const lp = sessionStorage.getItem("lastProgression");
    if (lp) {
      try {
        const prog = JSON.parse(lp);
        if (prog.date === selectedDate) {
          return setExistsDialog(true);
        }
      } catch {}
    }
    // التحقق من تعبئة الحقول
    const errs = {};
    brigadeList.forEach((b) =>
      customSlots.forEach((_, idx) => {
        const cell = selection[b.id]?.[idx] || {};
        ["course", "salle", "user"].forEach((f) => {
          if (!cell[f]) errs[`${b.id}-${idx}-${f}`] = "مطلوب";
        });
      })
    );
    if (Object.keys(errs).length) {
      setRowErrors(errs);
      return setSnackbar({
        open: true,
        message: "الرجاء ملء جميع الحقول.",
        severity: "error",
      });
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // إنشاء كل الحصص
      const creations = await Promise.all(
        brigadeList.flatMap((b) =>
          customSlots.map((slot, idx) => {
            const sel = selection[b.id][idx];
            return fetch(`${API_URL}/api/seances`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                data: {
                  brigade: b.id,
                  salle: sel.salle,
                  user: sel.user,
                  cour: sel.course,
                  date: selectedDate,
                  start_time: slot.start + ":00.000",
                  end_time: slot.end + ":00.000",
                  Appele: "",
                  time_presence: null,
                },
              }),
            }).then((r) => r.json());
          })
        )
      );

      // تجمع معرّفات الحصص المنشأة
      const createdIds = creations.map((c) => c.data.documentId);

      // إنشاء سجلّ historique جديد مرتبط بهذه الحصص
      await fetch(`${API_URL}/api/historiques`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          data: {
            date: selectedDate,
            seances: createdIds,
          },
        }),
      });

      // حفظ للتذكّر
      const prog = {
        date: selectedDate,
        seanceIds: createdIds,
      };
      sessionStorage.setItem("lastProgression", JSON.stringify(prog));

      setSubmitting(false);
      setViewMode("show");
      setSnackbar({
        open: true,
        message: "Done",
        severity: "success",
      });
    } catch (err) {
      setSubmitting(false);
      setSnackbar({
        open: true,
        message: "خطأ أثناء الإنشاء: " + err.message,
        severity: "error",
      });
    }
  };

  // تعديل الحصص + تحديث historique الموجود
  const handleUpdateConfirm = async () => {
    if (!currentHistorique) {
      // لا يمكن التحديث بدون وجود historique مسبق
      setSnackbar({
        open: true,
        message: "لم يتم العثور على سجلّ historique للتحديث.",
        severity: "error",
      });
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // تحديث كل حصة
      for (let s of editedSeances) {
        await fetch(`${API_URL}/api/seances/${s.documentId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            data: {
              start_time: s.start_time + ":00.000",
              end_time: s.end_time + ":00.000",
              salle: s.salleId,
              cour: s.courseId,
              user: s.userId,
              date: selectedDate,
            },
          }),
        });
      }

      // بعد تعديل الحصص، نجمع معرّفاتهنّ
      const updatedIds = editedSeances.map((s) => s.id);

      // نحدّث سجلّ historique ليربط مع القائمة الجديدة
      await fetch(
        `${API_URL}/api/historiques/${currentHistorique.documentId}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            data: {
              seances: updatedIds,
            },
          }),
        }
      );

      setUpdating(false);
      setViewMode("show");
      setSnackbar({
        open: true,
        message: "تم تحديث الحصص والـ historique بنجاح.",
        severity: "success",
      });
    } catch (err) {
      setUpdating(false);
      setSnackbar({
        open: true,
        message: "خطأ أثناء التحديث: " + err.message,
        severity: "error",
      });
    }
  };

  const groupedBrigades = useMemo(() => {
    const map = {};
    brigadeList.forEach((b) => {
      if (!map[b.stage]) map[b.stage] = [];
      map[b.stage].push(b);
    });
    return map;
  }, [brigadeList]);

  if (loading)
    return (
      <Box p={4} className="flex justify-center">
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box p={4}>
        <Typography color="error">خطأ في جلب البيانات: {error}</Typography>
      </Box>
    );

  return (
    <Box p={4} className="space-y-4">
      <Typography variant="h5" sx={{mb:2}}>
        
        {viewMode === "create"
          ? "Creer la progression"
          : viewMode === "show"
          ? "  AFICHER LES SEANCES"
          : "  EDITER "}
      </Typography>

      {viewMode === "show" ? (
        <Typography>DATE : {selectedDate}</Typography>
      ) : (
        <TextField
          label=" CHOISIRE LA DATE"
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setViewMode("create");
          }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      )}

      {viewMode === "create" && (
        <>
          <Button onClick={() => setSlotsOpen((o) => !o)}>
            {slotsOpen ? " HIDE LES TEMPS" : "  EDITER LES TEMPS DES SEANCES"}
          </Button>
          {slotsOpen && (
            <Box className="flex space-x-4 mb-2">
              {customSlots.map((slot, idx) => (
                <Stack key={idx} spacing={1} className="flex-1">
                  <Typography variant="subtitle2">SEANCE {idx + 1}</Typography>
                  <TextField
                    label="DU"
                    type="time"
                    value={slot.start}
                    onChange={(e) =>
                      setCustomSlots((prev) =>
                        prev.map((s, i) =>
                          i === idx
                            ? { ...s, start: e.target.value }
                            : s
                        )
                      )
                    }
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="AU"
                    type="time"
                    value={slot.end}
                    onChange={(e) =>
                      setCustomSlots((prev) =>
                        prev.map((s, i) =>
                          i === idx
                            ? { ...s, end: e.target.value }
                            : s
                        )
                      )
                    }
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                  />
                </Stack>
              ))}
            </Box>
          )}
        </>
      )}

      <Paper className="rounded-lg shadow-lg overflow-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">STAGE</TableCell>
              <TableCell align="center">BRIGADE</TableCell>
              {customSlots.map((slot, idx) => (
                <SlotHeader key={idx} slot={slot} />
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {Object.entries(groupedBrigades).map(
                ([stage, brigadesOfStage]) =>
                  brigadesOfStage.map((b, idx) => (
                    <BrigadeRow
                      key={b.id}
                      brigade={b}
                      stageRowSpan={idx === 0 ? brigadesOfStage.length : 0}
                      customSlots={customSlots}
                      viewMode={viewMode}
                      selection={selection}
                      handleChange={handleChange}
                      rowErrors={rowErrors}
                      seances={seances}
                      editedSeances={editedSeances}
                      handleEditChange={handleEditChange}
                      courseList={courseList}
                      salleList={salleList}
                      userList={userList}
                    />
                  ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </Paper>

      <Box className="flex space-x-2">
        {viewMode === "create" && (
          <>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={submitting}
              startIcon={submitting && <CircularProgress size={20} />}
            >
              {submitting ? " EN COUR..." : "CREER"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setSelection({});
                setRowErrors({});
                sessionStorage.removeItem(storageKey);
                sessionStorage.removeItem("lastProgression");
              }}
            >
             REINSTALLER
            </Button>
          </>
        )}
        {viewMode === "show" && (
          <>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                sessionStorage.removeItem(storageKey);
                sessionStorage.removeItem("lastProgression");
                setSelection({});
                setViewMode("create");
              }}
            >
              NEVAUX
            </Button>
            <Button variant="contained" onClick={() => setViewMode("edit")}>
              EDITER
            </Button>
          </>
        )}
        {viewMode === "edit" && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateConfirm}
              disabled={updating}
              startIcon={updating && <CircularProgress size={20} />}
            >
              {updating ? " EN COUR ..." : " DONE"}
            </Button>
            <Button variant="outlined" onClick={() => setViewMode("show")}>
              إلغاء
            </Button>
          </>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={existsDialog}
        onClose={() => setExistsDialog(false)}
      >
        <DialogTitle>تنبيه</DialogTitle>
        <DialogContent>
          <Typography>
           LA PROGRESSION DE CE JOUR EST DEJA EXISTER
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExistsDialog(false)}>DONE</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
