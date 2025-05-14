import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User.js"; // Fixed: Add .js extension
import { ConfigENV } from "./index.js";

//local strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "Incorrect Email! :-:" });
        }

        const IsMatch = await user.comparePassword(password);

        if (!IsMatch) {
          return done(null, false, { message: "Incorrect Password :-:" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ConfigENV.JWT_SECRET_ACCESS_TOKEN,
};

//jwt strategy
passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

//Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: ConfigENV.GOOGLE_CLIENT_ID,
      clientSecret: ConfigENV.GOOGLE_CLIENT_SECRET,
      callbackURL: ConfigENV.GOOGLE_CALLBACK,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Update existing user with Google ID
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: ConfigENV.FACEBOOK_CLIENT_ID,
      clientSecret: ConfigENV.FACEBOOK_CLIENT_SECRET,
      callbackURL: ConfigENV.FACEBOOK_CALLBACK,
      profileFields: ["id", "displayName", "photos", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with Facebook ID
        let user = await User.findOne({ facebookId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if we have an email from Facebook
        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (email) {
          // Check if user exists with the same email
          user = await User.findOne({ email });

          if (user) {
            // Update existing user with Facebook ID
            user.facebookId = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: email || `fb_${profile.id}@placeholder.com`, // Use email or create placeholder
          facebookId: profile.id,
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
