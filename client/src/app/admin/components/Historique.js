import * as React from "react";
import NotificationBell from "./NotificationBell";
import {
  Box,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Avatar,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ExpandMore,
  CalendarToday,
  Description,
  Close,
} from "@mui/icons-material";
import LoadingIn from "@/app/hooks/LoadingIn";

export default function HistoriqueGrid() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const [histos, setHistos] = React.useState([]);
  const [filterDate, setFilterDate] = React.useState("");
  const [expanded, setExpanded] = React.useState(null);
  const [selectedSeance, setSelectedSeance] = React.useState(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  React.useEffect(() => {
    async function fetchHistos() {
      setLoading(true);
      try {
        const url = `${API_URL}/api/historiques?populate=*&populate[seances][populate][0]=user&populate[seances][populate][1]=brigade&populate[seances][populate][2]=salle&populate[seances][populate][3]=cour.cour_contant&populate[seances][populate][4]=userPhoto`;
        const res = await fetch(url);
        const json = await res.json();
        const data = json.data || [];
        setHistos(data);

        // حساب الغيابات
        const now = new Date();
        const absences = [];
        data.forEach((h) => {
          const dateOnly = h.date.split("T")[0];
          h.seances.forEach((s) => {
            const endDt = new Date(`${dateOnly}T${s.end_time}`);
            const hasPresence = s.time_presence !== null && s.Appele !== "";
            if (!hasPresence && endDt < now) {
              absences.push({
                date: dateOnly,
                time: s.end_time.slice(0, 5),
                brigade: s.brigade?.nom || "—",
              });
            }
          });
        });
        setNotifications(absences);
        if (absences.length > 0) setSnackbarOpen(true);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistos();
  }, [API_URL]);

  // تصفية حسب التاريخ
  const filtered = React.useMemo(() => {
    if (!filterDate) return histos;
    return histos.filter((h) => h.date.split("T")[0] === filterDate);
  }, [histos, filterDate]);

  const handleChange = (id) => (_, isExp) => setExpanded(isExp ? id : null);
  const openDetail = (s) => {
    setSelectedSeance(s);
    setOpenDialog(true);
  };
  const closeDetail = () => {
    setSelectedSeance(null);
    setOpenDialog(false);
  };
  const closeSnackbar = () => setSnackbarOpen(false);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <NotificationBell notifications={notifications} />

      <TextField
        fullWidth
        label="فلترة بالتاريخ"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        sx={{ my: 4 }}
      />

      {loading ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <LoadingIn overlay={false} size={60} />
        </Box>
      ) : (
        filtered.map((h) => {
          const dateKey = h.date.split("T")[0];
          const seances = h.seances;
          const times = Array.from(
            new Set(seances.map((s) => s.start_time.slice(0, 5)))
          ).sort();
          const brigades = Array.from(
            new Set(seances.map((s) => s.brigade?.nom || "—"))
          );

          return (
            <Accordion
              key={h.id}
              expanded={expanded === h.id}
              onChange={handleChange(h.id)}
              sx={{ mb: 2, borderRadius: 2, boxShadow: 3 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <CalendarToday sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {dateKey}
                </Typography>
                <Chip label={`${seances.length} حصة`} />
              </AccordionSummary>

              <AccordionDetails>
                <Paper variant="outlined">
                  <Box
                    component="table"
                    sx={{ width: "100%", borderCollapse: "collapse" }}
                  >
                    <Box component="thead">
                      <Box component="tr">
                        <Box component="th" sx={{ p: 1 }}>
                          دفعة
                        </Box>
                        {times.map((t) => (
                          <Box
                            component="th"
                            key={t}
                            sx={{ p: 1, textAlign: "center" }}
                          >
                            {t}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {brigades.map((br) => (
                        <Box component="tr" key={br}>
                          <Box component="td" sx={{ p: 1, fontWeight: "bold" }}>
                            {br}
                          </Box>
                          {times.map((t) => {
                            const s = seances.find(
                              (x) =>
                                (x.brigade?.nom || "—") === br &&
                                x.start_time.slice(0, 5) === t
                            );
                            return (
                              <Box
                                component="td"
                                key={t}
                                sx={{
                                  p: 1,
                                  cursor: s ? "pointer" : "default",
                                  bgcolor: s ? "background.paper" : "inherit",
                                }}
                                onClick={() => s && openDetail(s)}
                              >
                                {s ? (
                                  <>
                                    <Typography variant="body2">
                                      {s.cour?.title || "—"}
                                    </Typography>
                                    <LinearProgress
                                      variant="determinate"
                                      value={
                                        s.time_presence && s.Appele ? 100 : 0
                                      }
                                      sx={{
                                        height: 6,
                                        borderRadius: 1,
                                        mt: 0.5,
                                      }}
                                    />
                                  </>
                                ) : (
                                  "—"
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}

      <Dialog open={openDialog} onClose={closeDetail} maxWidth="sm" fullWidth>
        <DialogTitle>
          تفاصيل الحصة
          <IconButton
            onClick={closeDetail}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSeance && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography>
                  المادة: {selectedSeance.cour?.title || "—"}
                </Typography>
                <Typography>
                  دفعة: {selectedSeance.brigade?.nom || "—"}
                </Typography>
                <Typography>
                  قاعة: {selectedSeance.salle?.nom || "—"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>
                  بداية: {selectedSeance.start_time.slice(0, 5)}
                </Typography>
                <Typography>
                  نهاية: {selectedSeance.end_time.slice(0, 5)}
                </Typography>
                <Typography>
                  حضور: {selectedSeance.time_presence || "—"}
                </Typography>
              </Grid>
              {selectedSeance.cour?.cour_contant?.length > 0 && (
                <Grid item xs={12}>
                  <Typography sx={{ mt: 2 }}>المستندات:</Typography>
                  {selectedSeance.cour.cour_contant.map((doc) => (
                    <Button
                      key={doc.id}
                      href={`${API_URL}${doc.url}`}
                      target="_blank"
                      startIcon={<Description />}
                      sx={{ textTransform: "none", mr: 1, mt: 1 }}
                    >
                      {doc.name}
                    </Button>
                  ))}
                </Grid>
              )}
              {selectedSeance.userPhoto?.length > 0 && (
                <Grid item xs={12} sx={{ textAlign: "center", mt: 2 }}>
                  <Avatar
                    src={`${API_URL}${selectedSeance.userPhoto[0].url}`}
                    sx={{ width: 80, height: 80, mx: "auto" }}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail} variant="contained">
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="warning" onClose={closeSnackbar}>
          تم تسجيل غياب في {notifications.length} حصة. الرجاء المتابعة.
        </Alert>
      </Snackbar>
    </Box>
  );
}
