const MenuItem = require('../models/menuModel');
const { body, validationResult } = require('express-validator');

exports.item_create_post = [
    // Validate and sanitize fields
    body('name')
        .trim()
        .escape(),
    body('description')
        .trim()
        .escape(),
    body('price')
        .trim()
        .escape(),
    body('category')
        .trim()
        .escape(),
    body('picture')
        .trim()
        .escape(),
    body('reward')
    .trim()
    .escape(),
    // process request after validation and sanitization
    (req,res,next) => {
        // Extract the validation error from a request
        const errors = validationResult(req);

        const item = new MenuItem({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            picture: req.body.picture,
            reward: req.body.reward
        }).save()
        .then(() => {
            res.status(200).json({ success: true});
            console.log('ok');
        })
        .catch((err) => res.status(500).json({message: 'something went wrong with the server'}));
    }
];

exports.item_details_get = (req, res, next) => {
    MenuItem.findById(req.params.id)
    .populate()
    .then((result) => {
      res.status(200).json(result);
    })
    .then((result) => {
      res.status(200).json({ user: result, errors: [] });
    })
    .catch((err) => next(err));
}

exports.item_list = (req, res, next) => {
    MenuItem.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch(() => { res.status(500).json('Something went wrong with the server'); });
}

exports.item_list_category = (req, res, next) => {
    MenuItem.find({ category: req.body.category, available: true })
    .then((result) => {
        res.status(200).json(result)
    })
    .catch(() => { res.status(500).json('Something went wrong with the server')});
}

exports.delete_item_post = (req, res, next) => {
    MenuItem.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => next(err));
}

exports.update_item_post = [
    // Validate and sanitize fields
    body('name')
        .trim()
        .escape(),
    body('description')
        .trim()
        .escape(),
    body('price')
        .trim()
        .escape(),
    body('category')
        .trim()
        .escape(),
    body('picture')
        .trim()
        .escape(),
    body('reward')
        .trim()
        .escape(),
    // process request after validation and sanitization
    (req,res,next) => {
        // Extract the validation error from a request
        const errors = validationResult(req);

        const item = new MenuItem({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            picture: req.body.picture,
            reward: req.body.reward
        });
        MenuItem.findByIdAndUpdate(req,params.id, item)
        .then(() => {
            res.status(200).json({ success: true});
            console.log('ok');
        })
        .catch((err) => res.status(500).json({message: 'something went wrong with the server'}));
    }
]

exports.update_status_post = (req, res) => {
    console.log(req.body);
    MenuItem.findOneAndUpdate({_id: req.body.id}, {available: req.body.status}, {new: true})
    .then((result) => {
        console.log(result)
        res.status(200).json({ success: true , result: result});
        console.log('ok');
    })
    .catch((err) => console.log(err));
}