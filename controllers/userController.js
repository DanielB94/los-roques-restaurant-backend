const bcrypt = require('bcryptjs');
const { body, validationResult } = require("express-validator");
const User = require('../models/userModel');
const auth = require('../config/auth');
const sendEmail = require('./utils/email');

  exports.user_profile_get = (req, res, next) => {
    if (req.isAuthenticated) {
      User.findById(req.user._id)
      .then((result) => {
        res.status(200).json({ user: result, errors: [] });
    })
    .catch((err) => next(err));
  } else {
      res.status(401).json({success: false, message: 'Inicia sesion'})
  }
  };

  exports.user_profile_update = () => {

  };

  // --- USER DELETE --- //
exports.user_delete_post = (req, res, next) => {
  User.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => next(err));
};

// --- USER UPDATE --- //
exports.user_update_post = [
  // validate and sanitize data.
  body('password')
    .trim()
    .isLength({ min: 6 })
    .escape()
    .withMessage('Password must be at least 8 characters long'),
  body('confirm_password')
    .trim()
    .isLength({ min: 6 })
    .escape()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      // Indicates the success of this synchronous custom validator
      return true;
    }),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation error from a request.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.json({
        user: req.body,
        errors: errors.array(),
      });
      return;
    }// Data from Form is valid.
    
    console.log(req.params);
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      // if err, do something
      if (err) {
        next(err);
      }
      console.log(req.body);
      // otherwise, store hashedPassword in DB
      User.findByIdAndUpdate(req.params.id, {password: hashedPassword, confirm_password: hashedPassword}, {new: true})
        .then((theuser) => {
          console.log(theuser);
        })
        .catch((err) => next(err));
    });
  },
];

exports.forgot_password_post = async (req, res, next) => {
  // 1.- Get the user based on posted email
    const user = User.findOne({email: req.body.email});
    
      if(!user) {
        console.log('not');
        throw new Error('We could not find the user with given email, 404');
      
      } else {
        console.log(user)
        // 2.- Generate a random reset token
        const jwtPassword =auth.issuePasswordJWT(user);
        res.status(200).json({ success: true, token: jwtPassword.token, expiresIn: jwtPassword.expiresIn });
        
        // 3.- Send the token back to the user email
        const resetUrl = `${req.protocol}://${process.env.FRONTEND_HOST}/api/resetPassword/${jwtPassword.token}`;
        
          const message = `Hemos recibido una solicitud de cambio de contrasena\n\n <a>${resetUrl}<a/> sera valido solo por 10 minutos`
          await sendEmail({
            email: user._conditions.email,
            subject: 'Cambio de contrasena',
            message: message
          });
      }}
      

exports.reset_password_post = (req, res, next) => {

}

// --- PHONE USER UPDATE --- //
exports.user_update_phone_post = (req, res, next) => {

  if (req.isAuthenticated) {
    console.log(req.body);
    
    // otherwise, store Phone in DB
    User.findByIdAndUpdate(req.body.user_id, {phone: req.body.phone}, {new: true})
      .then((theuser) => {
        res.status(200).json({succeed: true})
        console.log(theuser, 'theuser');
      })
      .catch((err) => res.json({err: err}));
  } else {
    res.status(401).json({message: 'You are not authorized'});
  }
      
  }
/// 113030626382697314778 ///