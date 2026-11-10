import axios from "axios";

// Ndrysho këtë path që të përputhet me folderin tënd në XAMPP htdocs.
// P.sh. nëse backend-i është në C:\xampp\htdocs\jobconnect\backend
const api = axios.create({
  baseURL: "http://localhost/jobconnect/backend/api",
});

// Shto automatikisht token-in e ruajtur në localStorage në çdo kërkesë
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Nëse serveri kthen 401, çkyç përdoruesin automatikisht
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
