const createError = require('http-errors');
var http = require('http');
const express = require('express');
const path = require('path');
const logger = require('morgan');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const cors = require('cors');
const MongoStore = require('connect-mongo');
require('./config/mongoConfig');
const bodyParser = require('body-parser');
const orderController = require('./controllers/orderController');
const { Server } = require('socket.io');
const Order = require('./models/ordersModel');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const api = require('./routes/api');
const adminApi = require('./routes/adminApi');

const app = express();

/// GLOBAL OBJECT TO PASSPORT TOKEN CONFIG ///
//require('./config/passport')(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Stripe Set Up
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

// Match the raw body to content type application/json
const endpointSecret = 'whsec_6a833f95cc61fa1b4ae5a67303a669525b74e8ac668ab1c553905fcc29ec2124'

app.post('/webhook', bodyParser.raw({type: 'application/json'}), async (request, response) => {
  const payload = request.body;
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (
    event.type === 'checkout.session.completed'
    || event.type === 'checkout.session.async_payment_succeeded'
  ) {
    orderController.order_fulfillCheckout_post(event.data.object.id);
  }

  response.status(200).end();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// CORS Config
app.use(cors({
  origin: ["http://localhost:3000","https://danielb94.github.io/los-roques-restaurant/"],
  credentials: true
}));

// Cookie Handler
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({mongoUrl: process.env.MONGODB_KEY
    , collectionName: 'sessions'}),
    cookie: { maxAge: 1000 * 60 * 24 * 24, secure : false, httpOnly: true}
  }));
  
  require('./config/googleAuth');
  require('./config/facebookAuth');
  app.use(passport.initialize());
  app.use(passport.session());
  
  app.use('/api', api);
  app.use('/adminApi', adminApi);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
