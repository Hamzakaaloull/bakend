"use client";

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import LoadingIn from "@/app/hooks/LoadingIn";
import AppInfo from "./AppInfo";
import PersonellInfo from "./PersonellInfo";

export default function InfoAppSettings() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // إذا كنت تنفّذ fetch هنا، ضع setLoading(false) بعد انتهاء الطلب
    // هنا نستخدم تايمر للا مثال فقط
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LoadingIn overlay={false} size={80} />
      </Box>
    );
  }

  return (
    <main>
      <PersonellInfo />
      <AppInfo />
    </main>
  );
}
