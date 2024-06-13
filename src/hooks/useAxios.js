import { config } from "@fortawesome/fontawesome-svg-core";
import axios from "axios";
import { AuthProvider } from "./authProvider";

export function useAxios() {
  var headers = sessionStorage.getItem("token")
    ? { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    : {};

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API,
    headers: headers,
  });
  axiosInstance.interceptors.request.use((config) => {
    config.headers["Authorization"] = headers.Authorization;
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response.data, // Gère la réponse réussie
    (error) => {
      // Gère les erreurs de réponse
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        // Gérer les erreurs spécifiques ici
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error("No response received:", error.request);
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error("Request setup error:", error.message);
      }
      // Renvoie une promesse rejetée pour propager l'erreur
      return Promise.reject(error);
    }
  );

  return axiosInstance;
}
