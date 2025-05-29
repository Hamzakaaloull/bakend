"use client";
import { useEffect, useState } from "react";
import { Box, useTheme, Typography, Button } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/navigation";
import SideMenuAdmin from "./components/SideMenuAdmin";
import UserCrud from "./components/UserCrud/page";
import BrigadeCrud from "./components/BrigadeCrud";
import SalleCrud from "./components/SalleCrud";
import CoursCrud from "./components/CoursCrud";
import Settings from "./components/Settings/page";
import LoadingIn from "../hooks/LoadingIn";
import CreerProgression from "./components/CreerProgression";
import Historique from "./components/Historique";
import Specialty from "./components/specialty";
export default function AdminPage() {
  const [menuOption, setMenuOption] = useState("users");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <LoadingIn />;
  }

  if (isMobile) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center",
          p: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Mobile Not Supported
        </Typography>
        <Typography variant="body1">
          The admin panel is currently only available on desktop devices.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.back()}
          sx={{ mt: 4 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex"  , overflowY: "scroll" ,  height: "100vh", overflowY: "auto" }}>
      <SideMenuAdmin menuOption={menuOption} setMenuOption={setMenuOption} />

      <Box
        component="main"
        sx={{ flexGrow: 1, ml: { md: "280px" }, p: 4, width: "100%" }}
      >
        {menuOption === "users" && <UserCrud />}
        {menuOption === "specialty" && <Specialty />}
        {menuOption === "brigades" && <BrigadeCrud />}
        {menuOption === "salles" && <SalleCrud />}
        {menuOption === "cours" && <CoursCrud />}
        {menuOption === "settings" && <Settings />}
        {menuOption === "progression" && <CreerProgression />}
        {menuOption === "historique" && <Historique />}
      </Box>
    </Box>
  );
}
