import api from "./axios";

export const getMatches    = (status)  => api.get("/matches/", { params: status ? { status } : {} });
export const getMatch      = (id)      => api.get(`/matches/${id}/`);
export const submitMatch   = (data)    => api.post("/matches/submit/", data, { headers: { "Content-Type": "multipart/form-data" } });
export const approveMatch  = (id)      => api.post(`/matches/${id}/approve/`);
export const declineMatch  = (id)      => api.post(`/matches/${id}/decline/`);
export const updateMatch   = (id, data) => api.patch(`/matches/${id}/`, data);
