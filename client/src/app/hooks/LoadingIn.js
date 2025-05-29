"use client";

import React from "react";
import { Box } from "@mui/material";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { keyframes, styled, alpha } from "@mui/material/styles";

// Pulse animation
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Full-screen overlay with blurred backdrop
const Overlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.background.default, 0.6),
  backdropFilter: 'blur(8px)',
  zIndex: 1300,
}));

// Box خاص بالأنيميشن فقط (بدون ثوابت حجم)
const AnimationBox = styled(Box)`
  animation: ${pulse} 1.5s infinite;
`;

const DEFAULT_SRC = "https://lottie.host/4ed03861-758e-45ff-a46f-1b124f27a83e/CViEJyN7CJ.lottie";

export default function LoadingIn({
  overlay = true,
  src = DEFAULT_SRC,
  size = 120,  // القيمة الافتراضية بالبيكسل
}) {
  // إذا كان numeric نخلي "px"، وإلا نفترض المستخدم مرّر سترينغ كاملة
  const dimension = typeof size === "number" ? `${size}px` : size;

  const animation = (
    <AnimationBox
      sx={{
        width: dimension,
        height: dimension,
      }}
    >
      <DotLottieReact
        src={src}
        loop
        autoplay
      />
    </AnimationBox>
  );

  return overlay ? <Overlay>{animation}</Overlay> : animation;
}
