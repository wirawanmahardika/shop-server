import winston from "winston";
import "winston-daily-rotate-file";

const errorTransport = new winston.transports.DailyRotateFile({
  filename: "error-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  dirname: "log",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "error",
});

const logger = winston.createLogger({
  transports: [errorTransport],
});

export default logger;
