import api from "./axios";

export const getLeaderboard = (limit = 50) => api.get("/leaderboard/", { params: { limit } });
