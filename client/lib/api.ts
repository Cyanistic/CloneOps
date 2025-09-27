import { Api } from "../Api";

export const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:6969"
    : "";

export const API = new Api({
  baseUrl: BASE_URL,
  baseApiParams:
    process.env.NODE_ENV === "development"
      ? { credentials: "include" }
      : {},
});
