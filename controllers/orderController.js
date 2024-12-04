const User = require('../models/userModel');
const Order = require('../models/ordersModel');
const MenuItem = require('../models/menuModel');
const { initializeSocket, io } = require('../config/socketConfig');

const twilio = require('twilio');
const Stripe = require('stripe');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

exports.order_create_post = async (req,res,next) => {

  try {

/// IF USER IS AUTHENTICATED PROCeED WITH OPERATION ///
    if (req.isAuthenticated) {

    let session;
    let maxReward;
    let convertToCents = 100;

/// MAKE SURE THAT REWARDS DOES NOT GO OVER $20 ///
    if (req.body.cart_rewards >= 20) {
      maxReward = 20 * convertToCents
    } else {
      maxReward = req.body.user_rewards * convertToCents
    }

/// IF THERE IS ANY REWARDS APPLY A COUPON IF ITS NOT MAKE PAYMENT WITHUT COUPON ///
    if (req.body.rewards === true) {
       const coupon = await stripe.coupons.create({
        amount_off: maxReward,
        currency: 'usd',
        duration: 'once',
      });

      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        ui_mode: 'embedded',
        line_items: req.body.cart.map(item => {
    
          const cartItem = MenuItem.findById(item.id);
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name
              },
              unit_amount: item.priceInCents
            },
            quantity: item.quantity
          }
        }),
        discounts: [{
          coupon: coupon.id,
        },],
        success_url: `${process.env.FRONTEND_HOST}order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_HOST}failed`,
      });
      console.log('from discount');
        res.send({clientSecret: session.client_secret});
    } else {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        ui_mode: 'embedded',
        line_items: req.body.cart.map(item => {
    
          const cartItem = MenuItem.findById(item.id);
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name
              },
              unit_amount: item.priceInCents
            },
            quantity: item.quantity
          }
        }),
        success_url: `${process.env.FRONTEND_HOST}order/success?session_id={CHECKOUT_SESSION_ID}`,
        return_url: `${process.env.FRONTEND_HOST}order/success?session_id={CHECKOUT_SESSION_ID}`,
        
      });
      console.log('from no discount')
    }
      
/// CREATING AN ORDER TO DATABASE ///
      const items = req.body.cart.map(item => {
        return {
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          priceInCents: item.priceInCents,
          mods: item.mods
      }})

      const order = new Order({
        client: req.body.client,
        client_name: req.body.client_name,
        cart: items,
        address: req.body.address,
        payment_id: session.id,
        status: false,
        paid: false,
        subTotal: req.body.subTotal,
        totalProducts: req.body.totalProducts,
        totalTaxes: req.body.totalTaxes,
        total: req.body.total,
        cart_rewards: req.body.cart_rewards
      })
      
      order.save();

/// UPDATING ORDER ARRAY ON USER COLLECTION ///
      const result = await User.findByIdAndUpdate(req.body.client, { $push: { orders: order._id} }, {new: true});

        res.status(200).json({client_secret: session.client_secret, order: order, result: result});
        } else {
          res.status(401).json({succeed: false, message: 'Inicia sesion para comprar'});
        }
        } catch (err) {
      console.log(err)
          res.status(500).json({succeed: false, message: 'Algo ha salido mal en el servidor'});
        };
      }

exports.order_fulfillCheckout_post = async (sessionId) => {
      
        console.log('Fulfilling Checkout Session ' + sessionId);
        try {

          const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'],
          });
          // TODO: Make this function safe to run multiple times,
          // even concurrently, with the same session ID
          const paidStatus = Order.findOne({payment_id: sessionId})
          // TODO: Make sure fulfillment hasn't already been
          // peformed for this Checkout Session
          if (paidStatus.paid === true) {
            console.log('this session has been already proccesed');
            return null;
          } else {
            if (checkoutSession.payment_status !== 'unpaid') {
              // TODO: Perform fulfillment of the line items
              const order =  await Order.findOneAndUpdate({payment_id: sessionId}, {paid:  true}, {new: true});

              
              let reward;
              const user = await User.findById(order.client);
              if (checkoutSession.total_details.amount_discount !== 0) {
                reward = order.cart_rewards;
              } else {
                if (user.rewards >= 20) {
                  reward = 20
                } else if (user.rewards + order.cart_rewards >= 20) {
                  reward = 20
                } else {
                  reward = order.cart_rewards + user.rewards;
                }
              }
              await User.findByIdAndUpdate(order.client, {rewards: reward})
              
              
              const message = await client.messages.create({

                body: `Hola ${user.name} hemos recibido tu orden con ID: ${order._id}, enviaremos un mensaje cuando este lista.
                  Para ver el contenido de tu orden haz click aqui http://localhost:3000/order-details/${order._id}

                PD:  Para retirar el pedido debemos verificar el id de la orden.`,
            
                from: "+18556174449",
            
                to: "+18777804236",
            
              });
            
            
              console.log(message.body);
            

            } else {
              console.log('This order has not been paid');
            }
          }
        } catch(err) {
          console.log(err);
            //res.status(500).json({message: 'something went wrong in the server'});
        }
      }

exports.order_get_orders_get = (req, res, next) => {
    Order.find({status: false})
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err));
}

exports.order_get_orders_update = async (req, res, next) => {
  console.log(req.body.id)

  
  const order = Order.findByIdAndUpdate(req.body.id, {status: true})
  .then(async result => {

    const message = await client.messages.create({

      body: `Hola ${result.client_name} tu orden con ID: ${result._id}, esta lista para ser retirada
  
      PD:  Para retirar el pedido debemos verificar el id de la orden.`,
  
      from: "+18556174449",
  
      to: "+18777804236",
  
    });
    console.log(message.body);

    res.status(200).json({succeed: true})
  })
  .catch(err => console.log(err));

  

}

exports.order_delete_order_post = () => {
    Order.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(200).json({result: result});
    })
    .catch((err) => next(err));
}

exports.order_get_details = (req, res) => {
  if (req.isAuthenticated) {
    Order.findById(req.params.id)
    .then(result => {
      res.status(200).json({result: result});
    })
    .catch(err => res.status(500).json({succeed: false}))
  } else {
    
  }
}
