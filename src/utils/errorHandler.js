import { error } from "./response.js";

export default function internalServerError(err, req, res, next) {
  if (err) {
    console.log(err);
    return res.status(500).json({ ...error(500, "INTERNAL SERVER ERROR") });
  }
}
