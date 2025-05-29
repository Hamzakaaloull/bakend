"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  Chip,
  Stack,
  CardActions,
  IconButton,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Edit,
  Delete,
  Security as SecurityIcon,
  Circle as CircleIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

export default function UserCard({
  user,
  API_URL,
  theme,
  handleEdit,
  handleDelete,
  loadingDelete,
  userToDelete,
  currentUser,
  handleShowDetail
}) {
  // Skip rendering for current user
  if (currentUser && user.id === currentUser.id) return null;

  return (
    <Card
      sx={{
        transition: "transform 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: theme.shadows[6],
        },
        position: "relative",
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            src={
              user.imgProfile?.formats?.thumbnail?.url
                ? `${API_URL}${user.imgProfile.formats.thumbnail.url}`
                : ""
            }
            sx={{
              bgcolor: theme.palette.secondary.light,
              width: 60,
              height: 60,
            }}
          />
        }
        title={
          <Typography variant="subtitle1" noWrap>
            {user.username}
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Chip
          label={user.role?.name || "Aucun rôle"}
          color={
            user.role?.name === "admin"
              ? "primary"
              : user.role?.name === "manger"
              ? "secondary"
              : "default"
          }
          size="small"
          icon={<SecurityIcon fontSize="small" />}
          sx={{ mb: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          {user.user_status?.isOnline ? (
            <Chip
              label="En ligne"
              color="success"
              size="small"
              icon={<CircleIcon sx={{ fontSize: 10 }} />}
            />
          ) : (
            <Chip
              label="Hors ligne"
              color="default"
              size="small"
              icon={<CircleIcon sx={{ fontSize: 10 }} />}
            />
          )}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip
            key={user.id}
            label={user.specialty?.nom || "Aucune spécialité"}
            size="small"
            color={
              user.specialty?.nom === "informatique" ? "success" : "default"
            }
          />
        </Stack>
      </CardContent>
      <CardActions disableSpacing sx={{ mt: "auto" }}>
        <IconButton
          aria-label="edit"
          onClick={() => handleEdit(user)}
          disabled={loadingDelete}
        >
          <Edit />
        </IconButton>
        <IconButton
          aria-label="delete"
          onClick={() => handleDelete(user.id)}
          disabled={loadingDelete}
          color="error"
        >
          {loadingDelete && userToDelete === user.id ? (
            <CircularProgress size={20} />
          ) : (
            <Delete />
          )}
        </IconButton>
        <Button
        size="small"
         startIcon={<VisibilityIcon />}
         onClick={() => handleShowDetail(user)}
       >
        more detail
      </Button>
      </CardActions>
    </Card>
  );
}
