const passport = require('passport');
const User = require('../models/userModel');
const FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: process.env.FACE_ID,
    clientSecret: process.env.FACE_SECRET,
    callbackURL: `${process.env.BACKEND_HOST}api/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'photos', 'email']
},
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        User.findOne({ provider_id: profile.id })
        .then((user) => {
            if (user) {
                return cb(null, user)
            } else {
                let newUser = new User({
                    name: profile.displayName,
                    last_name: false,
                    email: false,
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