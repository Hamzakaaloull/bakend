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
    try {
      await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: false }),
      });
    } catch (err) {
      console.error("Error setting inactive:", err);
    }
  };

  const setActive = async () => {
    if (!token || !userId) return;
    setShowAlert(false);
    try {
      await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: true }),
      });
    } catch (err) {
      console.error("Error setting active:", err);
    }
  };

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(setInactive, 30000);
    setActive();
  };

  // التقاط الصورة + رفعها + تحديث seance + إغلاق الكاميرا
  const captureAndUpload = async () => {
    if (!videoRef.current || isUploading.current || !sessionId) {
      console.warn("captureAndUpload: لا يمكن البدء، قد يكون videoRef.current غير موجود أو isUploading قيد المعالجة أو sessionId غير معرف");
      return;
    }

    isUploading.current = true;

    // 1. إنشاء canvas من الفريم الحالي
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // 2. تحويل الصورة إلى Blob ثم المعالجة
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("toBlob: لم يتم إنشاء blob من الـ canvas");
        isUploading.current = false;
        return;
      }

      try {
        // 3. تحضير FormData لرفع الملف
        const formData = new FormData();
        formData.append("files", blob, "user_photo.jpg");
        formData.append("ref", "api::seance.seance");
        formData.append("refId", sessionId);
        formData.append("field", "userPhoto");

        console.log("⏳ إرسال طلب الرفع إلى Strapi…");
        // 4. إرسال طلب الرفع إلى Strapi
        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        console.log(`→ استجابة Upload: status = ${uploadRes.status}`);
        let uploadData;
        try {
          uploadData = await uploadRes.json();
        } catch (parseErr) {
          console.error("خطأ في قراءة JSON من استجابة الرفع:", parseErr);
          throw new Error("لم يتمكن من قراءة استجابة الخادم (JSON).");
        }

        console.log("→ محتوى استجابة الرفع:", uploadData);

        // 5. التحقق من حالة الاستجابة قبل متابعة المعالجة
        if (!uploadRes.ok) {
          // في حالة خطأ (500 أو 400)، نحاول استخلاص رسالة الخطأ
          let errorMsg = `فشل رفع الصورة (status ${uploadRes.status}).`;
          if (uploadData.error?.message) {
            errorMsg = uploadData.error.message;
          }
          throw new Error(errorMsg);
        }

        // 6. استخراج معرّفات الملفات المرفوعة
        let uploadedIds = [];
        if (
          uploadData.data &&
          Array.isArray(uploadData.data) &&
          uploadData.data.length > 0
        ) {
          uploadedIds = uploadData.data.map((fileObj) => fileObj.id);
          console.log("✔️ تم استخراج معرّفات الملفات:", uploadedIds);
        } else {
          console.error("Unexpected uploadData format:", uploadData);
          throw new Error("تنسيق الاستجابة غير متوقع من الخادم عند استخراج المعرفات.");
        }

        // 7. ربط الملف بحقل userPhoto في seance
        console.log("⏳ إرسال طلب تحديث seance بمعرفات الصور…");
        const updateRes = await fetch(`${API_URL}/api/seances/${sessionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: { userPhoto: uploadedIds } }),
        });

        console.log(`→ استجابة Update Seance: status = ${updateRes.status}`);
        let updateData;
        try {
          updateData = await updateRes.json();
        } catch (_) {
          console.error("خطأ في قراءة JSON من استجابة التحديث:", _);
        }

        console.log("→ محتوى استجابة تحديث seance:", updateData);

        if (!updateRes.ok) {
          let updateErrMsg = `فشل تحديث الحصة (status ${updateRes.status}).`;
          if (updateData?.error?.message) {
            updateErrMsg = updateData.error.message;
          }
          throw new Error(updateErrMsg);
        }

        console.log("✅ تم تحديث الـ seance بمعرّفات الصور:", uploadedIds);
      } catch (err) {
        // يُمكنك هنا إظهار رسالة للمستخدم أو الاحتفاظ بالسجل في مكان آخر
        console.error("💥 خطأ أثناء رفع الصورة أو ربطها:", err.message);
      } finally {
        // 8. إغلاق الكاميرا بعد الانتهاء
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }
        isUploading.current = false;
      }
    }, "image/jpeg", 0.8);
  };

  // تهيئة الكاميرا عند التحميل الأولي
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
        // ننتظر ثانيتين قبل التقاط الصورة
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

  // تتبع نشاط المستخدم (ماوس + لوحة مفاتيح)
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
          لقد أصبحت غير نشط، حرك الفأرة من فضلك!
        </Alert>
      </Snackbar>
    </>
  );
}
