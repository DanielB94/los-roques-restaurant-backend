const bcrypt = require('bcryptjs');
const { body, validationResult } = require("express-validator");
const Admin = require('../models/adminModel');
const auth = require('../config/auth');

// --- USER CREATE --- //
exports.user_create_post = [
    // Validate and sanitize fields.
    body('name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isAlpha()
    .withMessage('First name must not have numerics values.'),
    body('last_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Last name must be specified.')
    .isAlpha()
    .withMessage('Last name name must not have numerics values.'),
    body('email')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('E-mail must be specified.')
    .custom(
        (value) => {
            return Admin.findOne({ email: value }).then((user) => {
                if (user) {
                    return Promise.reject('E-mail already in use');
                }
            });
        },
        (req, res) => {
            // Handle the request
            console.log(req.body)
        },
      ),
    body('password')
      .trim()
      .isLength({ min: 6 })
      .escape()
      .withMessage('Password must be at least 6 characters long.'),
    body('confirm_password')
      .trim()
      .isLength()
      .escape()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        // Indicates the success of this synchronous custom validator
        return true;
      }),
    // Process request after validation and sanitization
    (req, res, next) => {
      // Extrac the validation error from a request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.status(400).json({
          user: req.body,
          errors: errors.array(),
        });
        return;
      }
      // Data from Form is valid.
      // Create an Author object with escaped and trimmed data.
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        // if err, do something
        if (err) {
          next(err);
        }
        console.log(req.body);
        // otherwise, store hashedPassword in DB
        const user = new Admin({
          name: req.body.name,
          last_name: req.body.last_name,
          email: req.body.email,
          password: hashedPassword,
          confirm_password: hashedPassword,
          gender: req.body.gender,
        }).save()
          .then((user) => {
            const jwt =auth.issueJWT(user);
            res.cookie('token', jwt);
            res.status(200).json({ success: true, token: jwt.token, expiresIn: jwt.expiresIn, info: user});
          })
          .catch((err) => res.status(500).json({ message: 'Something went wrong with the server'}));
      });
    },
  ];