import {
  List,
  Avatar,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Tooltip,
  IconButton,
  Typography,
  useMediaQuery,
  Divider,
  alpha,
  keyframes,
} from "@mui/material";
import {
  Home as HomeIcon,
  Logout as LogoutIcon,
  EventNote as EventNoteIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import MobileBottomNav from "./MobileBottomNav";

const shimmer = keyframes`
  0% { background-position: -200% 0 }
  100% { background-position: 200% 0 }
`;

export default function SideMenu({ ...props }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  if (isMobile)
    return (
      <MobileBottomNav
        value={props.menuOption}
        onChange={props.setMenuOption}
        handleLogout={props.handleLogout}
        handleSettingsOpen={props.handleSettingsOpen}
        avatarUrl={
          props.teacherInfo?.imgProfile?.url
            ? `${API_URL}${props.teacherInfo.imgProfile.url}`
            : null
        }
        username={props.teacherInfo?.username}
      />
    );

  return (
    <Box
      sx={{
        width: 280,
        height: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.light,
          0.1
        )}, ${alpha(theme.palette.primary.dark, 0.05)})`,
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        backdropFilter: "blur(12px)",
        animation: `${shimmer} 2s infinite linear`,
        transition: "transform 0.3s ease",
        transform: "translateX(0)",
        "&:hover": {
          transform: "translateX(-5px)",
        },
        position: "fixed",
        zIndex: 1100,
        display: "flex",
        flexDirection: "column",
        p: 3,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 4,
          fontWeight: 700,
          color: "primary.main",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -4,
            left: 0,
            width: 40,
            height: 2,
            bgcolor: "primary.main",
            borderRadius: 1,
            animation: "pulse 1.5s infinite",
          },
        }}
      >
        Portail CIT
      </Typography>

      <List sx={{ flexGrow: 1, mt: 2 }}>
        {[
          { key: "home", icon: <HomeIcon />, label: "Accueil" },
          { key: "seance", icon: <EventNoteIcon />, label: "Séances" },
        ].map((item) => (
          <ListItem
            key={item.key}
            component="button" // ✅ الحل الموصى به في MUI v5+
            selected={props.menuOption === item.key}
            onClick={() => props.setMenuOption(item.key)}
            sx={{
              borderRadius: 3,
              mb: 1.5,
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: "translateX(0)",
              "&:hover": {
                transform: "translateX(10px)",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                boxShadow: `0 4px 12px ${alpha(
                  theme.palette.primary.main,
                  0.15
                )}`,
              },
              "&.Mui-selected": {
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                boxShadow: `inset 4px 0 0 ${theme.palette.primary.main}`,
                "& .MuiListItemIcon-root": {
                  color: "primary.main",
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 48,
                transition: "transform 0.3s",
                ".MuiListItem-root:hover &": {
                  transform: "scale(1.1)",
                },
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                sx: {
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  position: "relative",
                  "&::after": {
                    content: '"→"',
                    position: "absolute",
                    right: -24,
                    opacity: 0,
                    transition: "opacity 0.3s",
                  },
                  "&:hover::after": {
                    opacity: 1,
                  },
                },
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: "auto", pt: 4 }}>
        <Divider
          sx={{ mb: 3, borderColor: alpha(theme.palette.divider, 0.15) }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            transition: "all 0.3s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: theme.shadows[6],
            },
          }}
        >
          <Avatar
            src={
              props.teacherInfo?.imgProfile?.url
                ? `${API_URL}${props.teacherInfo.imgProfile.url}`
                : undefined
            }
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: "all 0.3s",
              "&:hover": {
                boxShadow: `0 0 0 4px ${alpha(
                  theme.palette.primary.main,
                  0.2
                )}`,
                border: `2px solid ${theme.palette.primary.main}`,
              },
            }}
          >
            {!props.teacherInfo?.imgProfile?.url && <AccountCircleIcon />}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" noWrap>
              {props.teacherInfo?.username}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mt: 0.5,
              }}
            >
              <CircleIcon
                sx={{
                  fontSize: 8,
                  color: props.statu?.user_status?.isOnline ? "" : "error.main",
                }}
              />
              {props.teacherInfo?.user_status?.isOnline
                ? "En ligne"
                : "Hors ligne"}
            </Typography>
          </Box>

          <Tooltip title="Déconnexion">
            <IconButton
              onClick={props.handleLogout}
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                "&:hover": {
                  bgcolor: alpha(theme.palette.error.main, 0.2),
                  transform: "rotate(90deg)",
                  transition: "transform 0.3s",
                },
                transition: "all 0.3s",
              }}
            >
              <LogoutIcon sx={{ color: "error.main" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}

function CircleIcon(props) {
  return (
    <Box
      component="span"
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: "success.main",
        ...props.sx,
      }}
    />
  );
}
