import { UniqueConstraintError, ForeignKeyConstraintError, ValidationError } from "sequelize";

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

export class sequelizeTransactionErrorHandler extends Error {
  constructor(message) {
    super(message);
    this.name = "Sequelize error transaction";
    this.errorAt = "sequelize";
  }
}

export const prismaTransactionErrorHandler = sequelizeTransactionErrorHandler;

export function sequelizeErrorResponse(res, err) {
  if (err instanceof UniqueConstraintError) {
    const field = err.errors && err.errors[0] ? err.errors[0].path : "field";
    return res.status(403).json({
      ...error(403, `${field} already exist`),
    });
  }

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(403).json({
      ...error(
        403,
        "Failed to delete, there is a data that connect with current target"
      ),
    });
  }

  if (err instanceof ValidationError) {
    return res.status(403).json({
      ...error(403, err.message || "Validation error"),
    });
  }

  return res.status(500).json({ ...error(500, "INTERNAL SERVER ERROR") });
}

export const prismaErrorResponse = sequelizeErrorResponse;
