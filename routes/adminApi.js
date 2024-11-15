const express = require('express');
const bcrypt = require('bcryptjs');
const userController = require('../controllers/userController');
const menuController = require('../controllers/menuController');
const orderController = require('../controllers/orderController');
const adminController = require('../controllers/adminController');
const passport = require('passport');
const Admin = require('../models/adminModel');
const fs = require('fs');
const path = require('path');
const auth = require('../config/auth');

const router = express.Router();

// --- USER LOGIN --- //
router.post('/adminLog', (req, res, next) => {
    Admin.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          res.status(401).json({ success: false, msg: 'Could not find user' });
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (result) {
            console.log(req.user)
            const tokenObject = auth.issueJWT(user);
            res.status(200)
            .json({ success: true, info: user, jwt: tokenObject});
          } else {
            res.status(401).json({ success: false, msg: 'You entered the wrong password' });
          }
        });
      })
      .catch((err) => {
        next(err);
      });
  });

  const authorization = passport.authenticate('jwt', {session: false});

/// USER ROUTES ///
router.post('/create-user', adminController.user_create_post);

router.get('/rewards', authorization, userController.user_profile_get);

router.post('/update-user/:id', authorization, userController.user_update_post);

router.post('/delete-user/:id', authorization, userController.user_delete_post);

/// MENU ROUTES ///

router.post('/create-menu-item', authorization, menuController.item_create_post);

router.post('/menu-item-delete/:id', authorization, menuController.delete_item_post);

router.post('/update-status', authorization, menuController.update_status_post);

/// ORDER ROUTES ///

router.get('/get-order', authorization, orderController.order_get_orders_get);

router.post('/get-order', authorization, orderController.order_get_orders_update);

router.post('/delete-order/:id', authorization, orderController.order_delete_order_post);

router.get('/order/success', authorization, orderController.order_get_orders_get);

module.exports = router;
