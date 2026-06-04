import api from "./axios";

// Public — active players only (paginated list for directory)
export const getPlayers = () => api.get("/players/", {params: {page_size: 500}});
// Fetch ALL active players unpaginated — for dropdowns/selects
export const getAllActivePlayers = () => api.get("/players/", {params: {page_size: 500}});
export const getPlayer = (id) => api.get(`/players/${id}/`);
export const getPlayerProfile = (id) => api.get(`/players/${id}/profile/`);

// Admin — all players including inactive
export const getAllPlayers = () => api.get("/players/all/", {params: {page_size: 500}});

export const createPlayer = (data) => api.post("/players/", data, {headers: {"Content-Type": "multipart/form-data"}});
export const updatePlayer = (id, data) => api.patch(`/players/${id}/`, data, {headers: {"Content-Type": "multipart/form-data"}});
