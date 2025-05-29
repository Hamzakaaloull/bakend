
// components/UserGrid.js
"use client";
import React from "react";
import { Box, Card, Skeleton, CardContent } from "@mui/material";
import UserCard from "./UserCard";

export default function UserGrid({
  filteredUsers,
  loadingGlobal,
  API_URL,
  currentUser,
  theme,
  handleEdit,
  handleDelete,
  loadingDelete,
  userToDelete,
handleShowDetail
}) {
  if (loadingGlobal) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 4,
        }}
      >
        {[...Array(6)].map((_, index) => (
          <Card key={index} sx={{ height: 240 }}>
            <Skeleton
              variant="rectangular"
              height={140}
              animation="wave"
              sx={{ borderRadius: "8px 8px 0 0" }}
            />
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rectangular" height={24} width="50%" />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        },
        gap: 4,
      }}
    >
      {filteredUsers.map((user) => (
        <UserCard
          key={user.id}
          user={user}
             handleShowDetail={handleShowDetail}
          API_URL={API_URL}
          theme={theme}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          loadingDelete={loadingDelete}
          userToDelete={userToDelete}
          currentUser={currentUser}

        />
      ))}
    </Box>
  );
}
