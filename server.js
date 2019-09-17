const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./data/users-model');

const server = express();

server.use(express.json());

server.post('/api/register', (req, res) => {
    const hash = bcrypt.hashSync(req.body.password, 8);
    db.add({username: username, password: hash})
    .then(user => res.status(201).json(user))
    .catch(err => res.status(500).json(error));
});

server.post('/api/login', (req, res) => {
    db.findByUsername(req.body.username)
    .then(user => {
        if(user!=undefined && bcrypt.compareSync(req.body.password,user.password)) {
            res.status(200).json({message: "Welcome "+user.username});
        } else {
            res.status(401).json({mesage: 'You shall not pass!'});
        }
    })
    .catch(err => res.status(500).json(err));
})
function validate(req, res, next) {
    db.findByUsername(req.body.username)
    .then(user => {
        if(user!=undefined && bcrypt.compareSync(req.body.password,user.password)) {
            next();
        } else {
            res.status(401).json({mesage: 'You shall not pass!'});
        }
    })
    .catch(err => res.status(500).json(err));
}

server.get('/api/users', validate, (req, res) => {
    db.find()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(500).json(err));
})

module.exports = server;