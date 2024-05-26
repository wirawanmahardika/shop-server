import express from "express";
import session from "express-session";
import passport from "passport";
import { initializePassport } from "./configs/passport.js";
import cors from "cors";
import helmet from "helmet";
import internalServerError from "./middleware/errorHandler.js";
import usersRoutes from "./routes/users-routes.js";
import categoriesRoutes from "./routes/categories-routes.js";
import brandsRoutes from "./routes/brands-routes.js";
import itemsRoutes from "./routes/items-routes.js";
import previewRoutes from "./routes/preview-routes.js";
import penjualanRoutes from "./routes/penjualan-routes.js";
import sessionStoreMysql from "./configs/session.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// helmet digunakan untuk security terutama pada Content-Security-Policy
app.use(helmet({ crossOriginResourcePolicy: false }));
// Memparsing request body yang content-type = application/json menjadi sebuah object
app.use(express.json());
// pengaturan cors untuk keamanan cors agar mencegah XSS
app.use(
  cors({
    credentials: true,
    origin: [
      // "https://wirawan.my.id",
      "http://localhost:5173",
      "http://localhost:5174",
      // "http://localhost:3000",
      // "http://localhost:5500",
    ],
    methods: ["PUT", "POST", "PATCH", "DELETE"],
  })
);
// session digunakan untuk menyimpan riwayat sementara user
app.use(
  session({
    secret: process.env.COOKIE_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStoreMysql(session),
    cookie: {
      maxAge: 1000 * 3600 * 24 * 4,
      sameSite: "strict",
      path: "/",
      httpOnly: true,
      signed: true,
    },
  })
);
// static file untuk public
app.use(express.static("public"));
// konfigurasi passport
app.use(passport.initialize());
app.use(passport.session());
initializePassport(passport);

// api untuk routes users, semua aksi yang berkaitan dengan user dihandle di route ini
app.use("/api/users", usersRoutes);
// api untuk routes category, semua aksi yang berkaitan dengan category dihandle di route ini
app.use("/api/category", categoriesRoutes);
// api untuk routes brand, semua aksi yang berkaitan dengan brand dihandle di route ini
app.use("/api/brands", brandsRoutes);
// api untuk routes items/barang, semua aksi yang berkaitan dengan items/barang dihandle di route ini
app.use("/api/items", itemsRoutes);

app.use("/api/penjualan", penjualanRoutes);

app.use("/api/preview", previewRoutes);
// UI
// app.get("*", (req, res) => {
//     const pathOfUIHTML = path.resolve("public", "index.html");
//     res.sendFile(pathOfUIHTML);
//     res.send()
// });

// disini adalah route yang menjadi jalan terakhir jika suatu error yang tidak diketahui terjadi
// route ini untuk berjaga-jaga jika terjadi error, server tidak mati karena terdapat error yang tidak dihandle
app.use(internalServerError);
export default app;
