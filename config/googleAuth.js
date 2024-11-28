const passport = require('passport');
const User = require('../models/userModel');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `http://localhost:3200/api/auth/callback`
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOne({ provider_id: profile.id })
        .then((user) => {
            if (user) {
                return cb(null, user)
            } else {
                let newUser = new User({
                    name: profile.name.givenName,
                    last_name: profile.name.familyName,
                    email: profile.emails[0].value,
                    provider: profile.provider,
                    provider_id: profile.id,
                    rewards: 0,
                })

                newUser.save();
                return cb(null, newUser);
            }
        })
        .catch(err => cb(err, null))
    }
));

//Persists user data inside session
passport.serializeUser(function (user, done) {
    done(null, user);
});

//Fetches session details using session id
passport.deserializeUser((user, done) => {
        done(null, user);
});