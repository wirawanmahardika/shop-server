import { error } from "../utils/response.js";

export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res
    .status(401)
    .json({ ...error(401, "Anda harus login terlebih dahulu") });
}

export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.status(403).json({ ...error(403, "Anda sudah pernah login") });
  }
  return next();
}
