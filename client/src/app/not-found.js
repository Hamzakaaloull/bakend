// app/not-found.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button, LinearProgress } from "@mui/material";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function NotFound() {
  const router = useRouter();
  // ضبط مدّة الانميشن بالثواني (عدّل القيمة حسب طول الانميشن الحقيقي)
  const duration = 5;
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    // عدّاد ينقص كل ثانية
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(t - 1, 0));
    }, 1000);

    // تحويل بعد انتهاء العدّاد
    const timeout = setTimeout(() => {
      router.push("/login");
    }, duration * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 1,
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" color="text.secondary" gutterBottom>
    Page Not Found
      </Typography>

      <Box sx={{ width: 300, height: 300,  }}>
      <DotLottieReact
      src="https://lottie.host/23465673-468a-4b71-864e-775fedf60c36/YTShXBhK60.lottie"
      loop
      autoplay
    />
      </Box>

      <Box sx={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
        <Typography variant="body1" gutterBottom>
          U gonna puch u to login page in {" "}
          <Typography component="span" fontWeight="bold">
            {timeLeft}
          </Typography>{" "}
          second
        </Typography>
        <LinearProgress
          variant="determinate"
          value={((duration - timeLeft) / duration) * 100}
          sx={{ height: 10, borderRadius: 5 }}
        />
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => router.push("/login")}
        >
         GO NOW
        </Button>
      </Box>
    </Box>
  );
}
