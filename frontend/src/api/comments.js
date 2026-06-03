import api from "./axios";

export const getComments  = (model, objectId) => api.get("/comments/", { params: { model, object_id: objectId } });
export const postComment  = (data)             => api.post("/comments/", data);
