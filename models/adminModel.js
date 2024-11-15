const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
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
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;