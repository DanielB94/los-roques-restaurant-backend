const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    name: {String},
})

const orderSchema = new Schema({
    client: { type: Schema.Types.ObjectId, ref: "User" },
    client_name: {type: String, required: true},
    cart: Array,
    address: {type: String, required: true},
    payment_id: {type: String, required: true},
    status: Boolean,
    paid: Boolean,
    subTotal: Number,
    totalProducts: Number,
    totalTaxes: Number,
    total: Number,
    deliveryTotal: Number,
    rewards_used: Number,
    cart_rewards: {
        type: Number,
        max: 20
    },
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;