import api from "./axios";

export const getLeaderboard = (limit = 500) => api.get("/leaderboard/", {params: {limit}});
