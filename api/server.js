const path = require('path');
const express = require('express');
const bcryptjs = require('bcryptjs');
const session = require("express-session");
const { ConnectSessionKnexStore } = require('connect-session-knex');




const usersRouter = require('./users/users-router.js');
const authRouter = require('../auth/auth-router.js');
const dbConnection = require('../database/db-config.js'); // this must route to the config.js
const auth = require('../auth/authenticate-middleware.js');

const server = express()

const sessionConfiguration = {
  name: 'monster', // default value is sid
  secret: process.env.SESSION_SECRET || 'keep it safe',  // key for encryption
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: process.env.USE_SECURE_COOKIES || false, // send the cookie only over https (secure connection)
    httpOnly: true,  // prevent JS code on client from accessing THIS cookie  
  },
  resave: false,
  saveUninitialized: true, // read docs, it's related to GDPR compliance
  store: new ConnectSessionKnexStore({
    knex: dbConnection,
    tablename: 'sessions',
    sidfieldname: 'sid',
    createtable: true,
    clearInterval: 1000 * 60 * 30 // time to check and remove expired sessions from database

  }),
};

server.use(session(sessionConfiguration)); // enables session support
server.use(express.static(path.join(__dirname, '../client')))
server.use(express.json())

server.use('/api/users', auth, usersRouter);
server.use('/api/auth', authRouter);



server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'))
})



// server.get('/', (req, res) => {
//   res.json({ api: "up" });
// })


server.get("/hash", (req, res) => {
  const password = req.headers.authorization;
  const secret = req.headers.secret;

  const hash = hashString(secret)

  if (password === "mellon") {
    res.json({ welcome: 'friend', secret, hash })
  } else {
    res.status(401).json({ Message: "you can not pass!" });
  }
});

function hashString(str) {
  // use bcryptjs to hash the str argument and return the hash
  const rounds = process.env.HASH_ROUNDS || 4;
  const hash = bcryptjs.hashSync(str, rounds)
  return hash;
}





server.use('*', (req, res, next) => {
  next({ status: 404, message: 'not found!' })
})








server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  })
})

module.exports = server
