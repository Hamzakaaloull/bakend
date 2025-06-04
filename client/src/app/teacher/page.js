"use client";
import { useEffect, useState } from "react";
import { Box, useTheme, Typography, List, ListItem, ListItemText, CircularProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import SideMenu from "./components/SideMenu";
import Accueil from "./components/Accueil";
import Seances from "./components/Seances";
import ActivityTracker from "./components/ActivityTracker";
import LoadingIn from "../hooks/LoadingIn";

export default function TeacherPage() {
  const [menuOption, setMenuOption] = useState("home");
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);
  const [loadingSession, setLoadingSession] = useState(true);
  const [collapseOpen, setCollapseOpen] = useState(true);
  const [statu, setStatu] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const [todaysSessions, setTodaysSessions] = useState([]);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else {
      fetchTeacherData(token);
      checkAndUpdateActiveSession(token);
    }
  }, []);

  const fetchTeacherData = async (token) => {
    setLoadingTeacher(true);
    try {
      const res = await fetch(
        `${API_URL}/api/users/me?populate[imgProfile]=*&populate[role]=*&populate[user_status]=*&populate[specialty]=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setTeacherInfo(data);

      // Mettre à jour le statut de l'utilisateur
      const req = await fetch(`${API_URL}/api/user-statuses/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            isOnline: true,
            lastSeen: new Date().toISOString(),
            user: data.id,
          },
        }),
      });
      const dataReq = await req.json();
      setStatu(dataReq.data);
      setTeacherInfo((prev) => ({
        ...prev,
        user_status: dataReq.data,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTeacher(false);
    }
  };

  const checkAndUpdateActiveSession = async (token) => {
    setLoadingSession(true);
    try {
      const now = new Date();
      const today = now.toLocaleDateString("fr-CA");
      const res = await fetch(
        `${API_URL}/api/seances?filters[date][$eq]=${today}&populate[cour][populate][0]=cour_contant&populate[brigade]=true&populate[salle]=true&populate[userPhoto]=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      
      // Stocker toutes les séances d'aujourd'hui
      setTodaysSessions(data.data || []);
      
      if (!data.error) {
        const session = data.data.find((s) => {
          const start = new Date(`${s.date}T${s.start_time}`);
          const end = new Date(`${s.date}T${s.end_time}`);
          return now >= start && now <= end;
        });
        
        if (session) {
          setActiveSession(session);
          setHasActiveSession(true);
          const formattedTime = now.toISOString().split("T")[1].split("Z")[0];
          const upd = await fetch(
            `${API_URL}/api/seances/${session.documentId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ data: { time_presence: formattedTime } }),
            }
          );
        } else {
          setHasActiveSession(false);
        }
      } else {
        setHasActiveSession(false);
      }
    } catch (err) {
      console.error(err);
      setHasActiveSession(false);
    } finally {
      setLoadingSession(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const statusDocId = statu?.documentId;
    const userId = teacherInfo?.id;
    
    if (token && statusDocId) {
      try {
        await fetch(`${API_URL}/api/user-statuses/${statusDocId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              isOnline: false,
              lastSeen: new Date().toISOString(),
            },
          }),
        });
      } catch (err) {}
    }

    if (token && userId) {
      try {
        await fetch(`${API_URL}/api/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: false,
          }),
        });
      } catch (err) {}
    }
    
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Afficher le chargement pendant le traitement
  if (loadingSession || loadingTeacher) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Si aucune séance active n'est trouvée
  if (!hasActiveSession) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            bgcolor: "background.default",
            p: 4,
          }}
        >
          <Box
            sx={{
              bgcolor: "background.paper",
              p: 4,
              borderRadius: 2,
              boxShadow: 3,
              maxWidth: 600,
              width: "100%",
            }}
          >
           <Typography variant="h5" sx={{ mb: 1, textAlign: "center", color: "primary.main" }}>
               Séances prévues aujourd'hui
             </Typography>
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              opacity: 0.5,
              fontStyle: "italic",
              maxWidth: "600px",
              mx: "auto",
              my: 1,
            }}
          >
            Vous n’avez pas le droit de vous connecter si aucune séance active n’est prévue pour aujourd’hui.
          </Typography>

             
            {todaysSessions.length > 0 ? (
              <List
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  maxHeight: 400,
                  overflow: "auto",
                }}
              >
                {todaysSessions.map((session) => (
                  <ListItem key={session.id} divider>
                    <ListItemText
                      primary={session.cour?.title || "Matière inconnue"}
                      secondary={
                        // Correction : Utilisation de fragments et de spans
                        <>
                          <Typography component="span" variant="body2" display="block">
                            Date: {new Date(session.date).toLocaleDateString("fr-FR")}
                          </Typography>
                          <Typography component="span" variant="body2" display="block">
                            Heure: {session.start_time} - {session.end_time}
                          </Typography>
                          {session.brigade && (
                            <Typography component="span" variant="body2" display="block">
                              Brigade: {session.brigade.nom}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
                Aucune séance prévue aujourd'hui
              </Typography>
            )}
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  // Si une séance active existe, afficher l'interface normale
  return (
    <ThemeProvider theme={theme}>
      {isLoading && <LoadingIn />}
      <Box sx={{ display: "flex" }}>
        <SideMenu
          menuOption={menuOption}
          setMenuOption={setMenuOption}
          teacherInfo={teacherInfo}
          handleLogout={handleLogout}
          userstate={statu}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: { xs: 0, md: "280px" },
            p: { xs: 2, md: 4 },
            transition: "margin-left 0.3s ease",
            minHeight: "100vh",
            bgcolor: "background.default",
            position: "relative",
          }}
        >
          {menuOption === "home" && (
            <Accueil
              teacherInfo={teacherInfo}
              loadingTeacher={loadingTeacher}
            />
          )}
          {menuOption === "seance" && (
            <Seances
              activeSession={activeSession}
              loadingSession={loadingSession}
              collapseOpen={collapseOpen}
              setActiveSession={setActiveSession}
              setCollapseOpen={setCollapseOpen}
            />
          )}

          {teacherInfo && activeSession && (
            <ActivityTracker
              sessionId={activeSession.documentId}
              userId={teacherInfo.id}
              token={localStorage.getItem("token")}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}