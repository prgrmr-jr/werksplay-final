import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  xsrfCookieName: "csrftoken",       // Django's default CSRF cookie name
  xsrfHeaderName: "X-CSRFToken",     // Django reads the token from this header
});

/**
 * Request interceptor — reads the csrftoken cookie and injects it as
 * X-CSRFToken on every mutating request (POST, PUT, PATCH, DELETE).
 * This is needed because Vite proxies the API, so axios can't rely on
 * the automatic xsrf handling (which only works for same-origin).
 */
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const token = getCookie("csrftoken");
    if (token) {
      config.headers["X-CSRFToken"] = token;
    }
  }
  return config;
});

export default api;
