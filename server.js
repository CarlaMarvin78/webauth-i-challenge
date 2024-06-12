const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./data/users-model');
const dbConfig = require('./data/dbConfig');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const server = express();

const sessionConfig = {
    name: 'oatmeal_raisin',
    secret: process.env.SESSION_SECRET || 'For the horde',
    cookie: {
        maxAge: 1000 * 60 * 60, // in milliseconds
        secure: false, // true means only send cookie over https
        httpOnly: true, // true means JS has no access to the cookie
    },
    resave: false,
    saveUninitialized: true, // GDPR compliance
    store: new KnexSessionStore({
        knex: dbConfig,
        tablename: 'knexsessions',
        sidfieldname: 'sessionid',
        createtable: true,
        clearInterval: 1000 * 60 * 30, // clean out expired session data
    }),
};

server.use(express.json());
server.use(session(sessionConfig));

server.post('/api/register', (req, res) => {
    const hash = bcrypt.hashSync(req.body.password, 8);
    db.add({username: req.body.username, password: hash})
    .then(user => res.status(201).json(user))
    .catch(err => res.status(500).json(error));
});

server.post('/api/login', (req, res) => {
    db.findByUsername(req.body.username)
    .then(user => {
        if(user && bcrypt.compareSync(req.body.password,user.password)) {
            req.session.user = user;
            res.status(200).json({message: "Welcome "+user.username+" !"});
        } else {
            res.status(401).json({mesage: 'You shall not pass!'});
        }
    })
    .catch(err => res.status(500).json(err));
})

server.get('/api/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {res.status(500).json({error: "Error logging out."})}
            else {res.status(200).json({message: "Logged out."})}
        })
    } else {
        res.status(200).json({message: "Not logged in."});
    }
})
function validate(req, res, next) {
    if (req.session && req.session.user) {next();}
    else {res.status(401).json({mesage: 'You shall not pass!'});}
}

server.get('/api/users', validate, (req, res) => {
    db.find()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(500).json(err));
})

module.exports = server;