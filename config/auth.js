const fs = require('fs');
const path = require('path');
require('dotenv').config();

const passport = require('passport');
const jwt = require('jsonwebtoken');

require('./passport');

const PRIV_KEY = process.env.PRIVATE_KEY;

function issueJWT(user) {
  const _id = user._id;

  const expiresIn = '1d';

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const signedToken = jwt.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });

  return {
    token: 'bearer ' + signedToken,
    expires: expiresIn,
  };
}

function issuePasswordJWT(user) {
  const _id = user._id;
  const email = user.email;

  const expiresIn = '1d';

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const signedToken = jwt.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });

  return {
    token: signedToken,
    expires: expiresIn,
  };
}

const requireAuth = (req, res, next) => {

  const token = req.cookies.jwt;

  if (token) {
      jwt.verify(token, PRIV_KEY, (err, decodedToken) => {
        if(err) {
          console.log(err.message);
          res.redirect('/login');
        } else {
          console.log(decodedToken);
          next();
        }
      })
  } else {
      res.redirect('/login');
  }
}

module.exports.issueJWT = issueJWT;
module.exports.issuePasswordJWT = issuePasswordJWT;
module.exports.requireAuth = requireAuth;
