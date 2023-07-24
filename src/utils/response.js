import { Prisma } from "@prisma/client";

export const success = (description, code) => {
  return {
    code: code || 200,
    message: "OK",
    description,
  };
};

export const error = (code, description) => {
  return {
    code,
    message: "NOT OK",
    description,
  };
};

export function prismaErrorResponse(res, err) {
  if (!err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(500).json({ ...error(500, "INTERNAL SERVER ERROR") });
  }

  switch (err.code) {
    case "P2002":
      return res.status(403).json({
        ...error(403, `${err.meta.target.split("_")[1]} already exist`),
      });
    case "P2003":
      return res.status(403).json({
        ...error(
          403,
          "Failed to delete, there is a data that connect with current target"
        ),
      });
    case "P2004":
      return res.status(403).json({ ...error(403, "Action failed") });
    case "P2005":
      return res.status(403).json({ ...error(403, "Invalid data type") });
    case "P2006":
      return res.status(403).json({ ...error(403, "Invalid value") });
    case "P2007":
      return res.status(403).json({ ...error(403, "Invalid value") });
    case "P2008":
      return res.status(403).json({ ...error(403, "Failed to get data") });
    case "P2009":
      return res.status(403).json({ ...error(403, "Query Failed") });
    case "P2010":
      return res.status(403).json({ ...error(403, "Query failed") });
    case "P2011":
      return res.status(403).json({ ...error(403, "Action Failed") });
    case "P2012":
      return res.status(403).json({ ...error(403, "Missing require Value") });
    case "P2013":
      return res.status(403).json({ ...error(403, "Missing require value") });
    case "P2014":
      return res
        .status(403)
        .json({ ...error(403, "Action failed because data would be violate") });
    case "P2015":
      return res.status(404).json({ ...error(404, "File not found") });
    case "P2016":
      return res.status(403).json({ ...error(403, "Query error") });
    case "P2017":
      return res.status(403).json({ ...error(403, "Query error") });
    case "P2018":
      return res.status(404).json({ ...error(404, "File not found") });
    case "P2019":
      return res.status(403).json({ ...error(403, "Input error") });
    case "P2020":
      return res.status(403).json({
        ...error(403, "The value is too big for the allocated memory"),
      });
    case "P2021":
      return res.status(404).json({ ...error(404, "File Not Found") });
    case "P2022":
      return res.status(404).json({ ...error(404, "File Not Found") });
    case "P2023":
      return res.status(403).json({ ...error(403, "Action failed") });
    case "P2024":
      return res.status(403).json({ ...error(403, "Timed Out") });
    case "P2025":
      return res.status(404).json({ ...error(404, "File not found") });
    case "P2030":
      return res.status(404).json({ ...error(404, "File Not Found") });
    case "P2033":
      return res.status(403).json({
        ...error(403, "The value is too big for the allocated memory"),
      });
    case "P2034":
      return res.status(403).json({ ...error(403, "Action failed") });
    default:
      if (error.code && parseInt(err.code.split("P")[1]) > 2034) {
        return res.status(400).json({ ...error(400, "Action Failed") });
      }
      return res.status(500).json({ ...error(500, "INTERNAL SERVER ERROR") });
  }
}
