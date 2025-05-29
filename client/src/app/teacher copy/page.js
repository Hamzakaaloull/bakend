"use client";
import { useEffect, useState } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import SideMenu from "./components/SideMenu";
import Accueil from "./components/Accueil";
import Seances from "./components/Seances";

export default function TeacherPage() {
  const [menuOption, setMenuOption] = useState("home");
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);
  const [loadingSession, setLoadingSession] = useState(true);
  const [collapseOpen, setCollapseOpen] = useState(true);
  const router = useRouter();
  const [statu, setstatu] = useState(null);
  const handleUpdateSession = (updatedSession) => {
    setActiveSession(updatedSession);
  };
  // Add media query hook
  const theme = useTheme();

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
        "http://localhost:1337/api/users/me?populate[imgProfile]=*&populate[role]=*&populate[user_status]=*",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      console.log(data);
      setTeacherInfo(data);

      const req = await fetch("http://localhost:1337/api/user-statuses/", {
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

      const datareq = await req.json();
      setstatu(datareq.data);
      console.log("this is stati", datareq.data);
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
        `http://localhost:1337/api/seances?filters[date][$eq]=${today}&populate[cour][populate][0]=cour_contant&populate[brigade]=true&populate[salle]=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      console.log(data);
      if (!data.error) {
        const session = data.data.find((s) => {
          const start = new Date(`${s.date}T${s.start_time}`);
          const end = new Date(`${s.date}T${s.end_time}`);
          return now >= start && now <= end;
        });
        if (session) {
          setActiveSession(session);
          const formattedTime = now.toISOString().split("T")[1].split("Z")[0];
          const upd = await fetch(
            `http://localhost:1337/api/seances/${session.documentId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ data: { time_presence: formattedTime } }),
            }
          );
          const dataupd = upd.json();
          console.log(dataupd);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSession(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    const statusId = statu?.documentId; // استخدام الـID من الحالة المحدثة

    if (token) {
      try {
        await fetch(`http://localhost:1337/api/user-statuses/${statusId}`, {
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
      } catch (err) {
        console.error("حدث خطأ أثناء تحديث الحالة:", err);
      }
    }
    localStorage.removeItem("token");
    router.push("/login");
  };
  return (
    <ThemeProvider theme={theme}>
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
              setActiveSession={setActiveSession} // Added this line
              loadingSession={loadingSession}
              collapseOpen={collapseOpen}
              setCollapseOpen={setCollapseOpen}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
