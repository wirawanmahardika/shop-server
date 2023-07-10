import bcrypt from "bcrypt";
import { Strategy } from "passport-local";
import { prisma } from "../database/prisma-client.js";
import { error } from "../utils/response.js";

export function initializePassport(passport) {
  passport.use(
    new Strategy(
      { usernameField: "username" },
      async (username, password, done) => {
        const user = await prisma.users.findFirst({ where: { username } });

        if (!user) {
          return done({ ...error(401, "Username tidak terdaftar") }, false);
        }

        if (!(await bcrypt.compare(password, user.password))) {
          return done({ ...error(401, "Password invalid") }, false);
        }

        return done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.users.findUnique({
        where: { id: id },
      });

      if (!user) {
        return done(
          {
            ...error(401, "Riwayat login anda tidak tersedia atau telah habis"),
          },
          false
        );
      }
      delete user.password;
      return done(null, user);
    } catch (err) {
      console.log(err);
      throw new Error("INTERNAL SERVER ERROR");
    }
  });
}


