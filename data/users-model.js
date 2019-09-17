const db = require('./dbConfig');

function find() {
    return db('users');
}

function findById(id) {
    return db('users').where({id}).first();
}

function findByUsername(username) {
    return db('users').where({username}).first();
}

function add(user) {
    return db('users').insert(user)
    .then(ids => findById(ids[0]));
}

module.exports = {find, findById, findByUsername, add};