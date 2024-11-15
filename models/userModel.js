const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var findOrCreate = require('mongoose-findorcreate');

const userSchema = new Schema({
    name: {
        type: String,
        minLenght: 1
    },
    last_name: {
        type: String,
        minLenght: 1
    },
    email: {
        type: String,
        minLenght: 1
    },
    password: {
        type: String,
        minLenght: 6
    },
    confirm_password: {
        type: String,
        minLenght: 6
    },
    gender: String,

    provider: String,

    provider_id: String,

    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],

    rewards: {
        type: Number,
        max: 20,
    },

    phone: {
        type: String,
        minLenght: 10,
    }
});

userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

module.exports = User;