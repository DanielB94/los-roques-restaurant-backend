const fs = require('fs');
const path = require('path');
const passportJwt = require('passport-jwt');
const Admin = require('../models/adminModel');

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

const pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256'],
};

const strategy = new JwtStrategy(options, (payload, done) => {
  Admin.findOne({ _id: payload.sub })
    .then((user) => {
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    })
    .catch((err) => done(err, null));
});
module.exports = (passport) => {
  passport.use(strategy);
};
