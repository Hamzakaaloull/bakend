"use client";
import { useEffect, useRef, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

export default function ActivityTracker({ sessionId, userId, token }) {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [showAlert, setShowAlert] = useState(false);
  const inactivityTimer = useRef(null);
  const isUploading = useRef(false);

  // تحديث حالة isActive في Strapi
  const setInactive = async () => {
    if (!token || !userId) return;
    setShowAlert(true);
    await fetch(`${API_URL}/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: false }),
    }).catch(console.error);
  };

  const setActive = async () => {
    if (!token || !userId) return;
    setShowAlert(false);
    await fetch(`${API_URL}/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: true }),
    }).catch(console.error);
  };

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(setInactive, 30000);
    setActive();
  };

  // التقاط الصورة + رفعها + تحديث seance + إغلاق الكاميرا
  const captureAndUpload = async () => {
    if (!videoRef.current || isUploading.current || !sessionId) return;
    isUploading.current = true;

    // عمل canvas من الفريم الحالي
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        // 1. رفع الملف
        const formData = new FormData();
        formData.append("files", blob, "user_photo.jpg");
        formData.append("ref", "api::seance.seance");
        formData.append("refId", sessionId);
        formData.append("field", "userPhoto");

        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        const uploadedIds = uploadData.map((f) => f.id);

        // 2. ربط الملف بالحقل userPhoto في seance
        await fetch(`${API_URL}/api/seances/${sessionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: { userPhoto: uploadedIds } }),
        });
        console.log("Seance updated with photo IDs:", uploadedIds);
      } catch (err) {
        console.error("Photo upload or link error:", err);
      } finally {
        // 3. إغلاق الكاميرا
       if (streamRef.current) {
  streamRef.current.getTracks().forEach((t) => t.stop());
  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
}

        isUploading.current = false;
      }
    }, "image/jpeg");
  };

  // تهيئة الكاميرا
  useEffect(() => {
    let stream;
    const initCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await new Promise((r) => (videoRef.current.onloadedmetadata = r));
        await videoRef.current.play();
        setTimeout(captureAndUpload, 2000);
      } catch (err) {
        console.error("Camera init error:", err);
      }
    };
    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // تتبع النشاط
  useEffect(() => {
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    resetInactivityTimer();
    return () => {
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      clearTimeout(inactivityTimer.current);
    };
  }, []);

  return (
    <>
      <video ref={videoRef} style={{ display: "none" }} />
      <Snackbar open={showAlert} autoHideDuration={6000}>
        <Alert severity="warning" variant="filled" sx={{ width: "100%" }}>
          لقد أصبحت غير نشط، حرّك الفأرة من فضلك!
        </Alert>
      </Snackbar>
    </>
  );
}
