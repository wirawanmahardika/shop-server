import bcrypt from "bcrypt";
import { Strategy } from "passport-local";
import { User } from "../app/database.js";
import { error } from "../utils/response.js";

export function initializePassport(passport) {
  passport.use(
    new Strategy(
      { usernameField: "username" },
      async (username, password, done) => {
        const userRecord = await User.findOne({ where: { username } });
        const user = userRecord ? userRecord.toJSON() : null;

        if (!user) {
          return done(
            { ...error(401, "Username tidak terdaftar"), place: "username" },
            false
          );
        }

        if (!(await bcrypt.compare(password, user.password))) {
          return done(
            { ...error(401, "Password invalid"), place: "password" },
            false
          );
        }

        return done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const userRecord = await User.findOne({
        where: { id: id },
      });

      if (!userRecord) {
        return done(
          {
            ...error(401, "Riwayat login anda tidak tersedia atau telah habis"),
          },
          false
        );
      }
      const user = userRecord.toJSON();
      delete user.password;
      return done(null, user);
    } catch (err) {
      console.log(err);
      throw new Error("INTERNAL SERVER ERROR");
    }
  });
}
