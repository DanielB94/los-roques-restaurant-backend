const passport = require('passport');
const express = require('express');
const bcrypt = require('bcryptjs');
const userController = require('../controllers/userController');
const menuController = require('../controllers/menuController');
const orderController = require('../controllers/orderController')
const User = require('../models/userModel');
require('dotenv').config();
require('../config/googleAuth');
require('../config/facebookAuth');

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

const fs = require('fs');
const path = require('path');

const router = express.Router();

/// GOOGLE STRATEGY ///

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/callback',
  passport.authenticate('google', {
    successRedirect: `http://localhost:3000/rewards`,
    failureRedirect: `http://localhost:300/unauthorized`}));

/// FACEBOOK STRATEGY ///

  router.get('/auth/facebook',
    passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: `${process.env.FRONTEND_HOST}rewards`,
    failureRedirect: `${process.env.FRONTEND_HOST}unauthorized`}));

/// SUCCEESS ROUTE ///
  
  router.get('/login/success', (req, res) => {
    if (req.isAuthenticated) {
    res.status(200).json({
      info: req.user
    })  
  } else {
    res.status(401).redirect(`${process.env.FRONTEND_HOST}login`);
  }
  });

/// LOGOUT SESSION ///
  router.post('/logout', (req, res) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.status(200).json({success: true});
    });
})

/// STRIPE CONFIG ///
router.get('/stripeConfig', (req, res) => {
  res.send({
    publishableKEY: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

/// USER ROUTES ///

router.get('/rewards', userController.user_profile_get);

router.post('/phoneNumber', userController.user_update_phone_post);

// router.post('/forgotPassword', userController.forgot_password_post);

// router.patch('/resetPassword:token', userController.reset_password_post);



/// MENU ROUTES ///

router.get('/menu-items', menuController.item_list);

router.post('/menu-item-category', menuController.item_list_category);

/// router.get('/menu-item-detail/:id', menuController.item_details_get);



/// ORDERS ROUTES ///

router.post('/create-order', orderController.order_create_post);

router.get('/order-details/:id', orderController.order_get_details);

router.get('/order/success', async (req, res) => {
  const session_id = req.query.session_id;
  
  orderController.order_fulfillCheckout_post(session_id);
  
});



module.exports = router;