import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Users
export const getAllUsers = () => API.get("/users");
export const createUser = (data) => API.post("/users", data);
export const getUser = (id) => API.get(`/users/${id}`);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// Workouts
export const createWorkout = (data) => API.post("/workouts", data);
export const getWorkouts = (userId) => API.get(`/workouts/${userId}`);
export const deleteWorkout = (id) => API.delete(`/workouts/byid/${id}`);

// PRs
export const getPRs = (userId) => API.get(`/prs/${userId}`);

// Exercises
export const getExercises = () => API.get("/exercises");
export const getExerciseLibrary = (userId) => API.get(`/exercises/library/${userId}`);
export const addGlobalExercise = (data) => API.post("/exercises", data);
export const addUserCustomExercise = (userId, data) => API.post(`/exercises/custom/${userId}`, data);
export const deleteUserCustomExercise = (userId, exerciseId) => API.delete(`/exercises/custom/${userId}/${exerciseId}`);
export const deleteGlobalExercise = (id) => API.delete(`/exercises/${id}`);

// Templates
export const getTemplateLibrary = (userId) => API.get(`/templates/library/${userId}`);
export const getGlobalTemplates = () => API.get("/templates/global");
export const getUserTemplates = (userId) => API.get(`/templates/${userId}`);
export const getTemplate = (id) => API.get(`/templates/byid/${id}`);
export const createTemplate = (data) => API.post("/templates", data);
export const deleteTemplate = (id) => API.delete(`/templates/${id}`);
