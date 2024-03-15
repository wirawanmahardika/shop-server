import jwt from "jsonwebtoken";
import { error } from "../utils/response";

export default function jwtAuth(req, res, next) {
  let token = req.headers["authorization"];
  token = token && token.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ ...error(401, err.message) });

    req.jwtUser = user;
    return next();
  });
}
