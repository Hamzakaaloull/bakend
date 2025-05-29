// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export async function fetchAPI(path) {
  const url = `${API_URL}${path}`;
  console.log("Fetching:", url);
  const res = await fetch(url);
  if (!res.ok) {
    console.error("API fetch error:", res.statusText);
    throw new Error(`API error: ${res.statusText}`);
  }
  const data = await res.json();
  console.log("API data:", data);
  return data;
}
