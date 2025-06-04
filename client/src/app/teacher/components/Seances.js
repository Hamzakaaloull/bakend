"use client";
import { useRouter } from "next/navigation";  
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Collapse,
  Alert,
  IconButton,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Skeleton,
  Slide,
  Link as MuiLink,
  TextField,
  Button,
  Snackbar,
  useMediaQuery,
} from "@mui/material";
import {
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

export default function Seances({
  activeSession,
  setActiveSession,
  loadingSession,
  collapseOpen,
  setCollapseOpen,
}) {
  const router = useRouter(); 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [appeleInput, setAppeleInput] = useState(activeSession?.Appele || "");
  const [showInput, setShowInput] = useState(!activeSession?.Appele);
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");   // أو المسار الذي تريد الانتقال إليه بعد الخروج
  };


  // Sync input with activeSession changes
  useEffect(() => {
    setAppeleInput(activeSession?.Appele || "");
    setShowInput(!activeSession?.Appele);
  }, [activeSession]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!appeleInput.trim() || !activeSession) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Authentification requise", severity: "error" });
      return;
    }

    const res = await fetch(
      `${API_URL}/api/seances/${activeSession.documentId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: { Appele: appeleInput } }),
      }
    );

    if (res.ok) {
      const updatedData = await res.json();
      
      // التعديل هنا: الوصول المباشر إلى Appele دون attributes
      setActiveSession((prev) => ({
        ...prev,
        Appele: updatedData.data.Appele, // ← تمت إزالة .attributes
      }));
      
      setShowInput(false);
      setSnackbar({
        open: true,
        message: "Appelé enregistré avec succès!",
        severity: "success",
      });
    } else {
      const errorData = await res.json();
      throw new Error(errorData.message || "Échec de la mise à jour");
    }
  } catch (error) {
    setSnackbar({ 
      open: true, 
      message: error.message || "Erreur serveur", 
      severity: "error" 
    });
  }
};

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 0, md: 4 } }}>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          color: "#2E3B55",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <EventNoteIcon sx={{ color: "#009688" }} />
        Séance Active
      </Typography>
      {activeSession ? (
        <Collapse in={collapseOpen}>
          <Alert
            severity="success"
            sx={{
              bgcolor: "success.light",
              borderLeft: "4px solid #4CAF50",
              mb: 4,
            }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setCollapseOpen(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            Votre présence a été enregistrée avec succès!
          </Alert>
        </Collapse>
      ) : (
        ""
      )}

      {loadingSession ? (
        <Skeleton variant="rectangular" height={200} />
      ) : activeSession ? (
        <>
          <Slide in timeout={600}>
            <TableContainer
              component={Box}
              sx={{
                borderRadius: 3,
                border: "1px solid #E0E0E0",
                bgcolor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                overflowX: "auto",
                width: { xs: "90vw", md: "auto" },
                minWidth: isMobile ? "320px" : "unset",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    {[
                      "Date",
                      "Heure de début",
                      "Heure de fin",
                      "Matière",
                      "Document",
                      "Brigade",
                    ].map((head) => (
                      <TableCell
                        key={head}
                        sx={{
                          fontWeight: 600,
                          borderBottom: "2px solid #E0E0E0",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor: "#F0F9FF",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      },
                    }}
                  >
                    <TableCell>
                      {new Date(activeSession.date).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>{activeSession.start_time}</TableCell>
                    <TableCell>{activeSession.end_time}</TableCell>
                    <TableCell>
                      {activeSession.cour?.title || "Matière non trouvée"}
                    </TableCell>
                    <TableCell>
                      {Array.isArray(activeSession.cour?.cour_contant) &&
                      activeSession.cour.cour_contant.length > 0 ? (
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {activeSession.cour.cour_contant.map(
                            (file, index) => (
                              <MuiLink
                                key={index}
                                href={`${API_URL}${file.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  textDecoration: "none",
                                  color: "#1565C0",
                                  bgcolor: "#E3F2FD",
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: 2,
                                  display: "inline-block",
                                  transition: "transform 0.2s ease",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                  },
                                }}
                              >
                                📎 {file.name}
                              </MuiLink>
                            )
                          )}
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontStyle="italic"
                        >
                          Aucun document trouvé.
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {activeSession.brigade ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                          }}
                        >
                          <Typography variant="body1" fontWeight={600}>
                            {activeSession.brigade.nom}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Stage: {activeSession.brigade.stage}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Effectif: {activeSession.brigade.effectif_theorique}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="error">
                          Brigade non trouvée
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Slide>

          {/* Appel Section */}
          <Box mt={4}>
            {showInput && (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  bgcolor: "background.paper",
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid #E0E0E0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Saisie Appelé
                </Typography>
               <TextField
                fullWidth
                multiline
                rows={4}
                value={appeleInput}
                onChange={(e) => setAppeleInput(e.target.value)}
                variant="outlined"
                InputProps={{
                  style: { fontFamily: "monospace" },
                  readOnly: !showInput, // ← منع التعديل عند العرض
                }}
                sx={{ mb: 2 }}
              />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  sx={{ mt: 1 }}
                >
                  Enregistrer
                </Button>
              </Box>
            )}

            {!showInput && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>
                  Appelé Enregistré:
                </Typography>
                <pre
                  style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
                >
                  {activeSession.Appele}
                </pre>
              </Box>
            )}
          </Box>
        </>
      ) : (
        
        <Alert
          severity="info"
          sx={{
            bgcolor: "info.light",
            borderLeft: "4px solid #2196F3",
            mb: 4,
          }}
        >
          Aucune séance active trouvée.
        </Alert>
        
      )
      }
 
      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          elevation={6}
          variant="filled"
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
