"use client";
import { Box, Typography, Skeleton, useTheme, styled } from "@mui/material";
import InfoCard from "./InfoCard";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Event as EventIcon,
  Update as UpdateIcon,
} from "@mui/icons-material";

const StyledGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(3),
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  position: "relative",
  paddingBottom: theme.spacing(2),
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "60px",
    height: "4px",
    backgroundColor: theme.palette.primary.main,
    borderRadius: "2px",
  },
}));

const CardSkeleton = () => (
  <Box
    sx={{
      p: 3,
      bgcolor: "background.paper",
      borderRadius: 2,
      boxShadow: 1,
      height: "140px",
    }}
  >
    <Skeleton variant="circular" width={40} height={40} />
    <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
    <Skeleton variant="text" width="80%" />
  </Box>
);

export default function Accueil({ teacherInfo, loadingTeacher }) {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
      {loadingTeacher ? (
        <>
          <Skeleton variant="text" width="40%" height={60} sx={{ mb: 4 }} />
          <StyledGrid>
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </StyledGrid>
        </>
      ) : (
        <Box>
          <Title
            variant="h3"
            sx={{
              mb: 6,
              fontWeight: 700,
              color: "text.primary",
            }}
          >
            Informations Personnelles
          </Title>

          <StyledGrid>
            <InfoCard
              icon={
                <PersonIcon
                  sx={{ color: theme.palette.primary.main, fontSize: 32 }}
                />
              }
              label="Nom d'utilisateur"
              value={teacherInfo.username}
              gradient="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
            />
            <InfoCard
              icon={
                <EmailIcon
                  sx={{ color: theme.palette.secondary.main, fontSize: 32 }}
                />
              }
              label="Email"
              value={teacherInfo.email}
              gradient="linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)"
            />
            <InfoCard
              icon={
                <SecurityIcon
                  sx={{ color: theme.palette.success.main, fontSize: 32 }}
                />
              }
              label="Rôle"
              value={
                teacherInfo.role?.name === "teacher" ? "Formateur" : "admin"
              }
              gradient="linear-gradient(135deg, #e3ffe7 0%, #d9e7ff 100%)"
            />
            <InfoCard
              icon={
                <EventIcon
                  sx={{ color: theme.palette.warning.main, fontSize: 32 }}
                />
              }
              label="Date de création"
              value={new Date(teacherInfo.createdAt).toLocaleDateString(
                "fr-FR"
              )}
              gradient="linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)"
            />
            <InfoCard
              icon={
                <UpdateIcon
                  sx={{ color: theme.palette.info.main, fontSize: 32 }}
                />
              }
              label="Dernière mise à jour"
              value={new Date(teacherInfo.updatedAt).toLocaleDateString(
                "fr-FR"
              )}
              gradient="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
            />
          </StyledGrid>
        </Box>
      )}
    </Box>
  );
}
