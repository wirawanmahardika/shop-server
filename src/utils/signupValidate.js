import zxcvbn from "zxcvbn";
import { error } from "./response.js";
import emailValidator from "email-validator";

export function signupValidate(req, res, next) {
  const { username, password, email, ...data } = req.body;

  if (!emailValidator.validate(email)) {
    return res
      .status(403)
      .json({ ...error(403, "Email is not valid"), place: "email" });
  }

  if (username.length < 6) {
    return res.status(403).json({
      ...error(403, "Username Character shouldn't be less than 6"),
      place: "username",
    });
  }
  if (username.length > 20) {
    return res.status(403).json({
      ...error(403, "Username Character shouldn't be higher than 20"),
      place: "username",
    });
  }

  const passwordTestResult = zxcvbn(password);

  if (passwordTestResult.score < 3) {
    return res.status(403).json({
      ...error(403, "Password strength error"),
      passwordStrengthLevel: passwordTestResult.score,
      warning: passwordTestResult.feedback.warning || "bad password",
      suggestions: passwordTestResult.feedback.suggestions,
      place: "password",
    });
  }

  return next();
}
