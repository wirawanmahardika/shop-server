import { error } from "../utils/response.js";

export function verifyRole(req, res, next) {
  if (req.user.role === "admin") {
    return next();
  }

  return res.status(401).json({ ...error(401, "Anda tidak memiliki izin") });
}
