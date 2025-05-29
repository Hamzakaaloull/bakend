import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const CardContainer = styled(Box)(({ theme, gradient }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  minHeight: 140,
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[4],
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "4px",
    background: gradient,
  },
}));

export default function InfoCard({ icon, label, value, gradient }) {
  return (
    <CardContainer gradient={gradient}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        {icon}
        <Typography
          variant="subtitle1"
          sx={{
            ml: 1.5,
            fontWeight: 600,
            color: "text.secondary",
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "text.primary",
        }}
      >
        {value}
      </Typography>
    </CardContainer>
  );
}
