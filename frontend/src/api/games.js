import api from "./axios";

// Returns all active games — used in dropdowns, always fetch full list
export const getGames  = () => api.get("/games/", { params: { page_size: 500 } });
export const createGame = (data) => api.post("/games/", data);
export const updateGame = (id, data) => api.patch(`/games/${id}/`, data);
