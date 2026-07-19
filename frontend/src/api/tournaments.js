import api from "./axios";

export const getTournaments    = ()                        => api.get("/tournaments/");
export const getTournament     = (id)                      => api.get(`/tournaments/${id}/`);
export const createTournament  = (data)                    => api.post("/tournaments/", data);
export const updateTournament  = (id, data)                => api.patch(`/tournaments/${id}/`, data);
export const registerTeam      = (id, data)                => api.post(`/tournaments/${id}/register-team/`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const startTournament   = (id)                      => api.post(`/tournaments/${id}/start/`);
export const setWinner         = (id, matchId, winnerId)   => api.post(`/tournaments/${id}/matches/${matchId}/set-winner/`, { winner_id: winnerId });
export const swapTeams         = (id, data)                => api.post(`/tournaments/${id}/swap-teams/`, data);
export const deleteTeam        = (id, teamId)              => api.delete(`/tournaments/${id}/teams/${teamId}/delete/`);
export const addMember         = (id, teamId, playerId)    => api.post(`/tournaments/${id}/teams/${teamId}/add-member/`, { player_id: playerId });
export const removeMember      = (id, teamId, memberId)    => api.delete(`/tournaments/${id}/teams/${teamId}/members/${memberId}/remove/`);
export const getMessages       = (id)                      => api.get(`/tournaments/${id}/messages/`);
