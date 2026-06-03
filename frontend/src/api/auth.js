import api from "./axios";

export const getCsrfToken = () => api.get("/accounts/csrf/");
export const login        = (username, password) => api.post("/accounts/login/",  { username, password });
export const logout       = ()                   => api.post("/accounts/logout/");
export const getMe        = ()                   => api.get("/accounts/me/");
