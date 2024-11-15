const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuItemSchema = new Schema({
    name: String,
    description: String,
    price: Number,
    priceInCents: Number,
    category: String,
    picture: { data: Buffer, contentType: String },
    reward: Number,
    available: Boolean,
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;