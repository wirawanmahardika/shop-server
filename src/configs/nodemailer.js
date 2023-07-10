import nodemailer from "nodemailer";

export function createTransporter() {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "julio.kling19@ethereal.email",
      pass: "5bGAcRcHQxwsvq9ABT",
    },
  });

  return transporter;
}
