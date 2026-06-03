import api from "./axios";

export const getSideQuests      = (status)  => api.get("/sidequests/", { params: status ? { status } : {} });
export const getSideQuest       = (id)      => api.get(`/sidequests/${id}/`);
export const submitSideQuest    = (data)    => api.post("/sidequests/submit/", data, { headers: { "Content-Type": "multipart/form-data" } });
export const submitCompletion   = (id, data) => api.post(`/sidequests/${id}/submit-completion/`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const approveSideQuest   = (id)      => api.post(`/sidequests/${id}/approve/`);
export const declineSideQuest   = (id)      => api.post(`/sidequests/${id}/decline/`);
export const completeSideQuest  = (id)      => api.post(`/sidequests/${id}/complete/`);
export const updateSideQuest    = (id, data) => api.patch(`/sidequests/${id}/`, data);
