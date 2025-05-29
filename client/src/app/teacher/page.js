"use client";
import { useEffect, useState } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
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
      console.log("this is teacher info ", data);
      setTeacherInfo(data);

      // fetch the statu of the user and update it
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
      // save the statu of the user
      setStatu(dataReq.data);
      setTeacherInfo((prev) => ({
        ...prev,
        user_status: dataReq.data,
      }));
      console.log("Updated status on login:", dataReq.data);
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
      console.log("this is seances ", data);
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
          const dataupd = await upd.json();
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
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const statusDocId = statu?.documentId;
    const userId = teacherInfo?.id;
    // update the satete of the user
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
        console.log("✅ user-status updated to offline");
      } catch (err) {
        console.error("Error updating user-status:", err);
      }
    }

    // 2. update isActive في Users-Permissions
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
        console.log("✅ user.isActive updated to false");
      } catch (err) {
        console.error("Error updating user.isActive:", err);
      }
    }
    // 3. delete the token and puch to login
    localStorage.removeItem("token");
    router.push("/login");
  };

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
