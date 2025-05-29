import React from "react";
import {
  IconButton,
  Badge,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
  Divider,
  Grow,
} from "@mui/material";
import { Notifications } from "@mui/icons-material";

export default function NotificationBell({ notifications }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      {/* أيقونة الإشعارات */}
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={notifications.length} color="error">
          <Notifications fontSize="large" />
        </Badge>
      </IconButton>

      {/* صندوق الإشعارات */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        TransitionComponent={Grow}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
            p: 1.5,
            borderRadius: 2,
            boxShadow: 4,
          },
        }}
      >
        <Typography variant="h6" sx={{ px: 1, mb: 1 }}>
          حالات الغياب ({notifications.length})
        </Typography>
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              لا توجد غيابات
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 330, overflowY: "auto" }}>
            {notifications.map((n, idx) => (
              <ListItem key={idx} alignItems="flex-start" sx={{ py: 1 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {n.professor?.charAt(0).toUpperCase() || "P"}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: 600 }}>
                      {n.professor}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {n.date} من {n.start} إلى {n.end}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        دفعة: {n.brigade}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        <Box textAlign="center" sx={{ mt: 1 }}>
          <Typography
            variant="caption"
            color="primary"
            sx={{
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={handleClose}
          >
            إغلاق
          </Typography>
        </Box>
      </Popover>
    </>
  );
}
