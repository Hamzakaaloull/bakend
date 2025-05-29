// hooks/useUser.js
"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export default function useUser() {
  const [userData, setUserData] = useState(null);
  const [myData, setMyData] = useState(null);
  const [brigades, setBrigades] = useState([]);
  const [roles, setRoles] = useState([]);
  const [salles, setSalles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!token) {
      setError("No token");
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        const [
          allUsersRes,
          meRes,
          brigadesRes,
          rolesRes,
          sallesRes,
          coursesRes,
        ] = await Promise.all([
          axios.get(
            `${API}/api/users?populate[role]=*&populate[user_status]=*`,
            { headers: authHeader }
          ),
          axios.get(
            `${API}/api/users/me?populate[role]=*&populate[imgProfile]=*&populate[user_status]=*`,
            { headers: authHeader }
          ),
          axios.get(`${API}/api/brigades?populate=*`, { headers: authHeader }),
          axios.get(`${API}/api/users-permissions/roles`, {
            headers: authHeader,
          }),
          axios.get(`${API}/api/salles`, { headers: authHeader }),
          axios.get(`${API}/api/courss?populate=*`, {
            headers: authHeader,
          }),
        ]);

        setUserData(allUsersRes.data);
        setMyData(meRes.data);
        setBrigades(brigadesRes.data);
        setRoles(rolesRes.data);
        setSalles(sallesRes.data);
        setCourses(coursesRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const register = useCallback(async (userInfo) => {
    const res = await axios.post(`${API}/api/auth/local/register`, userInfo);
    return res.data;
  }, []);

  const fetchUserById = useCallback(
    async (id) => {
      const res = await axios.get(`${API}/api/users/${id}`, {
        headers: authHeader,
      });
      return res.data;
    },
    [authHeader]
  );

  return {
    userData,
    myData,
    setMyData,       
    brigades,
    roles,
    salles,
    courses,
    loading,
    error,
    register,
    fetchUserById,
  };
}
